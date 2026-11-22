/**
 * Artemis co-scientist proxy. Cloudflare Worker.
 *
 * Holds the Gemini key server-side (wrangler secret GEMINI_API_KEY) so nothing
 * secret ever reaches a browser. Accepts { prompt } from the portal, enforces
 * origin + size + per-IP rate limits, forwards to Gemini Flash, returns { text }.
 *
 * Deploy:
 *   cd worker && npx wrangler secret put GEMINI_API_KEY   # paste the key once
 *   npx wrangler deploy
 * Then create public/live/GBM3/ai-config.js (gitignored) containing:
 *   window.ARTEMIS_AI_ENDPOINT = "https://<your-worker>.workers.dev/ask";
 */

const MODEL = "gemini-3.8-flash";
const ALLOWED = [
  "https://artemislabs.bio",
  "https://www.artemislabs.bio",
  "https://logan196.github.io",
  "http://127.0.0.1:8080",
  "http://localhost:3000",
];
const MAX_PROMPT = 12000; // run context + question
const WINDOW_S = 60;
const PER_WINDOW = 8; // requests per IP per minute

function cors(origin) {
  const allow = ALLOWED.includes(origin) ? origin : ALLOWED[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

const json = (obj, status, origin) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors(origin) },
  });

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
    if (request.method !== "POST") return json({ error: "POST only" }, 405, origin);
    if (origin && !ALLOWED.includes(origin)) return json({ error: "origin not allowed" }, 403, origin);

    // per-IP rate limit (KV binding RL is optional; without it the limiter is a no-op)
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (env.RL) {
      const key = `rl:${ip}:${Math.floor(Date.now() / 1000 / WINDOW_S)}`;
      const n = parseInt((await env.RL.get(key)) || "0", 10) + 1;
      if (n > PER_WINDOW) return json({ error: "rate limit, try again shortly" }, 429, origin);
      await env.RL.put(key, String(n), { expirationTtl: WINDOW_S * 2 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "bad JSON" }, 400, origin);
    }
    const prompt = typeof body?.prompt === "string" ? body.prompt : "";
    if (!prompt) return json({ error: "missing prompt" }, 400, origin);
    if (prompt.length > MAX_PROMPT) return json({ error: "prompt too large" }, 413, origin);

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;

    for (let attempt = 0; attempt < 3; attempt++) {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 400 },
        }),
      });
      if ((r.status === 503 || r.status === 429) && attempt < 2) {
        await new Promise((res) => setTimeout(res, 1200 * (attempt + 1)));
        continue;
      }
      const d = await r.json().catch(() => ({}));
      if (d.error) return json({ error: d.error.message || `HTTP ${r.status}` }, 502, origin);
      const text = (d.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim();
      if (!text) return json({ error: "empty response" }, 502, origin);
      return json({ text }, 200, origin);
    }
    return json({ error: "model busy, try again" }, 503, origin);
  },
};
