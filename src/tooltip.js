(function (popup, dom, on, fx) {

    // tooltip plugin

    var
        order,
        place,
        plugins,
        PIN_CLASS = 'pin',
        gap = 5;

    order = {
        BL:'BL,BR,TL,TR'.split(','),
        BR: 'BR,BL,TR,TL'.split(','),
        TL:'TL,TR,BL,BR'.split(','),
        TR: 'TR,TL,BR,BL'.split(',')
    };

    function pin (popNode, box){
        var pin = dom('div', {class: PIN_CLASS, style:{height: box.p.height, width:box.p.width}}, document.body);
        pin.appendChild(popNode);
        return pin
    }

    function removePin (options, popNode, input) {
        if(popNode && popNode.parentNode && popNode.parentNode.className === PIN_CLASS){
            var parent = popNode.parentNode;
            parent.removeChild(popNode);
            dom.destroy(parent);
        }
    }

    function size (options, popNode, input) {
        var box = {
            gap: options.gap || gap
        };
        if(popNode){
            box.p = dom.box(popNode);
        }
        if(input){
            box.i = dom.box(input);
        }
        return box;
    }

    function autoPlace (options, popNode, input, box, posOrder ) {
        if(!options.auto){
            return false;
        }
        var p, win = dom.box(window);
        if(!posOrder || !posOrder.length){
            console.log('`auto` not available for center positions');
            return false;
        }

        p = posOrder.shift().split('');

        if(p[0] === 'B'){
            if( box.i.top + box.i.height + box.gap + box.p.height > win.height ){
                return autoPlace(options, popNode, input, box, posOrder);
            }
        }
        else{
            if( box.i.top + - box.gap - box.p.height < 0 ){
                return autoPlace(options, popNode, input, box, posOrder);
            }
        }

        if(p[1] === 'R'){
            if( box.i.left - box.gap - box.p.width < 0 ){
                return autoPlace(options, popNode, input, box, posOrder);
            }
        }
        else{
            if( box.i.left + box.i.width + box.gap + box.p.width > win.width ){
                return autoPlace(options, popNode, input, box, posOrder);
            }
        }

        place[p.join('')](options, popNode, input, box);
        return true;
    }

    place = {

        BL: function (options, popNode, input, force) {
            var box = force || size(options, popNode, input);
            if (!force && autoPlace(options, popNode, input, box, order.BL.concat())) { return; }
            dom.style(popNode, {
                position: 'absolute',
                left: box.i.left,
                top: box.i.top + box.i.height + box.gap
            });
        },

        BR: function (options, popNode, input, force) {
            var box = force || size(options, popNode, input);
            if (!force && autoPlace(options, popNode, input, box, order.BR.concat())) { return; }
            dom.style(popNode, {
                position: 'absolute',
                left: (box.i.left + box.i.width) - box.p.width,
                top: box.i.top + box.i.height + box.gap
            });
        },

        BC: function (options, popNode, input) {
            var box = size(options, popNode, input);
            dom.style(popNode, {
                position: 'absolute',
                left: (box.i.left + box.i.width / 2) - (box.p.width / 2),
                top: box.i.top + box.i.height + box.gap
            });
        },

        CL: function (options, popNode, input) {
            var box = size(options, popNode, input);
            dom.style(popNode, {
                position: 'absolute',
                left: box.i.left - box.p.width - box.gap,
                top: box.i.top + box.i.height / 2 - box.p.height / 2
            });
        },

        CR: function (options, popNode, input) {
            var box = size(options, popNode, input);
            dom.style(popNode, {
                position: 'absolute',
                left: box.i.left + box.i.width + box.gap,
                top: box.i.top + box.i.height / 2 - box.p.height / 2
            });
        },

        TL: function (options, popNode, input, force) {
            var
                pinNode,
                box = force || size(options, popNode, input);

            if (!force && autoPlace(options, popNode, input, box, order.TL.concat())) { return; }

            pinNode = pin(popNode, box);

            dom.style(pinNode, {
                position: 'absolute',
                left: box.i.left,
                top: box.i.top - box.p.height - box.gap
            });
            dom.style(popNode, {
                position: 'absolute',
                left: 0,
                bottom: 0
            });
        },

        TR: function (options, popNode, input, force) {
            var
                pinNode,
                box = force || size(options, popNode, input);

            if (!force && autoPlace(options, popNode, input, box, order.TR.concat())) { return; }

            pinNode = pin(popNode, box);

            dom.style(pinNode, {
                position: 'absolute',
                left: (box.i.left + box.i.width) - box.p.width,
                top: box.i.top - box.p.height - box.gap
            });
            dom.style(popNode, {
                position: 'absolute',
                left: 0,
                bottom: 0
            });
        },

        TC: function (options, popNode, input) {
            var
                box = size(options, popNode, input),
                pinNode = pin(popNode, box);

            dom.style(pinNode, {
                position: 'absolute',
                left: (box.i.left + box.i.width / 2) - box.p.width / 2,
                top: box.i.top - box.p.height - box.gap
            });
            dom.style(popNode, {
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

}(window.popup, window.dom, window.on, window.fx));