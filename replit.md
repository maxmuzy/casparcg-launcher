# CasparCG Launcher

## Overview
CasparCG Launcher is an Electron desktop application for managing CasparCG Server, part of the Sofie TV Automation System. This Vue.js + Electron application provides process management and configuration editing for CasparCG.

**Important:** This is a desktop application that requires Electron. It cannot run directly in a web browser. The application must be built and run on a Windows/Mac/Linux desktop environment.

## Features
- Process management (Start/Stop/Restart CasparCG and related processes)
- CasparCG Configuration Editor with support for:
  - Paths configuration
  - Channels with video modes, color depth, color space
  - Consumers (Screen, Decklink, NDI, FFmpeg, Bluefish, Artnet, System Audio)
  - Producers
  - Audio configuration (channel layouts, mix configs)
  - Custom video modes
  - Template hosts
  - Controllers (TCP, HTTP)
  - OSC settings
  - Advanced settings (flash, HTML, thumbnails, etc.)
- Windows Service Control (install/uninstall CasparCG as Windows service)
- Log viewer
- HTTP API server

## Building the Application

### Prerequisites
- Node.js 16+ (with NODE_OPTIONS=--openssl-legacy-provider for Node 17+)
- Windows/Mac/Linux desktop environment

### Development
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Production Build
```bash
# Build for current platform
npm run build

# Build directory only (no installer)
npm run build:dir
```

## Project Structure
```
├── src/
│   ├── main/                  # Electron main process
│   │   └── index.js           # Main process entry
│   └── renderer/              # Vue.js frontend
│       ├── components/        # Vue components
│       │   ├── config/        # CasparCG configuration components
│       │   │   ├── consumers/ # Consumer form components
│       │   │   ├── CasparCGConfig.vue
│       │   │   ├── ChannelsConfiguration.vue
│       │   │   ├── AudioConfiguration.vue
│       │   │   ├── CustomVideoModes.vue
│       │   │   ├── TemplateHosts.vue
│       │   │   └── ...
│       │   ├── Settings.vue
│       │   ├── Status.vue
│       │   └── ProcessTab.vue
│       ├── router/
│       │   └── index.js
│       ├── store/
│       │   ├── index.js
│       │   └── modules/
│       │       ├── Process.js
│       │       └── CasparcgConfig.js
│       ├── utils/
│       │   └── casparcgConfigParser.js
│       ├── main.js
│       └── App.vue
├── .electron-vue/             # Webpack configurations
├── build/                     # Build resources (icons)
└── package.json
```

## Build System
- **Webpack 4** for bundling
- **Vue 2** with Vue Router and Vuex
- **Bootstrap-Vue** for UI components
- **Sass** for styling
- **Electron Builder** for packaging

## Technical Notes
- Uses `NODE_OPTIONS=--openssl-legacy-provider` in npm scripts for webpack compatibility with Node.js 17+
- Requires Electron for full functionality (process control, file system access, Windows service management)
- CasparCG config XML parsing uses xml2js library

## Original Repository
- [Sofie Documentation](https://sofie-automation.github.io/sofie-core/)
- [GitHub Repository](https://github.com/Sofie-Automation/casparcg-launcher)
