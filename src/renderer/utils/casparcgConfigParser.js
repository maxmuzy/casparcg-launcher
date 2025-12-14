import xml2js from 'xml2js'

const VIDEO_MODES = [
  'PAL',
  'NTSC',
  '576p2500',
  '720p2398',
  '720p2400',
  '720p2500',
  '720p5000',
  '720p2997',
  '720p5994',
  '720p3000',
  '720p6000',
  '1080p2398',
  '1080p2400',
  '1080i5000',
  '1080i5994',
  '1080i6000',
  '1080p2500',
  '1080p2997',
  '1080p3000',
  '1080p5000',
  '1080p5994',
  '1080p6000',
  '1556p2398',
  '1556p2400',
  '1556p2500',
  'dci1080p2398',
  'dci1080p2400',
  'dci1080p2500',
  '2160p2398',
  '2160p2400',
  '2160p2500',
  '2160p2997',
  '2160p3000',
  '2160p5000',
  '2160p5994',
  '2160p6000',
  'dci2160p2398',
  'dci2160p2400',
  'dci2160p2500',
]

const LOG_LEVELS = ['trace', 'debug', 'info', 'warning', 'error', 'fatal']

const LATENCY_OPTIONS = ['normal', 'low', 'default']

const KEYER_OPTIONS = ['external', 'external_separate_device', 'internal', 'default']

const STRETCH_OPTIONS = ['none', 'fill', 'uniform', 'uniform_to_fill']

const ASPECT_RATIO_OPTIONS = ['default', '4:3', '16:9']

const ANGLE_BACKEND_OPTIONS = ['', 'gl', 'd3d11', 'd3d9']

const COLOR_SPACE_OPTIONS = ['bt709', 'bt2020', 'bt601']

const PIXEL_FORMAT_OPTIONS = ['yuv', 'rgba']

const AUTO_DEINTERLACE_OPTIONS = ['none', 'interlaced', 'all']

const CHANNEL_LAYOUT_OPTIONS = ['mono', 'stereo', 'matrix']

function getDefaultConfig() {
  return {
    paths: {
      mediaPath: 'media/',
      logPath: 'log/',
      logPathDisable: false,
      dataPath: 'data/',
      templatePath: 'template/',
    },
    lockClearPhrase: 'secret',
    logLevel: 'info',
    logAlignColumns: true,
    channels: [
      {
        videoMode: '720p5000',
        colorDepth: 8,
        colorSpace: 'bt709',
        consumers: [
          { type: 'screen', config: {} },
          { type: 'system-audio', config: {} },
        ],
        producers: [],
      },
    ],
    controllers: {
      tcp: {
        port: 5250,
        protocol: 'AMCP',
      },
    },
    amcp: {
      mediaServer: {
        host: 'localhost',
        port: 8000,
      },
    },
    flash: {
      enabled: false,
      bufferDepth: 'auto',
    },
    ffmpeg: {
      producer: {
        autoDeinterlace: 'interlaced',
        threads: 4,
      },
    },
    html: {
      remoteDebuggingPort: 0,
      enableGpu: false,
      angleBackend: 'gl',
      cachePath: '',
    },
    systemAudio: {
      producer: {
        defaultDeviceName: '',
      },
    },
    ndi: {
      autoLoad: false,
    },
    customVideoModes: [],
    osc: {
      defaultPort: 6250,
      disableSendToAmcpClients: false,
      predefinedClients: [],
    },
    templateHosts: [],
    audio: {
      channelLayouts: [],
      mixConfigs: [],
    },
  }
}

