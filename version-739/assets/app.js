(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function setMobileNav() {
    var toggle = qs('.menu-toggle');
    var mobile = qs('.mobile-nav');
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      mobile.hidden = expanded;
    });
  }

  function setHeroSlider() {
    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dot');
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        restart();
      });
    });

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    restart();
  }

  function setSearchPage() {
    var container = qs('#search-results');
    var status = qs('#search-status');
    if (!container || !status || !window.movieSearchIndex) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var heroInput = qs('.hero-search input[name="q"]');
    if (heroInput) {
      heroInput.value = query;
    }

    if (!query) {
      return;
    }

    var lowered = query.toLowerCase();
    var results = window.movieSearchIndex.filter(function (item) {
      return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine]
        .join(' ')
        .toLowerCase()
        .indexOf(lowered) !== -1;
    }).slice(0, 120);

    status.textContent = results.length ? '搜索结果：' + query : '没有找到相关内容：' + query;
    container.innerHTML = results.map(function (item) {
      return [
        '<a class="movie-card" href="' + item.url + '">',
        '  <div class="card-poster">',
        '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="card-year">' + escapeHtml(item.year) + '</span>',
        '  </div>',
        '  <div class="card-body">',
        '    <div class="card-type">' + escapeHtml(item.type) + '</div>',
        '    <h3>' + escapeHtml(item.title) + '</h3>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="card-tags"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre.split(/[\/，,、\s]+/)[0] || item.type) + '</span></div>',
        '  </div>',
        '</a>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setPlayer() {
    var video = qs('#site-video');
    var overlay = qs('.player-overlay');
    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var hlsInstance = null;
    var ready = false;

    function attach() {
      if (ready || !stream) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function start() {
      attach();
      if (overlay) {
        overlay.classList.add('hidden');
      }
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          video.controls = true;
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setMobileNav();
    setHeroSlider();
    setSearchPage();
    setPlayer();
  });
})();
