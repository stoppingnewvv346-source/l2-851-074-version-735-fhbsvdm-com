(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector('video[data-hls-src]');
    var startButton = shell.querySelector('[data-player-start]');
    var message = shell.querySelector('[data-player-message]');
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-hls-src');
    var initialized = false;
    var hlsInstance = null;

    function setMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function initialize() {
      if (initialized) {
        return Promise.resolve();
      }
      initialized = true;
      setMessage('正在初始化播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('播放源已就绪');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage('视频加载失败，请稍后重试或检查播放源');
          }
        });
        return Promise.resolve();
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setMessage('浏览器原生 HLS 播放已启用');
        return Promise.resolve();
      }

      setMessage('当前浏览器不支持 HLS 播放，请使用新版 Chrome、Edge、Safari 或 Firefox');
      return Promise.reject(new Error('HLS is not supported'));
    }

    function play() {
      initialize().then(function () {
        return video.play();
      }).then(function () {
        if (startButton) {
          startButton.classList.add('is-hidden');
        }
      }).catch(function () {
        setMessage('播放未能自动开始，请再次点击视频控件播放');
      });
    }

    if (startButton) {
      startButton.addEventListener('click', play);
    }

    video.addEventListener('play', function () {
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (startButton && video.currentTime === 0) {
        startButton.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('.player-shell').forEach(setupPlayer);
})();
