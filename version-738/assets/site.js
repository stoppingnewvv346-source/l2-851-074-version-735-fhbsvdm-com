(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupSearchForms() {
    document.querySelectorAll('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var prev = root.querySelector('.hero-prev');
    var next = root.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function yearMatches(value, selected) {
    if (!selected || selected === '全部年份') {
      return true;
    }
    var year = parseInt(value, 10);
    if (selected === '2010-2019') {
      return year >= 2010 && year <= 2019;
    }
    if (selected === '2000-2009') {
      return year >= 2000 && year <= 2009;
    }
    if (selected === '更早') {
      return year > 0 && year < 2000;
    }
    return String(value).indexOf(selected) !== -1;
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-target .movie-card'));
    if (!panel || !cards.length) {
      return;
    }
    var keyword = panel.querySelector('.filter-keyword');
    var region = panel.querySelector('.filter-region');
    var type = panel.querySelector('.filter-type');
    var year = panel.querySelector('.filter-year');
    var empty = document.querySelector('.empty-state');

    function apply() {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var r = region ? region.value : '全部地区';
      var t = type ? type.value : '全部类型';
      var y = year ? year.value : '全部年份';
      var visible = 0;
      cards.forEach(function (card) {
        var search = (card.getAttribute('data-search') || '').toLowerCase();
        var cardRegion = card.getAttribute('data-region') || '';
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var ok = true;
        if (q && search.indexOf(q) === -1) {
          ok = false;
        }
        if (r !== '全部地区' && cardRegion.indexOf(r) === -1) {
          ok = false;
        }
        if (t !== '全部类型' && cardType.indexOf(t) === -1) {
          ok = false;
        }
        if (!yearMatches(cardYear, y)) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keyword, region, type, year].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
    apply();
  }

  function movieCard(movie) {
    var tags = Array.isArray(movie.tags) && movie.tags.length ? movie.tags[0] : movie.genre;
    return [
      '<article class="movie-card">',
      '<a class="card-link" href="' + movie.link + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<div class="card-poster">',
      '<img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy" />',
      '<span class="card-type">' + escapeHtml(movie.type) + '</span>',
      '<span class="card-tag">' + escapeHtml(tags) + '</span>',
      '<span class="play-hover">▶</span>',
      '</div>',
      '<div class="card-body">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(movie.genre) + '</span><em>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + '</em></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearchPage() {
    var box = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');
    if (!box || !summary || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim().toLowerCase();
    var input = document.querySelector('.search-page-form input[name="q"]');
    if (input) {
      input.value = params.get('q') || '';
    }
    var list = window.SEARCH_MOVIES.filter(function (movie) {
      if (!q) {
        return true;
      }
      return movie.search.indexOf(q) !== -1;
    }).slice(0, 120);
    summary.textContent = q ? '搜索结果' : '精选影片';
    if (!list.length) {
      box.innerHTML = '<p class="empty-state">未找到匹配影片</p>';
      return;
    }
    box.innerHTML = list.map(movieCard).join('');
  }

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupSearchPage();
  });
})();

var MoviePlayer = {
  init: function (src) {
    var video = document.querySelector('[data-player-video]');
    var cover = document.querySelector('[data-player-cover]');
    var status = document.querySelector('[data-player-status]');
    var playNow = document.querySelector('[data-play-now]');
    var attached = false;
    var hls = null;

    if (!video || !src) {
      return;
    }

    function setStatus(text) {
      if (!status) {
        return;
      }
      status.textContent = text;
      status.hidden = !text;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            setStatus('播放失败，请稍后重试');
          }
        });
      } else {
        video.src = src;
      }
      video.controls = true;
    }

    function start() {
      attach();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      setStatus('');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus('点击视频区域继续播放');
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', start);
    }
    if (playNow) {
      playNow.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        start();
      }
    });
    video.addEventListener('error', function () {
      setStatus('播放失败，请稍后重试');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }
};
