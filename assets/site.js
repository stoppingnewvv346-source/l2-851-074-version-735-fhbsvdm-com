(function () {
  const scriptElement = document.currentScript;
  const assetBase = scriptElement ? new URL('.', scriptElement.src).href : './assets/';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    const carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }

    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }

    let activeIndex = 0;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5000);
  }

  function initCardFilters() {
    const panels = Array.from(document.querySelectorAll('[data-card-filter]'));
    panels.forEach(function (panel) {
      const root = panel.closest('.page-has-filter') || document;
      const cards = Array.from(root.querySelectorAll('[data-filter-list] .movie-card'));
      const keywordInput = panel.querySelector('[data-filter-search]');
      const typeSelect = panel.querySelector('[data-filter-type]');
      const yearSelect = panel.querySelector('[data-filter-year]');
      const countEl = panel.querySelector('[data-filter-count]');
      const emptyEl = root.querySelector('[data-empty-result]');

      function applyFilter() {
        const keyword = (keywordInput && keywordInput.value || '').trim().toLowerCase();
        const type = typeSelect && typeSelect.value || '';
        const year = yearSelect && yearSelect.value || '';
        let visibleCount = 0;

        cards.forEach(function (card) {
          const text = (card.dataset.search || '').toLowerCase();
          const cardType = card.dataset.type || '';
          const cardYear = card.dataset.year || '';
          const matched = (!keyword || text.includes(keyword)) && (!type || cardType === type) && (!year || cardYear === year);
          card.hidden = !matched;
          if (matched) {
            visibleCount += 1;
          }
        });

        if (countEl) {
          countEl.textContent = visibleCount + ' 部';
        }
        if (emptyEl) {
          emptyEl.hidden = visibleCount !== 0;
        }
      }

      [keywordInput, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });
    });
  }

  function movieCardTemplate(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="card-link" href="' + escapeHtml(movie.url) + '">',
      '    <div class="poster-frame">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" class="poster-image" loading="lazy" onerror="this.classList.add(\'is-missing-image\'); this.removeAttribute(\'src\');">',
      '      <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
      '      <span class="poster-region">' + escapeHtml(movie.region) + '</span>',
      '    </div>',
      '    <div class="card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="card-meta">',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <span>' + escapeHtml(movie.genre) + '</span>',
      '      </div>',
      '      <div class="tag-row">' + tags + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    const data = window.MOVIE_SEARCH_DATA;
    const results = document.querySelector('[data-search-results]');
    const input = document.querySelector('[data-search-input]');
    const summary = document.querySelector('[data-search-summary]');
    const empty = document.querySelector('[data-search-empty]');
    const form = document.querySelector('[data-search-form]');
    if (!data || !results || !input) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    input.value = initialQuery;

    function renderSearch(query) {
      const keyword = query.trim().toLowerCase();
      results.innerHTML = '';

      if (!keyword) {
        if (summary) {
          summary.textContent = '请输入关键词开始搜索。';
        }
        if (empty) {
          empty.hidden = true;
        }
        return;
      }

      const matched = data.filter(function (movie) {
        return String(movie.searchText || '').toLowerCase().includes(keyword);
      }).slice(0, 120);

      results.innerHTML = matched.map(movieCardTemplate).join('');
      if (summary) {
        summary.textContent = '关键词“' + query + '”的匹配结果如下。';
      }
      if (empty) {
        empty.hidden = matched.length !== 0;
      }
    }

    form && form.addEventListener('submit', function (event) {
      event.preventDefault();
      const query = input.value.trim();
      const nextUrl = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState({}, '', nextUrl);
      renderSearch(query);
    });

    input.addEventListener('input', function () {
      renderSearch(input.value);
    });

    renderSearch(initialQuery);
  }

  function initPlayers() {
    const shells = Array.from(document.querySelectorAll('[data-player-shell]'));
    if (!shells.length) {
      return;
    }

    let hlsPromise = null;

    function loadHls() {
      if (!hlsPromise) {
        hlsPromise = import(assetBase + 'hls-dru42stk.js')
          .then(function (module) {
            return module.H;
          })
          .catch(function () {
            return null;
          });
      }
      return hlsPromise;
    }

    shells.forEach(function (shell) {
      const video = shell.querySelector('video');
      const button = shell.querySelector('[data-player-start]');
      const status = shell.querySelector('[data-player-status]');
      const source = video && video.dataset.hlsSrc;
      let initialized = false;

      if (!video || !source) {
        if (status) {
          status.textContent = '暂时无法播放。';
        }
        return;
      }

      async function startPlayback() {
        shell.classList.add('is-playing');
        if (status) {
          status.textContent = '正在加载...';
        }

        if (!initialized) {
          initialized = true;
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else {
            const Hls = await loadHls();
            if (Hls && Hls.isSupported()) {
              const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
              });
              hls.loadSource(source);
              hls.attachMedia(video);
            } else {
              video.src = source;
            }
          }
        }

        const playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {
            if (status) {
              status.textContent = '请再次点击播放。';
            }
          });
        }
      }

      if (button) {
        button.addEventListener('click', startPlayback);
      }
      video.addEventListener('click', function () {
        if (!initialized) {
          startPlayback();
        }
      });
      video.addEventListener('playing', function () {
        if (status) {
          status.textContent = '正在播放。';
        }
      });
      video.addEventListener('error', function () {
        if (status) {
          status.textContent = '暂时无法播放，请稍后重试。';
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroCarousel();
    initCardFilters();
    initSearchPage();
    initPlayers();
  });
})();
