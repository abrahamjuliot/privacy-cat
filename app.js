const settings = {
    randomize: {
        time: 1,
        platform: true,
        screens: true,
        gpu: true,
        touch: true
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

const struct = {
    navProps: {},
    screenProps: {},
    webgl: {}
}

const randomizify = (settings) => {
    console.log('Setting up new randomization...')
    // Settings
    const { randomize: { platform, screens, gpu, touch } } = settings

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
    const system = () => {
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
    const noisified = system()
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
    struct.navProps.platform = !platform ? navigator.platform : agentPlatform
    struct.navProps.appVersion = (
        !platform ? navigator.appVersion :
        `5.0 (${agent}) ${apple} ${gecko} Chrome/${listRand(version)} ${safari}`
    )
    struct.navProps.userAgent = (
        !platform ? navigator.userAgent :
        `${mozilla}${struct.navProps.appVersion}`
    )
    
    // Device Touch, Hardware, and Memory
    function canLieTouch() {
        const userAgent = !platform ? navigator.userAgent : struct.navProps.userAgent
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
    struct.navProps.maxTouchPoints = !touch ? navigator.maxTouchPoints : canLieTouch() ? rand(1, 10) : navigator.maxTouchPoints
    struct.navProps.hardwareConcurrency = !platform ? navigator.hardwareConcurrency : rand(1, 16)
    struct.navProps.deviceMemory = !platform ? navigator.deviceMemory : evenRand(2, 32)

    // Device Screen
    // https://gs.statcounter.com/screen-resolution-stats
    const randomScreen = () => {
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
        device.availWidth = device.width - rand(1, 20)
        device.availHeight = device.height - rand(1, 20)
        device.colorDepth = listRand([24, 32, 48])
        device.pixelDepth = listRand([24, 32, 48])
        return device
    }
    const actualScreen = {
        width,
        hieght,
        availWidth,
        availHeight,
        colorDepth,
        pixelDepth
    } = screen
    struct.screenProps = !screens ? actualScreen : randomScreen()

    // Device GPU
    //https://www.primegrid.com/gpu_list.php
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

    return
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

const startProgram = settings => {
    const seconds = 1000
    
    const { randomize: { time } } = settings
    console.log(`Running. Randomization set to refresh every ${time} minutes.`)
    randomizify(settings)
    setInterval(() => randomizify(settings), time * 60 * seconds) // randomize every x seconds
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

const chromeNotification = (title, message) => {
    return chrome.notifications.create('', {
        title,
        message,
        type: 'basic',
        iconUrl: 'icon48.png'
    })
}

const listenOnMessage = (data, sender) => {
    // listen for execute reboot
    if (data.execute != undefined && data.execute == 'reboot') {
        return reboot()
    }
    // listen for fingerprint scripts
    const { tab: { id: senderTabId } } = sender
    const { notificationSettings: { notification }, warning, url } = data
    const fingerprintScripts = data.fingerprintScripts || []
    const len = fingerprintScripts.length
    if (len) {
        chrome.tabs.get(senderTabId, tab => {
            if (chrome.runtime.lastError) { return }
            const { id: tabId } = tab
            const visibleTab = tab.index >= 0
            if (visibleTab) {
                chrome.browserAction.setBadgeText({ text: `${len}`, tabId })
                if (notification) { chromeNotification(warning, url) }
            } 
            else { // prerendered tab
                chrome.webNavigation.onCommitted.addListener(function update(details) {
                    if (details.tabId == senderTabId) {
                        chrome.browserAction.setBadgeText({ text: `${len}`, tabId: senderTabId })
                        chrome.webNavigation.onCommitted.removeListener(update)
                        if (notification) { chromeNotification(warning, url) }
                    }
                })
            }
        })
    }
}

chrome.runtime.onMessage.addListener(listenOnMessage)