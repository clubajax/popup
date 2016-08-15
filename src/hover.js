(function (popup, dom, on, fx) {

    popup.addPlugin({
        type: 'event',
        name: 'hover',
        create: function (options, disPlugin) {
    
            if(!options.input){
                console.error('The hover event must have an input');            
            }

            var log = 1;
            
            function onMouseOut (callback) {
                
                function checkMousedOut () {
                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        if(!overInput && !overPopup){
                            callback();
                        }
                    }, 300);
                }
                var 
                    timer,
                    overInput,
                    overPopup,
                    handles = [
                        on(options.input, 'mouseout', function () {
                            overInput = false;
                            checkMousedOut();
                        }),
                        on(options.popup, 'mouseout', function () {
                            overPopup = false;
                            checkMousedOut();
                        }),
                        on(options.input, 'mouseover', function () {
                            overInput = true;
                            checkMousedOut();
                        }),
                        on(options.popup, 'mouseover', function () {
                            overPopup = true;
                            checkMousedOut();
                        })
                    ];
    
                return {
                    remove: function () {
                        log && console.log('hover.remove');
                        handles.forEach(function (h) { h.remove(); });
                    },
                    pause: function () {
                        log && console.log('hover.pause');
                        handles.forEach(function (h) { h.pause(); });
                    },
                    resume: function () {
                        log && console.log('hover.resume');
                        handles.forEach(function (h) { h.resume(); });
                    }
                };
    
                
            }
            
            var 
                overHandle,
                outHandle;

            overHandle = on(options.input, 'mouseover', function () {
                disPlugin.show();
                if(!outHandle){
                    outHandle = onMouseOut(function () {
                        disPlugin.hide();
                        outHandle.pause();
                    });
                }
                outHandle.resume();
            });
            
            return {
                onShow: function () {
                    //log && console.log('hover.show');
                },
                onHide: function () {
                    //log && console.log('hover.hide');
                },
                destroy: function () {
                    if(overHandle){ overHandle.remove(); }
                    if(outHandle){ outHandle.remove(); }
                }
            }
        }
    });

}(window.popup, window.dom, window.on, window.fx));