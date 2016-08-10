(function () {



    window.popup.addPlugin({
        type: 'event',
        name: 'click',
        create: function (options, disPlugin) {
            var
                clickoffHandle,
                animating,
                log = 1;

            function handleClose () {
                if(!options.popup){
                    console.log('attempt to handleClose after destroy', options);
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

            function handleClickOff () {
                var offHandles = [];
                function checkClose (e) {
                    log && console.log('checkClose');
                    setTimeout(function(){
                        // timeout allows for activeElement to come into focus after target blur
                        log && console.log('check', e.type, document.activeElement);
                        var testNode = document.activeElement;
                        if(options.popup.contains(testNode) || (options.input && (options.input.contains(testNode)))){
                            console.log('contains!!!');
                            return;
                        }
                        disPlugin.hide();
                    },1)
                }

                if(!options.popup){
                    console.log('[ERROR] attempt to handleClose after destroy 2');
                    return;
                }

                offHandles.push(on(document.body, 'keyup', function (e) {
                    if(e.key === 'Escape'){
                        disPlugin.hide();
                    }
                }));
                offHandles.push(on(options.popup, 'blur', checkClose));
                if(options.input){
                    offHandles.push(on(options.input, 'blur', checkClose));
                }

                return {
                    remove: function () {
                        log && console.log('clickoff.remove');
                        offHandles.forEach(function (h) { h.remove(); });
                    },
                    pause: function () {
                        log && console.log('clickoff.pause');
                        offHandles.forEach(function (h) { h.pause(); });
                    },
                    resume: function () {
                        log && console.log('clickoff.resume');
                        offHandles.forEach(function (h) { h.resume(); });
                    }
                };
            }

            return {
                onShow: function () {
                    handleClose();
                },
                onHide: function () {
                    clickoff(false);
                },
                destroy: function () {
                    if(clickoffHandle){
                        clickoffHandle.remove();
                        clickoffHandle = null;
                    }
                }
            }
        }
    });

}());