function parseXmlToConfig(xmlString) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      trim: true,
    })

    parser.parseString(xmlString, (err, result) => {
      if (err) {
        reject(err)
        return
      }

      try {
        const config = getDefaultConfig()
        const xmlConfig = result.configuration || {}

        if (xmlConfig.paths) {
          const paths = xmlConfig.paths
          config.paths.mediaPath = paths['media-path'] || config.paths.mediaPath
          config.paths.dataPath = paths['data-path'] || config.paths.dataPath
          config.paths.templatePath = paths['template-path'] || config.paths.templatePath
          if (typeof paths['log-path'] === 'object') {
            config.paths.logPath = paths['log-path']._ || paths['log-path'] || config.paths.logPath
            config.paths.logPathDisable = paths['log-path'].disable === 'true'
          } else {
            config.paths.logPath = paths['log-path'] || config.paths.logPath
          }
        }

        if (xmlConfig['lock-clear-phrase']) {
          config.lockClearPhrase = xmlConfig['lock-clear-phrase']
        }

        if (xmlConfig['log-level']) {
          config.logLevel = xmlConfig['log-level']
        }

        if (xmlConfig['log-align-columns']) {
          config.logAlignColumns = xmlConfig['log-align-columns'] === 'true'
        }

        if (xmlConfig.channels && xmlConfig.channels.channel) {
          const channels = Array.isArray(xmlConfig.channels.channel)
            ? xmlConfig.channels.channel
            : [xmlConfig.channels.channel]

          config.channels = channels.map((ch) => parseChannel(ch))
        }

        if (xmlConfig.controllers && xmlConfig.controllers.tcp) {
          config.controllers.tcp.port = parseInt(xmlConfig.controllers.tcp.port) || 5250
          config.controllers.tcp.protocol = xmlConfig.controllers.tcp.protocol || 'AMCP'
        }

        if (xmlConfig.amcp && xmlConfig.amcp['media-server']) {
          config.amcp.mediaServer.host = xmlConfig.amcp['media-server'].host || 'localhost'
          config.amcp.mediaServer.port = parseInt(xmlConfig.amcp['media-server'].port) || 8000
        }

        if (xmlConfig.flash) {
          config.flash.enabled = xmlConfig.flash.enabled === 'true'
          config.flash.bufferDepth = xmlConfig.flash['buffer-depth'] || 'auto'
        }

        if (xmlConfig.ffmpeg && xmlConfig.ffmpeg.producer) {
          config.ffmpeg.producer.autoDeinterlace = xmlConfig.ffmpeg.producer['auto-deinterlace'] || 'interlaced'
          config.ffmpeg.producer.threads = parseInt(xmlConfig.ffmpeg.producer.threads) || 4
        }

        if (xmlConfig.html) {
          config.html.remoteDebuggingPort = parseInt(xmlConfig.html['remote-debugging-port']) || 0
          config.html.enableGpu = xmlConfig.html['enable-gpu'] === 'true'
          config.html.angleBackend = xmlConfig.html['angle-backend'] || 'gl'
          config.html.cachePath = xmlConfig.html['cache-path'] || ''
        }

        if (xmlConfig.ndi) {
          config.ndi.autoLoad = xmlConfig.ndi['auto-load'] === 'true'
        }

        if (xmlConfig.osc) {
          config.osc.defaultPort = parseInt(xmlConfig.osc['default-port']) || 6250
          config.osc.disableSendToAmcpClients = xmlConfig.osc['disable-send-to-amcp-clients'] === 'true'
          if (xmlConfig.osc['predefined-clients'] && xmlConfig.osc['predefined-clients']['predefined-client']) {
            const clients = Array.isArray(xmlConfig.osc['predefined-clients']['predefined-client'])
              ? xmlConfig.osc['predefined-clients']['predefined-client']
              : [xmlConfig.osc['predefined-clients']['predefined-client']]
            config.osc.predefinedClients = clients.map((c) => ({
              address: c.address || '127.0.0.1',
              port: parseInt(c.port) || 5253,
            }))
          }
        }

        if (xmlConfig.audio) {
          config.audio = parseAudioSection(xmlConfig.audio)
        }

        if (xmlConfig['video-modes'] && xmlConfig['video-modes']['video-mode']) {
          const modes = Array.isArray(xmlConfig['video-modes']['video-mode'])
            ? xmlConfig['video-modes']['video-mode']
            : [xmlConfig['video-modes']['video-mode']]
          config.customVideoModes = modes.map((m) => ({
            id: m.id || '',
            width: parseInt(m.width) || 0,
            height: parseInt(m.height) || 0,
            timeScale: parseInt(m['time-scale']) || 0,
            duration: parseInt(m.duration) || 0,
            cadence: parseInt(m.cadence) || 0,
          }))
        }

        if (xmlConfig['template-hosts'] && xmlConfig['template-hosts']['template-host']) {
          const hosts = Array.isArray(xmlConfig['template-hosts']['template-host'])
            ? xmlConfig['template-hosts']['template-host']
            : [xmlConfig['template-hosts']['template-host']]
          config.templateHosts = hosts.map((h) => ({
            videoMode: h['video-mode'] || '',
            filename: h.filename || '',
            width: parseInt(h.width) || 0,
            height: parseInt(h.height) || 0,
          }))
        }

        resolve(config)
      } catch (parseError) {
        reject(parseError)
      }
    })
  })
}

