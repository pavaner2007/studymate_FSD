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

// Parse plain XML transcript (<text start="..." dur="...">...</text>)
const parseXmlTranscript = (xml) => {
  const matches = [...xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)]
  return matches
    .map((m) =>
      m[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/<[^>]+>/g, '')
        .trim()
    )
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Method 1: YouTube Timedtext API (most reliable, no HTML parsing needed)
const fetchViaTimedtextApi = async (videoId, preferredLang = 'en') => {
  // Step 1: get list of available caption tracks
  const listRes = await axios.get('https://www.youtube.com/api/timedtext', {
    params: { type: 'list', v: videoId },
    headers: DEFAULT_HEADERS,
    timeout: 15000,
  })

  const xml = listRes.data
  // Parse track list XML: <track id="..." name="" lang_code="en" .../>
  const trackMatches = [...xml.matchAll(/<track\s+([^/]+)\/>/g)]
  if (!trackMatches.length) throw new Error('No caption tracks found via timedtext API')

  const tracks = trackMatches.map((m) => {
    const attrs = {}
    const attrMatches = [...m[1].matchAll(/(\w+)="([^"]*)"/g)]
    attrMatches.forEach(([, key, val]) => { attrs[key] = val })
    return attrs
  })

  // Pick preferred language, fallback to first available
  const selected =
    tracks.find((t) => t.lang_code === preferredLang) ||
    tracks.find((t) => t.lang_code?.startsWith(preferredLang)) ||
    tracks[0]

  if (!selected) throw new Error('No usable caption track found')

  // Step 2: fetch the actual transcript
  const transcriptRes = await axios.get('https://www.youtube.com/api/timedtext', {
    params: { v: videoId, lang: selected.lang_code, name: selected.name || '', fmt: 'srv3' },
    headers: DEFAULT_HEADERS,
    timeout: 15000,
  })

  const transcript = parseXmlTranscript(transcriptRes.data)
  if (!transcript || transcript.length < 20) throw new Error('Transcript is empty or too short')

  return { transcript, languageCode: selected.lang_code }
}

// Method 2: Parse ytInitialPlayerResponse from the watch page HTML
const fetchViaWatchPage = async (videoId, preferredLang = 'en') => {
  const pageRes = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { ...DEFAULT_HEADERS, 'Accept': 'text/html' },
    timeout: 20000,
  })

  const html = pageRes.data

  // Extract video title
  let videoTitle = `YouTube Video (${videoId})`
  const titleMatch = html.match(/<title>([^<]*)<\/title>/)
  if (titleMatch) videoTitle = titleMatch[1].replace(/ - YouTube$/, '').trim()

  // Try multiple patterns to find ytInitialPlayerResponse
  const jsonPatterns = [
    /ytInitialPlayerResponse\s*=\s*(\{.+?\});(?:\s*(?:var|const|let)\s|\s*<\/script>)/s,
    /ytInitialPlayerResponse\s*=\s*(\{[\s\S]+?\})\s*;\s*(?:if|var|const|let|window|<)/,
    /"playerResponse"\s*:\s*"(\{.+?\})"/,
  ]

  let playerResponse = null
  for (const pattern of jsonPatterns) {
    const match = html.match(pattern)
    if (!match) continue
    try {
      const raw = pattern.source.includes('"playerResponse"')
        ? JSON.parse(`"${match[1]}"`)
        : match[1]
      playerResponse = JSON.parse(raw)
      if (playerResponse?.captions) break
    } catch { continue }
  }

  const captionTracks =
    playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || []

  if (!captionTracks.length) throw new Error('No captions in player response')

  const selected =
    captionTracks.find((t) => t.languageCode === preferredLang && !t.kind) ||
    captionTracks.find((t) => t.languageCode?.startsWith(preferredLang) && !t.kind) ||
    captionTracks.find((t) => !t.kind) ||
    captionTracks[0]

  if (!selected?.baseUrl) throw new Error('No usable caption track URL')

  const transcriptRes = await axios.get(selected.baseUrl, {
    headers: DEFAULT_HEADERS,
    params: { fmt: 'srv3' },
    timeout: 15000,
  })

  const transcript = parseXmlTranscript(transcriptRes.data)
  if (!transcript || transcript.length < 20) throw new Error('Transcript is empty')

  return { transcript, videoTitle, languageCode: selected.languageCode }
}

const fetchYoutubeTranscript = async (url, preferredLang = 'en') => {
  const videoId = extractVideoId(url)
  if (!videoId) throw new Error('Invalid YouTube URL')

  // Try Supadata API first if key is configured
  if (process.env.SUPADATA_API_KEY) {
    try {
      const res = await axios.get('https://api.supadata.ai/v1/youtube/transcript', {
        params: { videoId, lang: preferredLang, text: true },
        headers: { 'x-api-key': process.env.SUPADATA_API_KEY },
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
    } catch { /* fall through */ }
  }

  // Get video title from watch page (needed for method 1)
  let videoTitle = `YouTube Video (${videoId})`
  try {
    const pageRes = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: DEFAULT_HEADERS, timeout: 10000,
    })
    const m = pageRes.data.match(/<title>([^<]*)<\/title>/)
    if (m) videoTitle = m[1].replace(/ - YouTube$/, '').trim()
  } catch { /* use default */ }

  // Try timedtext API first (most reliable)
  try {
    const result = await fetchViaTimedtextApi(videoId, preferredLang)
    return { videoId, videoTitle, transcript: result.transcript, languageCode: result.languageCode }
  } catch { /* fall through */ }

  // Fallback: parse watch page HTML
  try {
    const result = await fetchViaWatchPage(videoId, preferredLang)
    return {
      videoId,
      videoTitle: result.videoTitle || videoTitle,
      transcript: result.transcript,
      languageCode: result.languageCode,
    }
  } catch { /* fall through */ }

  throw new Error('Could not fetch transcript. The video may have captions disabled or is private/unavailable.')
}

module.exports = { fetchYoutubeTranscript, extractVideoId }
