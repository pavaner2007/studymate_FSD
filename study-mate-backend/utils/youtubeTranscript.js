const axios = require('axios')

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
}

const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?.*v=)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/shorts\/)([^&\n?#]+)/,
    /(?:youtube\.com\/live\/)([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url
  return null
}

const decodeTranscriptEvents = (events = []) =>
  events
    .map((event) => (event.segs || []).map((segment) => segment.utf8 || '').join(''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

const parsePlayerResponse = (html) => {
  const patterns = [
    /ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;/s,
    /"playerResponse":"({.+?})"/s,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (!match) continue

    try {
      if (pattern.source.includes('"playerResponse"')) {
        return JSON.parse(JSON.parse(`"${match[1]}"`))
      }
      return JSON.parse(match[1])
    } catch (error) {
      continue
    }
  }

  return null
}

const pickCaptionTrack = (captionTracks = [], preferredLang = 'en') => {
  if (!captionTracks.length) return null

  return (
    captionTracks.find((track) => track.languageCode === preferredLang && !track.kind) ||
    captionTracks.find((track) => track.languageCode?.startsWith(preferredLang) && !track.kind) ||
    captionTracks.find((track) => !track.kind) ||
    captionTracks[0]
  )
}

const fetchTranscriptFromYoutubePage = async (videoId, preferredLang = 'en') => {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  const pageResponse = await axios.get(watchUrl, {
    headers: DEFAULT_HEADERS,
    timeout: 20000,
  })

  const playerResponse = parsePlayerResponse(pageResponse.data)
  const captionTracks =
    playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || []

  if (!captionTracks.length) {
    throw new Error('No captions found for this video')
  }

  const selectedTrack = pickCaptionTrack(captionTracks, preferredLang)
  if (!selectedTrack?.baseUrl) {
    throw new Error('Could not find a usable caption track')
  }

  const transcriptResponse = await axios.get(selectedTrack.baseUrl, {
    headers: DEFAULT_HEADERS,
    params: { fmt: 'json3' },
    timeout: 20000,
  })

  const transcript = decodeTranscriptEvents(transcriptResponse.data?.events)
  if (!transcript || transcript.length < 20) {
    throw new Error('Transcript is empty or too short')
  }

  return {
    videoId,
    videoTitle:
      playerResponse?.videoDetails?.title ||
      playerResponse?.microformat?.playerMicroformatRenderer?.title?.simpleText ||
      `YouTube Video (${videoId})`,
    transcript,
    languageCode: selectedTrack.languageCode || preferredLang,
  }
}

const fetchYoutubeTranscript = async (url, preferredLang = 'en') => {
  const videoId = extractVideoId(url)
  if (!videoId) {
    throw new Error('Invalid YouTube URL')
  }

  const supadataApiKey = process.env.SUPADATA_API_KEY
  if (supadataApiKey) {
    try {
      const res = await axios.get('https://api.supadata.ai/v1/youtube/transcript', {
        params: { videoId, lang: preferredLang, text: true },
        headers: { 'x-api-key': supadataApiKey },
        timeout: 20000,
      })

      const data = res.data
      const transcript = (data?.transcript || data?.content || data?.text || '').trim()
      if (transcript.length >= 20) {
        return {
          videoId,
          videoTitle: data?.title || `YouTube Video (${videoId})`,
          transcript,
          languageCode: preferredLang,
        }
      }
    } catch (error) {
      // Fall back to direct YouTube caption fetching when the external API fails.
    }
  }

  return fetchTranscriptFromYoutubePage(videoId, preferredLang)
}

module.exports = { fetchYoutubeTranscript, extractVideoId }
