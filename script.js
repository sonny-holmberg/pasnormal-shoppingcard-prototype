/**
 * Product card hover sequence
 * -----------------------------------------------------------------------
 * States: "default" -> "entering" -> "hover" -> "leaving" -> "default"
 *
 *  mouseenter : crossfade video on top of the image, play enter clip,
 *               then crossfade to the static hover.png underneath
 *  mouseleave : same in reverse with the leave clip, landing on default.png
 *
 * Unlike GIFs, <video> fires a real "ended" event the instant playback
 * finishes — so there's no manual duration to guess or keep in sync with
 * the asset. The only timing constant left is the crossfade itself.
 * -----------------------------------------------------------------------
 */

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

  // How long the image <-> video dissolve takes, in ms.
  // Keep this in sync with --crossfade-transition in styles.css.
  const CROSSFADE_MS = 220;

  let state = 'default'; // 'default' | 'entering' | 'hover' | 'leaving'
  let requestId = 0; // guards against a stale callback from an interrupted sequence

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
    // Used when a new sequence interrupts one that's still mid-fade.
    // Swapping the source (below) briefly clears the video's rendered
    // frame, so if it were still fading in/out via the normal CSS
    // transition at that moment, that blank frame — and whatever static
    // image sits underneath it — would flash through. Snapping opacity
    // to 0 with no transition first guarantees there's nothing to see
    // during the swap; the new clip then fades in fresh as normal.
    video.style.transition = 'none';
    video.classList.remove('is-visible');
    void video.offsetWidth; // force layout so the transition:none actually applies
    video.style.transition = '';
  }

function playTransition(clip, startStaticSrc, nextStaticSrc, nextState) {
    const myRequest = ++requestId;
    
    // FIX: Pre-emptively update the static background image to match 
    // the first frame of the new video BEFORE we hide the video layer.
    img.src = startStaticSrc;
    
    hideVideoInstantly();
    setVideoSource(clip);
    video.currentTime = 0;

    // Fade the video in only once it's actually rendering frames
    video.onplaying = () => {
      if (myRequest !== requestId) return;
      video.classList.add('is-visible');
    };

    video.onended = () => {
      if (myRequest !== requestId) return;

      // swap the static image underneath, then dissolve the video back out
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
    card.classList.add('is-hover'); // size bar starts sliding up now
    
    // We pass ASSETS.default as the starting visual, and ASSETS.hover as the ending visual
    playTransition(ASSETS.enter, ASSETS.default, ASSETS.hover, 'hover');
  }

function handleLeave() {
    if (state === 'default' || state === 'leaving') return;
    state = 'leaving';
    card.classList.remove('is-hover'); // size bar starts sliding down now
    
    // We pass ASSETS.hover as the starting visual, and ASSETS.default as the ending visual
    playTransition(ASSETS.leave, ASSETS.hover, ASSETS.default, 'default');
  }

  card.addEventListener('mouseenter', handleEnter);
  card.addEventListener('mouseleave', handleLeave);

  // Optional: keep keyboard users in sync too, since the card is focusable.
  card.addEventListener('focus', handleEnter);
  card.addEventListener('blur', handleLeave);

  // --- Gør størrelses-knapperne interaktive ---

  // Find alle knapperne inde i size-baren
  const sizeOptions = card.querySelectorAll('.size-bar__option');

  // Gennemgå hver knap og tilføj en 'click' event listener
  sizeOptions.forEach(option => {
    option.addEventListener('click', (event) => {
      // Forhindrer klikket i at boble op til selve kortet (god praksis,
      // hvis du senere tilføjer et link til hele kortet)
      event.stopPropagation();

      // Fjern .is-selected fra ALLE knapper
      sizeOptions.forEach(opt => opt.classList.remove('is-selected'));

      // Tilføj .is-selected til den specifikke knap, der blev klikket på
      option.classList.add('is-selected');
    });
  });

  // --- Gør wishlist-hjertet interaktivt ---
  const wishlistBtn = card.querySelector('.btn-wishlist');

  wishlistBtn.addEventListener('click', (event) => {
    // Forhindrer klikket i at boble op, så vi ikke ved en fejl "klikker" på hele produktkortet
    event.stopPropagation();

    // Toggler (tænder/slukker) vores nye klasse
    wishlistBtn.classList.toggle('is-active');

    // Opdaterer aria-pressed for skærmlæsere (Accessibility/Tilgængelighed)
    const isPressed = wishlistBtn.classList.contains('is-active');
    wishlistBtn.setAttribute('aria-pressed', isPressed);
  });

})();
