(function () {


    function tick (callback) {
        window.requestAnimationFrame(callback);
    }

    window.popup.addPlugin({
        type: 'display',
        name: 'default',
        create: function (options, posPlugin, aniPlugin, evtPlugin) {

            var
                log = 1,
                animating,
                popup,
                node,
                showing,
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
                    popup = dom('div', {className: 'popup', style:{display:'inline-block'}, attr:{tabindex:0}}, document.body);
                    controller.popup = options.popup = popup;
                    controller.node = options.node = node;
                    popup.appendChild(node);
                }

                 evtPlugin.onShow();


                // set to abs so popup does not interfere with layout
                // prepare any layout dimensions for plugins to measure
                dom.style(popup, {
                    position: 'absolute',
                    display: '',
                    height: ''
                });

                console.log('tick', popup);
                tick(function () {
                    console.log('tick2', popup);
                    if(posPlugin){
                        console.log('popup.place', dom.style(popup, 'height'));
                        posPlugin.place(options, popup, options.input);
                    }

                    if(!aniPlugin){
                        popup.style.display = '';
                        tick(function () {
                            log && console.log('fire.open');
                            showing = true;
                            on.fire(controller, 'open');
                        });
                    }else{
                        var canceled, h = on(document.body, 'click', function () {
                            // checks if popup was canceled while opening
                            // TODO: perhaps close immediately
                            console.log('CANCELED - animating:', animating);
                            canceled = 1;
                        });
                        animating = true;
                        console.log('animate');
                        aniPlugin.show(options, popup, options.input, function () {
                            console.log('done show');
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
                        }else if(popup){ // may be destroyed
                            popup.style.display = 'none';
                        }
                        if(posPlugin && posPlugin.onClose){
                            posPlugin.onClose(options, popup, options.input);
                        }
                        if(aniPlugin && aniPlugin.onClose){
                            aniPlugin.onClose(options, popup, options.input);
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
                        aniPlugin.hide(options, popup, options.input, finish);
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