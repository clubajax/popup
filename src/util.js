(function () {

    var
        POS_CLASS = 'pin',
        ANI_CLASS = 'ani',
        SCROLL_CLASS = 'scroller',
        defaultGap = 5;

    window.popup.util = {

        wrap: function (options, h, pop) {
            // We need three nodes
            // popup
            //      fixed size
            // popup-ani
            //      sized to popup, abs pos for ani up
            //      can be overflow: hidden
            // popup-scroller
            //      for scrolling the content
            //      can NOT be overflow: hidden
            // would this affect the tip/modal popups?
            // can it be used just for drop.js?

            options.positionNode = dom('div', {class: POS_CLASS, style:{height: h}}, document.body);
            options.aniNode = dom('div', {class: ANI_CLASS, style:{overflow: 'hidden', height: h}}, options.positionNode);
            options.scrollNode = dom('div', {class: SCROLL_CLASS, style:{overflow: 'auto', height: h}}, options.aniNode);
            options.scrollNode.appendChild(pop);
            options.popup = pop;
            pop.style.position = '';
        },

        unwrap: function (options, popup, input) {
            popup = popup || options.popup;
            if(popup && popup.parentNode && popup.parentNode.className === POS_CLASS){
                var parent = popup.parentNode;
                document.body.appendChild(popup);
                dom.destroy(parent);
            }

            delete options.positionNode;
            delete options.aniNode;
            delete options.scrollNode;
            //delete options.popup;
        },

        // TODO: Move measurements to dom
        //
        size: function (options, popup, input) {
            var
                parent,
                box = {
                    gap: options.gap || defaultGap
                };
            if(popup){
                dom.style(popup, {
                    display: '',
                    height: ''
                });
                if(!popup.parentNode){
                    document.body.appendChild(popup);
                    box.p = dom.box(popup);
                    document.body.removeChild(popup);
                }else{
                    parent = popup.parentNode;
                    document.body.appendChild(popup);
                    box.p = dom.box(popup);
                    parent.appendChild(popup);
                }
            }
            if(input){
                box.i = dom.box(input);
            }
            return box;
        },

        height: function (node) {
            if (!node) {
                return 0;
            }

            if(node === window){
                return node.innerHeight;
            }

            var
                detached,
                height,
                previousDisplay,
                previousHeight = dom.style(node, 'height');

            if (previousHeight > 0) {
                return previousHeight;
            }

            previousDisplay = node.style.display;

            dom.style(node, {
                display: '',
                height: ''
            });

            if(!node.parentNode){
                detached = true;
                document.body.appendChild(node);
            }

            height = node.clientHeight;
            dom.style(node, {
                display: previousDisplay,
                height: previousHeight
            });

            if(detached){
                document.body.removeChild(node);
            }

            return height;
        },

        resetStyle: function (node) {
            // set to abs so popup does not interfere with layout
            // prepare any layout dimensions for plugins to measure
            dom.style(node, {
                position: 'absolute',
                display: '',
                height: ''
            });
        },

        tick: function (callback) {
            window.requestAnimationFrame(callback);
        }
    };

}());