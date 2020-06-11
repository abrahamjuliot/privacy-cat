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

    // https://stackoverflow.com/questions/12395722/can-the-window-object-be-modified-from-a-chrome-extension
    function injectScript(code) {
        const scriptEl = document.createElement('script')
        const head = document.head
        scriptEl.setAttribute("data-source", 'Privacy Cat')
        scriptEl.innerHTML = code
        return head.insertBefore(scriptEl, head.firstChild)
    }

    const actualWebglRenderer = () => {
        const context = document.createElement('canvas').getContext('webgl')
        const extension = context.getExtension('WEBGL_debug_renderer_info')
        const renderer = context.getParameter(extension.UNMASKED_RENDERER_WEBGL)
        return renderer
    }

    function define(response) {
        const { struct, settings } = response
        const { block, notify, permission } = settings
        //console.log(settings)
        const {
            navProps,
            screenProps,
            webgl: { extension },
            canvasContext,
            clientRects,
            canvasHash,
            rectsHash,
            hash
        } = struct

        // Log random fingerprint hash id
        const title = `Fingerprint hash id: ${hash}`
        const entries = [
            ...Object.entries(navProps),
            ...Object.entries(screenProps)
        ]
        console.groupCollapsed(title)
            for (const [key, value] of entries) {
                console.log(`${key}:`, value)
            }
            const renderer = extension['37446'] ? extension['37446'] : actualWebglRenderer()
            console.log(`WebGLRenderer:`, renderer)
            console.log(`Canvas:`, canvasHash)
            console.log(`Rects:`, rectsHash)
        console.groupEnd()

        // https://stackoverflow.com/questions/9515704/insert-code-into-the-page-context-using-a-content-script
        // https://marketplace.visualstudio.com/items?itemName=bierner.comment-tagged-templates
        injectScript(/* js */`
        (function() {
            // client side computation

            // webgl
            function webgl(extension) {
                const getParameter = WebGLRenderingContext.prototype.getParameter
                return function (x) {
                    return (
                        extension == false ? getParameter.apply(this, arguments) :
                        extension[x] ? extension[x] : 
                        getParameter.apply(this, arguments)
                    )
                }
            }

            // canvas
            const canvasContext = JSON.parse('${JSON.stringify(canvasContext)}')
            const canvasProto = HTMLCanvasElement.prototype
            const getContext = HTMLCanvasElement.prototype.getContext
            const toDataURL = HTMLCanvasElement.prototype.toDataURL
            const toBlob = HTMLCanvasElement.prototype.toBlob
            const getImageData = CanvasRenderingContext2D.prototype.getImageData
            function canvasContextType(contextType, contextAttributes) {
                canvasProto._contextType = contextType
                return getContext.apply(this, arguments)
            }
            function randomizeContext2D(context) {
                const { fillStyle, shadowColor, strokeStyle, font } = canvasContext
                context.textBaseline = 'top'
                context.textBaseline = 'alphabetic'
                context.fillStyle = fillStyle
                context.shadowColor = shadowColor
                context.strokeStyle = strokeStyle
                context.fillText('.', 4, 17)
                context.font = font
                return context
            }
            function randomizeContextWebgl(context) {
                const { widthOffset, heightOffset } = canvasContext
                context.width += widthOffset
                context.height += heightOffset
                return context
            }
            function randomCanvasDataURL() {
                if (this._contextType == '2d') {
                    const context = getContext.apply(this, ['2d'])
                    randomizeContext2D(context)
                    return toDataURL.apply(this, arguments)
                } else if (this._contextType == 'webgl') {
                    randomizeContextWebgl(this)
                    return toDataURL.apply(this, arguments)
                }
                return toDataURL.apply(this, arguments)
            }
            function randomCanvasBlob() {
                if (this._contextType == '2d') {
                    const context = getContext.apply(this, ['2d'])
                    randomizeContext2D(context)
                    return toBlob.apply(this, arguments)
                } else if (this._contextType == 'webgl') {
                    randomizeContextWebgl(this)
                    return toBlob.apply(this, arguments)
                }
                return toBlob.apply(this, arguments)
            }
            function randomImageData() {
                const context = randomizeContext2D(this)
                return getImageData.apply(context, arguments)
            }

            // clientRects
            const offset = JSON.parse('${JSON.stringify(clientRects)}')
            const clientRects = offset ? true: false // detect setting
            const elementGetClientRects = Element.prototype.getClientRects
            const elementGetBoundingClientRect = Element.prototype.getBoundingClientRect
            const rangeGetClientRects = Range.prototype.getClientRects
            const rangeGetBoundingClientRect = Range.prototype.getBoundingClientRect
            const randomClient = type => {
                const method = (
                    type == 'rangeRects' ? rangeGetClientRects :
                    type == 'rangeBounding' ? rangeGetBoundingClientRect :
                    type == 'elementRects' ? elementGetClientRects :
                    type == 'elementBounding' ? elementGetBoundingClientRect : ''
                )
                const domRectify = (client) => {
                    const props = [ 'bottom', 'height', 'left', 'right', 'top', 'width', 'x', 'y' ]
                    if (client.length) {
                        let i, len = client.length
                        for (i = 0; i < len; i++) {
                            client[i][props[0]] += offset[props[0]]
                            client[i][props[1]] += offset[props[1]]
                            client[i][props[2]] += offset[props[2]]
                            client[i][props[3]] += offset[props[3]]
                            client[i][props[4]] += offset[props[4]]
                            client[i][props[5]] += offset[props[5]]
                            client[i][props[6]] += offset[props[6]]
                            client[i][props[7]] += offset[props[7]]
                        }
                        return client
                    }
                    props.forEach(prop => { client[prop] += offset[prop] })
                    return client
                }
                return function () {
                    const client = method.apply(this, arguments)
                    return domRectify(client)
                }
            }

            // Detect Fingerprinting
            const post = (obj) => {
                obj.src = 'ondicjclhhjndhdkpagjhhfdjbpokfhe'
                window.postMessage(obj, '*')
            }
            // Property API and Fingerprint Rank
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
                getContext: ['HTMLCanvasElement.prototype.getContext', 1],
                toDataURL: ['HTMLCanvasElement.prototype.toDataURL', 8],
                toBlob: ['HTMLCanvasElement.prototype.toBlob', 4],
                getImageData: ['CanvasRenderingContext2D.prototpe.getImageData', 8],
                isPointInPath: ['CanvasRenderingContext2D.prototype.isPointInPath', 1],
                isPointInStroke: ['CanvasRenderingContext2D.prototype.isPointInStroke', 1],
                measureText: ['CanvasRenderingContext2D.prototype.measureText', 2],
                createAnalyser: ['AudioContext.prototype.createAnalyser', 4],
                createOscillator: ['AudioContext.prototype.createOscillator', 4],
                getChannelData: ['AudioBuffer.prototype.getChannelData', 8],
                copyFromChannel: ['AudioBuffer.prototype.copyFromChannel', 8],
                createDataChannel: ['RTCPeerConnection.prototype.createDataChannel', 3],
                createOffer: ['RTCPeerConnection.prototype.createOffer', 3],
                setRemoteDescription: ['RTCPeerConnection.setRemoteDescription', 3]
            }

            // https://stackoverflow.com/questions/2255689/how-to-get-the-file-path-of-the-currently-executing-javascript-code
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
            const warningRank = 14 // total rank that triggers fingerprint dtected warning
            const propsRead = [] // collect each property read
            const propsReadAll = {} // collects how many times each property is read
            const fingerprintScripts = []
            const scripts = []
            const { canvas, audio, rtcpeer, rects } = JSON.parse('${JSON.stringify(permission)}')
            const permitToRead = {
                toBlob: !canvas, // HTMLCanvasElement
                toDataURL: !canvas, // HTMLCanvasElement
                getChannelData: !audio, // AudioBuffer
                createDataChannel: !rtcpeer, // RTCPeerConnection
                getClientRects: !rects,
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
                        +propDescription.replace(/\.prototype/, '')
                        +', which can be used to uniquely identify your browser '
                        +'and track your internet activity without your consent. '
                        +'OK to allow or Cancel to abort.'
                    )
                    if (!confirm(permitMessage)) { throw new ReferenceError(randomMessage) }
                    else { permitToRead[prop] = true } // permit additional reads
                }
                
                // count how many times each prop is read
                propsReadAll[propDescription] ? propsReadAll[propDescription]++ : propsReadAll[propDescription] = 1

                // if new property is read, increase the rank counter and add it to collection of props read 
                if (newPropRead) {
                    rankCounter += fpRank
                    propsRead.push(propDescription)
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
                        const notificationSettings = JSON.parse('${JSON.stringify(notify)}')
                        tracedScript.creep = true // caught!
                        fingerprintScripts.push(url)
                        post({ fingerprintScripts, notificationSettings, warning, url, propsRead: tracedScript.all })
                        console.warn(warning, url, tracedScript.all)
                    }
                }
                else { tracedScript.all[propDescription]++ }
                return
            }

            // difinify
            const {
                speech, plugins, mimetypes, gamepads, battery, connection, webrtc
            } = JSON.parse('${JSON.stringify(block)}')
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
                    mimeTypes: mimetypes ? [] : navigator.mimeTypes, // ? block
                    plugins: plugins ? [] : navigator.plugins,     // ? block
                    connection: connection ? undefined : navigator.connection, // ? block
                    getBattery: battery ? () => {} : navigator.getBattery, // ? block
                    getGamepads: gamepads ? () => [] : navigator.getGamepads // ? block
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
                    getVoices: speech ? () => {} : speechSynthesis.getVoices // ? block
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
                    getBoundingClientRect: clientRects ? randomClient('elementBounding') : Element.prototype.getBoundingClientRect, // ? randomize
                    getClientRects: clientRects ? randomClient('elementRects') : Element.prototype.getClientRects // ? randomize
                }
            },
            {
                name: 'Range',
                proto: true,
                struct: {
                    getBoundingClientRect: clientRects ? randomClient('rangeBounding') : Range.prototype.getBoundingClientRect, // ? randomize
                    getClientRects: clientRects ? randomClient('rangeRects') : Range.prototype.getClientRects // ? randomize
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
                    getContext: canvasContext ? canvasContextType : HTMLCanvasElement.prototype.getContext, // ? capture type to randomize
                    toDataURL: canvasContext ? randomCanvasDataURL : HTMLCanvasElement.prototype.toDataURL, // ? randomize
                    toBlob: canvasContext ? randomCanvasBlob : HTMLCanvasElement.prototype.toBlob, // ? randomize
                }
            },
            {
                name: 'CanvasRenderingContext2D',
                proto: true,
                struct: {
                    getImageData: canvasContext ? randomImageData : CanvasRenderingContext2D.prototype.getImageData, // ? randomize
                    isPointInPath: CanvasRenderingContext2D.prototype.isPointInPath,
                    isPointInStroke: CanvasRenderingContext2D.prototype.isPointInStroke,
                    measureText: CanvasRenderingContext2D.prototype.measureText
                }
            },
            {
                name: 'AudioContext',
                proto: true,
                struct: {
                    createAnalyser: AudioContext.prototype.createAnalyser,
                    createOscillator: AudioContext.prototype.createOscillator
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
                    createDataChannel: rtcpeer ? () => {} : RTCPeerConnection.prototype.createDataChannel, // ? block
                    createOffer: rtcpeer ? () => {} : RTCPeerConnection.prototype.createOffer, // ? block
                    setRemoteDescription: rtcpeer ? () => {} : RTCPeerConnection.prototype.setRemoteDescription // ? block
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

    chrome.storage.local.get(['struct', 'settings'], define)

    return
})()
