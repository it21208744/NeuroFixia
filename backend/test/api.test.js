// Integration tests: embedded MongoDB + a stub ML service (no Python needed).
const { test, before, after } = require('node:test')
const assert = require('node:assert')
const http = require('http')

let server, ml, base, token

before(async () => {
  // Stub ML service
  ml = http
    .createServer((req, res) => {
      let body = ''
      req.on('data', (c) => (body += c))
      req.on('end', () => {
        res.setHeader('content-type', 'application/json')
        const routes = {
          '/health': { status: 'ok' },
          '/cognitive/predict': { prediction: 0, probability_autism: 10, probability_td: 90, confidence_score: 90 },
          '/social/analyze': { risk_prediction: 1, risk_probability: 0.8, sentiment_q9: 1, sentiment_q10: 0,
            important_negative_responses: ['q6'], importance_scores: { q6: 16.9 }, top_3_features: [{ feature: 'q6', label: 'x', score_percent: 16.9 }] },
          '/behavioral/analyze': { final_prediction: 'non-autism', combined_confidence: 0.2, modalities_used: ['facial_expressions_recognition'],
            details: { facial_expressions_recognition: { prediction: 'Typical', confidence: 0.2 }, behavior: {}, heatmap: {} } },
          '/sensory/predict': { final_prediction: 'Not Hypersensitivity', pose_prediction: 'Not Hypersensitivity', confidence_hypersensitivity: 0.1 },
        }
        res.end(JSON.stringify(routes[req.url] || { error: 'nope' }))
      })
    })
    .listen(0)
  process.env.ML_URL = `http://127.0.0.1:${ml.address().port}`
  process.env.NODE_ENV = 'test'
  delete process.env.MONGO_URI
  const { connectDB } = require('../config/db')
  await connectDB()
  const { createApp } = require('../server')
  server = createApp().listen(0)
  base = `http://127.0.0.1:${server.address().port}/api`
})

after(async () => {
  server.close()
  ml.close()
  await require('../config/db').disconnectDB()
})

const call = async (method, path, body, auth = true) => {
  const r = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(auth && token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: r.status, data: await r.json() }
}

test('register, login, me', async () => {
  let r = await call('POST', '/users/register', { name: 'Parent', email: 'P@x.com', password: 'secret1' }, false)
  assert.equal(r.status, 201)
  r = await call('POST', '/users/register', { name: 'Parent', email: 'p@x.com', password: 'secret1' }, false)
  assert.equal(r.status, 400, 'duplicate email rejected (case-insensitive)')
  r = await call('POST', '/users/login', { email: 'p@x.com', password: 'wrong' }, false)
  assert.equal(r.status, 401)
  r = await call('POST', '/users/login', { email: 'p@x.com', password: 'secret1' }, false)
  assert.equal(r.status, 200)
  token = r.data.token
  // password must not be re-hashed on later saves (old pre-save bug)
  await call('PUT', '/users/me', { child: { name: 'Kid', age: 5 } })
  r = await call('POST', '/users/login', { email: 'p@x.com', password: 'secret1' }, false)
  assert.equal(r.status, 200)
  r = await call('GET', '/users/me')
  assert.equal(r.data.child.name, 'Kid')
})

test('protected routes reject anonymous requests', async () => {
  const r = await call('GET', '/dashboard/summary', null, false)
  assert.equal(r.status, 401)
})

test('cognitive analyze saves + predicts', async () => {
  const r = await call('POST', '/cognitive/analyze', { attentionScore: 80, memoryScore: 30, score: 50, errors: 2 })
  assert.equal(r.status, 200)
  assert.deepEqual(r.data.levels, { attention: 'Good', memory: 'Low', logic: 'Moderate' })
  assert.equal((await call('GET', '/cognitive/results')).data.length, 1)
})

test('social flow', async () => {
  assert.equal((await call('POST', '/social/profile', { age: '5', gender: 'Male', lang: 'english' })).status, 200)
  const ans = { q1: 'yes', q2: 'no', q3: 'yes', q4: 'yes', q5: 'no', q6: 'no', q7: 'yes', q8: 'yes', q9: 'a', q10: 'b' }
  const r = await call('POST', '/social/analyze', ans)
  assert.equal(r.status, 200)
  const list = (await call('GET', '/social/responses')).data
  assert.equal(list[0].risk_prediction, 'Risk Detected')
  assert.equal((await call('DELETE', `/social/responses/${list[0]._id}`)).status, 200)
  assert.equal((await call('POST', '/social/scores', { finalScore: 80, currentLevel: '2' })).status, 201)
})

test('sensory sessions', async () => {
  assert.equal((await call('POST', '/sensory/sessions', { sound: 'clapping', volume: 0.4, duration: 12 })).status, 201)
  assert.equal((await call('POST', '/sensory/sessions', { sound: 'clapping', volume: 3, duration: 12 })).status, 400)
  const s = (await call('GET', '/sensory/sessions')).data
  assert.equal(s.length, 1)
  assert.ok(s[0].timestamp)
})

test('behavioral multipart analyze', async () => {
  const fd = new FormData()
  fd.append('expressions', JSON.stringify(['Sad', 'Angry', 'Happy', 'Surprised']))
  fd.append('scanpath', new Blob([Buffer.from('fakepng')], { type: 'image/png' }), 'scanpath.png')
  const r = await fetch(base + '/behavioral/analyze', { method: 'POST', body: fd, headers: { authorization: `Bearer ${token}` } })
  assert.equal(r.status, 200)
  const preds = (await call('GET', '/behavioral/predictions')).data
  assert.equal(preds.length, 1)
  const sum = (await call('GET', '/dashboard/summary')).data
  assert.equal(sum.behavioral.count, 1)
  assert.equal(sum.cognitive.count, 1)
})
