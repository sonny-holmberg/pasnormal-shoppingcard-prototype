/**
 * Product card hover sequence
 * -----------------------------------------------------------------------
 * States: "default" -> "entering" -> "hover" -> "leaving" -> "default"
 *
 *  mouseenter : play enter.gif once, then hold on hover.jpg (static)
 *  mouseleave : play leave.gif once, then hold on default.jpg (static)
 *
 * The size bar toggles via a single "is-hover" class on the card, driven
 * by CSS transitions in styles.css — it slides up as soon as the enter
 * sequence starts, and slides down as soon as the leave sequence starts.
 *
 * GIFs have no reliable "finished playing" event in the browser, so this
 * relies on a timer that should match the real duration of your exported
 * GIF. Update ENTER_DURATION / LEAVE_DURATION below whenever you swap in
 * new GIF files.
 * -----------------------------------------------------------------------
 */

(() => {
  const card = document.getElementById('productCard');
  const image = document.getElementById('cardImage');

  const ASSETS = {
    default: 'assets/default.png',
    hover: 'assets/hover.png',
    enterGif: 'assets/enter.gif',
    leaveGif: 'assets/leave.gif',
  };

  // Match these to the ACTUAL playback length of your GIFs, in milliseconds.
  const ENTER_DURATION = 500;
  const LEAVE_DURATION = 500;

  let state = 'default'; // 'default' | 'entering' | 'hover' | 'leaving'
  let pendingTimer = null;

  /**
   * Sets the <img> src with a cache-busting query param so the GIF
   * restarts from its first frame every time, even if it was just shown.
   */
  function playGif(src, duration, onComplete) {
    clearTimeout(pendingTimer);
    image.src = `${src}?play=${Date.now()}`;
    pendingTimer = setTimeout(onComplete, duration);
  }

  function handleEnter() {
    if (state === 'entering' || state === 'hover') return;

    state = 'entering';
    card.classList.add('is-hover'); // size bar starts sliding up now

    playGif(ASSETS.enterGif, ENTER_DURATION, () => {
      image.src = ASSETS.hover;
      state = 'hover';
    });
  }

  function handleLeave() {
    if (state === 'default' || state === 'leaving') return;

    state = 'leaving';
    card.classList.remove('is-hover'); // size bar starts sliding down now

    playGif(ASSETS.leaveGif, LEAVE_DURATION, () => {
      image.src = ASSETS.default;
      state = 'default';
    });
  }

  card.addEventListener('mouseenter', handleEnter);
  card.addEventListener('mouseleave', handleLeave);

  // Optional: keep keyboard users in sync too, since the card is focusable.
  card.addEventListener('focus', handleEnter);
  card.addEventListener('blur', handleLeave);

  // --- NYT: Gør størrelses-knapperne interaktive ---
  
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

  // --- NYT: Gør wishlist-hjertet interaktivt ---
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
