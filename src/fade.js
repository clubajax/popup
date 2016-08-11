(function () {

    window.popup.addPlugin({
        type: 'animate',
        name: 'fade',
        show: function (options, popup, input, callback) {
            fx.opacity(popup, {
                startOpacity: 0,
                opacity: 1,
                speed: options.speed,
                callback: callback
            })
        },
        hide: function (options, popup, input, callback) {
            fx.opacity(popup, {
                startOpacity: 1,
                opacity: 0,
                speed: options.speed,
                callback: callback
            })
        }
    });

}());