(function (popup, dom, on, fx) {

    // drop plugin (dropdown selects)

    var
        log = 0,
        util = popup.util,
        BOT_MIN = 200,
        plugin = {
            type: 'position',
            name: 'drop',
            place: place,
            onClose: function (options, popNode) {
                util.unwrap(options, popNode);
            }
        };

    function placeTop (options, pop, input, box, win, space) {

        log && console.log('placeTop');

        util.wrap(options, Math.min(space, box.p.h), pop);

        dom.style(options.positionNode, {
            position: 'absolute',
            left: box.i.left,
            top: box.i.y - box.p.height - box.gap
        });
        dom.style(options.aniNode, {
            position: 'absolute',
            left: 0,
            bottom: 0
        });
    }

    function placeTopScroll (options, pop, input, box, win, space) {
        log && console.log('placeTopScroll');

        util.wrap(options, space, pop);

        dom.style(options.positionNode, {
            position: 'absolute',
            left: box.i.left,
            top: box.i.y - space
        });

        dom.style(options.aniNode, {
            position: 'absolute',
            bottom: 0
        });
    }

    function placeBot (options, pop, input, box, win, space) {
        log && console.log('placeBot', pop.parentNode);

        util.wrap(options, space, pop);
        dom.style(options.positionNode, {
            position: 'absolute',
            left: box.i.left,
            top: box.i.y + box.i.height + box.gap
        });
    }

    function placeBotScroll (options, pop, input, box, win, space) {
        log && console.log('placeBotScroll', box.i.y);

        util.wrap(options, space, pop);
        dom.style(options.positionNode, {
            position: 'absolute',
            left: box.i.left,
            top: box.i.y + box.i.height + box.gap
        });
    }

    function place (options, pop, input) {
        util.resetStyle(pop);
        var
            box = util.size(options, pop, input),
            win = dom.box(window),
            topSpace = box.i.top - (box.gap * 2),
            botSpace = win.height - (box.i.top + box.i.height + (box.gap * 2));


        //log && console.log('topSpace', topSpace, 'botSpace', botSpace, 'box', box);
        log && console.log('popheight', box.p.height);
        // force primarily used for testing, but there may be a use case in dev
        if(options.force === 'up'){
            return placeTopScroll(options, pop, input, box, win, topSpace);
        }
        else if(options.force === 'down'){
            return placeBotScroll(options, pop, input, box, win, botSpace);
        }

        if(box.p.height <= botSpace){
            // bottom
            log && console.log('bottom', input);
            placeBot(options, pop, input, box, win, botSpace);
        }
        else if(box.p.height <= topSpace){
            // top
            log && console.log('top');
            placeTop(options, pop, input, box, win, topSpace);
        }
        else if(botSpace >= BOT_MIN || botSpace > topSpace){
            // bottom, but scrolls
            placeBotScroll(options, pop, input, box, win, botSpace);
        }
        else{
            // top, but scrolls
            placeTopScroll(options, pop, input, box, win, topSpace);
        }

    }

    popup.addPlugin(plugin);

}(window.popup, window.dom, window.on, window.fx));