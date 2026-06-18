(function () {
    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playOverlay");
        var hlsInstance = null;
        var hasLoaded = false;

        if (!video || !sourceUrl) {
            return;
        }

        function loadSource() {
            if (hasLoaded) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }

            hasLoaded = true;
        }

        function startPlayback() {
            loadSource();
            if (overlay) {
                overlay.hidden = true;
            }
            video.controls = true;
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", function () {
            if (overlay) {
                overlay.hidden = true;
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });

        loadSource();
    };
})();
