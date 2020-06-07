// ie11 fix for template.content
function templateContent(template) {
    // template {display: none !important} /* add css if template is in dom */
    if ('content' in document.createElement('template')) {
        return document.importNode(template.content, true)
    } else {
        const frag = document.createDocumentFragment()
        const children = template.childNodes
        for (let i = 0, len = children.length; i < len; i++) {
            frag.appendChild(children[i].cloneNode(true))
        }
        return frag
    }
}
// tagged template literal (JSX alternative)
const patch = (oldEl, newEl, fn = undefined) => {
    oldEl.parentNode.replaceChild(newEl, oldEl)
    return typeof fn === 'function' ? fn() : true
}
const html = (stringSet, ...expressionSet) => {
    const template = document.createElement('template')
    template.innerHTML = stringSet.map((str, i) => `${str}${expressionSet[i] || ''}`).join('')
    return templateContent(template) // ie11 fix for template.content
}

// Helpers
const noop = () => { }
const setSync = (data, fn = noop) => chrome.storage.local.set(data, fn)
const getSync = (data, fn = noop) => chrome.storage.local.get(data, fn)
const id = (x) => document.getElementById(x)
const first = (x) => document.querySelector(x)

// Default Settings
const settings = {
    randomize: {
        time: 1,
        system: true,
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

//const removeExtraSpaces = (x) => x.replace(/\s{2,}/g, ' ')
const actualWebglRenderer = () => {
    const context = document.createElement('canvas').getContext('webgl')
    const extension = context.getExtension('WEBGL_debug_renderer_info')
    const renderer = context.getParameter(extension.UNMASKED_RENDERER_WEBGL)
    return renderer
}
const gpuTitle = (x) => /\((.*?)\svs/g.exec(x)[1]
const configureSettings = () => {
    document.addEventListener('DOMContentLoaded', () => {
        const fingerprintEl = id('fingerprint')
        const showRandomizationInView = data => {
            const isMessage = data.fingerprint != undefined
            const isStorage = data.struct != undefined
            if (isMessage || isStorage) {
                console.log(`Getting text from... message: ${isMessage}, storage: ${isStorage}`)
                const struct = isMessage ? data.fingerprint.struct : data.struct
                const { navProps, screenProps, webgl: { extension }, hash, timestamp } = struct
                const { userAgent, deviceMemory: mem, hardwareConcurrency: cpu, maxTouchPoints: mtp } = navProps
                const { availHeight: ah, availWidth: aw, colorDepth: cd, height: h, pixelDepth: pd, width: w } = screenProps
                const ver = /Chrome\/(.*?)\./g.exec(userAgent)[1]
                const os = /Windows|Linux|Mac/g.exec(userAgent)[0]
                const gpu = extension == false ? gpuTitle(actualWebglRenderer()) : gpuTitle(extension['37446'])
                const text = `${hash} [@${timestamp}]: Chrome ${ver} ${os}, memory: ${mem},  cpu: ${cpu}, ${gpu}, screen: ${aw}x${ah} of ${w}x${h}, pixels: ${pd}, color: ${cd}, touch: ${mtp}`
                fingerprintEl.classList.remove('show')
                fingerprintEl.classList.add('hide')
                setTimeout(() => {
                    fingerprintEl.classList.remove('hide')
                    fingerprintEl.classList.add('show')
                    fingerprintEl.setAttribute('data-fingerprint', text)
                    console.log(`Added at ${timestamp}`)
                }, 300)
            }
            return
        }
        getSync('struct', showRandomizationInView) // initial setup
        chrome.runtime.onMessage.addListener(showRandomizationInView) // listen for changes

        const elements = {
            randomize: {
                time1El: id('time1'),
                time10El: id('time10'),
                time60El: id('time60'),
                time480El: id('time480'),
                rebootEl: id('reboot'),
                systemEl: id('system'),
                screensEl: id('screen'),
                gpuEl: id('gpu'),
                touchEl: id('touch')
            },
            block: {
                speechEl: id('speech'),
                pluginsEl: id('plugins'),
                mimetypesEl: id('mimetypes'),
                gamepadsEl: id('gamepads'),
                batteryEl: id('battery'),
                connectionEl: id('connection'),
                webrtcEl: id('webrtc')
            },
            notify: {
                notifyEl: id('notify')
            },
            permission: {
                canvasEl: id('canvas'),
                audioEl: id('audio'),
                rectsEl: id('rects'),
                rtcpeerEl: id('rtcpeer')
            }
        }

        const setSettingsView = (elements, settings) => {
            const {
                randomize: { time1El, time10El, time60El, time480El, systemEl, screensEl, gpuEl, touchEl },
                block: { speechEl, pluginsEl, mimetypesEl, gamepadsEl, batteryEl, connectionEl, webrtcEl },
                notify: { notifyEl },
                permission: { canvasEl, audioEl, rectsEl, rtcpeerEl }
            } = elements
            const {
                randomize: { time, system, screens, gpu, touch },
                block: { speech, plugins, mimetypes, gamepads, battery, connection, webrtc },
                notify: { notification },
                permission: { canvas, audio, rects, rtcpeer }
            } = settings
            // randomize
            if (time == 1) { time1El.checked = true }
            else if (time == 10) { time10El.checked = true }
            else if (time == 60) { time60El.checked = true }
            else { time480El.checked = true }
            if (system == true) { systemEl.checked = true }
            if (screens == true) { screensEl.checked = true }
            if (gpu == true) { gpuEl.checked = true }
            if (touch == true) { touchEl.checked = true }
            // block
            if (speech == true) { speechEl.checked = true }
            if (plugins == true) { pluginsEl.checked = true }
            if (mimetypes == true) { mimetypesEl.checked = true }
            if (gamepads == true) { gamepadsEl.checked = true }
            if (battery == true) { batteryEl.checked = true }
            if (connection == true) { connectionEl.checked = true }
            if (webrtc == true) { webrtcEl.checked = true }
            // notify
            if (notification == true) { notifyEl.checked = true }
            // permissions
            if (canvas == true) { canvasEl.checked = true }
            if (audio == true) { audioEl.checked = true }
            if (rects == true) { rectsEl.checked = true }
            if (rtcpeer == true) { rtcpeerEl.checked = true }
            return
        }

        const listenToSettings = (elements) => {
            const body = first('body')
            const {
                randomize: { time1El, time10El, time60El, time480El, rebootEl, systemEl, screensEl, gpuEl, touchEl },
                block: { speechEl, pluginsEl, mimetypesEl, gamepadsEl, batteryEl, connectionEl, webrtcEl },
                notify: { notifyEl },
                permission: { canvasEl, audioEl, rectsEl, rtcpeerEl }
            } = elements

            return body.addEventListener('click', event => {
                const el = event.target
                const send = (message) => chrome.runtime.sendMessage(message)
                const updateSync = (obj, prop, value, reboot = false) => {
                    return getSync('settings', (response) => {
                        const { settings } = response
                        settings[obj][prop] = value
                        return setSync({ settings }, () => {
                            if (reboot) { send({ execute: 'reboot' }) }
                        })
                    })
                }

                if (el == time1El) { updateSync('randomize', 'time', 1, true) }
                if (el == time10El) { updateSync('randomize', 'time', 10, true) }
                if (el == time60El) { updateSync('randomize', 'time', 60, true) }
                if (el == time480El) { updateSync('randomize', 'time', 480, true) }
                if (el == rebootEl) { send({ execute: 'reboot' }) }
                if (el == systemEl) { updateSync('randomize', 'system', systemEl.checked, true) }
                if (el == screensEl) { updateSync('randomize', 'screens', screensEl.checked, true) }
                if (el == gpuEl) { updateSync('randomize', 'gpu', gpuEl.checked, true) }
                if (el == touchEl) { updateSync('randomize', 'touch', touchEl.checked, true) }
                if (el == speechEl) { updateSync('block', 'speech', speechEl.checked) }
                if (el == pluginsEl) { updateSync('block', 'plugins', pluginsEl.checked) }
                if (el == mimetypesEl) { updateSync('block', 'mimetypes', mimetypesEl.checked) }
                if (el == gamepadsEl) { updateSync('block', 'gamepads', gamepadsEl.checked) }
                if (el == batteryEl) { updateSync('block', 'battery', batteryEl.checked) }
                if (el == connectionEl) { updateSync('block', 'connection', connectionEl.checked) }
                if (el == webrtcEl) { updateSync('block', 'webrtc', webrtcEl.checked) }
                if (el == notifyEl) { updateSync('notify', 'notification', notifyEl.checked) }
                if (el == canvasEl) { updateSync('permission', 'canvas', canvasEl.checked) }
                if (el == audioEl) { updateSync('permission', 'audio', audioEl.checked) }
                if (el == rectsEl) { updateSync('permission', 'rects', rectsEl.checked) }
                if (el == rtcpeerEl) { updateSync('permission', 'rtcpeer', rtcpeerEl.checked) }
                return
            })
        }
        // sync settings to view
        getSync('settings', (response) => {
            if (!response.settings) {
                // set the default settings
                return setSync({ settings }, () => {
                    setSettingsView(elements, settings)
                    listenToSettings(elements)
                })
            }
            // else set the sync settings
            setSettingsView(elements, response.settings)
            return listenToSettings(elements)
        })

    })
}

// Randomization Description
const systemDescription = 'navigator.userAgent&#013navigator.appVersion&#013navigator.platform&#013navigator.hardwareConcurrency&#013navigator.deviceMemory'
const screenDescription = 'screen.width&#013screen.height&#013screen.availWidth&#013screen.availHeight&#013screen.colorDepth&#013screen.pixelDepth'
const webgelDescription = 'WebGLRenderingContext.getParameter'
const touchDescription = 'navigator.maxTouchPoints'
const canvasDescription = 'HTMLCanvasElement.getContext&#013HTMLCanvasElement.toDataURL'
// Block Description
const speechDescription = 'speechSynthesis.getVoices'
const pluginsDescription = 'navigator.plugins'
const mimeTypesDescription = 'navigator.mimeTypes'
const gamepadsDescription = 'navigator.getGamepads'
const batteryDescription = 'navigator.getBattery'
const connectionDescription = 'navigator.connection'
const webrtcDescription = 'RTCPeerConnection.createDataChannel&#013RTCPeerConnection.createOffer&#013RTCPeerConnection.setRemoteDescription'
// Permission Description
const canvasToDataURL = 'HTMLCanvasElement.toDataURL'
const audioChannelData = 'AudioBuffer.getChannelData'
const clientRects = '[Range|Element].getClientRects'
const webtrcDataChannel = 'RTCPeerConnection.createDataChannel'
// HTML View
const view = html/* html */`
<style>
    /* github.com/necolas/normalize.css */
    html{line-height:1.15;-webkit-text-size-adjust:100%}body{margin:0}main{display:block}h1{font-size:2em;margin:0.67em 0}hr{box-sizing:content-box;height:0;overflow:visible}pre{font-family:monospace, monospace;font-size:1em}a{background-color:transparent}abbr[title]{border-bottom:none;text-decoration:underline;text-decoration:underline dotted}b,strong{font-weight:bolder}code,kbd,samp{font-family:monospace, monospace;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-0.25em}sup{top:-0.5em}img{border-style:none}button,input,optgroup,select,textarea{font-family:inherit;font-size:100%;line-height:1.15;margin:0}button,input{overflow:visible}button,select{text-transform:none}[type="button"],[type="reset"],[type="submit"],button{-webkit-appearance:button}[type="button"]::-moz-focus-inner,[type="reset"]::-moz-focus-inner,[type="submit"]::-moz-focus-inner,button::-moz-focus-inner{border-style:none;padding:0}[type="button"]:-moz-focusring,[type="reset"]:-moz-focusring,[type="submit"]:-moz-focusring,button:-moz-focusring{outline:1px dotted ButtonText}fieldset{padding:0.35em 0.75em 0.625em}legend{box-sizing:border-box;color:inherit;display:table;max-width:100%;padding:0;white-space:normal}progress{vertical-align:baseline}textarea{overflow:auto}[type="checkbox"],[type="radio"]{box-sizing:border-box;padding:0}[type="number"]::-webkit-inner-spin-button,[type="number"]::-webkit-outer-spin-button{height:auto}[type="search"]{-webkit-appearance:textfield;outline-offset:-2px}[type="search"]::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}details{display:block}summary{display:list-item}template{display:none}[hidden]{display:none}
    /* custom */
    body {
      position: relative;
      width: 330px;
      box-sizing: border-box;
      margin: 5px;
    }
    body:after {
        position: absolute;
        content: "";
        width: 120%;
        height: 50%;
        top: -100px;
        left: -20px;
        transform-origin: top left;
        transform: skewY(3deg);
        z-index: -10;
        background: linear-gradient(45deg, #9d99de 0%, #99d4de 90%);
    }
    section {
      display: flex;
      flex-flow: row wrap;
    }
    label {
      margin: 5px auto;
    }
    input:focus {
        outline: none;
    }
    button, input, select {
        line-height: 1.15;
        margin: 2px 5px;
    }
    strong,
    label {
      display: block;
      font-size: 14px;
    }
    label, input {
      user-select: none;
      cursor: pointer;
    }

    label span {
      padding: 5px;
    }

    input[type=checkbox] {
      transform: scale(1.3);
      padding: 10px;
    }

    section {
      background: #fff;
      padding: 10px;
      margin: 10px auto;
      box-shadow: 0px 1px 0px 1px #55555512, 0px 2px 4px 1px #55555526;
    }
    #randomization {
        animation: enter 0.3s 0.1s ease both;
    }
    #special {
        animation: enter 0.3s 0.2s ease both;
    }
    @keyframes enter {
        0%, 60% {
            transform: translate(-15px, 0);
            opacity: 0;
        }
        100% {
            transform: translate(0);
            opacity: 1;
        }
    }
    .randomization-section,
    .block-section,
    .permission-section {
      width: 50%;
    }
    .show {
        opacity: 1;
    }
    .hide {
        opacity: 0;
    }
    #reboot {
        border: none;
        padding: 10px 20px;
        background: rgb(239, 239, 239);
    }
    #reboot:hover {
        background: #aaaaaa5c;
        box-shadow: 0px 1px 1px 1px #8079793d, 0px 1px 4px 3px #8079790f;
        transition: background 0.3s ease;
    }
    #reboot:not(:hover) {
        transition: background 0.3s ease;
    }
    #fingerprint {
        word-wrap: break-word;
        font-family: monospace;
        font-size: 12px;
        margin: 0 auto;
        min-height: 80px;
        color: #555;
        padding: 10px 20px;
        border-radius: 2px;
        background: #fff;
        transition: opacity 0.3s, height 0.3s;
    }
    #fingerprint:after {
        display: block;
        content: ''attr(data-fingerprint)'';
        white-space: pre-wrap;
    } 
  </style>
  <div id="fingerprint"></div>
  <section id="randomization">
    <div class="randomization-section">
      <strong>Randomize Every</strong>
        <label for="time1"><input id="time1" type="radio" value="1" name="time">1 Minute</label>
        <label for="time10"><input id="time10" type="radio" value="10" name="time">10 Minutes</label>
        <label for="time60"><input id="time60" type="radio" value="60" name="time">1 Hour</label>
        <label for="time480"><input id="time480" type="radio" value="480" name="time">8 Hours</label>
        <input title="Generate new randomization" id="reboot" type="button" value="New">
    </div>
    <div class="randomization-section">
        <strong>Randomize Fingerprint</strong>
        <label title="${systemDescription}"><input type="checkbox" id="system"><span>System</span></label>
        <label title="${screenDescription}"><input type="checkbox" id="screen"><span>Screen</span></label>
        <label title="${webgelDescription}"><input type="checkbox" id="gpu"><span>GPU</span></label>
        <label title="${touchDescription}"><input type="checkbox" id="touch"><span>Touch</span></label>
        <label title="${canvasDescription}"><input type="checkbox" id="canvasData"><span>Canvas</span></label>
    </div>
  </section>
  <section id="special">
    <div class="block-section">
        <strong>Block</strong>
        <span>Block APIs (breaks sites)</span>
        <label title="${speechDescription}"><input type="checkbox" id="speech"><span>Speech</span></label>
        <label title="${pluginsDescription}"><input type="checkbox" id="plugins"><span>Plugins</span></label>
        <label title="${mimeTypesDescription}"><input type="checkbox" id="mimetypes"><span>MimeTypes</span></label>
        <label title="${gamepadsDescription}"><input type="checkbox" id="gamepads"><span>Gamepads</span></label>
        <label title="${batteryDescription}"><input type="checkbox" id="battery"><span>Battery</span></label>
        <label title="${connectionDescription}"><input type="checkbox" id="connection"><span>Connection</span></label>
        <label title="${webrtcDescription}"><input type="checkbox" id="webrtc"><span>WebRTC</span></label>
    </div>
    <div class="permission-section">
        <strong>Notify Fingerprinting</strong>
        <label><input type="checkbox" id="notify"><span>Chrome</span></label>
        <strong>Require Permission</strong>
        <span>Pauses script execution</span>
        <label title="${canvasToDataURL}"><input type="checkbox" id="canvas"><span>Canvas</span></label>
        <label title="${audioChannelData}"><input type="checkbox" id="audio"><span>Audio</span></label>
        <label title="${clientRects}"><input type="checkbox" id="rects"><span>Rects</span></label>
        <label title="${webtrcDataChannel}"><input type="checkbox" id="rtcpeer"><span>WebRTC</span></label>
    </div>
  </section>
`
patch(id('app'), view, configureSettings)

//uniquely identify your browser and track your internet activity without your consent. 