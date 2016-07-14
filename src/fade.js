(function () {

    window.popup.addPlugin({
        type: 'animate',
        name: 'fade',
        show: function (options, popup, input, callback) {
            console.log('FADE IN', popup);
            fx.opacity(popup, {
                startOpacity: 0,
                opacity: 1,
                speed: options.speed,
                callback: callback
            })
        },
        hide: function (options, popup, input, callback) {
            console.log('FADE OUT', popup);
            fx.opacity(popup, {
                startOpacity: 1,
                opacity: 0,
                speed: options.speed,
                callback: callback
            })
        }
    });

}());