function parseChannel(ch) {
  const channel = {
    videoMode: ch['video-mode'] || 'PAL',
    colorDepth: parseInt(ch['color-depth']) || 8,
    colorSpace: ch['color-space'] || 'bt709',
    consumers: [],
    producers: [],
  }

  if (ch.consumers) {
    if (ch.consumers.decklink) {
      const decklinks = Array.isArray(ch.consumers.decklink) ? ch.consumers.decklink : [ch.consumers.decklink]
      decklinks.forEach((d) => {
        channel.consumers.push({ type: 'decklink', config: parseDecklinkConsumer(d) })
      })
    }

    if (ch.consumers.screen !== undefined) {
      const screens = Array.isArray(ch.consumers.screen) ? ch.consumers.screen : [ch.consumers.screen]
      screens.forEach((s) => {
        channel.consumers.push({ type: 'screen', config: parseScreenConsumer(s) })
      })
    }

    if (ch.consumers['system-audio'] !== undefined) {
      const sysAudio = ch.consumers['system-audio']
      channel.consumers.push({
        type: 'system-audio',
        config: parseSystemAudioConsumer(sysAudio),
      })
    }

    if (ch.consumers.ndi) {
      const ndis = Array.isArray(ch.consumers.ndi) ? ch.consumers.ndi : [ch.consumers.ndi]
      ndis.forEach((n) => {
        channel.consumers.push({ type: 'ndi', config: parseNdiConsumer(n) })
      })
    }

    if (ch.consumers.ffmpeg) {
      const ffmpegs = Array.isArray(ch.consumers.ffmpeg) ? ch.consumers.ffmpeg : [ch.consumers.ffmpeg]
      ffmpegs.forEach((f) => {
        channel.consumers.push({ type: 'ffmpeg', config: parseFfmpegConsumer(f) })
      })
    }

    if (ch.consumers.bluefish) {
      const bluefishes = Array.isArray(ch.consumers.bluefish) ? ch.consumers.bluefish : [ch.consumers.bluefish]
      bluefishes.forEach((b) => {
        channel.consumers.push({ type: 'bluefish', config: parseBluefishConsumer(b) })
      })
    }

    if (ch.consumers.artnet) {
      const artnets = Array.isArray(ch.consumers.artnet) ? ch.consumers.artnet : [ch.consumers.artnet]
      artnets.forEach((a) => {
        channel.consumers.push({ type: 'artnet', config: parseArtnetConsumer(a) })
      })
    }
  }

  if (ch.producers && ch.producers.producer) {
    const producers = Array.isArray(ch.producers.producer) ? ch.producers.producer : [ch.producers.producer]
    channel.producers = producers.map((p) => ({
      id: parseInt(p.id) || 0,
      command: p._ || p || '',
    }))
  }

  return channel
}

