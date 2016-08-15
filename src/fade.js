(function (popup, dom, on, fx) {

    // fade plugin

    popup.addPlugin({
        type: 'animate',
        name: 'fade',
        show: function (options, popNode, input, callback) {
            fx.opacity(popNode, {
                startOpacity: 0,
                opacity: 1,
                speed: options.speed,
                callback: callback
            })
        },
        hide: function (options, popNode, input, callback) {
            fx.opacity(popNode, {
                startOpacity: 1,
                opacity: 0,
                speed: options.speed,
                callback: callback
            })
        }
    });

}(window.popup, window.dom, window.on, window.fx));