const axios = require('axios')

const ML_URL = () => process.env.ML_URL || 'http://127.0.0.1:5001'

const client = () =>
  axios.create({ baseURL: ML_URL(), timeout: 5 * 60 * 1000, maxBodyLength: Infinity, maxContentLength: Infinity })

/** Forward an ML-service error with a useful message instead of a generic 500. */
function mlError(res, err, fallback) {
  if (err.response) {
    const msg = err.response.data?.error || fallback
    return res.status(err.response.status >= 500 ? 502 : err.response.status).json({ message: msg })
  }
  console.error('[ml]', err.message)
  return res
    .status(503)
    .json({ message: 'The analysis service is starting up or unavailable. Please try again in a minute.' })
}

module.exports = { client, mlError, ML_URL }
