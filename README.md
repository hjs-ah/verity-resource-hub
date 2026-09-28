# Verity Resource Hub

Landing page for Verity Outreach Worship Center initiatives. Cards come from a Notion database;
the page is static HTML plus one small serverless function that talks to Notion.

```
index.html      page, styles, popup, light/dark toggle
api/cards.js    reads the Notion database (token stays server-side)
assets/         logos
.env.example    the two settings the function needs
```

## 1. Notion database

Live database: [Resource Hub Cards](https://app.notion.com/p/6be6eb68f5964730b1d3c5718ae78e8f), under `Command Center Home / Ministry / Projects / Verity Resource Hub`. It already has the columns below and six draft rows (unpublished) for the known initiatives — fill each in and check Published when it's ready to go live.

Columns (names must match, or edit `PROP` at the top of `api/cards.js`):

| Column        | Type     | Used for                                              |
|---------------|----------|-------------------------------------------------------|
| Title         | Title    | Card title                                            |
| Image URL     | URL      | Card image (and popup header)                         |
| Description   | Text     | Short line on the card                                |
| Impact        | Text     | Impact line on the card, e.g. "156 cases of water donated" |
| Summary       | Text     | Popup: about the initiative                           |
| Latest update | Text     | Popup: most recent summary                            |
| Link          | URL      | Popup: "Visit initiative" button                      |
| Donate URL    | URL      | Popup: "Donate" button (only shows if filled)         |
| Order         | Number   | Card order, lowest first                              |
| Published     | Checkbox | Only checked rows appear on the page                  |

## 2. Connect Notion

1. notion.so/profile/integrations > New integration > copy the secret.
2. Open the database > ... menu > Connections > add your integration.
3. Copy the database ID from its URL (the 32 characters before `?v=`).

## 3. Deploy: GitHub, then Vercel

1. Push this folder to a new GitHub repo (`.gitignore` already keeps secrets out).
2. In Vercel: Add New > Project > import the repo. Framework preset **Other**; leave build command and output directory empty.
3. Before the first deploy, add two Environment Variables: `NOTION_TOKEN` and `NOTION_DATABASE_ID`.
4. Deploy. Every push to `main` redeploys automatically. Edits to cards in Notion show up within about 5 minutes with no redeploy.

Local dev (optional):

```
npm i -g vercel
cp .env.example .env.local     # fill in both values
vercel dev                     # http://localhost:3000
```

Opening `index.html` directly (no server) shows sample cards so you can work on the design.

## Settings in index.html

- `MINISTRY_START_YEAR` drives the "years in ministry" line under the logo (set `null` to hide).
- Theme defaults to light; the toggle saves the visitor's choice in their browser.
