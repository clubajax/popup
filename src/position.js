(function () {

    var gap = 5;
    window.popup.addPlugin({
        type: 'position',
        name: 'BL',
        place: function (options, popup, input, callback) {
            console.log('PLACE');
            var iBox = dom.box(input);
            dom.style(popup, {
                position: 'absolute',
                left: iBox.left,
                top: iBox.top + iBox.height + gap
            });
        }
    });

}());