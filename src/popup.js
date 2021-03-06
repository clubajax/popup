(function(dom, on){ // fx is not UMD yet

    function noop () {}



    // TODO: make a hover plugin
    // TODO: make logging an option

    function popup (options) {
        // TODO: handle hover?
        // options:
        //  create: function that lazily creates popup (must return one node) TODO: could `node` be an option?
        //  input: button or input that opens popup
        //  event: click, self,  TODO: hover
        //  closeOn: blur, clickoff
        //  position: auto, top, bottom, center, TL,TR,BL,BR, (etc) function
        //  rwd (position?)
        //  autosize: sizes to container? className?
        //  class: className to apply to popup
        //  animate: fade, wipe,
        //  destroyOnClose Boolean

        return createController(options);
    }

    popup.plugins = {};

    function getPlugin (type, name) {
        if(!name){
            return null;
        }
        if(popup.plugins[type]){
            if(!popup.plugins[type][name]){
                console.warn('No `'+type+'` plugin found for `'+name+'`');
            }else{
                return popup.plugins[type][name];
            }
        }
        return null;
    }

    function addPlugin (plugin) {
        popup.plugins[plugin.type] = popup.plugins[plugin.type] || {};
        if(popup.plugins[plugin.type][plugin.name]){
            throw Error('A popup plugin can only be installed once: ' + plugin.type + ' - ' + plugin.name);
        }
        popup.plugins[plugin.type][plugin.name] = plugin;
    }

    addPlugin({
        type: 'event',
        name: 'default',
        create: function (options, controller) {
            return {
                onShow: function () {
                    //on.fire(controller, 'open');
                },
                onHide: noop,
                destroy: noop
            }
        }
    });


    popup.addPlugin = addPlugin;

    function createController (options) {

        options.event = options.event || 'default';

        var
            log = 0,
            node,
            handles = [],
            controller = dom('div'),
            posPlugin = getPlugin('position', options.position),
            aniPlugin = getPlugin('animate', options.animate),
            evtPlugin = getPlugin('event', options.event),
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
            if(disPlugin){
                disPlugin.hide();
                disPlugin.destroy();
            }
            controller.node = node = null;
            controller.popup = null;
            controller.open = noop;
            controller.close = noop;
            controller.toggle = noop;
            popup.util.tick(function () {
                handles.forEach(function (h) {
                    h.remove();
                });
            });
            log && console.log('destroy');
        }

        function show () {
            disPlugin.show();
        }

        function hide () {
            disPlugin.hide(function () {
                if(options.destroyOnClose){
                    destroy();
                }
            });
        }

        controller.open = show;
        controller.close = hide;
        controller.toggle = noop;
        controller.destroy = destroy;

        if(options.event === 'default'){
            // just open it
            disPlugin.show();
        }

        return controller;
    }

    if (typeof window !== 'undefined') {
        // global
        window.popup = popup;
    }
    else if (typeof module !== 'undefined') {
        //CJS
        module.exports = popup;
    }
    else {
        // AMD
        return popup;
    }

}(window.dom, window.on));