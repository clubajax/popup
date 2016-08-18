(function (popup, dom, on, fx) {

    // fade plugin

    popup.addPlugin({
        type: 'animate',
        name: 'fade',
        show: function (options, popNode, input, callback) {
            fx.style(popNode, {
                opacity:{
                    beg: 0,
                    end: 1
                },
                speed: options.speed,
                callback: callback
            });
        },
        hide: function (options, popNode, input, callback) {
            fx.style(popNode, {
                opacity:{
                    beg: 1,
                    end: 0
                },
                speed: options.speed,
                callback: callback
            });
        }
    });

}(window.popup, window.dom, window.on, window.fx));