function parseDecklinkConsumer(d) {
  const config = {
    device: parseInt(d.device) || 1,
    keyDevice: parseInt(d['key-device']) || 0,
    embeddedAudio: d['embedded-audio'] === 'true',
    latency: d.latency || 'normal',
    keyer: d.keyer || 'external',
    keyOnly: d['key-only'] === 'true',
    bufferDepth: parseInt(d['buffer-depth']) || 3,
    pixelFormat: d['pixel-format'] || '',
    videoMode: d['video-mode'] || '',
    colorSpace: d['color-space'] || '',
    waitForReference: d['wait-for-reference'] || 'auto',
    waitForReferenceDuration: parseInt(d['wait-for-reference-duration']) || 10,
    subregion: d.subregion
      ? {
          srcX: parseInt(d.subregion['src-x']) || 0,
          srcY: parseInt(d.subregion['src-y']) || 0,
          destX: parseInt(d.subregion['dest-x']) || 0,
          destY: parseInt(d.subregion['dest-y']) || 0,
          width: parseInt(d.subregion.width) || 0,
          height: parseInt(d.subregion.height) || 0,
        }
      : null,
    hdrMetadata: d['hdr-metadata']
      ? {
          maxCll: parseInt(d['hdr-metadata']['max-cll']) || 1000,
          maxFall: parseInt(d['hdr-metadata']['max-fall']) || 1000,
          minDml: parseFloat(d['hdr-metadata']['min-dml']) || 0.005,
          maxDml: parseInt(d['hdr-metadata']['max-dml']) || 1000,
        }
      : null,
    ports: [],
  }

  if (d.ports && d.ports.port) {
    const ports = Array.isArray(d.ports.port) ? d.ports.port : [d.ports.port]
    config.ports = ports.map((p) => ({
      device: parseInt(p.device) || 1,
      keyOnly: p['key-only'] === 'true',
      videoMode: p['video-mode'] || '',
      subregion: p.subregion
        ? {
            srcX: parseInt(p.subregion['src-x']) || 0,
            srcY: parseInt(p.subregion['src-y']) || 0,
            destX: parseInt(p.subregion['dest-x']) || 0,
            destY: parseInt(p.subregion['dest-y']) || 0,
            width: parseInt(p.subregion.width) || 0,
            height: parseInt(p.subregion.height) || 0,
          }
        : null,
    }))
  }

  return config
}

function parseSystemAudioConsumer(s) {
  if (typeof s !== 'object' || s === null || s === '') {
    return { channelLayout: 'stereo', latency: 200 }
  }
  return {
    channelLayout: s['channel-layout'] || 'stereo',
    latency: parseInt(s.latency) || 200,
  }
}

function parseAudioSection(audio) {
  const result = {
    channelLayouts: [],
    mixConfigs: [],
  }

  if (audio['channel-layouts'] && audio['channel-layouts']['channel-layout']) {
    const layouts = Array.isArray(audio['channel-layouts']['channel-layout'])
      ? audio['channel-layouts']['channel-layout']
      : [audio['channel-layouts']['channel-layout']]
    result.channelLayouts = layouts.map((l) => ({
      name: l.name || '',
      type: l.type || '',
      numChannels: parseInt(l['num-channels']) || 0,
      channels: (l.channels || '').trim(),
    }))
  }

  if (audio['mix-configs'] && audio['mix-configs']['mix-config']) {
    const mixConfigs = Array.isArray(audio['mix-configs']['mix-config'])
      ? audio['mix-configs']['mix-config']
      : [audio['mix-configs']['mix-config']]
    result.mixConfigs = mixConfigs.map((mc) => {
      const config = {
        from: mc.from || '',
        to: mc.to || '',
        mix: mc.mix || 'add',
        mappings: [],
      }
      if (mc.mappings && mc.mappings.mapping) {
        const mappings = Array.isArray(mc.mappings.mapping)
          ? mc.mappings.mapping
          : [mc.mappings.mapping]
        config.mappings = mappings.map((m) => (typeof m === 'string' ? m.trim() : m))
      }
      return config
    })
  }

  return result
}

