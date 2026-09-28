// GET /api/cards
// Reads published rows from the Notion database and returns them as JSON for the landing page.
// The Notion token stays on the server (Vercel environment variables), never in the browser.

// Column names in the Notion database. Change these if you rename a column.
const PROP = {
  title: 'Title',               // Title
  image: 'Image URL',           // URL
  description: 'Description',   // Text (short line on the card)
  impact: 'Impact',             // Text (e.g. "156 cases of water donated")
  summary: 'Summary',           // Text (popup: about the initiative)
  latest: 'Latest update',      // Text (popup: most recent summary)
  link: 'Link',                 // URL (initiative page)
  donate: 'Donate URL',         // URL (shows a Donate button when filled)
  order: 'Order',               // Number (lowest first)
  published: 'Published',       // Checkbox (only checked rows appear)
};

const plain = (p) => (p && (p.title || p.rich_text) ? (p.title || p.rich_text).map((t) => t.plain_text).join('') : '');
const url = (p) => (p && p.url ? p.url : '');

module.exports = async function handler(req, res) {
  const { NOTION_TOKEN, NOTION_DATABASE_ID } = process.env;

  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    return res.status(500).json({ error: 'Set NOTION_TOKEN and NOTION_DATABASE_ID in the environment.' });
  }

  try {
    const r = await fetch(`https://api.notion.com/v1/databases/${NOTION_DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: { property: PROP.published, checkbox: { equals: true } },
        sorts: [{ property: PROP.order, direction: 'ascending' }],
        page_size: 100,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ error: 'Notion request failed', status: r.status, detail });
    }

    const data = await r.json();
    const cards = data.results.map((page) => {
      const p = page.properties;
      return {
        id: page.id,
        title: plain(p[PROP.title]),
        image: url(p[PROP.image]),
        description: plain(p[PROP.description]),
        impact: plain(p[PROP.impact]),
        summary: plain(p[PROP.summary]),
        latest: plain(p[PROP.latest]),
        link: url(p[PROP.link]),
        donate: url(p[PROP.donate]),
      };
    }).filter((c) => c.title);

    // Cache at the edge for 5 minutes so Notion isn't hit on every page view.
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ cards });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected error', detail: String(err) });
  }
};
