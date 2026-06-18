(function () {
  var pageSize = 48;
  var currentPage = 1;
  var currentResults = [];

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function readParams() {
    var params = new URLSearchParams(window.location.search);
    return {
      q: params.get('q') || '',
      region: params.get('region') || '',
      type: params.get('type') || '',
      genre: params.get('genre') || '',
      year: params.get('year') || ''
    };
  }

  function syncForm(values) {
    var form = document.querySelector('[data-search-form]');

    if (!form) {
      return;
    }

    ['q', 'region', 'type', 'genre', 'year'].forEach(function (key) {
      if (form.elements[key]) {
        form.elements[key].value = values[key] || '';
      }
    });
  }

  function matches(movie, values) {
    var q = normalize(values.q);
    var haystack = normalize([
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.oneLine,
      (movie.genre || []).join(' '),
      (movie.tags || []).join(' ')
    ].join(' '));

    if (q && haystack.indexOf(q) === -1) {
      return false;
    }

    if (values.region && movie.region !== values.region) {
      return false;
    }

    if (values.type && movie.type !== values.type) {
      return false;
    }

    if (values.genre && (movie.genre || []).indexOf(values.genre) === -1) {
      return false;
    }

    if (values.year && String(movie.year) !== String(values.year)) {
      return false;
    }

    return true;
  }

  function card(movie) {
    return [
      '<a class="movie-card" href="' + movie.href + '" title="' + escapeHtml(movie.title) + '">',
      '  <span class="poster-frame">',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="play-pill">▶</span>',
      '    <span class="score-badge">' + escapeHtml(movie.rating) + '</span>',
      '  </span>',
      '  <span class="movie-card-body">',
      '    <strong>' + escapeHtml(movie.title) + '</strong>',
      '    <span class="movie-meta">' + escapeHtml([movie.year, movie.region, movie.type].filter(Boolean).join(' · ')) + '</span>',
      '    <span class="movie-one-line">' + escapeHtml(movie.oneLine) + '</span>',
      '  </span>',
      '</a>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderResults() {
    var resultsNode = document.querySelector('[data-search-results]');
    var countNode = document.querySelector('[data-search-count]');
    var paginationNode = document.querySelector('[data-search-pagination]');

    if (!resultsNode || !countNode || !paginationNode) {
      return;
    }

    var totalPages = Math.max(1, Math.ceil(currentResults.length / pageSize));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);
    var start = (currentPage - 1) * pageSize;
    var pageItems = currentResults.slice(start, start + pageSize);

    countNode.textContent = '共找到 ' + currentResults.length + ' 部影片，当前第 ' + currentPage + ' / ' + totalPages + ' 页。';
    resultsNode.innerHTML = pageItems.map(card).join('\n');
    renderPagination(paginationNode, totalPages);
  }

  function renderPagination(node, totalPages) {
    var html = [];

    if (totalPages <= 1) {
      node.innerHTML = '';
      return;
    }

    html.push(buttonHtml('上一页', currentPage - 1, currentPage === 1));

    for (var page = 1; page <= totalPages; page += 1) {
      if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2) {
        html.push(buttonHtml(page, page, false, page === currentPage));
      } else if (page === 2 || page === totalPages - 1) {
        html.push('<span class="pagination-gap">…</span>');
      }
    }

    html.push(buttonHtml('下一页', currentPage + 1, currentPage === totalPages));
    node.innerHTML = html.join('\n');

    node.querySelectorAll('[data-page]').forEach(function (button) {
      button.addEventListener('click', function () {
        currentPage = Number(button.getAttribute('data-page'));
        renderResults();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  function buttonHtml(label, page, disabled, active) {
    if (disabled) {
      return '<span class="is-disabled">' + label + '</span>';
    }

    if (active) {
      return '<span class="is-current">' + label + '</span>';
    }

    return '<a href="#" data-page="' + page + '">' + label + '</a>';
  }

  function applyFilters(values) {
    currentPage = 1;
    currentResults = (window.MOVIE_DATA || []).filter(function (movie) {
      return matches(movie, values);
    });
    renderResults();
  }

  function init() {
    var form = document.querySelector('[data-search-form]');
    var values = readParams();

    syncForm(values);
    applyFilters(values);

    if (!form) {
      return;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var nextValues = {
        q: form.elements.q.value,
        region: form.elements.region.value,
        type: form.elements.type.value,
        genre: form.elements.genre.value,
        year: form.elements.year.value
      };
      var params = new URLSearchParams();

      Object.keys(nextValues).forEach(function (key) {
        if (nextValues[key]) {
          params.set(key, nextValues[key]);
        }
      });

      var query = params.toString();
      var url = query ? 'search.html?' + query : 'search.html';
      window.history.replaceState({}, '', url);
      applyFilters(nextValues);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
