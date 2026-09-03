# Product card — hover animation prototype

A working HTML/CSS/JS prototype of the shopping card: static helmet shot by
default, a short video crossfades in on mouse-enter and settles on the
"putting the helmet on" photo, a video crossfades in on mouse-leave and
settles back on the default shot, and the size-select bar slides up from
below on hover.

## 1. Open it in VS Code

1. Unzip / copy the whole `project` folder somewhere local.
2. `File → Open Folder…` and select it.
3. Install the **Live Server** extension (by Ritwick Dey) if you don't have
   it — search "Live Server" in the Extensions panel.
4. Right-click `index.html` → **Open with Live Server**.

Double-clicking `index.html` to open it directly still works fine too
(tested, including the video autoplay) — Live Server is just nicer for
auto-reloading while you edit.

## 2. File structure

```
project/
├── index.html      the card markup
├── styles.css       all layout/visual styling
├── script.js         the hover state machine
└── assets/
    ├── default.png   static, default state
    ├── hover.png     static, settled hover state
    ├── enter.webm / enter.mp4   plays on mouse-enter
    └── leave.webm / leave.mp4   plays on mouse-leave
```

## 3. Why video instead of GIF

You asked whether swapping GIF for `mp4`/`webm` would help — yes, on three
counts:

- **Quality.** GIF is capped at a 256-colour palette per frame, which is
  why the transition could look slightly dithered/banded on the helmet's
  gradient. Video uses real compression (H.264/VP9) and holds far more
  colour detail at a fraction of the file size — the placeholder clips
  here are ~50KB each, versus ~700KB for the GIFs they replaced.
- **Precise timing.** This was the more important fix. GIFs don't give
  JavaScript any "finished playing" signal, so the old code had to guess
  a duration (`ENTER_DURATION`/`LEAVE_DURATION`) and hope it matched the
  actual GIF. `<video>` fires a real `ended` event the instant playback
  finishes, so `script.js` now just listens for that — no timing constant
  to keep in sync with the asset at all.
- **Smooth cuts.** This is the crossfade you asked about — see below.

## 4. How the crossfade works

The media layer is now two stacked elements instead of one:

- `<img id="cardImage">` always holds the *current static frame*
  (`default.png` or `hover.png`).
- `<video id="cardVideo">` sits on top of it, transparent (`opacity: 0`)
  until a transition starts.

On `mouseenter`: the video's source is set to the enter clip and played;
once it's actually rendering frames (`playing` event), it fades in over
the static image (`opacity` transition, `--crossfade-transition` in
`styles.css`, 220ms by default). When the clip finishes (`ended` event),
the `<img>` src is swapped to `hover.png` *underneath*, and the video
fades back out — revealing the static photo rather than cutting to it.
`mouseleave` mirrors this with the leave clip, landing back on
`default.png`.

Net effect: static image → soft dissolve → motion → soft dissolve →
static image, with no hard cuts anywhere in the sequence.

Interrupting mid-hover (leaving while the enter clip is still playing, or
vice versa) is handled by a request-token guard in `script.js`, so a
stale `ended` callback from a cancelled sequence can't fire after a new
one has started.

## 5. Swapping in your real clips

`enter.webm`/`enter.mp4` and `leave.webm`/`leave.mp4` are placeholders —
the same simple crossfade as before, just re-encoded as video. Replace
all four with your real exports, same filenames, dropped into `assets/`.
Both formats are provided per clip because Safari doesn't support WebM —
the `<video>` element tries WebM first and falls back to MP4
automatically, no code changes needed as long as you keep both.

Nothing needs to change in `script.js` for a new clip of a different
length — that was the whole point of moving off the GIF timer. If you
want the dissolve itself to feel faster/slower, adjust
`--crossfade-transition` in `styles.css` and `CROSSFADE_MS` in
`script.js` together (they're separate because CSS drives the visual
fade and JS needs to know how long to wait before it's safe to call the
sequence "done").

## 6. Note on generating your clips

Since you're already running ComfyUI locally for image-to-video, your two
static shots (`default.png` / `hover.png`) are a natural pair of
start/end keyframes for an i2v pass — likely faster than hand-animating
the transition in After Effects. Export straight to mp4/webm rather than
GIF and you skip a conversion step entirely.
