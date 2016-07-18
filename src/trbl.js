(function () {

    var
        order,
        place,
        plugins,
        PIN_CLASS = 'pin',
        popup = window.popup,
        gap = 5;

    order = {
        BL:'BL,BR,TL,TR'.split(','),
        BR: 'BR,BL,TR,TL'.split(','),
        TL:'TL,TR,BL,BR'.split(','),
        TR: 'TR,TL,BR,BL'.split(',')
    };

    function pin (popup, box){
        var pin = dom('div', {class: PIN_CLASS, style:{height: box.p.height, width:box.p.width}}, document.body);
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

    function autoPlace (options, popup, input, box, posOrder ) {
        if(!options.auto){
            return false;
        }
        var i, p, win = dom.box(window);
        if(!posOrder || !posOrder.length){
            console.log('`auto` not available for center positions');
            return false;
        }

        p = posOrder.shift().split('');
        if(p[0] === 'B'){
            if( box.i.top + box.i.height + box.gap + box.p.top + box.p.height > win.height ){
                return autoPlace(options, popup, input, box, posOrder);
            }
        }
        else{
            if( box.i.top + - box.gap - box.p.height < 0 ){
                return autoPlace(options, popup, input, box, posOrder);
            }
        }

        if(p[1] === 'R'){
            if( box.i.left - box.gap - box.p.width < 0 ){
                return autoPlace(options, popup, input, box, posOrder);
            }
        }
        else{
            if( box.i.left + box.i.width + box.gap + box.p.width > win.width ){
                return autoPlace(options, popup, input, box, posOrder);
            }
        }

        place[p.join('')](options, popup, input, box);
        return true;
    }

    place = {

        BL: function (options, popup, input, force) {
            var box = force || size(options, popup, input);
            if (!force && autoPlace(options, popup, input, box, order.BL)) { return; }
            dom.style(popup, {
                position: 'absolute',
                left: box.i.left,
                top: box.i.top + box.i.height + box.gap
            });
        },

        BR: function (options, popup, input, force) {
            var box = force || size(options, popup, input);
            if (!force && autoPlace(options, popup, input, box, order.BR)) { return; }
            dom.style(popup, {
                position: 'absolute',
                left: (box.i.left + box.i.width) - box.p.width,
                top: box.i.top + box.i.height + box.gap
            });
        },

        BC: function (options, popup, input) {
            var box = size(options, popup, input);
            dom.style(popup, {
                position: 'absolute',
                left: (box.i.left + box.i.width / 2) - (box.p.width / 2),
                top: box.i.top + box.i.height + box.gap
            });
        },

        CL: function (options, popup, input) {
            var box = size(options, popup, input);
            dom.style(popup, {
                position: 'absolute',
                left: box.i.left - box.p.width - box.gap,
                top: box.i.top + box.i.height / 2 - box.p.height / 2
            });
        },

        CR: function (options, popup, input) {
            var box = size(options, popup, input);
            dom.style(popup, {
                position: 'absolute',
                left: box.i.left + box.i.width + box.gap,
                top: box.i.top + box.i.height / 2 - box.p.height / 2
            });
        },

        TL: function (options, popup, input, force) {
            var
                pinNode,
                box = force || size(options, popup, input);
            if (!force && autoPlace(options, popup, input, box, order.TL)) { return; }

            pinNode = pin(popup, box);

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
        },

        TR: function (options, popup, input, force) {
            var
                pinNode,
                box = force || size(options, popup, input);
            if (!force && autoPlace(options, popup, input, box, order.TR)) { return; }

            pinNode = pin(popup, box);

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
        },

        TC: function (options, popup, input) {
            var
                box = size(options, popup, input),
                pinNode = pin(popup, box);

            dom.style(pinNode, {
                position: 'absolute',
                left: (box.i.left + box.i.width / 2) - box.p.width / 2,
                top: box.i.top - box.p.height - box.gap
            });
            dom.style(popup, {
                position: 'absolute',
                left: 0,
                bottom: 0
            });
        }
    };

    plugins = [{
        type: 'position',
        name: 'BL',
        place: place.BL
    },{
        type: 'position',
        name: 'BR',
        place: place.BR
    },{
        type: 'position',
        name: 'TL',
        place: place.TL,
        onClose: removePin
    },{
        type: 'position',
        name: 'TR',
        place: place.TR,
        onClose: removePin
    },{
        type: 'position',
        name: 'TC',
        place: place.TC,
        onClose: removePin
    },{
        type: 'position',
        name: 'BC',
        place: place.BC
    },{
        type: 'position',
        name: 'CL',
        place: place.CL
    },{
        type: 'position',
        name: 'CR',
        place: place.CR
    }];

    plugins.forEach(popup.addPlugin);

}());