function parseScreenConsumer(s) {
  if (typeof s !== 'object' || s === null) return {}
  return {
    device: parseInt(s.device) || 1,
    aspectRatio: s['aspect-ratio'] || 'default',
    stretch: s.stretch || 'fill',
    windowed: s.windowed !== 'false',
    keyOnly: s['key-only'] === 'true',
    vsync: s.vsync === 'true',
    borderless: s.borderless === 'true',
    interactive: s.interactive !== 'false',
    alwaysOnTop: s['always-on-top'] === 'true',
    x: parseInt(s.x) || 0,
    y: parseInt(s.y) || 0,
    width: parseInt(s.width) || 0,
    height: parseInt(s.height) || 0,
    sbsKey: s['sbs-key'] === 'true',
    colourSpace: s['colour-space'] || 'RGB',
  }
}

function parseNdiConsumer(n) {
  return {
    name: n.name || '',
    allowFields: n['allow-fields'] === 'true',
  }
}

function parseFfmpegConsumer(f) {
  return {
    path: f.path || '',
    args: f.args || '',
  }
}

function parseBluefishConsumer(b) {
  return {
    device: parseInt(b.device) || 1,
    sdiStream: parseInt(b['sdi-stream']) || 1,
    embeddedAudio: b['embedded-audio'] === 'true',
    keyer: b.keyer || 'disabled',
    internalKeyerAudioSource: b['internal-keyer-audio-source'] || 'videooutputchannel',
    watchdog: parseInt(b.watchdog) || 2,
    uhdMode: parseInt(b['uhd-mode']) || 0,
  }
}

function parseArtnetConsumer(a) {
  const config = {
    universe: parseInt(a.universe) || 0,
    host: a.host || '127.0.0.1',
    port: parseInt(a.port) || 6454,
    refreshRate: parseInt(a['refresh-rate']) || 30,
    fixtures: [],
  }

  if (a.fixtures && a.fixtures.fixture) {
    const fixtures = Array.isArray(a.fixtures.fixture) ? a.fixtures.fixture : [a.fixtures.fixture]
    config.fixtures = fixtures.map((f) => ({
      type: f.type || 'RGBW',
      startAddress: parseInt(f['start-address']) || 1,
      fixtureCount: parseInt(f['fixture-count']) || 1,
      fixtureChannels: parseInt(f['fixture-channels']) || 6,
      x: parseInt(f.x) || 0,
      y: parseInt(f.y) || 0,
      width: parseInt(f.width) || 100,
      height: parseInt(f.height) || 100,
      rotation: parseInt(f.rotation) || 0,
    }))
  }

  return config
}

