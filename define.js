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
                appVersion: ['navigator.appVersion', 2],
                deviceMemory: ['navigator.deviceMemory', 1],
                doNotTrack: ['navigator.doNotTrack', 1],
                hardwareConcurrency: ['navigator.hardwareConcurrency', 1],
                languages: ['navigator.languages', 1],
                maxTouchPoints: ['navigator.maxTouchPoints', 1],
                mimeTypes: ['navigator.mimeTypes', 1],
                platform: ['navigator.platform', 1],
                plugins: ['navigator.plugins', 1],
                userAgent: ['navigator.userAgent', 2],
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
                resolvedOptions: ['Intl.DateTimeFormat.prototype.resolvedOptions', 2],
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
                getBoundingClientRect: ['prototype.getBoundingClientRect', 2],
                getClientRects: ['prototype.getClientRects', 2],
                offsetWidth: ['HTMLElement.prototype.offsetWidth', 1],
                offsetHeight: ['HTMLElement.prototype.offsetHeight', 1],
                shaderSource: ['WebGLRenderingContext.prototype.shaderSource', 6],
                getExtension: ['WebGLRenderingContext.prototype.getExtension', 2],
                getParameter: ['WebGLRenderingContext.prototype.getParameter', 2],
                getSupportedExtensions: ['WebGLRenderingContext.prototype.getSupportedExtensions', 4],
                toDataURL: ['HTMLCanvasElement.prototype.toDataURL', 6],
                toBlob: ['HTMLCanvasElement.prototype.toBlob', 6],
                getImageData: ['CanvasRenderingContext2D.prototype.getImageData', 6],
                isPointInPath: ['CanvasRenderingContext2D.prototype.isPointInPath', 1],
                isPointInStroke: ['CanvasRenderingContext2D.prototype.isPointInStroke', 1],
                measureText: ['CanvasRenderingContext2D.prototype.measureText', 1],
                font: ['CanvasRenderingContext2D.prototype.font', 1],
                createAnalyser: ['AudioContext.prototype.createAnalyser', 6],
                createOscillator: ['AudioContext.prototype.createOscillator', 6],
                getChannelData: ['AudioBuffer.prototype.getChannelData', 6],
                copyFromChannel: ['AudioBuffer.prototype.getChannelData', 6],
                createDataChannel: ['RTCPeerConnection.prototype.createDataChannel', 6],
                createOffer: ['RTCPeerConnection.prototype.createOffer', 6],
                setRemoteDescription: ['RTCPeerConnection.setRemoteDescription', 6]
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
            const warningRank = 12
            const propsRead = []
            const propsReadAll = {}
            const fingerprintScripts = []
            const scripts = []
            const watch = (prop) => {
                const url = getCurrentScript()
                const propDescription = propAPI[prop][0]
                const fpRank = propAPI[prop][1]
                const tracedScript = scripts.filter(s => s.url == url)[0] // previously traced script?
                const newPropRead = !itemInList(propsRead, propDescription)

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
                        const messageFromMars = (Math.random() + 1).toString(36).substring(2, 8)
                        const message = tracedScript.reads
                        tracedScript.creep = true // caught!
                        fingerprintScripts.push(url)
                        post({ fingerprintScripts })
                        console.warn(warning, url, tracedScript.all)
                        //if (!confirm(message)) { throw new ReferenceError(messageFromMars) }
                    }
                }
                else { tracedScript.all[propDescription]++ }
                return
            }
            const staticNavProps = {
                doNotTrack: navigator.doNotTrack,
                languages: navigator.languages,
                mimeTypes: navigator.mimeTypes,
                plugins: navigator.plugins,
                connection: navigator.connection,
                getBattery: navigator.getBattery,
                getGamepads: navigator.getGamepads
            }
            const dateProps = {
                getTimezoneOffset: Date.prototype.getTimezoneOffset
            }
            const intlProps = {
                resolvedOptions: Intl.DateTimeFormat.prototype.resolvedOptions
            }
            const mathProps = {
                acos: Math.acos,
                acosh: Math.acosh,
                asin: Math.asin,
                asinh: Math.asinh,
                cosh: Math.cosh,
                expm1: Math.expm1,
                sinh: Math.sinh
            }
            const mediaDeviceProps = {
                enumerateDevices: navigator.mediaDevices.enumerateDevices
            }
            const videoElementProps = {
                canPlayType: HTMLVideoElement.prototype.canPlayType
            }
            const mediaElementProps = {
                canPlayType: HTMLMediaElement.prototype.canPlayType
            }
            const mediaSourceProps = {
                isTypeSupported: MediaSource.isTypeSupported
            }
            const mediaRecorderProps = {
                isTypeSupported: MediaRecorder.isTypeSupported
            }
            const speechProps = {
                getVoices: speechSynthesis.getVoices
            }
            const performanceProps = {
                now: performance.now
            }
            const elemRectProps = {
                getBoundingClientRect: Element.prototype.getBoundingClientRect,
                getClientRects: Element.prototype.getClientRects
            }
            const rangeRectProps = {
                getBoundingClientRect: Range.prototype.getBoundingClientRect,
                getClientRects: Range.prototype.getClientRects
            }
            const staticWebglProps = {
                shaderSource: WebGLRenderingContext.prototype.shaderSource,
                getExtension: WebGLRenderingContext.prototype.getExtension,
                getSupportedExtensions: WebGLRenderingContext.prototype.getSupportedExtensions
            }
            const canvasProps = {
                toDataURL: HTMLCanvasElement.prototype.toDataURL,
                toBlob: HTMLCanvasElement.prototype.toBlob
            }
            const canvasContextProps = {
                getImageData: CanvasRenderingContext2D.prototype.getImageData,
                isPointInPath: CanvasRenderingContext2D.prototype.isPointInPath,
                isPointInStroke: CanvasRenderingContext2D.prototype.isPointInStroke,
                measureText: CanvasRenderingContext2D.prototype.measureText,
            }
            const audioProps = {
                createAnalyser: AudioContext.prototype.createAnalyser,
                createOscillator: AudioContext.prototype.createOscillator,
            }
            const audioBufferProps = {
                getChannelData: AudioBuffer.prototype.getChannelData,
                copyFromChannel: AudioBuffer.prototype.copyFromChannel
            }
            const webRTCProps = {
                createDataChannel: RTCPeerConnection.prototype.createDataChannel,
                createOffer: RTCPeerConnection.prototype.createOffer,
                setRemoteDescription: RTCPeerConnection.setRemoteDescription
            }
            // randomized props
            const navProps = JSON.parse('${JSON.stringify(navProps)}')
            const screenProps = JSON.parse('${JSON.stringify(screenProps)}')
            const extension = JSON.parse('${JSON.stringify(extension)}')
            const webglProps = {
                getParameter: webgl(extension)
            }
            // difinify
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
                Object.defineProperties(root.navigator, definify(navProps))
                Object.defineProperties(root.screen, definify(screenProps))
                Object.defineProperties(root.WebGLRenderingContext.prototype, definify(webglProps))
                // Static
                Object.defineProperties(root.navigator, definify(staticNavProps))
                Object.defineProperties(root.Date.prototype, definify(dateProps))
                Object.defineProperties(root.Intl.DateTimeFormat.prototype, definify(intlProps))
                Object.defineProperties(root.Math, definify(mathProps))
                Object.defineProperties(root.navigator.mediaDevices, definify(mediaDeviceProps))
                Object.defineProperties(root.HTMLVideoElement.prototype, definify(videoElementProps))
                Object.defineProperties(root.HTMLMediaElement.prototype, definify(mediaElementProps))
                Object.defineProperties(root.MediaSource, definify(mediaSourceProps))
                Object.defineProperties(root.MediaRecorder, definify(mediaRecorderProps))
                Object.defineProperties(root.speechSynthesis, definify(speechProps))
                Object.defineProperties(root.performance, definify(performanceProps))
                Object.defineProperties(root.Element.prototype, definify(elemRectProps))
                Object.defineProperties(root.Range.prototype, definify(rangeRectProps))
                Object.defineProperties(root.WebGLRenderingContext.prototype, definify(staticWebglProps))
                Object.defineProperties(root.HTMLCanvasElement.prototype, definify(canvasProps))
                Object.defineProperties(root.CanvasRenderingContext2D.prototype, definify(canvasContextProps))
                Object.defineProperties(root.AudioContext.prototype, definify(audioProps))
                Object.defineProperties(root.AudioBuffer.prototype, definify(audioBufferProps))
                Object.defineProperties(root.RTCPeerConnection.prototype, definify(webRTCProps))
            }
            redefine(window)
        })()
        `)
        return
    }
    //chrome.extension.onMessage.addListener(define)

    chrome.storage.local.get(['struct', 'log'], define)

    return
})()

//https://stackoverflow.com/questions/12395722/can-the-window-object-be-modified-from-a-chrome-extension
//https://stackoverflow.com/questions/9515704/insert-code-into-the-page-context-using-a-content-script