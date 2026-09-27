import { getStore } from "@netlify/blobs";

const PASSWORD = "Elena&Mirco2026";

export default async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get("pwd") !== PASSWORD) {
    return new Response(JSON.stringify({ error: "Non autorizzato" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const store = getStore({ name: "messaggi", consistency: "strong" });

    // 1. Vecchio formato: tutti i messaggi in un'unica lista "all"
    const existing = await store.get("all", { type: "json" });
    const messages = Array.isArray(existing) ? existing.slice() : [];

    // 2. Nuovo formato: un messaggio per chiave "m-..."
    const { blobs } = await store.list({ prefix: "m-" });
    const keys = blobs.map((b) => b.key);
    for (let i = 0; i < keys.length; i += 25) {
      const blocco = await Promise.all(
        keys.slice(i, i + 25).map((k) => store.get(k, { type: "json" }).catch(() => null))
      );
      for (const m of blocco) {
        if (m && typeof m === "object") messages.push(m);
      }
    }

    // Dal più vecchio al più recente, come prima
    messages.sort((a, b) => String(a.ts || "").localeCompare(String(b.ts || "")));

    return new Response(JSON.stringify(messages), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
