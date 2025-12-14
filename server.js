const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')

const PORT = 5000

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>CasparCG Launcher - Electron Desktop App</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { background: #1a1a2e; color: #eee; min-height: 100vh; }
    .hero { padding: 60px 0; }
    .card { background: #16213e; border: 1px solid #0f3460; }
    .code { background: #0d1b2a; padding: 15px; border-radius: 5px; font-family: monospace; }
    .badge-info { background: #0f3460; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero text-center">
      <h1 class="display-4 mb-3">CasparCG Launcher</h1>
      <p class="lead">Electron Desktop Application for CasparCG Server Management</p>
      <span class="badge bg-warning text-dark">Desktop App - Cannot run in browser</span>
    </div>

    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">How to Build</h5>
            <div class="code">
              <p class="mb-1 text-info"># Install dependencies</p>
              <p class="mb-2">npm install</p>
              <p class="mb-1 text-info"># Development mode</p>
              <p class="mb-2">npm run dev</p>
              <p class="mb-1 text-info"># Production build</p>
              <p class="mb-0">npm run build</p>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">Features</h5>
            <ul class="list-unstyled">
              <li>✓ Process Management (Start/Stop/Restart)</li>
              <li>✓ CasparCG Configuration Editor</li>
              <li>✓ Audio Configuration (layouts, mix configs)</li>
              <li>✓ Custom Video Modes</li>
              <li>✓ Template Hosts</li>
              <li>✓ Windows Service Control</li>
              <li>✓ Log Viewer</li>
              <li>✓ HTTP API Server</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12 mb-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">Configuration Editor Tabs</h5>
            <div class="row">
              <div class="col-md-3"><span class="badge bg-primary">Paths</span></div>
              <div class="col-md-3"><span class="badge bg-primary">Channels</span></div>
              <div class="col-md-3"><span class="badge bg-primary">Audio</span></div>
              <div class="col-md-3"><span class="badge bg-primary">Controllers</span></div>
              <div class="col-md-3 mt-2"><span class="badge bg-primary">OSC</span></div>
              <div class="col-md-3 mt-2"><span class="badge bg-primary">Video Modes</span></div>
              <div class="col-md-3 mt-2"><span class="badge bg-primary">Templates</span></div>
              <div class="col-md-3 mt-2"><span class="badge bg-primary">Advanced</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mb-4">
      <p class="text-muted">
        Download this repository and run <code>npm run dev</code> on your Windows/Mac/Linux desktop to use the application.
      </p>
      <a href="https://github.com/Sofie-Automation/casparcg-launcher" class="btn btn-outline-light" target="_blank">
        View on GitHub
      </a>
    </div>
  </div>
</body>
</html>
  `)
})

app.listen(PORT, '0.0.0.0', () => {
  console.log('CasparCG Launcher info page running on port ' + PORT)
})
