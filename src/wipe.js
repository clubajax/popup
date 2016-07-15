(function () {

    window.popup.addPlugin({
        type: 'animate',
        name: 'wipe',
        show: function (options, popup, input, callback) {
            console.log('WIPE IN', popup);
            fx.height(popup, {
                startHeight: 0,
                height: 'auto',
                speed: options.speed,
                callback: callback
            })
        },
        hide: function (options, popup, input, callback) {
            console.log('WIPE OUT', popup);
            fx.height(popup, {
                height: 0,
                speed: options.speed,
                callback: callback
            })
        }
    });

}());