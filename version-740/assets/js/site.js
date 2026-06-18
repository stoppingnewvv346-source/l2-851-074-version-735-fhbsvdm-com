(function () {
  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var index = 0;
    var timer = null;

    function show(next) {
      index = next;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });

    if (slides.length > 1) {
      start();
    }
  }

  function initCardFilters() {
    selectAll('[data-card-filter-form]').forEach(function (form) {
      var input = form.querySelector('[data-filter-input]');
      var region = form.querySelector('[data-filter-region]');
      var cards = selectAll('[data-filter-card]');

      function update() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var regionValue = region ? region.value : '全部';
        cards.forEach(function (card) {
          var text = card.getAttribute('data-title') || '';
          var cardRegion = card.getAttribute('data-region') || '';
          var textMatch = !query || text.indexOf(query) !== -1;
          var regionMatch = regionValue === '全部' || cardRegion === regionValue;
          card.hidden = !(textMatch && regionMatch);
        });
      }

      if (input) {
        input.addEventListener('input', update);
      }
      if (region) {
        region.addEventListener('change', update);
      }
      update();
    });
  }

  function escapeHTML(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function renderSearchCard(item) {
    return [
      '<article class="movie-card">',
      '  <a href="' + escapeHTML(item.url) + '" class="card-link">',
      '    <div class="card-media">',
      '      <img src="' + escapeHTML(item.image) + '" alt="' + escapeHTML(item.title) + '" loading="lazy">',
      '      <span class="region-pill">' + escapeHTML(item.region) + '</span>',
      '      <span class="play-badge">▶</span>',
      '      <span class="duration">' + escapeHTML(item.duration) + '</span>',
      '    </div>',
      '    <div class="card-body">',
      '      <h3>' + escapeHTML(item.title) + '</h3>',
      '      <p>' + escapeHTML(item.oneLine) + '</p>',
      '      <div class="card-meta">',
      '        <span>' + escapeHTML(item.views) + '</span>',
      '        <span>★ ' + escapeHTML(item.rating) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('\n');
  }

  function initSearch() {
    var form = document.querySelector('[data-search-form]');
    var results = document.querySelector('[data-search-results]');
    if (!form || !results || !window.SEARCH_INDEX) {
      return;
    }
    var input = form.querySelector('[data-search-input]');
    var region = form.querySelector('[data-search-region]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render() {
      var query = input.value.trim().toLowerCase();
      var regionValue = region.value;
      var matched = window.SEARCH_INDEX.filter(function (item) {
        var text = [
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.oneLine,
          (item.tags || []).join(' ')
        ].join(' ').toLowerCase();
        var textMatch = !query || text.indexOf(query) !== -1;
        var regionMatch = regionValue === '全部' || item.region === regionValue;
        return textMatch && regionMatch;
      }).slice(0, 120);

      if (!matched.length) {
        results.innerHTML = '<div class="content-card"><h2>未找到相关影片</h2><p>换一个片名、地区、年份或标签试试。</p></div>';
        return;
      }
      results.innerHTML = matched.map(renderSearchCard).join('\n');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set('q', input.value.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState(null, '', url.toString());
      render();
    });
    input.addEventListener('input', render);
    region.addEventListener('change', render);
    render();
  }

  function initPlayers() {
    selectAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }

      function prepare() {
        if (video.getAttribute('data-ready') === '1') {
          return;
        }
        var stream = video.getAttribute('data-stream');
        if (!stream) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
          shell._hls = hls;
        } else {
          video.src = stream;
        }
        video.setAttribute('data-ready', '1');
      }

      function play() {
        prepare();
        shell.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initCardFilters();
    initSearch();
    initPlayers();
  });
})();
