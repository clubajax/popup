(function () {


    function tick (callback) {
        window.requestAnimationFrame(callback);
    }

    window.popup.addPlugin({
        type: 'display',
        name: 'default',
        create: function (options, posPlugin, aniPlugin, evtPlugin) {

            var
                log = 0,
                animating,
                pop,
                node,
                showing,
                util = window.popup.util,
                displayController = {
                    show: show,
                    hide: hide,
                    destroy: function () {
                        evtPlugin.destroy();
                    }
                };

            evtPlugin = evtPlugin.create(options, displayController);

            function show () {
                if(showing === true){ return; }
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

                 evtPlugin.onShow();

                util.resetStyle(pop);

                tick(function () {
                    if(posPlugin){
                        posPlugin.place(options, pop, options.input);
                    }

                    if(!aniPlugin){
                        pop.style.display = '';
                        tick(function () {
                            log && console.log('fire.open');
                            showing = true;
                            on.fire(controller, 'open');
                        });
                    }else{
                        var canceled, h = on(document.body, 'click', function () {
                            // checks if pop was canceled while opening
                            // TODO: perhaps close immediately
                            console.log('CANCELED - animating:', animating);
                            canceled = 1;
                        });
                        animating = true;
                        aniPlugin.show(options, pop, options.input, function () {
                            log && console.log('done show');
                            animating = false;
                            h.remove();
                            showing = true;
                            if(canceled){
                                hide();
                            }else{
                                on.fire(controller, 'open');
                            }
                        });
                    }
                });
            }

            function hide () {
                function close () {
                    log && console.log('hide');
                    function finish () {
                        animating = false;
                        log && console.log('finish');
                        if(options.destroyOnClose){
                            destroy();
                        }else if(pop){ // may be destroyed
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
                            showing = false;
                            on.fire(controller, 'close');
                        });
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
                    console.log('reverse animation');
                }

                if(node){
                    log && console.log('check.hide');
                    if(options.closeDelay){
                        setTimeout(close, options.closeDelay);
                    }else{
                        close();
                    }
                }
                evtPlugin.onHide();
            }


            return displayController;
        }
    });
}());