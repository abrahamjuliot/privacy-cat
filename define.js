(function () {
    window.addEventListener('message', function (event) {
        // Restrict messages to same frame
        
        if (event.source !== window) { return }

        const message = event.data
        const { src } = message
        // Restrict messages type and source
        if (typeof message !== 'object'
        || message === null
        || src !== 'ondicjclhhjndhdkpagjhhfdjbpokfhe') { return }
        
        if (!chrome.runtime.lastError) {
            return chrome.runtime.sendMessage(message)
        }
        return
    })

    function injectScript(code) {
        const scriptEl = document.createElement('script')
        const head = document.head
        scriptEl.setAttribute("data-source", 'Privacy Cat')
        scriptEl.innerHTML = code
        return head.insertBefore(scriptEl, head.firstChild)
    }

    function define(response) {
        //chrome.extension.onMessage.removeListener(define)
        const { struct } = response
        const { navProps, screenProps, webgl: { extension } } = struct
        const hashify = str => {
            let i, len, hash = 0x811c9dc5
            for (i = 0, len = str.length; i < len; i++) {
                hash = Math.imul(31, hash) + str.charCodeAt(i) | 0
            }
            return ("0000000" + (hash >>> 0).toString(16)).substr(-8)
        }
        // Log random fingerprint hash id
        const title = `🐱Meow! Your device fingerprint is randomized (hash id: ${hashify(JSON.stringify(struct))})`
        const entries = [
            ...Object.entries(navProps),
            ...Object.entries(screenProps)
        ]
        console.groupCollapsed(title)
        for (const [key, value] of entries) {
            console.log(`${key}:`, value)
        }
        console.log(`WebGLRenderer:`, extension['37446'])
        console.groupEnd()

        injectScript(/* js */`
        (function() {
            // get device
            function webgl(extension) {
                const getParameter = WebGLRenderingContext.prototype.getParameter
                return function (x) {
                    return extension[x] ? extension[x] : getParameter.apply(this, arguments)
                }
            }
            // Detect Fingerprinting
            const post = (obj) => {
                obj.src = 'ondicjclhhjndhdkpagjhhfdjbpokfhe'
                window.postMessage(obj, '*')
            }
            const propAPI = {
                appVersion: ['navigator.appVersion', 1],
                deviceMemory: ['navigator.deviceMemory', 1],
                doNotTrack: ['navigator.doNotTrack', 1],
                hardwareConcurrency: ['navigator.hardwareConcurrency', 1],
                languages: ['navigator.languages', 1],
                maxTouchPoints: ['navigator.maxTouchPoints', 1],
                mimeTypes: ['navigator.mimeTypes', 1],
                platform: ['navigator.platform', 1],
                plugins: ['navigator.plugins', 1],
                userAgent: ['navigator.userAgent', 1],
                vendor: ['navigator.vendor', 1],
                connection: ['navigator.connection', 1],
                getBattery: ['navigator.getBattery', 1],
                getGamepads: ['navigator.getGamepads', 1],
                width: ['screen.width', 1],
                height: ['screen.height', 1],
                availWidth: ['screen.availWidth', 1],
                availHeight: ['screen.availHeight', 1],
                availTop: ['screen.availTop', 1],
                availLeft: ['screen.availLeft', 1],
                colorDepth: ['screen.colorDepth', 1],
                pixelDepth: ['screen.pixelDepth', 1],
                getTimezoneOffset: ['Date.prototype.getTimezoneOffset', 1],
                resolvedOptions: ['Intl.DateTimeFormat.prototype.resolvedOptions', 1],
                acos: ['acos: Math.acos', 1],
                acosh: ['Math.acosh', 1],
                asin: ['Math.asin', 1],
                asinh: ['Math.asinh', 1],
                cosh: ['Math.cosh', 1],
                expm1: ['Math.expm1', 1],
                sinh: ['Math.sinh', 1],
                enumerateDevices: ['navigator.mediaDevices.enumerateDevices', 1],
                canPlayType: ['prototype.canPlayType', 1],
                isTypeSupported: ['isTypeSupported', 1],
                getVoices: ['speechSynthesis.getVoices', 1],
                now: ['performance.now', 1],
                getBoundingClientRect: ['prototype.getBoundingClientRect', 1],
                getClientRects: ['prototype.getClientRects', 3],
                offsetWidth: ['HTMLElement.prototype.offsetWidth', 1],
                offsetHeight: ['HTMLElement.prototype.offsetHeight', 1],
                shaderSource: ['WebGLRenderingContext.prototype.shaderSource', 4],
                getExtension: ['WebGLRenderingContext.prototype.getExtension', 4],
                getParameter: ['WebGLRenderingContext.prototype.getParameter', 8],
                getSupportedExtensions: ['WebGLRenderingContext.prototype.getSupportedExtensions', 4],
                toDataURL: ['HTMLCanvasElement.prototype.toDataURL', 8],
                toBlob: ['HTMLCanvasElement.prototype.toBlob', 4],
                getImageData: ['CanvasRenderingContext2D.prototpe.getImageData', 8],
                isPointInPath: ['CanvasRenderingContext2D.prototype.isPointInPath', 1],
                isPointInStroke: ['CanvasRenderingContext2D.prototype.isPointInStroke', 1],
                measureText: ['CanvasRenderingContext2D.prototype.measureText', 2],
                font: ['CanvasRenderingContext2D.prototype.font', 2],
                createAnalyser: ['AudioContext.prototype.createAnalyser', 4],
                createOscillator: ['AudioContext.prototype.createOscillator', 4],
                getChannelData: ['AudioBuffer.prototype.getChannelData', 8],
                copyFromChannel: ['AudioBuffer.prototype.copyFromChannel', 8],
                createDataChannel: ['RTCPeerConnection.prototype.createDataChannel', 3],
                createOffer: ['RTCPeerConnection.prototype.createOffer', 3],
                setRemoteDescription: ['RTCPeerConnection.setRemoteDescription', 3]
            }
            const getCurrentScript = () => {
                const jsURL = ${/(\/.+\.js)/gi}
                const error = new Error()
                let path
                try {
                    path = error.stack.match(jsURL)[0]
                    return 'https:'+path
                }
                catch (err) {
                    return '[unknown]'
                }
            }
            const itemInList = (list, item) => list.indexOf(item) > -1
            let listenForExcessivePropReads = true
            let rankCounter = 0
            const warningRank = 14
            const propsRead = []
            const propsReadAll = {}
            const fingerprintScripts = []
            const scripts = []

            const permitToRead = { // get permit from options
                toDataURL: false, // HTMLCanvasElement
                getChannelData: false, // AudioBuffer
                createDataChannel: false, // RTCPeerConnection
                getClientRects: false,
            }
            const watch = (prop) => {
                const url = getCurrentScript()
                const propDescription = propAPI[prop][0]
                const fpRank = propAPI[prop][1]
                const tracedScript = scripts.filter(s => s.url == url)[0] // previously traced script?
                const newPropRead = !itemInList(propsRead, propDescription)
                
                // grant permission if required
                if (permitToRead[prop] === false) {
                    const randomMessage = (Math.random() + 1).toString(36).substring(2, 8)
                    const permitMessage = (
                        'This site is trying to read '
                        +propDescription
                        +', which can be used to uniquely identify your browser '
                        +'and track your internet activity. '
                        +'OK to allow or Cancel to abort.'
                    )
                    if (!confirm(permitMessage)) { throw new ReferenceError(randomMessage) }
                    else { permitToRead[prop] = true } // for any reads following
                }
                
                // count how many times each prop is read
                propsReadAll[propDescription] ? propsReadAll[propDescription]++ : propsReadAll[propDescription] = 1

                // if new property is read, increase the rank counter and add it to collection of props read 
                if (newPropRead) {
                    rankCounter += fpRank
                    propsRead.push(propDescription)
                    //post({ propsRead })
                }

                // Detect excessive prop reads and warn
                const excessivePropReadsDetected = rankCounter >= warningRank
                if (listenForExcessivePropReads && excessivePropReadsDetected) {
                    console.warn('Excessive property reads detected!', propsReadAll, scripts)
                    listenForExcessivePropReads = false 
                }
                // if the script is not yet in the traced scripts collection, add it
                if (!tracedScript) {
                    scripts.push({ url, fpRank, reads: [propDescription], all: { [propDescription]: 1 }, creep: false })
                }
                // else if this is not the first time the prop was read (in this previously traced script)
                else if (!itemInList(tracedScript.reads, propDescription)) {
                    tracedScript.fpRank += fpRank // increase the rank (update only on first prop read)
                    tracedScript.reads.push(propDescription)
                    tracedScript.all[propDescription] = 1
                    // detect
                    const fingerprintingDetected = tracedScript.fpRank >= warningRank
                    const alreadyCaught = tracedScript.creep
                    if (!alreadyCaught && fingerprintingDetected) {
                        const warning = 'Fingerprinting detected!'
                        tracedScript.creep = true // caught!
                        fingerprintScripts.push(url)
                        post({ fingerprintScripts })
                        console.warn(warning, url, tracedScript.all)
                    }
                }
                else { tracedScript.all[propDescription]++ }
                return
            }

            
            // difinify
            const intlProps = {
                resolvedOptions: Intl.DateTimeFormat.prototype.resolvedOptions
            }
            const mediaDeviceProps = {
                enumerateDevices: navigator.mediaDevices.enumerateDevices
            }
            const apiStructs = [{
                name: 'navigator',
                proto: false,
                struct: {
                    ...JSON.parse('${JSON.stringify(navProps)}'), // ? randomize
                    doNotTrack: navigator.doNotTrack,
                    languages: navigator.languages,
                    mimeTypes: navigator.mimeTypes, // ? block
                    plugins: navigator.plugins,     // ? block
                    connection: navigator.connection,
                    getBattery: navigator.getBattery, // ? block
                    getGamepads: navigator.getGamepads // ? block
                }
            }, 
            {
                name: 'screen',
                proto: false,
                struct: JSON.parse('${JSON.stringify(screenProps)}') // ? randomize
            },
            {
                name: 'Date',
                proto: true,
                struct: {
                    getTimezoneOffset: Date.prototype.getTimezoneOffset
                }
            },
            {
                name: 'Math',
                proto: false,
                struct: {
                    acos: Math.acos,
                    acosh: Math.acosh,
                    asin: Math.asin,
                    asinh: Math.asinh,
                    cosh: Math.cosh,
                    expm1: Math.expm1,
                    sinh: Math.sinh
                }
            },
            {
                name: 'HTMLVideoElement',
                proto: true,
                struct: {
                    canPlayType: HTMLVideoElement.prototype.canPlayType
                }
            },
            {
                name: 'HTMLMediaElement',
                proto: true,
                struct: {
                    canPlayType: HTMLMediaElement.prototype.canPlayType
                }
            },
            {
                name: 'MediaSource',
                proto: false,
                struct: {
                    isTypeSupported: MediaSource.isTypeSupported
                }
            },
            {
                name: 'MediaRecorder',
                proto: false,
                struct: {
                    isTypeSupported: MediaRecorder.isTypeSupported
                }
            },
            {
                name: 'speechSynthesis',
                proto: false,
                struct: {
                    getVoices: speechSynthesis.getVoices // ? block
                }
            },
            {
                name: 'performance',
                proto: false,
                struct: {
                    now: performance.now
                }
            },
            {
                name: 'Element',
                proto: true,
                struct: {
                    getBoundingClientRect: Element.prototype.getBoundingClientRect,
                    getClientRects: Element.prototype.getClientRects
                }
            },
            {
                name: 'Range',
                proto: true,
                struct: {
                    getBoundingClientRect: Range.prototype.getBoundingClientRect,
                    getClientRects: Range.prototype.getClientRects
                }
            },
            {
                name: 'WebGLRenderingContext',
                proto: true,
                struct: {
                    shaderSource: WebGLRenderingContext.prototype.shaderSource,
                    getExtension: WebGLRenderingContext.prototype.getExtension,
                    getParameter: webgl(JSON.parse('${JSON.stringify(extension)}')), // ? randomize
                    getSupportedExtensions: WebGLRenderingContext.prototype.getSupportedExtensions
                }
            },
            {
                name: 'HTMLCanvasElement',
                proto: true,
                struct: {
                    toDataURL: HTMLCanvasElement.prototype.toDataURL, // ? randomize
                    toBlob: HTMLCanvasElement.prototype.toBlob
                }
            },
            {
                name: 'CanvasRenderingContext2D',
                proto: true,
                struct: {
                    getImageData: CanvasRenderingContext2D.prototype.getImageData,
                    isPointInPath: CanvasRenderingContext2D.prototype.isPointInPath,
                    isPointInStroke: CanvasRenderingContext2D.prototype.isPointInStroke,
                    measureText: CanvasRenderingContext2D.prototype.measureText,
                }
            },
            {
                name: 'AudioContext',
                proto: true,
                struct: {
                    createAnalyser: AudioContext.prototype.createAnalyser,
                    createOscillator: AudioContext.prototype.createOscillator,
                }
            },
            {
                name: 'AudioBuffer',
                proto: true,
                struct: {
                    getChannelData: AudioBuffer.prototype.getChannelData,
                    copyFromChannel: AudioBuffer.prototype.copyFromChannel
                }
            },
            {
                name: 'RTCPeerConnection',
                proto: true,
                struct: {
                    createDataChannel: RTCPeerConnection.prototype.createDataChannel, // ? block
                    createOffer: RTCPeerConnection.prototype.createOffer, // ? block
                    setRemoteDescription: RTCPeerConnection.prototype.setRemoteDescription // ? block
                }
            }      
            ]
 
            function definify(struct) {
                const redefinedProps = {}
                Object.keys(struct).forEach(prop => {
                    redefinedProps[prop] = {
                        get: () => { watch(prop); return struct[prop] }
                    }
                })
                return redefinedProps
            }
            function redefine(root) {
                // Randomized
                apiStructs.forEach(api => {
                    const { name, proto, struct } = api
                    return Object.defineProperties(
                        (proto?root[name].prototype:root[name]), definify(struct)
                    )
                })
                // Deep calls
                Object.defineProperties(root.Intl.DateTimeFormat.prototype, definify(intlProps))
                Object.defineProperties(root.navigator.mediaDevices, definify(mediaDeviceProps))
            }
            redefine(window)
        })()
        `)
        return
    }

    chrome.storage.local.get(['struct', 'log'], define)

    return
})()

//https://stackoverflow.com/questions/12395722/can-the-window-object-be-modified-from-a-chrome-extension
//https://stackoverflow.com/questions/9515704/insert-code-into-the-page-context-using-a-content-script