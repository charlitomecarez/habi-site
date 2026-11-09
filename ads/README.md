# Habi ads

Vertical video ads (1080 × 1920, 30 fps) for Reels, TikTok and Shorts, made with
[HyperFrames](https://github.com/heygen-com/hyperframes) in the site's Banig look.
Each ad is an HTML page with one GSAP timeline; HyperFrames renders it to MP4.

| Ad | Length | What happens |
| --- | --- | --- |
| `master` | 26 s | Hook, then Home, Todos, Money, Vehicle and Vault in one phone, then ₱0 and the end card |
| `home` | 12.5 s | Home types its sentence, the tiles update, a todo gets done |
| `todos` | 12.5 s | The rent reminder drops in, rent gets checked off, rice is set for tomorrow |
| `vault` | 12.5 s | PIN goes in, the vault opens, a password is copied, it locks itself |
| `money` | 12.5 s | The total adds up, Globe gets paid, payday lands |
| `vehicle` | 12.5 s | A trip runs the odometer up, the oil change comes due and gets logged |
| `todos-card` | 10 s loop | The Todos card on the website: reminder, rent checked off, rice set for tomorrow |
| `vault-card` | 10 s loop | The Vault card on the website: PIN, open, password copied, locks again |

Every ad ends on the same card: **Make your own copy**, Open source · Android first · ₱0 a month,
and the repo URL. All names, amounts and readings are example data, and the end card says so.

## Render

```bash
./render.sh                  # everything, delivery quality -> renders/habi-<ad>.mp4
./render.sh home money       # just these
QUALITY=draft ./render.sh home   # fast preview
```

HyperFrames comes from the `video-editing-workflow` repo
(`tools/setup.sh --animated-graphics` there). Set `HF=/path/to/hyperframes` if yours lives elsewhere.
`renders/` is git-ignored: upload the MP4s, don't commit them.

There is no sound. Add music or SFX in your editor (Kdenlive, CapCut) when you post.

## Edit

- `compositions/<ad>.html`: the screen markup, the stickers, and the timeline (times in seconds).
- `shared/brand.css`: tokens, the weave, the phone, stickers, the wipe and the end card.
- `shared/ad.js`: helpers. `hookIn`, `phoneIn`, `type`, `count`, `swap`, `tapOn`, `sticker`, `wipe`, `endCard`.
  Everything is plain tweens on one paused timeline, so any frame can be rendered on its own.
- Fonts are Schibsted Grotesk, copied from the site's `@fontsource` package into `shared/fonts/`.
