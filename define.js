(function () {
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
                hash = Math.imul(31, hash) + str.charCodeAt(i)|0
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

        injectScript(`
        (function() {
            // get device
            function webgl(extension) {
                const getParameter = WebGLRenderingContext.prototype.getParameter
                return function (x) {
                    return extension[x] ? extension[x] : getParameter.apply(this, arguments)
                }
            }
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
                        get: () => struct[prop]
                    }
                })
                return redefinedProps
            }
            function redefine(root) {
                Object.defineProperties(root.navigator, definify(navProps))
                Object.defineProperties(root.screen, definify(screenProps))
                Object.defineProperties(root.WebGLRenderingContext.prototype, definify(webglProps))
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