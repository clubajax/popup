(function () {

    window.popup.addPlugin({
        type: 'animate',
        name: 'wipe',
        show: function (options, popup, input, callback) {

            var node = options.aniNode || popup;
            console.log('wipe', dom.style(node, 'height'), node);
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

}());