# FlyCatcher

Snap a campus bulletin board, let AI split it into flyers, swipe through them, and keep the ones you like in a wallet that adds to your calendar.

Built with React + Vite. Gemini reads the photo through a tiny server function (`api/scan.js`) so the API key never reaches the browser.

## Run it locally

1. Get a free Gemini API key at https://aistudio.google.com/apikey
2. Create a `.env` file containing `GEMINI_API_KEY=your-key` (it's gitignored, so the key stays on your machine). Optionally add `GEMINI_MODEL=` to pick a different model.
3. `npm install`
4. `npm run dev`, then open the "Network" URL it prints on your phone (same Wi-Fi)

> Phones only allow the live camera on `https://` or `localhost`. On the local network URL, the shutter falls back to the phone's camera picker. Deploy (below) to get the live camera with coach marks.

## Deploy to your phone (free)

1. Push this folder to a GitHub repo.
2. At https://vercel.com, "Add New Project", import the repo. Vercel detects Vite.
3. In Project Settings, Environment Variables, add `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`).
4. Open the `https://…vercel.app` link on your phone. In Safari, Share, "Add to Home Screen" for a full-screen app.

## How it's put together

| Path | What it does |
| --- | --- |
| `api/scan.js` | Sends the photo + prompt to Gemini, returns JSON |
| `src/lib/prompt.js` | The board-reading prompt (AI copies text exactly; no guessing dates) |
| `src/lib/dates.js` | App-side date logic: picks the year, parses times, flags weekday mismatches |
| `src/lib/quality.js` | On-device checks for glare, darkness and blur that drive the live coach marks |
| `src/lib/crop.js`, `Poster.jsx` | Cuts each flyer out of the photo using Gemini's box and shows it on the cards |
| `src/lib/Dither.jsx`, `field.js` | Animated dither art, used when a flyer has no photo crop |
| `src/lib/ics.js` | "Add" downloads a calendar invite with a day-before alert |
| `src/screens/*` | Capture, Reading, Retake, Swipe, Wallet |
| `src/styles.css` | Tokens and the motion system |

## Motion system

- Easing tokens: `--ease-out` for UI, `--spring` for physical things (cards, stamps), 180 / 320 / 520 ms.
- Screen changes use the View Transitions API. The board photo is a shared element, so it morphs from camera to reading to retake.
- Shutter: press scale + white flash + haptic tick.
- Reading: the photo lifts into a card with a scan sweep, then "Found N events" pops in.
- Swipe: cards deal in with a stagger; drag turns them in 3D; release flips them away while the next card pulls into focus from a blur.
- Wallet: cards rise in sequence; newly saved ones get a blue ring that fades; Add morphs to Added.
- Everything respects the phone's Reduce Motion setting.

## Ideas not built yet

Accounts and sync, real reminders (push), saved vs. going states, close-up retake for single flyers, sharing.
