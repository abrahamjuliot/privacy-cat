const settings = {
    randomize: {
        time: 10,
        system: true,
        screens: true,
        gpu: true,
        canvasContext: true,
        clientRects: true,
        audioData: true
    },
    block: {
        speech: false,
        plugins: false,
        mimetypes: false,
        gamepads: false,
        battery: false,
        connection: false,
        webrtc: false
    },
    notify: {
        notification: false
    },
    permission: {
        canvas: false,
        audio: false,
        rects: false,
        rtcpeer: false
    }
}

//https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
const hashMini = str => {
    const json = `${JSON.stringify(str)}`
    let i, len, hash = 0x811c9dc5
    for (i = 0, len = json.length; i < len; i++) {
        hash = Math.imul(31, hash) + json.charCodeAt(i) | 0
    }
    return ('0000000' + (hash >>> 0).toString(16)).substr(-8)
}

const hashify = async (x) => {
    const json = `${JSON.stringify(x)}`
    const jsonBuffer = new TextEncoder('utf-8').encode(json)
    const hashBuffer = await crypto.subtle.digest('SHA-256', jsonBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('')
    return hashHex
}

const struct = {
    navProps: {},
    screenProps: {},
    webgl: {},
    canvasContext: {},
    clientRects: {},
    timestamp: '',
    canvasHash: '',
    rectsHash: '',
    audioHash: '',
    hash: ''
}

const randomizify = (settings, getNewSettings = false) => {
    
    async function execute(settings) {
        // Settings
        const { randomize: { system, screens, gpu, canvasContext, clientRects, audioData } } = settings

        // Helpers
        const listRand = (list) => list[Math.floor(Math.random() * list.length)]
        const evenRand = (min, max) =>
            (Math.floor(Math.random() * ((max / 2) - min + 1)) + min) * 2
        const rand = (min, max) =>
            (Math.floor(Math.random() * (max - min + 1)) + min)

        // Chrome User Agent/Platform
        const mozilla = 'Mozilla/'
        const apple = 'AppleWebKit/537.36'
        const gecko = '(KHTML, like Gecko)'
        const safari = 'Safari/537.36'

        //https://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
        const randomSystem = () => {
            const linux = listRand(['Linux x86_64', 'Linux armv7l', 'Linux i686'])
            return [{
                agent: 'Windows NT 10.0; Win64; x64',
                agentPlatform: 'Win32'
            },
            {
                agent: `X11; ${linux}`,
                agentPlatform: linux
            },
            {
                agent: 'Macintosh; Intel Mac OS X 10_15_4',
                agentPlatform: 'MacIntel'
            }
            ]
        }
        const noisified = randomSystem()
        const {
            agent,
            agentPlatform
        } = listRand(noisified)

        //https://developers.whatismybrowser.com/useragents/explore/software_name/chrome
        const version = [
            '83.0.4103.61',
            '81.0.4044.138',
            '80.0.3987.149'
        ]
        struct.navProps.platform = !system ? navigator.platform : agentPlatform
        struct.navProps.appVersion = (
            !system ? navigator.appVersion :
                `5.0 (${agent}) ${apple} ${gecko} Chrome/${listRand(version)} ${safari}`
        )
        struct.navProps.userAgent = (
            !system ? navigator.userAgent :
                `${mozilla}${struct.navProps.appVersion}`
        )

        // Device Touch, Hardware, and Memory
        // The idea of detecting OS has lied (or detecting if OS can lie) is inspired by Fingerprintjs2
        // https://github.com/Valve/fingerprintjs2/blob/master/fingerprint2.js#L1125
        function canLieTouch() {
            const userAgent = !system ? navigator.userAgent : struct.navProps.userAgent
            const os = (
                /windows phone/ig.test(userAgent) ? 'Windows Phone' :
                    /win(dows|16|32|64|95|98|nt)|wow64/ig.test(userAgent) ? 'Windows' :
                        /android/ig.test(userAgent) ? 'Android' :
                            /linux/ig.test(userAgent) ? 'Linux' :
                                /ios/ig.test(userAgent) ? 'iOS' :
                                    /mac/ig.test(userAgent) ? 'Mac' :
                                        /cros/ig.test(userAgent) ? 'CrOS' :
                                            'Other'
            )
            const touchOS = (/^(Windows(|\sPhone)|CrOS|Android|iOS)$/ig.test(os))
            return touchOS
        }
        const memory = {
            low: [2, 4],
            mid: [4, 6],
            high: [8, 16]
        }
        const hardwareConcurrencyComputed = listRand([2, 4, 8])
        const deviceMemoryRange = (
            hardwareConcurrencyComputed == 2 ? memory.low :
            hardwareConcurrencyComputed == 4 ? memory.mid :
            memory.high
        )
        const deviceMemoryComputed = listRand(deviceMemoryRange)
        struct.navProps.maxTouchPoints = !system ? navigator.maxTouchPoints : canLieTouch() ? listRand([0, 10]) : navigator.maxTouchPoints
        struct.navProps.hardwareConcurrency = !system ? navigator.hardwareConcurrency : hardwareConcurrencyComputed
        struct.navProps.deviceMemory = !system ? navigator.deviceMemory : deviceMemoryComputed

        // Device Screen
        // https://gs.statcounter.com/screen-resolution-stats
        const randomScreen = () => {
            const depth = listRand([24, 32, 48])
            const device = listRand([{
                width: 1920,
                height: 1080
            }, {
                width: 1440,
                height: 900
            }, {
                width: 1280,
                height: 800
            }, {
                width: 1600,
                height: 900
            }])
            device.availWidth = device.width - evenRand(2, 20)
            device.availHeight = device.height
            device.colorDepth = depth
            device.pixelDepth = depth
            return device
        }
        const actualScreen = {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth
        }
        struct.screenProps = !screens ? actualScreen : randomScreen()

        // Device GPU
        // https://www.primegrid.com/gpu_list.php
        // The idea of randomizing the renderer is inspired by Trace
        // https://github.com/jake-cryptic/AbsoluteDoubleTrace/blob/master/MyTrace/js/contentscript/page.js#L1087
        const webglRenderer = () => {
            const macRenderers = [{
                gpu: 'AMD Radeon',
                model: [
                    'HD 7950 Compute Engine',
                    'Pro 580 Compute Engine',
                    'RX 570 Compute Engine',
                    'RX Vega 56 Compute Engine',
                    'Pro 580 Compute Engine',
                    'Pro 580X Compute Engine'
                ]
            },
            {
                gpu: 'ATI Radeon',
                model: [
                    'HD 5770',
                    'HD 6770M',
                    'HD 6750M'
                ]
            },
            {
                gpu: 'R9',
                model: [
                    'M395X Compute Engine',
                    'M290 Compute Engine'
                ]
            },
            {
                gpu: 'NVIDIA GeForce GTX',
                model: [
                    '675MX',
                    '680'
                ]
            }
            ]
            const renderers = [{
                gpu: 'NVIDIA GeForce RTX',
                model: [
                    '2080 SUPER',
                    '2080 Ti',
                    '2080',
                    '2070 SUPER',
                    '2070',
                    '2060'
                ]
            },
            {
                gpu: 'NVIDIA GeForce GTX',
                model: [
                    '1080 Ti',
                    '1080',
                    '1070 Ti',
                    '1070',
                    '1660 Ti',
                    '1660',
                    '1650',
                    '1060',
                    '1050 Ti',
                    '1050'
                ]
            },
            {
                gpu: 'AMD Radeon',
                model: [
                    'VII',
                    '(TM) R9 Fury Series',
                    '(TM) RX Vega 11 Graphics'
                ]
            },
            {
                gpu: 'Radeon',
                model: [
                    'RX Vega',
                    'RX 580 Series',
                    'RX 570 Series',
                    'RX 560 Series',
                    '(TM) RX 480 Graphics'
                ]
            }
            ]
            const randomRenderer = (
                struct.navProps.platform == 'MacIntel' ?
                    listRand(macRenderers) :
                    listRand(renderers)
            )
            const randomGpu = randomRenderer.gpu
            const randomModel = listRand(randomRenderer.model)
            const randomizedRenderer = `${randomGpu} ${randomModel}`
            const extension = {
                37446: `ANGLE (${randomizedRenderer} vs_${rand(1, 5)}_0 ps_${rand(1, 5)}_0)`
            }
            return extension
        }

        struct.webgl = {
            extension: !gpu ? false : webglRenderer()
        }

        // canvasContext
        const randomRGBA = () => {
            const clr = () => Math.round(Math.random() * 255)
            return `rgba(${clr()},${clr()},${clr()},${Math.random().toFixed(1)})`
        }
        const randomFont = () =>  {
            const fontFamily = [
                'Arial', 'Courier', 'Georgia', 'Helvetica', 'Impact', 'monospace', 'Tahoma', 'Times', 'Verdana'
            ]
            const fontSize = Math.floor((Math.random() * 100) + 12)
            const rand = Math.floor(Math.random() * fontFamily.length)
            return `${fontSize}px ${fontFamily[rand]}`
        } 
        const fillStyle = randomRGBA()
        const shadowColor = randomRGBA()
        const strokeStyle = randomRGBA()
        const font = randomFont()
        const widthOffset = rand(-10, 10)
        const heightOffset = rand(-10, 10)
        struct.canvasContext = canvasContext ? { fillStyle, shadowColor, strokeStyle, font, widthOffset, heightOffset } : false

        // clientRects
        // The idea of randomizing the DOMRect with fractional offsets is inspired by Trace
        // https://github.com/jake-cryptic/AbsoluteDoubleTrace/blob/master/MyTrace/js/contentscript/page.js#L496
        const computedOffset = rand(10, 99)
        struct.clientRects = clientRects ? { computedOffset } : false

        // audioData
        const channelNoise = Math.random() * 0.0000001
        const frequencyNoise = Math.random() * 0.001
        struct.audioData = audioData ? { channelNoise, frequencyNoise } : false

        // create hashes
        struct.audioHash = hashMini(struct.audioData)
        struct.rectsHash = hashMini(struct.clientRects)
        struct.canvasHash = hashMini(struct.canvasContext)
        struct.hash = await hashify({
            ...struct.navProps,
            ...struct.screenProps,
            ...struct.webgl,
            ...struct.canvasContext,
            ...struct.clientRects,
            ...struct.audioData
        })

        // timestamp
        struct.timestamp = new Date().toLocaleTimeString()

        // log exection
        console.log(`${struct.timestamp}: Setting up new randomization... ${struct.hash}`)
        
        // update storage and send message to settings
        chrome.storage.local.set({ struct })
        chrome.runtime.sendMessage(
            {
                fingerprint: {
                    struct
                }
            }
        )
        return
    }
    
    if (getNewSettings) {
        console.log('[Fetched latest settings]')
        return chrome.storage.local.get('settings', (response) => {
            execute(response.settings)
        })
    }
    
    return execute(settings)
}

function setHeader(details) {
    // set header
    const { navProps: { userAgent } } = struct
    const { requestHeaders } = details
    const uaIndex = requestHeaders.findIndex(header => header.name === 'User-Agent')
    if (userAgent && uaIndex >= 0) {
        requestHeaders[uaIndex].value = userAgent
    }

    chrome.storage.local.set({ struct })

    return { requestHeaders }
}
let repeatInterval
const startProgram = settings => {
    const seconds = 1000
    const { randomize: { time } } = settings
    console.log(`Running. Randomization set to refresh every ${time} minutes (${time * 60 * seconds} ms).`)
    randomizify(settings)
    clearInterval(repeatInterval)
    repeatInterval = setInterval(() => randomizify(settings, true), time * 60 * seconds) // randomize every x seconds
    chrome.webRequest.onBeforeSendHeaders.removeListener(setHeader)
    return chrome.webRequest.onBeforeSendHeaders.addListener(
        setHeader,
        { urls: ['<all_urls>'] },
        ['blocking', 'requestHeaders']
    )
}

const reboot = () => {
    console.log('rebooting...')
    return chrome.storage.local.get('settings', (response) => {

        if (!response.settings) {
            // start with default settings
            return chrome.storage.local.set({ settings }, () => {
                startProgram(settings)
            })
        }
        return startProgram(response.settings)
    })
}

reboot()

const chromeNotification = (title, message, iconUrl = 'privacycat128.png') => {
    return chrome.notifications.create('', {
        title,
        message,
        type: 'basic',
        iconUrl
    })
}

const listenOnMessage = (data, sender) => {
    // listen for execute reboot
    if (data.execute != undefined && data.execute == 'reboot') {
        return reboot()
    }
    // listen for fingerprint scripts
    const { tab: { id: senderTabId } } = sender
    const { notificationSettings: { notification }, warning, url, propsRead } = data
    const fingerprintScripts = data.fingerprintScripts || []
    const len = fingerprintScripts.length
    const notificationMessage = notification ? `${url}\n\n${Object.keys(propsRead).length}+ properties read (view console)` : ''

    if (notification) { console.log(propsRead) }
    if (len) {
        chrome.tabs.get(senderTabId, tab => {
            if (chrome.runtime.lastError) { return }
            const { id: tabId } = tab
            const visibleTab = tab.index >= 0
            if (visibleTab) {
                chrome.browserAction.setBadgeText({ text: `${len}`, tabId })
                if (notification) {
                    chromeNotification(warning, notificationMessage)
                }
            }
            else { // prerendered tab
                chrome.webNavigation.onCommitted.addListener(function update(details) {
                    if (details.tabId == senderTabId) {
                        chrome.browserAction.setBadgeText({ text: `${len}`, tabId: senderTabId })
                        chrome.webNavigation.onCommitted.removeListener(update)
                        if (notification) { chromeNotification(warning, notificationMessage) }
                    }
                })
            }
        })
    }
}

chrome.runtime.onMessage.addListener(listenOnMessage)