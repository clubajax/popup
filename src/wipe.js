(function(popup, dom, on, fx) {

    popup.addPlugin({
        type: 'animate',
        name: 'wipe',
        show: function (options, popup, input, callback) {
            var node = options.aniNode || popup;
            fx.height(node, {
                startHeight: 0,
                //height: 'auto',
                height: dom.style(node, 'height') || 'auto',
                speed: options.speed,
                callback: callback
            })
        },
        hide: function (options, popup, input, callback) {
            fx.height(options.aniNode || popup, {
                height: 0,
                speed: options.speed,
                callback: callback
            })
        }
    });

}(window.popup, window.dom, window.on, window.fx));