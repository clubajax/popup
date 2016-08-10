(function () {

    var log = 1;

    function tick (callback) {
        window.requestAnimationFrame(callback);
    }

    window.popup.addPlugin({
        type: 'display',
        name: 'default',
        create: function (options, posPlugin, aniPlugin) {

            var
                clickoffHandle,
                animating,
                popup,
                node,
                showing;

            function show () {
                if(showing === true){ return; }
                log && console.log('show');
                if(!node){
                    console.log('CREATE NODE');
                    node = options.create();
                    if(!node){
                        throw new Error('The `popup.create` method must return a node');
                    }
                    popup = dom('div', {className: 'popup', style:{display:'inline-block'}, attr:{tabindex:0}}, document.body);
                    controller.popup = popup;
                    controller.node = node;
                    popup.appendChild(node);
                }

                handleClose();


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
                clickoff(false);
            }


            function handleClose () {
                if(!popup){
                    console.log('attempt to handleClose after destroy');
                    return;
                }
                var closeOn = options.closeOn || options.openOn === 'click' ? 'clickoff' : false;
                switch (closeOn) {
                    case 'self': break;
                    case 'clickoff':
                        clickoff(true);
                        break;
                }
            }

            function handleClickOff () {
                var offHandles = [];
                function checkClose (e) {
                    log && console.log('checkClose');
                    setTimeout(function(){
                        // timeout allows for activeElement to come into focus after target blur
                        log && console.log('check', e.type, document.activeElement);
                        var testNode = document.activeElement;
                        if(popup.contains(testNode) || (options.input && (options.input.contains(testNode)))){
                            console.log('contains!!!');
                            return;
                        }
                        console.log('HiDE!');
                        hide();
                    },1)
                }

                if(!popup){
                    console.log('[ERROR] attempt to handleClose after destroy 2');
                    return;
                }

                offHandles.push(on(document.body, 'keyup', function (e) {
                    if(e.key === 'Escape'){
                        hide();
                    }
                }));
                offHandles.push(on(popup, 'blur', checkClose));
                if(options.input){
                    offHandles.push(on(options.input, 'blur', checkClose));
                }

                return {
                    remove: function () {
                        offHandles.forEach(function (h) { h.remove(); });
                    },
                    pause: function () {
                        offHandles.forEach(function (h) { h.pause(); });
                    },
                    resume: function () {
                        offHandles.forEach(function (h) { h.resume(); });
                    }
                };
            }

            function clickoff (resume) {
                log && console.log('clickoff', resume);
                if(resume){
                    if(!clickoffHandle){
                        // This might need a timeout here
                        log && console.log('clickoff.create');
                        clickoffHandle = handleClickOff();
                    }else{
                        setTimeout(function () {
                            log && console.log('clickoff.resume');
                            if(options.input){
                                options.input.focus();
                            }
                            clickoffHandle.resume();
                        }, 100);
                    }
                }else if(clickoffHandle){
                    clickoffHandle.pause();
                }
            }

            return {
                show: show,
                hide: hide,
                destroy: function () {
                    if(clickoffHandle){
                        clickoffHandle.remove();
                        clickoffHandle = null;
                    }
                }
            };
        }
    });
}());