(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    function getScriptBase() {
        var scripts = document.getElementsByTagName('script');
        for (var i = scripts.length - 1; i >= 0; i -= 1) {
            var src = scripts[i].getAttribute('src') || '';
            if (src.indexOf('player.js') !== -1) {
                return new URL('.', scripts[i].src);
            }
        }
        return new URL('./assets/', window.location.href);
    }

    ready(function () {
        var base = getScriptBase();
        var roots = Array.prototype.slice.call(document.querySelectorAll('[data-player-root]'));

        roots.forEach(function (root) {
            var video = root.querySelector('video');
            var start = root.querySelector('.player-start');
            var config = root.querySelector('.playback-config');
            var source = '';
            var attached = false;
            var pending = false;
            var hlsInstance = null;

            if (!video || !start || !config) {
                return;
            }

            try {
                source = JSON.parse(config.textContent || '{}').src || '';
            } catch (error) {
                source = '';
            }

            function loadLocalHls() {
                return import(new URL('hls-dru42stk.js', base).href).then(function (module) {
                    return module.H;
                }).catch(function () {
                    return null;
                });
            }

            function getHls() {
                if (window.Hls) {
                    return Promise.resolve(window.Hls);
                }
                return loadLocalHls();
            }

            function attach() {
                if (attached) {
                    return Promise.resolve();
                }
                attached = true;

                if (!source) {
                    return Promise.resolve();
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    return Promise.resolve();
                }

                return getHls().then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        hlsInstance = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = source;
                    }
                });
            }

            function play() {
                if (pending) {
                    return;
                }
                pending = true;
                start.classList.add('is-hidden');

                attach().then(function () {
                    var attempt = video.play();
                    if (attempt && typeof attempt.catch === 'function') {
                        attempt.catch(function () {
                            start.classList.remove('is-hidden');
                        });
                    }
                }).catch(function () {
                    start.classList.remove('is-hidden');
                }).finally(function () {
                    pending = false;
                });
            }

            start.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                start.classList.add('is-hidden');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    start.classList.remove('is-hidden');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    });
})();
