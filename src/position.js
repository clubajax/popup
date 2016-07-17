(function () {

    var
        order,
        plugins,
        PIN_CLASS = 'pin',
        popup = window.popup,
        gap = 5;

    order = {
        BL:'BL,BR,BC,TL,TR,TC'.split(','),
        TL:'TL,TR,TC,BL,BR.BC'.split(',')
    };

    function pin (popup, box){
        var pin = dom('div', {class: PIN_CLASS, style:{height: box.height, width:box.width}}, document.body);
        pin.appendChild(popup);
        return pin
    }

    function removePin (options, popup, input) {
        if(popup && popup.parentNode && popup.parentNode.className === PIN_CLASS){
            var parent = popup.parentNode;
            parent.removeChild(popup);
            dom.destroy(parent);
        }
    }

    function BL (options, popup, input){
        var iBox = dom.box(input);
        dom.style(popup, {
            position: 'absolute',
            left: iBox.left,
            top: iBox.top + iBox.height + gap
        });
    }

    function BR (options, popup, input){
        var
            pBox = dom.box(popup),
            iBox = dom.box(input);
        dom.style(popup, {
            position: 'absolute',
            left: (iBox.left + iBox.width) - pBox.width,
            top: iBox.top + iBox.height + gap
        });
    }

    function TL (options, popup, input){
        var
            pBox = dom.box(popup),
            iBox = dom.box(input),
            pinNode = pin(popup, pBox);

        dom.style(pinNode, {
            position: 'absolute',
            left: iBox.left,
            top: iBox.top - pBox.height - gap
        });
        dom.style(popup, {
            position: 'absolute',
            left: 0,
            bottom: 0
        });
    }

    function TR (options, popup, input){
        var
            pBox = dom.box(popup),
            iBox = dom.box(input),
            pinNode = pin(popup, pBox);

        console.log(pBox.width, 'iBox', iBox);

        dom.style(pinNode, {
            position: 'absolute',
            left: (iBox.left + iBox.width) - pBox.width,
            top: iBox.top - pBox.height - gap
        });
        dom.style(popup, {
            position: 'absolute',
            left: 0,
            bottom: 0
        });
    }

    plugins = [{
        type: 'position',
        name: 'BL',
        place: BL
    },{
        type: 'position',
        name: 'BR',
        place: BR
    },{
        type: 'position',
        name: 'TL',
        place: TL,
        onClose: removePin
    },{
        type: 'position',
        name: 'TR',
        place: TR,
        onClose: removePin
    }];

    plugins.forEach(popup.addPlugin);

}());