function configToXml(config) {
  const builder = new xml2js.Builder({
    xmldec: { version: '1.0', encoding: 'utf-8' },
    renderOpts: { pretty: true, indent: '    ', newline: '\n' },
    headless: false,
  })

  const xmlObj = {
    configuration: {
      paths: {
        'media-path': config.paths.mediaPath,
        'log-path': config.paths.logPathDisable
          ? { _: config.paths.logPath, $: { disable: 'true' } }
          : config.paths.logPath,
        'data-path': config.paths.dataPath,
        'template-path': config.paths.templatePath,
      },
      'lock-clear-phrase': config.lockClearPhrase,
      channels: {
        channel: config.channels.map((ch) => buildChannelXml(ch)),
      },
      controllers: {
        tcp: {
          port: config.controllers.tcp.port,
          protocol: config.controllers.tcp.protocol,
        },
      },
      amcp: {
        'media-server': {
          host: config.amcp.mediaServer.host,
          port: config.amcp.mediaServer.port,
        },
      },
    },
  }

  if (config.logLevel !== 'info') {
    xmlObj.configuration['log-level'] = config.logLevel
  }

  if (config.osc.predefinedClients.length > 0 || config.osc.defaultPort !== 6250) {
    xmlObj.configuration.osc = {
      'default-port': config.osc.defaultPort,
    }
    if (config.osc.disableSendToAmcpClients) {
      xmlObj.configuration.osc['disable-send-to-amcp-clients'] = 'true'
    }
    if (config.osc.predefinedClients.length > 0) {
      xmlObj.configuration.osc['predefined-clients'] = {
        'predefined-client': config.osc.predefinedClients.map((c) => ({
          address: c.address,
          port: c.port,
        })),
      }
    }
  }

  if (config.audio && (config.audio.channelLayouts.length > 0 || config.audio.mixConfigs.length > 0)) {
    xmlObj.configuration.audio = buildAudioXml(config.audio)
  }

  if (config.customVideoModes && config.customVideoModes.length > 0) {
    xmlObj.configuration['video-modes'] = {
      'video-mode': config.customVideoModes.map((m) => ({
        id: m.id,
        width: m.width,
        height: m.height,
        'time-scale': m.timeScale,
        duration: m.duration,
        cadence: m.cadence,
      })),
    }
  }

  if (config.templateHosts && config.templateHosts.length > 0) {
    xmlObj.configuration['template-hosts'] = {
      'template-host': config.templateHosts.map((h) => ({
        'video-mode': h.videoMode,
        filename: h.filename,
        width: h.width,
        height: h.height,
      })),
    }
  }

  if (config.flash) {
    xmlObj.configuration.flash = {
      enabled: config.flash.enabled ? 'true' : 'false',
      'buffer-depth': config.flash.bufferDepth || 'auto',
    }
  }

  if (config.ffmpeg && config.ffmpeg.producer) {
    xmlObj.configuration.ffmpeg = {
      producer: {
        'auto-deinterlace': config.ffmpeg.producer.autoDeinterlace || 'interlaced',
        threads: config.ffmpeg.producer.threads || 4,
      },
    }
  }

  if (config.html) {
    xmlObj.configuration.html = {
      'remote-debugging-port': config.html.remoteDebuggingPort || 0,
      'enable-gpu': config.html.enableGpu ? 'true' : 'false',
      'angle-backend': config.html.angleBackend || 'gl',
    }
    if (config.html.cachePath) {
      xmlObj.configuration.html['cache-path'] = config.html.cachePath
    }
  }

  if (config.ndi) {
    xmlObj.configuration.ndi = {
      'auto-load': config.ndi.autoLoad ? 'true' : 'false',
    }
  }

  if (config.systemAudio && config.systemAudio.producer) {
    xmlObj.configuration['system-audio'] = {
      producer: {},
    }
    if (config.systemAudio.producer.defaultDeviceName) {
      xmlObj.configuration['system-audio'].producer['default-device-name'] = config.systemAudio.producer.defaultDeviceName
    }
  }

  xmlObj.configuration['log-align-columns'] = config.logAlignColumns ? 'true' : 'false'

  return builder.buildObject(xmlObj)
}

