// The board-reading prompt. AI reads, the app reasons: no date math or guessing here.
export const PROMPT = `You are reading a photo of a campus bulletin board covered in flyers.

STEP 1 · Check the photo.
Decide if the photo is good enough to read. Problems: "blurry", "too_dark", "glare", "too_far", "angled", "too_many_cut_off".
If most flyers cannot be read, set retake_board to true. List flyers that need a close-up in retake_flyers.

STEP 2 · Count every flyer, left to right, top to bottom. Give each a position like "top left", "middle", "bottom right".

STEP 3 · Transcribe each flyer exactly as printed.
Accuracy rules:
- Copy text exactly. Never guess, fill in, or fix a date, time, or place.
- If a character is ambiguous (for example "Nov 1" vs "Nov 10"), put the options in possible_readings.
- Only use what is visible on the flyer. No outside knowledge. Do not convert dates or add a year.
- evidence: the exact words you used for the date and time.
- missing_fields only applies to kind "event" or "deadline".

kind is one of: "event", "deadline", "resource", "recruitment", "info", "other".
category (only for events, else null) is one of: "art", "music", "market", "club", "film", "sport", "food", "talk", "party", "outdoors", "volunteer", "tech", "wellness", "culture", "study", "info_session".

Return ONLY JSON in this shape (values below are placeholders, not examples to copy):
{
  "photo_check": { "retake_board": false, "board_issues": [], "retake_flyers": [{ "position": "<position>", "reason": "<short reason>" }] },
  "flyers": [{
    "position": "<position>",
    "kind": "<kind>",
    "host_text": "<as printed or null>",
    "title_text": "<as printed>",
    "date_text": "<as printed or null>",
    "time_text": "<as printed or null>",
    "place_text": "<as printed or null>",
    "price_text": "<as printed or null>",
    "display_title": "<short clean title, max 40 chars>",
    "display_place": "<short place or null>",
    "category": "<category or null>",
    "description": "<one plain sentence about the event or null>",
    "evidence": "<exact words used for date and time>",
    "missing_fields": [],
    "unclear_fields": [],
    "possible_readings": [{ "field": "<field>", "options": ["<a>", "<b>"] }],
    "cut_off": false,
    "needs_closeup": false,
    "confidence": 0.0
  }]
}`;
