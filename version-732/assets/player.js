(function () {
  function initPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-player-start]');
    var message = shell.querySelector('[data-player-message]');
    var source = shell.getAttribute('data-video-src');
    var hls = null;
    var initialized = false;

    function setMessage(text, isError) {
      if (!message) {
        return;
      }

      message.textContent = text;
      message.classList.toggle('is-error', Boolean(isError));
    }

    function playVideo() {
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setMessage('浏览器阻止了自动播放，请再次点击播放按钮。', false);
        });
      }
    }

    function initialize() {
      if (!source) {
        setMessage('当前影片没有可用播放源。', true);
        return;
      }

      if (initialized) {
        playVideo();
        return;
      }

      initialized = true;
      setMessage('正在初始化 HLS 播放源…', false);

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('播放源已就绪。', false);
          playVideo();
        });

        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setMessage('网络错误，正在重试加载播放源。', true);
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setMessage('媒体错误，正在尝试恢复。', true);
            hls.recoverMediaError();
          } else {
            setMessage('播放源无法加载，请稍后重试。', true);
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setMessage('播放源已就绪。', false);
          playVideo();
        }, { once: true });
      } else {
        setMessage('当前浏览器不支持 HLS 播放，请更换浏览器或开启 HLS 支持。', true);
      }
    }

    if (button) {
      button.addEventListener('click', function () {
        button.classList.add('is-hidden');
        initialize();
      });
    }

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && button) {
        button.classList.remove('is-hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.player-shell').forEach(initPlayer);
  });
})();
