(function(popup, dom, on, fx) {

    popup.addPlugin({
        type: 'animate',
        name: 'wipe',
        show: function (options, popNode, input, callback) {
            fx.style(options.aniNode || popNode, {
                height:{
                    beg: 0,
                    end: 'auto'
                },
                speed: options.speed,
                callback: callback
            });
        },
        hide: function (options, popNode, input, callback) {
            fx.style(options.aniNode || popNode, {
                height:{
                    beg: 'auto',
                    end: 0
                },
                speed: options.speed,
                callback: callback
            });
        }
    });

}(window.popup, window.dom, window.on, window.fx));