function buildChannelXml(ch) {
  const channel = {
    'video-mode': ch.videoMode,
    consumers: {},
  }

  if (ch.colorDepth !== 8) {
    channel['color-depth'] = ch.colorDepth
  }

  if (ch.colorSpace !== 'bt709') {
    channel['color-space'] = ch.colorSpace
  }

  ch.consumers.forEach((consumer) => {
    switch (consumer.type) {
      case 'screen':
        if (!channel.consumers.screen) channel.consumers.screen = []
        channel.consumers.screen.push(buildScreenXml(consumer.config))
        break
      case 'system-audio':
        channel.consumers['system-audio'] = buildSystemAudioXml(consumer.config)
        break
      case 'decklink':
        if (!channel.consumers.decklink) channel.consumers.decklink = []
        channel.consumers.decklink.push(buildDecklinkXml(consumer.config))
        break
      case 'ndi':
        if (!channel.consumers.ndi) channel.consumers.ndi = []
        channel.consumers.ndi.push(buildNdiXml(consumer.config))
        break
      case 'ffmpeg':
        if (!channel.consumers.ffmpeg) channel.consumers.ffmpeg = []
        channel.consumers.ffmpeg.push(buildFfmpegXml(consumer.config))
        break
      case 'bluefish':
        if (!channel.consumers.bluefish) channel.consumers.bluefish = []
        channel.consumers.bluefish.push(buildBluefishXml(consumer.config))
        break
      case 'artnet':
        if (!channel.consumers.artnet) channel.consumers.artnet = []
        channel.consumers.artnet.push(buildArtnetXml(consumer.config))
        break
    }
  })

  if (ch.producers && ch.producers.length > 0) {
    channel.producers = {
      producer: ch.producers.map((p) => ({
        $: { id: p.id },
        _: p.command,
      })),
    }
  }

  return channel
}

function buildScreenXml(config) {
  if (!config || Object.keys(config).length === 0) return ''
  const screen = {}
  if (config.device && config.device !== 1) screen.device = config.device
  if (config.aspectRatio && config.aspectRatio !== 'default') screen['aspect-ratio'] = config.aspectRatio
  if (config.stretch && config.stretch !== 'fill') screen.stretch = config.stretch
  if (config.windowed === false) screen.windowed = 'false'
  if (config.keyOnly) screen['key-only'] = 'true'
  if (config.vsync) screen.vsync = 'true'
  if (config.borderless) screen.borderless = 'true'
  if (config.interactive === false) screen.interactive = 'false'
  if (config.alwaysOnTop) screen['always-on-top'] = 'true'
  if (config.x) screen.x = config.x
  if (config.y) screen.y = config.y
  if (config.width) screen.width = config.width
  if (config.height) screen.height = config.height
  if (config.sbsKey) screen['sbs-key'] = 'true'
  if (config.colourSpace && config.colourSpace !== 'RGB') screen['colour-space'] = config.colourSpace
  return Object.keys(screen).length > 0 ? screen : ''
}

function buildSystemAudioXml(config) {
  if (!config || Object.keys(config).length === 0) return ''
  const sysAudio = {}
  if (config.channelLayout && config.channelLayout !== 'stereo') {
    sysAudio['channel-layout'] = config.channelLayout
  }
  if (config.latency && config.latency !== 200) {
    sysAudio.latency = config.latency
  }
  return Object.keys(sysAudio).length > 0 ? sysAudio : ''
}

function buildSubregionXml(subregion) {
  if (!subregion) return null
  const sr = {}
  if (subregion.srcX) sr['src-x'] = subregion.srcX
  if (subregion.srcY) sr['src-y'] = subregion.srcY
  if (subregion.destX) sr['dest-x'] = subregion.destX
  if (subregion.destY) sr['dest-y'] = subregion.destY
  if (subregion.width) sr.width = subregion.width
  if (subregion.height) sr.height = subregion.height
  return Object.keys(sr).length > 0 ? sr : null
}

