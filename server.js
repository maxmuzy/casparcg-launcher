const express = require('express')
const path = require('path')

const app = express()
const PORT = 5000

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  next()
})

app.use(express.static(path.join(__dirname, 'dist/web')))

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/web', 'index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`CasparCG Launcher Web running on http://0.0.0.0:${PORT}`)
})
