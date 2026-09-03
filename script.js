(() => {
  const card = document.getElementById('productCard');
  const img = document.getElementById('cardImage');
  const video = document.getElementById('cardVideo');

  const ASSETS = {
    default: 'assets/default.png',
    hover: 'assets/hover.png',
    enter: { webm: 'assets/enter.webm', mp4: 'assets/enter.mp4' },
    leave: { webm: 'assets/leave.webm', mp4: 'assets/leave.mp4' },
  };

  const CROSSFADE_MS = 220;

  let state = 'default';
  let requestId = 0;

  function setVideoSource(clip) {
    video.querySelectorAll('source').forEach((s) => s.remove());

    const webmSource = document.createElement('source');
    webmSource.src = clip.webm;
    webmSource.type = 'video/webm';

    const mp4Source = document.createElement('source');
    mp4Source.src = clip.mp4;
    mp4Source.type = 'video/mp4';

    // webm first: browsers use the first source type they support
    video.append(webmSource, mp4Source);
    video.load();
  }

  function hideVideoInstantly() {
    video.style.transition = 'none';
    video.classList.remove('is-visible');
    void video.offsetWidth;
    video.style.transition = '';
  }

function playTransition(clip, startStaticSrc, nextStaticSrc, nextState) {
    const myRequest = ++requestId;

    img.src = startStaticSrc;
    
    hideVideoInstantly();
    setVideoSource(clip);
    video.currentTime = 0;

    video.onplaying = () => {
      if (myRequest !== requestId) return;
      video.classList.add('is-visible');
    };

    video.onended = () => {
      if (myRequest !== requestId) return;

      img.src = nextStaticSrc;
      video.classList.remove('is-visible');

      setTimeout(() => {
        if (myRequest === requestId) state = nextState;
      }, CROSSFADE_MS);
    };

    const playPromise = video.play();
    if (playPromise && playPromise.catch) playPromise.catch(() => {});
  }

function handleEnter() {
    if (state === 'entering' || state === 'hover') return;
    state = 'entering';
    card.classList.add('is-hover');

    playTransition(ASSETS.enter, ASSETS.default, ASSETS.hover, 'hover');
  }

function handleLeave() {
    if (state === 'default' || state === 'leaving') return;
    state = 'leaving';
    card.classList.remove('is-hover');
    
    playTransition(ASSETS.leave, ASSETS.hover, ASSETS.default, 'default');
  }

  card.addEventListener('mouseenter', handleEnter);
  card.addEventListener('mouseleave', handleLeave);

  card.addEventListener('focus', handleEnter);
  card.addEventListener('blur', handleLeave);

  const sizeOptions = card.querySelectorAll('.size-bar__option');

  sizeOptions.forEach(option => {
    option.addEventListener('click', (event) => {

      event.stopPropagation();

      sizeOptions.forEach(opt => opt.classList.remove('is-selected'));

      option.classList.add('is-selected');
    });
  });

  const wishlistBtn = card.querySelector('.btn-wishlist');

  wishlistBtn.addEventListener('click', (event) => {

    event.stopPropagation();

    wishlistBtn.classList.toggle('is-active');

    const isPressed = wishlistBtn.classList.contains('is-active');
    wishlistBtn.setAttribute('aria-pressed', isPressed);
  });

  const addToCartBtn = card.querySelector('.size-bar__action');

  addToCartBtn.addEventListener('click', (event) => {
    event.stopPropagation();

    const originalText = addToCartBtn.textContent;
    addToCartBtn.textContent = "Added!";
    addToCartBtn.style.background = "#2B692E";

    setTimeout(() => {
      addToCartBtn.textContent = originalText;
      addToCartBtn.style.background = "";
    }, 1200);
  });

})();
