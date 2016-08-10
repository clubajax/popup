(function(){

    function noop () {}

    var plugins = {};

    function tick (callback) {
        window.requestAnimationFrame(callback);
    }

    function addPlugin (plugin) {
        plugins[plugin.type] = plugins[plugin.type] || {};
        if(plugins[plugin.type][plugin.name]){
            throw Error('A popup plugin can only be installed once: ' + plugin.type + ' - ' + plugin.name);
        }
        plugins[plugin.type][plugin.name] = plugin;
    }

    function popup (options) {
        // TODO: handle hover?
        // options:
        //  create: function that lazily creates popup (must return one node)
        //  input: button or input that opens popup
        //  openOn: click, focus, enter, self
        //  closeOn: blur, clickoff
        //  position: auto, top, bottom, center, TL,TR,BL,BR, (etc) function
        //  rwd (position?)
        //  autosize: sizes to container? className?
        //  class: className to apply to popup
        //  animate: fade, wipe,
        //  destroyOnClose Boolean

        return createController(options);
    }

    function getPlugin (type, name) {
        if(!name){
            return null;
        }
        if(plugins[type]){
            if(!plugins[type][name]){
                console.warn('No position plugin found for `'+name+'`');
            }else{
                return plugins[type][name];
            }
        }
        return null;
    }

    popup.plugins = plugins;
    popup.addPlugin = addPlugin;
    window.popup = popup;

    function createController (options) {
        var
            node,
            popup,
            showing,
            clickoffHandle,
            posPlugin,
            aniPlugin,
            handles = [],
            log = 1,
            animating,
            controller = dom('div');

        controller.on = function (eventName, selector, callback) {
            var handle = on(controller, eventName, selector, callback);
            handles.push(handle);
            return handle;
        };
        controller.once = function (eventName, selector, callback) {
            var handle = once(controller, eventName, selector, callback);
            handles.push(handle);
            return handle;
        };

        function show () {
            if(showing === true){ return; }
            log && console.log('show');
            if(!node){
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


            posPlugin = getPlugin('position', options.position);
            aniPlugin = getPlugin('animate', options.animate);

            // set to abs so popup does not interfere with layout
            // prepare any layout dimensions for plugins to measure
            dom.style(popup, {
                position: 'absolute',
                display: '',
                height: ''
            });

            tick(function () {
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

                var plugin = getPlugin('animate', options.animate);
                if(!plugin){
                    finish();
                }else{
                    animating = true;
                    plugin.hide(options, popup, options.input, finish);
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

        function destroy () {
            if(node){ dom.destroy(node); }
            if(popup){ dom.destroy(popup); }
            if(clickoffHandle){
                clickoffHandle.remove();
                clickoffHandle = null;
            }
            controller.popup = popup = null;
            controller.node = node = null;
            log && console.log('destroy');
        }

        function handleOpen () {
            if(options.input){
                if(options.openOn === 'click'){
                    handles.push(on(options.input, 'click', show));
                }else{
                    console.log('*no openOn');
                    show();
                }
            }
            else{
                // no input
                if(options.openOn !== 'self'){
                    // just open it
                    show();
                }
            }
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

        controller.open = show;
        controller.close = hide;
        controller.toggle = noop;

        controller.destroy = function () {
            log && console.log('destroy');
            hide();
            destroy();
            controller.open = noop;
            controller.close = noop;
            controller.toggle = noop;
            handles.forEach(function (h) {
                h.remove();
            });
        };

        handleOpen(controller, options);

        window.controller = controller;
        return controller;
    }



}());