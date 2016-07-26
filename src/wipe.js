(function () {

    window.popup.addPlugin({
        type: 'animate',
        name: 'wipe',
        show: function (options, popup, input, callback) {
            //console.log('wipe', popup, dom.style(popup, 'height'));
            fx.height(popup, {
                startHeight: 0,
                height: 'auto',
                //height: dom.style(popup, 'height') || 'auto',
                speed: options.speed,
                callback: callback
            })
        },
        hide: function (options, popup, input, callback) {
            fx.height(popup, {
                height: 0,
                speed: options.speed,
                callback: callback
            })
        }
    });

}());