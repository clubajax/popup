(function () {

    var
        log = 0,
        popup = window.popup,
        gap = 5,
        POS_CLASS = 'pin',
        ANI_CLASS = 'ani',
        SCROLL_CLASS = 'scroller',
        BOT_MIN = 200,
        plugin = {
            type: 'position',
            name: 'drop',
            place: place,
            onClose: removePin
        };

    // FIXME: redundant code - make popup.util
    function pin (popup, box){
        var pin = dom('div', {class: POS_CLASS, style:{height: box.p.height, width:box.p.width}}, document.body);
        pin.appendChild(popup);
        return pin
    }

    function removePin (options, popup, input) {
        if(options.popup){
            options.popup.parentNode.removeChild(options.popup);
            dom.destroy(options.positionNode);
        }else if(popup && popup.parentNode && popup.parentNode.className === POS_CLASS){
            var parent = popup.parentNode;
            document.body.appendChild(popup);
            //parent.removeChild(popup);
            dom.destroy(parent);
        }

        delete options.positionNode;
        delete options.aniNode;
        delete options.scrollNode;
        delete options.popup;
    }

    function size (options, popup, input) {
        var box = {
            gap: options.gap || gap
        };
        if(popup){
            console.log('get size:::', popup.parentNode);
            if(!popup.parentNode){
                document.body.appendChild(popup);
                box.p = dom.box(popup);
                document.body.removeChild(popup);
            }else{
                box.p = dom.box(popup);
            }
        }
        if(input){
            box.i = dom.box(input);
        }
        return box;
    }

    // We need three nodes
    // popup
    //      fixed size
    // popup-ani
    //      sized to popup, abs pos for ani up
    //      can be overflow: hidden
    // popup-scroller
    //      for scrolling the content
    //      can NOT be overflow: hidden
    // would this affect the tip/modal popups?
    // can it be used just for drop.js?

    function wrapNode (options, h, popup) {
        console.log('wrap: ', h);
        options.positionNode = dom('div', {class: POS_CLASS, style:{height: h}}, document.body);
        options.aniNode = dom('div', {class: ANI_CLASS, style:{overflow: 'hidden', height: h}}, options.positionNode);
        options.scrollNode = dom('div', {class: SCROLL_CLASS, style:{overflow: 'auto', height: h}}, options.aniNode);
        options.scrollNode.appendChild(popup);
        options.popup = popup;
        popup.style.position = '';
    }

    function tick (callback) {
        window.requestAnimationFrame(callback);
    }

    function placeTop (options, popup, input, box, win, space) {
        log && console.log('placeTop');
        var pinNode = pin(popup, box);

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

    function placeTopScroll (options, popup, input, box, win, space) {
        log && console.log('placeTopScroll');

        wrapNode(options, space, popup);

        dom.style(options.positionNode, {
            position: 'absolute',
            left: box.i.left,
            top: box.i.top - space
        });

        dom.style(options.aniNode, {
            position: 'absolute',
            bottom: 0
        });
    }

    function placeBot (options, popup, input, box, win, space) {
        log && console.log('placeBot');
        dom.style(popup, {
            position: 'absolute',
            left: box.i.left,
            top: box.i.top + box.i.height + box.gap
        });
    }

    function placeBotScroll (options, popup, input, box, win, space) {
        log && console.log('placeBotScroll');

        wrapNode(options, space, popup);

        dom.style(options.positionNode, {
            position: 'absolute',
            left: box.i.left,
            top: box.i.top + box.i.height + box.gap
        });
    }

    function place (options, popup, input) {
        dom.style(popup, {
            position: 'absolute',
            display: '',
            height: ''
        });
            var
                box = size(options, popup, input),
                win = dom.box(window),
                topSpace = box.i.top - (box.gap * 2),
                botSpace = win.height - (box.i.top + box.i.height + (box.gap * 2));


            log && console.log('topSpace', topSpace, 'botSpace', botSpace, 'box.p.height', box.p.height);

            // force primarily used for testing, but there may be a use case in dev
            if(options.force === 'up'){
                return placeTopScroll(options, popup, input, box, win, topSpace);
            }
            else if(options.force === 'down'){
                return placeBotScroll(options, popup, input, box, win, botSpace);
            }

            if(box.p.height <= botSpace){
                // bottom
                log && console.log('bottom', input);
                placeBot(options, popup, input, box, win, botSpace);
            }
            else if(box.p.height <= topSpace){
                // top
                log && console.log('top');
                placeTop(options, popup, input, box, win, topSpace);
            }
            else if(botSpace >= BOT_MIN || botSpace > topSpace){
                // bottom, but scrolls
                placeBotScroll(options, popup, input, box, win, botSpace);
            }
            else{
                // top, but scrolls
                placeTopScroll(options, popup, input, box, win, topSpace);
            }

    }

    popup.addPlugin(plugin);

}());