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

    function size (options, popup, input) {
        var box = {
            gap: options.gap || gap
        };
        if(popup){
            box.p = dom.box(popup);
        }
        if(input){
            box.i = dom.box(input);
        }
        return box;
    }

    function BL (options, popup, input){
        var box = size(options, null, input);
        dom.style(popup, {
            position: 'absolute',
            left: box.i.left,
            top: box.i.top + box.i.height + box.gap
        });
    }

    function BR (options, popup, input){
        var box = size(options, popup, input);
        dom.style(popup, {
            position: 'absolute',
            left: (box.i.left + box.i.width) - box.p.width,
            top: box.i.top + box.i.height + box.gap
        });
    }

    function TL (options, popup, input){
        var
            box = size(options, popup, input),
            pinNode = pin(popup, box.p);

        dom.style(pinNode, {
            position: 'absolute',
            left: box.i.left,
            top: box.i.top - box.p.height - box.gap
        });
        dom.style(popup, {
            position: 'absolute',
            left: 0,
            bottom: 0
        });
    }

    function TR (options, popup, input){
        var
            box = size(options, popup, input),
            pinNode = pin(popup, box.p);

        dom.style(pinNode, {
            position: 'absolute',
            left: (box.i.left + box.i.width) - box.p.width,
            top: box.i.top - box.p.height - box.gap
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