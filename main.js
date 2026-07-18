/* Roman Licursi, Portfolio
   All motion degrades to static under prefers-reduced-motion.
   Sections: nav, reveal, role scramble, card spotlight, lightbox, Now loaders. */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* ── Nav: blur on scroll + active section highlight ── */
  const nav = document.getElementById('nav');
  const heroSection = document.getElementById('hero');
  if (nav && heroSection) {
    const navObserver = new IntersectionObserver(
      ([entry]) => nav.classList.toggle('scrolled', !entry.isIntersecting),
      { rootMargin: '-64px 0px 0px 0px' }
    );
    navObserver.observe(heroSection);
  }

  const navLinks = document.querySelectorAll('.nav-links a');
  const trackedSections = document.querySelectorAll('main section[id]');
  if (navLinks.length && trackedSections.length) {
    const linkObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) => {
            const active = a.getAttribute('href') === '#' + entry.target.id;
            if (active) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          });
        });
      },
      { rootMargin: '-38% 0px -55% 0px' }
    );
    trackedSections.forEach((s) => linkObserver.observe(s));
  }

  /* ── Scroll reveal ── */
  const revealObserver = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObserver.unobserve(e.target);
      }
    }),
    { rootMargin: '0px 0px -64px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  /* ── Hero role line: cycles phrases with a scramble transition.
        Final text lives in aria-label; only the hidden visual span churns. ── */
  const roleElement = document.querySelector('[data-scramble]');
  const roles = ['GTM Engineer', 'Applied AI Builder', 'Revenue Systems'];
  const scrambleCharset = '!<>-_\\/[]{}=+*^?#';
  let scrambleFrame = 0;
  let roleIndex = 0;
  let roleTimer = 0;

  function scrambleTo(target) {
    if (!roleElement) return;
    const visual = roleElement.querySelector('[aria-hidden="true"]');
    if (!visual) return;

    roleElement.setAttribute('aria-label', target);
    cancelAnimationFrame(scrambleFrame);

    if (reduceMotion.matches) {
      visual.textContent = target;
      return;
    }

    const characters = Array.from(target);
    const start = performance.now();
    const firstSettle = 110;
    const settleStep = 26;
    const churnTail = 90;

    roleElement.dataset.scrambling = 'true';

    function draw(now) {
      visual.textContent = characters.map((character, index) => {
        if (/\s/.test(character)) return character;
        const settleAt = start + firstSettle + index * settleStep;
        if (now >= settleAt) return character;
        return scrambleCharset[Math.floor(Math.random() * scrambleCharset.length)];
      }).join('');

      const end = start + firstSettle + characters.length * settleStep + churnTail;
      if (now < end) {
        scrambleFrame = requestAnimationFrame(draw);
      } else {
        visual.textContent = target;
        roleElement.dataset.scrambling = 'false';
      }
    }

    scrambleFrame = requestAnimationFrame(draw);
  }

  function scheduleNextRole() {
    window.clearTimeout(roleTimer);
    roleTimer = window.setTimeout(() => {
      roleIndex = (roleIndex + 1) % roles.length;
      scrambleTo(roles[roleIndex]);
      scheduleNextRole();
    }, 3400);
  }

  if (roleElement) {
    scrambleTo(roles[0]);
    if (!reduceMotion.matches) scheduleNextRole();
    roleElement.addEventListener('pointerenter', () => {
      if (roleElement.dataset.scrambling !== 'true') scrambleTo(roles[roleIndex]);
    });
    reduceMotion.addEventListener?.('change', () => {
      if (reduceMotion.matches) {
        window.clearTimeout(roleTimer);
        scrambleTo(roles[roleIndex]);
      } else {
        scheduleNextRole();
      }
    });
  }

  /* ── Card spotlight: cursor-tracked highlight, transform/opacity only ── */
  if (finePointer.matches) {
    let spotlightFrame = 0;
    document.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        if (spotlightFrame) return;
        spotlightFrame = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
          card.style.setProperty('--my', `${event.clientY - rect.top}px`);
          spotlightFrame = 0;
        });
      });
    });
  }

  /* ── Native dialog lightbox, delegated triggers so async shelves join ── */
  const dialog = document.getElementById('lightbox');
  const lightboxFigure = dialog?.querySelector('.lightbox-figure');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxStatus = document.getElementById('lightbox-status');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxSource = document.getElementById('lightbox-source');
  const previousButton = dialog?.querySelector('.lightbox-prev');
  const nextButton = dialog?.querySelector('.lightbox-next');
  const closeButton = dialog?.querySelector('.lightbox-close');

  if (dialog && lightboxFigure && lightboxImage && lightboxStatus && lightboxTitle && lightboxSource && previousButton && nextButton && closeButton) {
    let galleryItems = [];
    let galleryIndex = 0;
    let lastTrigger = null;
    let closeTimer = 0;

    function decodeValue(value = '') {
      try { return decodeURIComponent(value); } catch { return value; }
    }

    function readGalleryItem(element) {
      return {
        element,
        src: decodeValue(element.dataset.lightboxSrc),
        title: decodeValue(element.dataset.lightboxTitle) || 'Portfolio image',
        link: decodeValue(element.dataset.lightboxLink)
      };
    }

    function collectGallery(group) {
      galleryItems = Array.from(document.querySelectorAll('[data-lightbox-src]'))
        .filter((element) => (element.dataset.lightboxGroup || 'default') === group)
        .map(readGalleryItem)
        .filter((item) => item.src);
    }

    function renderGalleryItem(index) {
      if (!galleryItems.length) return;
      galleryIndex = (index + galleryItems.length) % galleryItems.length;
      const item = galleryItems[galleryIndex];
      lightboxFigure.dataset.state = 'loading';
      lightboxStatus.textContent = 'Loading image';
      lightboxImage.src = item.src;
      lightboxImage.alt = item.title;
      lightboxTitle.textContent = item.title;

      if (item.link) {
        lightboxSource.href = item.link;
        lightboxSource.hidden = false;
      } else {
        lightboxSource.hidden = true;
        lightboxSource.removeAttribute('href');
      }

      const hasMultipleItems = galleryItems.length > 1;
      previousButton.hidden = !hasMultipleItems;
      nextButton.hidden = !hasMultipleItems;

      if (hasMultipleItems) {
        const nextItem = galleryItems[(galleryIndex + 1) % galleryItems.length];
        const preload = new Image();
        preload.src = nextItem.src;
      }
    }

    function openLightbox(trigger) {
      collectGallery(trigger.dataset.lightboxGroup || 'default');
      const index = galleryItems.findIndex((item) => item.element === trigger);
      if (index < 0) return;
      lastTrigger = trigger;
      renderGalleryItem(index);
      dialog.classList.remove('closing');
      if (!dialog.open) dialog.showModal();
      closeButton.focus({ preventScroll: true });
    }

    function finishClose() {
      window.clearTimeout(closeTimer);
      if (dialog.open) dialog.close();
      dialog.classList.remove('closing');
    }

    function closeLightbox() {
      if (!dialog.open) return;
      if (reduceMotion.matches) {
        finishClose();
        return;
      }
      dialog.classList.add('closing');
      closeTimer = window.setTimeout(finishClose, 170);
    }

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-lightbox-src]');
      if (!trigger) return;
      event.preventDefault();
      openLightbox(trigger);
    });

    previousButton.addEventListener('click', () => renderGalleryItem(galleryIndex - 1));
    nextButton.addEventListener('click', () => renderGalleryItem(galleryIndex + 1));
    closeButton.addEventListener('click', closeLightbox);

    lightboxImage.addEventListener('load', () => {
      lightboxFigure.dataset.state = 'ready';
      lightboxStatus.textContent = '';
    });
    lightboxImage.addEventListener('error', () => {
      lightboxFigure.dataset.state = 'error';
      lightboxStatus.textContent = 'Could not load this image.';
    });

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeLightbox();
    });
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeLightbox();
    });
    dialog.addEventListener('close', () => {
      lightboxImage.removeAttribute('src');
      lightboxFigure.dataset.state = 'idle';
      lightboxStatus.textContent = '';
      lastTrigger?.focus({ preventScroll: true });
    });

    document.addEventListener('keydown', (event) => {
      if (!dialog.open) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        renderGalleryItem(galleryIndex - 1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        renderGalleryItem(galleryIndex + 1);
      }
    });
  }

  /* ── "Now" shelves: fade in once data actually arrives ── */
  function revealShelf(el) {
    if (!el) return;
    el.classList.add('now-reveal');
    if (el.style.display === 'none') el.style.display = '';
    void el.offsetHeight;
    el.classList.add('is-visible');
  }

  /* Recent flicks: pre-built JSON, refreshed by GitHub Actions */
  async function loadFlicks() {
    const shelf = document.getElementById('flicks-shelf');
    if (!shelf) return;
    try {
      const res = await fetch('./flicks.json');
      if (!res.ok) throw new Error('fetch failed');
      const items = await res.json();
      if (!items.length) {
        shelf.innerHTML = '<span class="now-empty">No rated films yet.</span>';
        revealShelf(shelf);
        return;
      }

      shelf.innerHTML = items.map(({ title: filmTitle, year: filmYear, rating: ratingRaw, poster, link }) => {
        const stars = ratingRaw
          ? '★'.repeat(Math.floor(ratingRaw)) + (ratingRaw % 1 ? '½' : '')
          : '';
        const meta = [filmYear, stars].filter(Boolean).join(' · ');
        const sourceLink = /^https?:\/\//.test(link) ? link : '';
        const tooltip = `<div class="flick-tooltip">
          <div class="flick-tooltip-title">${filmTitle}</div>
          ${meta ? `<div class="flick-tooltip-meta">${meta}</div>` : ''}
        </div>`;

        return `<a href="${link}" target="_blank" rel="noopener" class="flick-item" data-lightbox-src="${encodeURIComponent(poster)}" data-lightbox-title="${encodeURIComponent(filmTitle)}" data-lightbox-link="${encodeURIComponent(sourceLink)}" data-lightbox-group="culture" aria-label="View ${filmTitle} poster">
          <img class="flick-poster" src="${poster}" alt="${filmTitle}" loading="lazy">
          ${tooltip}
        </a>`;
      }).join('');
      revealShelf(shelf);
    } catch (e) {
      shelf.innerHTML = '<span class="now-empty">Couldn\'t load flicks right now.</span>';
      revealShelf(shelf);
    }
  }

  /* Recent jams: Last.fm API */
  const LASTFM_API_KEY = 'dbc4003d252a868be4a864e9eba11557';
  const LASTFM_USER = 'rlicursi';
  const LASTFM_DEFAULT_IMG = '2a96cbd8b46e442fc41c2b86b821562f';

  async function loadJams() {
    const turntable = document.getElementById('jams-turntable');
    const emptyEl = document.getElementById('jams-empty');
    if (!turntable || !emptyEl) return;
    try {
      const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${LASTFM_API_KEY}&format=json&limit=9`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      let tracks = data?.recenttracks?.track;
      if (!tracks) { revealShelf(emptyEl); return; }
      if (!Array.isArray(tracks)) tracks = [tracks];
      if (!tracks.length) { revealShelf(emptyEl); return; }

      const isNowPlaying = tracks[0]?.['@attr']?.nowplaying === 'true';
      const featured = tracks[0];

      const getImg = (track, size) =>
        track.image?.find((i) => i.size === size)?.['#text'] || '';
      const featArt = getImg(featured, 'large') || getImg(featured, 'medium');
      const hasArt = featArt && !featArt.includes(LASTFM_DEFAULT_IMG);

      document.getElementById('jams-title').textContent = featured.name || 'Loading';
      document.getElementById('jams-artist').textContent = featured.artist?.['#text'] || 'Last.fm';
      const badge = document.getElementById('jams-badge');
      badge.textContent = isNowPlaying ? 'Now Playing' : 'Last Played';
      if (isNowPlaying) badge.classList.add('is-live');
      const artEl = document.getElementById('jams-art');
      if (hasArt) {
        artEl.src = featArt;
        artEl.alt = featured.name;
      } else {
        artEl.style.display = 'none';
      }
      if (isNowPlaying) document.getElementById('jams-vinyl').classList.add('spinning');
      revealShelf(turntable);
    } catch (e) {
      emptyEl.textContent = 'Couldn\'t load tracks right now.';
      revealShelf(emptyEl);
    }
  }

  /* Recent reads: pre-built reads.json (Goodreads RSS), refreshed by GitHub Actions.
     Runtime CORS proxies were too flaky, same fix as flicks.json. */
  async function loadReads() {
    const shelf = document.getElementById('reads-shelf');
    if (!shelf) return;
    try {
      const res = await fetch('./reads.json');
      if (!res.ok) throw new Error('fetch failed');
      const items = await res.json();
      if (!items.length) {
        shelf.innerHTML = '<span class="now-empty">No rated books yet.</span>';
        revealShelf(shelf);
        return;
      }

      shelf.innerHTML = items.map(({ title, author, rating, img, link }) => {
        const stars = rating ? '★'.repeat(rating) : '';
        const meta = [author, stars].filter(Boolean).join(' · ');
        return `<a href="${link}" target="_blank" rel="noopener" class="flick-item" data-lightbox-src="${encodeURIComponent(img)}" data-lightbox-title="${encodeURIComponent(title)}" data-lightbox-link="${encodeURIComponent(link)}" data-lightbox-group="culture" aria-label="View ${title} cover">
          <img class="flick-poster" src="${img}" alt="${title}" loading="lazy">
          <div class="flick-tooltip">
            <div class="flick-tooltip-title">${title}</div>
            ${meta ? `<div class="flick-tooltip-meta">${meta}</div>` : ''}
          </div>
        </a>`;
      }).join('');
      revealShelf(shelf);
    } catch (e) {
      shelf.innerHTML = '<span class="now-empty">Couldn\'t load books right now.</span>';
      revealShelf(shelf);
    }
  }

  loadFlicks();
  loadJams();
  loadReads();
})();
