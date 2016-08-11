(function(){

    function noop () {}

    var plugins = {};

    function addPlugin (plugin) {
        plugins[plugin.type] = plugins[plugin.type] || {};
        if(plugins[plugin.type][plugin.name]){
            throw Error('A popup plugin can only be installed once: ' + plugin.type + ' - ' + plugin.name);
        }
        plugins[plugin.type][plugin.name] = plugin;
    }

    // TODO: make a display plugin, for hide/show
    // TODO: maybe make a click and hover plugin
    // TODO: make logging an option

    function popup (options) {
        // TODO: handle hover?
        // options:
        //  create: function that lazily creates popup (must return one node) TODO: could `node` be an option?
        //  input: button or input that opens popup
        //  openOn: click, focus, enter, self TODO: hover
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

        if(!options.openOn){
            options.openOn = 'default';
        }

        var
            log = 0,
            node,
            popup,
            handles = [],
            controller = dom('div'),
            posPlugin = getPlugin('position', options.position),
            aniPlugin = getPlugin('animate', options.animate),
            evtPlugin = getPlugin('event', options.event || 'click'),
            disPlugin = getPlugin('display', options.display || 'default').create(options, controller, posPlugin, aniPlugin, evtPlugin);

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

        function destroy () {
            if(node){ dom.destroy(node); }
            if(popup){ dom.destroy(popup); }
            if(disPlugin){
                disPlugin.destroy();
            }
            controller.popup = popup = null;
            controller.node = node = null;
            log && console.log('destroy');
        }

        function handleOpen () {
            if(options.openOn === 'default'){
                // just open it
                disPlugin.show();
            }
        }

        controller.open = disPlugin.show;
        controller.close = disPlugin.hide;
        controller.toggle = noop;
        controller.destroy = function () {
            log && console.log('destroy');
            disPlugin.hide();
            destroy();
            controller.open = noop;
            controller.close = noop;
            controller.toggle = noop;
            handles.forEach(function (h) {
                h.remove();
            });
        };

        handleOpen();

        window.controller = controller;
        return controller;
    }



}());