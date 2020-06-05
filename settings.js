//var color = document.getElementById('color').value;
//var likesColor = document.getElementById('like').checked;
const noop = () => { }
const setSync = (data, fn = noop) => chrome.storage.sync.set(data, fn)
const getSync = (data, fn = noop) => chrome.storage.sync.get(data, fn)
const id = (x) => document.getElementById(x)
const first = (x) => document.querySelector(x)


// chrome.storage.local.get(['struct', 'log'], define)
//{ fingerprintDetected: true, fingerprintScripts }

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

document.addEventListener('DOMContentLoaded', () => {

    const elements = {
        header: {
            fingerprint: id('fingerprint')
        },
        randomize: {
            time1El: id('time1'),
            time10El: id('time10'),
            time60El: id('time60'),
            time480El: id('time480'),
            platformEl: id('platform'),
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
            randomize: { time1El, time10El, time60El, time480El, platformEl, screensEl, gpuEl, touchEl },
            block: { speechEl, pluginsEl, mimetypesEl, gamepadsEl, batteryEl, connectionEl, webrtcEl },
            notify: { notifyEl },
            permission: { canvasEl, audioEl, rectsEl, rtcpeerEl }
        } = elements
        const {
            randomize: { time, platform, screens, gpu, touch },
            block: { speech, plugins, mimetypes, gamepads, battery, connection, webrtc },
            notify: { notification },
            permission: { canvas, audio, rects, rtcpeer }
        } = settings
        // randomize
        if (time == 1) { time1El.checked = true }
        else if (time == 10) { time10El.checked = true }
        else if (time == 60) { time60El.checked = true }
        else { time480El.checked = true }
        if (platform == true) { platformEl.checked = true }
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
            randomize: { time1El, time10El, time60El, time480El, platformEl, screensEl, gpuEl, touchEl },
            block: { speechEl, pluginsEl, mimetypesEl, gamepadsEl, batteryEl, connectionEl, webrtcEl },
            notify: { notifyEl },
            permission: { canvasEl, audioEl, rectsEl, rtcpeerEl }
        } = elements

        return body.addEventListener('click', event => {
            const el = event.target
            const updateSync = (obj, prop, value, reboot = false) => {
                const send = (message) => chrome.runtime.sendMessage(message)
                return getSync('settings', (response) => {
                    const { settings } = response
                    settings[obj][prop] = value
                    return setSync({ settings }, () => {
                        if (reboot) { send({execute:'reboot'}) }
                    })
                })  
            }
            
            if (el == time1El) { updateSync('randomize', 'time', 1, true) }
            if (el == time10El) { updateSync('randomize', 'time', 10, true) }
            if (el == time60El) { updateSync('randomize', 'time', 60, true) }
            if (el == time480El) { updateSync('randomize', 'time', 480, true) }
            if (el == platformEl) { updateSync('randomize', 'platform', platformEl.checked) }
            if (el == screensEl) { updateSync('randomize', 'screens', screensEl.checked) }
            if (el == gpuEl) { updateSync('randomize', 'gpu', gpuEl.checked) }
            if (el == touchEl) { updateSync('randomize', 'touch', touchEl.checked) }
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