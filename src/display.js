(function (popup, dom, on, fx) {


    function tick (callback) {
        window.requestAnimationFrame(callback);
    }

    popup.addPlugin({
        type: 'display',
        name: 'default',
        create: function (options, controller, posPlugin, aniPlugin, evtPlugin) {

            var
                log = 0,
                animating,
                pop,
                node,
                showing,
                util = popup.util,
                displayController = {
                    show: show,
                    hide: hide,
                    destroy: function () {
                        evtPlugin.destroy();
                        log && console.log('display.destroy');
                        dom.destroy(node);
                    }
                };

            evtPlugin = evtPlugin.create(options, displayController);

            function show () {
                if(showing === true){
                    log && console.log('already showing');
                    return;
                }
                showing = true;
                log && console.log('show');
                if(!node){
                    node = options.create();
                    if(!node){
                        throw new Error('The `popup.create` method must return a node');
                    }
                    pop = dom('div', {className: 'popup', style:{display:'inline-block'}, attr:{tabindex:0}}, document.body);
                    controller.popup = options.popup = pop;
                    controller.node = options.node = node;
                    pop.appendChild(node);
                }

                util.resetStyle(pop);
                if(evtPlugin.onShow) {
                    evtPlugin.onShow();
                }

                if(!aniPlugin){
                    showing = true;
                }
                tick(function () {
                    if(posPlugin){
                        posPlugin.place(options, pop, options.input);
                    }
                    if(!aniPlugin){
                        pop.style.display = '';
                        log && console.log('display.fire.open');
                        on.fire(controller, 'open');
                    }else{
                        animating = true;
                        aniPlugin.show(options, pop, options.input, function () {
                            log && console.log('done show');
                            animating = false;
                            on.fire(controller, 'open');
                        });
                    }
                });
            }

            function hide (callback) {

                function close () {
                    log && console.log('hide');
                    function finish () {
                        animating = false;
                        log && console.log('finish');
                        if(options.destroyOnClose){
                            displayController.destroy();
                        }else
                        if(pop){ // may be destroyed
                            pop.style.display = 'none';
                        }
                        if(posPlugin && posPlugin.onClose){
                            posPlugin.onClose(options, pop, options.input);
                        }
                        if(aniPlugin && aniPlugin.onClose){
                            aniPlugin.onClose(options, pop, options.input);
                        }
                        log && console.log('fire.close');
                        tick(function () {
                            log && console.log('emit.close');
                            // showing is set twice, to handle different click timings
                            // (in case show sets true after hide sets false)
                            showing = false;
                            on.fire(controller, 'close');
                        });
                        if(callback){
                            callback();
                        }
                    }

                    if(!aniPlugin){
                        finish();
                    }else{
                        animating = true;
                        aniPlugin.hide(options, pop, options.input, finish);
                    }
                }

                if(showing === false && !animating){
                    log && console.log('hide - not showing - animating', animating);
                    return;
                }else if(showing === false){
                    log && console.log('reverse animation');
                }

                showing = false;

                if(node){
                    log && console.log('check.hide');
                    if(options.closeDelay){
                        setTimeout(close, options.closeDelay);
                    }else{
                        close();
                    }
                }
                if(evtPlugin.onHide) {
                    evtPlugin.onHide();
                }
            }


            return displayController;
        }
    });
}(window.popup, window.dom, window.on, window.fx));