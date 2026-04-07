const axios = require('axios')

async function test() {
  const videoId = 'aircAruvnKk'

  // Use YouTube's internal InnerTube API (same as mobile app)
  const res = await axios.post(
    'https://www.youtube.com/youtubei/v1/get_transcript',
    {
      context: {
        client: {
          clientName: 'WEB',
          clientVersion: '2.20240101',
          hl: 'en',
        },
      },
      params: Buffer.from(`\n\x0b${videoId}`).toString('base64'),
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000,
    }
  )

  console.log('Status:', res.status)
  console.log('Response keys:', Object.keys(res.data || {}))
  console.log('Preview:', JSON.stringify(res.data).slice(0, 500))
}

test().catch(e => console.log('ERR:', e.response?.status, JSON.stringify(e.response?.data || e.message).slice(0, 200)))
