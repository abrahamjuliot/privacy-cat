//var color = document.getElementById('color').value;
//var likesColor = document.getElementById('like').checked;
const noop = ()=>{}
const setSync = (data, fn = noop) => chrome.storage.sync.set(data, fn)
const getSync = (data, fn = noop) => chrome.storage.sync.get(data, fn)
const id = (x) => document.getElementById(x)
const first = (x) => document.querySelector(x)
document.addEventListener('DOMContentLoaded', getSync(/*?*/))

const body = first('body')
// input
const randomize = id('randomize')
const time = id('time')
const platform = id('platform')
const screenEl = id('screen')
const gpu = id('gpu')
const touch = id('touch')
const speech = id('speech')
const plugins = id('plugins')
const mimetypes = id('mimetypes')
const gamepads = id('gamepads')
const battery = id('battery')
const connection = id('connection')
const webrtc = id('webrtc')
const alertEl = id('alert')
const notify = id('notify')

body.addEventListener('click', event => {
    const el = event.target

    if (el == randomize) { console.log('randomize') }
    if (el == time) { console.log('time') }
    if (el == platform) { console.log('platform') }
    if (el == screenEl) { console.log('screenEl') }
    if (el == gpu) { console.log('gpu') }
    if (el == touch) { console.log('touch') }
    if (el == speech) { console.log('speech') }
    if (el == plugins) { console.log('plugins') }
    if (el == mimetypes) { console.log('mimetypes') }
    if (el == gamepads) { console.log('gamepads') }
    if (el == battery) { console.log('battery') }
    if (el == connection) { console.log('connection') }
    if (el == webrtc) { console.log('webrtc') }
    if (el == alertEl) { console.log('alertEl') }
    if (el == notify) { console.log('notify') }

    return
})