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
            log = 0,
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
                popup = dom('div', {className: 'ay-popup', style:{display:'inline-block'}, attr:{tabindex:0}}, document.body);
                controller.popup = popup;
                controller.node = node;
                popup.appendChild(node);
                handleClose();
            }
            showing = true;

            posPlugin = getPlugin('position', options.position);
            aniPlugin = getPlugin('animate', options.animate);

            if(posPlugin){
                posPlugin.place(options, popup, options.input);
            }

            if(!aniPlugin){
                popup.style.display = '';
                tick(function () {
                    log && console.log('fire.open');
                    on.fire(controller, 'open');
                });
            }else{
                aniPlugin.show(options, popup, options.input, function () {
                    console.log('done show');
                    on.fire(controller, 'open');
                });
            }

        }

        function hide () {
            function close () {
                log && console.log('hide');

                showing = false;
                function finish () {
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
                        on.fire(controller, 'close');
                    });
                }
                var plugin = getPlugin('animate', options.animate);
                if(!plugin){
                    finish();
                }else{
                    plugin.hide(options, popup, options.input, finish);
                }
            }

            if(showing === false){ return; }
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
            switch (options.closeOn) {
                case 'self': break;
                case 'clickoff':
                    clickoff(true);
                    break;
            }
        }

        function handleClickOff () {
            var offHandles = [];
            function checkClose (e) {
                log && console.log('check', e.type, e.target, document.activeElement);

                var testNode = e.type === 'blur' ? document.activeElement : e.target;
                //testNode = e.target;

                if(popup.contains(testNode) || (options.input && (options.input.contains(testNode)))){
                    return;
                }
                hide();
            }

            if(!popup){
                console.log('[ERROR] attempt to handleClose after destroy 2');
                return;
            }

            log && console.log('clickoff.ready 1');
            offHandles.push(on(popup, 'blur', checkClose));
            if(options.input){
                offHandles.push(on(options.input, 'blur', checkClose));
            }

            log && console.log('clickoff.ready 4');
            offHandles.push(on(document.body, 'click', checkClose));

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

        // cannot overriding component destroy...
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