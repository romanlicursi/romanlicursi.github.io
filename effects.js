(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Text scramble: final text stays in aria-label while only the hidden visual span churns.
  const scrambleElement = document.querySelector('[data-scramble]');
  const scrambleCharset = '!<>-_\\/[]{}=+*^?#';
  let scrambleFrame = 0;

  function runScramble() {
    if (!scrambleElement) return;

    const target = scrambleElement.getAttribute('aria-label') || scrambleElement.textContent.trim();
    const visual = scrambleElement.querySelector('[aria-hidden="true"]');
    if (!visual) return;

    cancelAnimationFrame(scrambleFrame);

    if (reduceMotion.matches) {
      visual.textContent = target;
      return;
    }

    const characters = Array.from(target);
    const start = performance.now();
    const firstSettle = 130;
    const settleStep = 24;
    const churnTail = 100;

    scrambleElement.dataset.scrambling = 'true';

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
        scrambleElement.dataset.scrambling = 'false';
      }
    }

    scrambleFrame = requestAnimationFrame(draw);
  }

  runScramble();

  if (scrambleElement) {
    scrambleElement.addEventListener('pointerenter', () => {
      if (scrambleElement.dataset.scrambling !== 'true') runScramble();
    });
  }

  reduceMotion.addEventListener?.('change', runScramble);

  // Manual project coverflow: one complete project is foregrounded at a time.
  const projectCarousel = document.getElementById('project-carousel');
  const projectTrack = projectCarousel?.querySelector('.project-grid');
  const projectViewport = projectCarousel?.querySelector('.project-carousel-viewport');
  const projectCards = projectTrack ? Array.from(projectTrack.querySelectorAll('.project-card')) : [];
  const projectPrevious = projectCarousel?.querySelector('.project-carousel-prev');
  const projectNext = projectCarousel?.querySelector('.project-carousel-next');
  const projectIndicators = document.getElementById('project-carousel-indicators');
  const projectStatus = document.getElementById('project-carousel-status');

  if (projectCarousel && projectTrack && projectViewport && projectPrevious && projectNext && projectIndicators && projectStatus && projectCards.length) {
    let activeProjectIndex = 0;
    let pointerStartX = null;
    let pointerId = null;
    let projectIsTransitioning = false;
    let projectTransitionCard = null;
    let projectTransitionTimer = 0;
    const projectTransitionTimeout = 680;

    projectCarousel.classList.add('is-ready');

    const indicatorButtons = projectCards.map((card, index) => {
      const title = card.querySelector('.project-title')?.textContent.trim() || `Project ${index + 1}`;
      card.setAttribute('role', 'group');
      card.setAttribute('aria-roledescription', 'slide');
      card.setAttribute('aria-label', `${title}, ${index + 1} of ${projectCards.length}`);

      const indicator = document.createElement('button');
      indicator.type = 'button';
      indicator.className = 'project-carousel-indicator';
      indicator.setAttribute('aria-label', `Show ${title}`);
      indicator.addEventListener('click', () => requestActiveProject(index));
      projectIndicators.appendChild(indicator);
      return indicator;
    });

    function circularOffset(index) {
      let offset = index - activeProjectIndex;
      const midpoint = projectCards.length / 2;
      if (offset > midpoint) offset -= projectCards.length;
      if (offset < -midpoint) offset += projectCards.length;
      return offset;
    }

    function measureActiveProject() {
      const activeCard = projectCards[activeProjectIndex];
      if (!activeCard) return;
      const height = Math.ceil(activeCard.scrollHeight);
      projectCarousel.style.setProperty('--active-card-height', `${height}px`);
    }

    function renderProjects() {
      projectCards.forEach((card, index) => {
        const offset = circularOffset(index);
        const isActive = offset === 0;
        card.dataset.carouselOffset = Math.abs(offset) > 2 ? 'far' : String(offset);
        card.setAttribute('aria-hidden', String(!isActive));
        card.querySelectorAll('a').forEach((link) => {
          if (isActive) link.removeAttribute('tabindex');
          else link.tabIndex = -1;
        });
        indicatorButtons[index].setAttribute('aria-current', String(isActive));
      });

      const activeTitle = projectCards[activeProjectIndex].querySelector('.project-title')?.textContent.trim() || 'Project';
      projectStatus.textContent = `${activeTitle}, ${activeProjectIndex + 1} of ${projectCards.length}`;
      requestAnimationFrame(measureActiveProject);
    }

    function setActiveProject(index) {
      activeProjectIndex = (index + projectCards.length) % projectCards.length;
      renderProjects();
    }

    function finishProjectTransition(event) {
      if (event && (event.target !== projectTransitionCard || event.propertyName !== 'transform')) return;

      window.clearTimeout(projectTransitionTimer);
      projectTransitionCard?.removeEventListener('transitionend', finishProjectTransition);
      projectTransitionCard?.removeEventListener('transitioncancel', finishProjectTransition);
      projectTransitionCard = null;
      projectIsTransitioning = false;
      projectCarousel.classList.remove('is-transitioning');
      projectCarousel.removeAttribute('aria-busy');

    }

    function requestActiveProject(index) {
      const normalizedIndex = (index + projectCards.length) % projectCards.length;
      if (normalizedIndex === activeProjectIndex) return;

      if (reduceMotion.matches) {
        if (projectIsTransitioning) finishProjectTransition();
        setActiveProject(normalizedIndex);
        return;
      }

      if (projectIsTransitioning) {
        finishProjectTransition();
      }

      projectIsTransitioning = true;
      projectCarousel.classList.add('is-transitioning');
      projectCarousel.setAttribute('aria-busy', 'true');
      setActiveProject(normalizedIndex);

      projectTransitionCard = projectCards[normalizedIndex];
      projectTransitionCard.addEventListener('transitionend', finishProjectTransition);
      projectTransitionCard.addEventListener('transitioncancel', finishProjectTransition);
      projectTransitionTimer = window.setTimeout(finishProjectTransition, projectTransitionTimeout);
    }

    projectPrevious.addEventListener('click', () => requestActiveProject(activeProjectIndex - 1));
    projectNext.addEventListener('click', () => requestActiveProject(activeProjectIndex + 1));

    projectCards.forEach((card, index) => {
      card.addEventListener('click', (event) => {
        if (index === activeProjectIndex) return;
        event.preventDefault();
        event.stopPropagation();
        requestActiveProject(index);
      });
    });

    projectViewport.addEventListener('click', (event) => {
      const activeRect = projectCards[activeProjectIndex].getBoundingClientRect();
      if (event.clientX < activeRect.left) {
        event.preventDefault();
        event.stopPropagation();
        requestActiveProject(activeProjectIndex - 1);
      }
      if (event.clientX > activeRect.right) {
        event.preventDefault();
        event.stopPropagation();
        requestActiveProject(activeProjectIndex + 1);
      }
    }, true);

    projectCarousel.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        requestActiveProject(activeProjectIndex - 1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        requestActiveProject(activeProjectIndex + 1);
      }
      if (event.key === 'Home') {
        event.preventDefault();
        requestActiveProject(0);
      }
      if (event.key === 'End') {
        event.preventDefault();
        requestActiveProject(projectCards.length - 1);
      }
    });

    projectViewport.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || event.target.closest('a, button')) return;
      pointerStartX = event.clientX;
      pointerId = event.pointerId;
      projectViewport.setPointerCapture?.(pointerId);
    });

    projectViewport.addEventListener('pointerup', (event) => {
      if (pointerStartX === null || event.pointerId !== pointerId) return;
      const distance = event.clientX - pointerStartX;
      pointerStartX = null;
      pointerId = null;
      if (Math.abs(distance) < 52) return;
      requestActiveProject(activeProjectIndex + (distance < 0 ? 1 : -1));
    });

    projectViewport.addEventListener('pointercancel', () => {
      pointerStartX = null;
      pointerId = null;
    });

    const projectResizeObserver = typeof ResizeObserver === 'function'
      ? new ResizeObserver(measureActiveProject)
      : null;
    projectCards.forEach((card) => projectResizeObserver?.observe(card));
    document.fonts?.ready.then(measureActiveProject);
    renderProjects();
  }

  // Native dialog lightbox with delegated triggers so async shelves join the gallery.
  const dialog = document.getElementById('lightbox');
  const lightboxFigure = dialog?.querySelector('.lightbox-figure');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxStatus = document.getElementById('lightbox-status');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxSource = document.getElementById('lightbox-source');
  const previousButton = dialog?.querySelector('.lightbox-prev');
  const nextButton = dialog?.querySelector('.lightbox-next');
  const closeButton = dialog?.querySelector('.lightbox-close');

  if (!dialog || !lightboxFigure || !lightboxImage || !lightboxStatus || !lightboxTitle || !lightboxSource || !previousButton || !nextButton || !closeButton) return;

  let galleryItems = [];
  let galleryIndex = 0;
  let lastTrigger = null;
  let closeTimer = 0;

  function decodeValue(value = '') {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
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
    closeTimer = window.setTimeout(finishClose, 180);
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
})();
