# CasparCG Launcher

## Overview
CasparCG Launcher is a web-based preview of the CasparCG Server Launcher application, part of the Sofie TV Automation System. This is a Vue.js web application that demonstrates the launcher interface.

**Note:** The original application is an Electron desktop app. This Replit version runs a web-based preview that simulates the interface. The full Electron desktop app is required for actual CasparCG process control.

## Features (in Web Preview Mode)
- View process status (demo data)
- Simulated Start/Stop/Restart controls
- Settings page preview
- Log viewer with simulated entries

## Running the Application

### Development
```bash
# Build the web version
NODE_OPTIONS=--openssl-legacy-provider npm run build:web

# Start the server
npm run start
```

### Workflow
The web application runs on port 5000 using the `node server.js` command.

## Project Structure
```
├── src/
│   ├── main/                  # Electron main process (not used in web)
│   └── renderer/              # Vue.js frontend
│       ├── components/        # Vue components
│       │   ├── *.vue          # Electron versions
│       │   └── *.web.vue      # Web-compatible versions
│       ├── router/
│       │   ├── index.js       # Electron router
│       │   └── index.web.js   # Web router
│       ├── store/
│       │   ├── index.js       # Electron store
│       │   └── index.web.js   # Web store
│       ├── main.js            # Electron entry
│       ├── main.web.js        # Web entry
│       ├── App.vue            # Electron app
│       └── App.web.vue        # Web app
├── dist/web/                  # Built web assets
├── server.js                  # Express server for web preview
└── .electron-vue/             # Webpack configurations
```

## Build System
- **Webpack 4** for bundling
- **Vue 2** with Vue Router and Vuex
- **Bootstrap-Vue** for UI components
- **Sass** for styling (uses dart-sass)

## Technical Notes
- Uses `NODE_OPTIONS=--openssl-legacy-provider` for webpack compatibility with modern Node.js
- Web version uses mock Electron APIs for demonstration
- Original Electron functionality (process control, file system access) is simulated

## Original Repository
This project was imported from the Sofie CasparCG Server Launcher.
- [Sofie Documentation](https://sofie-automation.github.io/sofie-core/)
- [GitHub Repository](https://github.com/Sofie-Automation/casparcg-launcher)