function buildDecklinkXml(config) {
  const dl = {
    device: config.device || 1,
  }
  if (config.keyDevice) dl['key-device'] = config.keyDevice
  if (config.embeddedAudio) dl['embedded-audio'] = 'true'
  if (config.latency !== 'normal') dl.latency = config.latency
  if (config.keyer !== 'external') dl.keyer = config.keyer
  if (config.keyOnly) dl['key-only'] = 'true'
  if (config.bufferDepth !== 3) dl['buffer-depth'] = config.bufferDepth
  if (config.pixelFormat) dl['pixel-format'] = config.pixelFormat
  if (config.videoMode) dl['video-mode'] = config.videoMode
  if (config.colorSpace) dl['color-space'] = config.colorSpace
  if (config.waitForReference !== 'auto') dl['wait-for-reference'] = config.waitForReference
  if (config.waitForReferenceDuration !== 10) dl['wait-for-reference-duration'] = config.waitForReferenceDuration

  const subregion = buildSubregionXml(config.subregion)
  if (subregion) dl.subregion = subregion

  if (config.hdrMetadata) {
    dl['hdr-metadata'] = {
      'max-cll': config.hdrMetadata.maxCll,
      'max-fall': config.hdrMetadata.maxFall,
      'min-dml': config.hdrMetadata.minDml,
      'max-dml': config.hdrMetadata.maxDml,
    }
  }

  if (config.ports && config.ports.length > 0) {
    dl.ports = {
      port: config.ports.map((p) => {
        const port = { device: p.device || 1 }
        if (p.keyOnly) port['key-only'] = 'true'
        if (p.videoMode) port['video-mode'] = p.videoMode
        const portSubregion = buildSubregionXml(p.subregion)
        if (portSubregion) port.subregion = portSubregion
        return port
      }),
    }
  }

  return dl
}

function buildNdiXml(config) {
  const ndi = {}
  if (config.name) ndi.name = config.name
  if (config.allowFields) ndi['allow-fields'] = 'true'
  return ndi
}

function buildFfmpegXml(config) {
  return {
    path: config.path || '',
    args: config.args || '',
  }
}

function buildBluefishXml(config) {
  return {
    device: config.device || 1,
    'sdi-stream': config.sdiStream || 1,
    'embedded-audio': config.embeddedAudio ? 'true' : 'false',
    keyer: config.keyer || 'disabled',
    'internal-keyer-audio-source': config.internalKeyerAudioSource || 'videooutputchannel',
    watchdog: config.watchdog || 2,
    'uhd-mode': config.uhdMode || 0,
  }
}

function buildAudioXml(audio) {
  const result = {}

  if (audio.channelLayouts && audio.channelLayouts.length > 0) {
    result['channel-layouts'] = {
      'channel-layout': audio.channelLayouts.map((l) => ({
        $: { name: l.name },
        type: l.type,
        'num-channels': l.numChannels,
        channels: l.channels,
      })),
    }
  }

  if (audio.mixConfigs && audio.mixConfigs.length > 0) {
    result['mix-configs'] = {
      'mix-config': audio.mixConfigs.map((mc) => {
        const mixConfig = {
          from: mc.from,
          to: mc.to,
          mix: mc.mix,
        }
        if (mc.mappings && mc.mappings.length > 0) {
          mixConfig.mappings = {
            mapping: mc.mappings,
          }
        }
        return mixConfig
      }),
    }
  }

  return result
}

function buildArtnetXml(config) {
  const artnet = {
    universe: config.universe || 0,
    host: config.host || '127.0.0.1',
    port: config.port || 6454,
    'refresh-rate': config.refreshRate || 30,
  }
  if (config.fixtures && config.fixtures.length > 0) {
    artnet.fixtures = {
      fixture: config.fixtures.map((f) => ({
        type: f.type,
        'start-address': f.startAddress,
        'fixture-count': f.fixtureCount,
        'fixture-channels': f.fixtureChannels,
        x: f.x,
        y: f.y,
        width: f.width,
        height: f.height,
        rotation: f.rotation,
      })),
    }
  }
  return artnet
}

export {
  VIDEO_MODES,
  LOG_LEVELS,
  LATENCY_OPTIONS,
  KEYER_OPTIONS,
  STRETCH_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  ANGLE_BACKEND_OPTIONS,
  COLOR_SPACE_OPTIONS,
  PIXEL_FORMAT_OPTIONS,
  AUTO_DEINTERLACE_OPTIONS,
  CHANNEL_LAYOUT_OPTIONS,
  getDefaultConfig,
  parseXmlToConfig,
  configToXml,
}
