(function () {

    var
        log = 1,
        popup = window.popup,
        gap = 5,
        plugin = {
            type: 'position',
            name: 'drop',
            place: place
        };

    // FIXME: redundant code
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

    var
        PIN_CLASS = 'pin',
        BOT_MIN = 200;

    function placeTop (options, popup, input, box, win, space) {
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
        var pinNode = pin(popup, box);

        dom.style(pinNode, {
            position: 'absolute',
            left: box.i.left,
            top: box.i.top - space,
            height: space - box.gap,
        });
        dom.style(popup, {
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: space - box.gap,
            overflowY: 'scroll'
        });
    }

    function placeBot (options, popup, input, box, win, space) {
        dom.style(popup, {
            position: 'absolute',
            left: box.i.left,
            top: box.i.top + box.i.height + box.gap
        });
    }

    function placeBotScroll (options, popup, input, box, win, space) {
        log && console.log('placeBotScroll');
        dom.style(popup, {
            position: 'absolute',
            left: box.i.left,
            top: box.i.top + box.i.height + box.gap,
            height: space,
            overflowY: 'scroll'
        });
    }

    function place (options, popup, input) {
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
            log && console.log('bottom');
            placeBot(options, popup, input, box, win, botSpace);
        }
        else if(box.p.height <= topSpace){
            // top
            log && console.log('top');
            placeTop(options, popup, input, box, win, topSpace);
        }
        else if(botSpace <= BOT_MIN || botSpace > topSpace){
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