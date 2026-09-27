import { getStore } from "@netlify/blobs";

const PASSWORD = "Elena&Mirco2026";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });

export default async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get("pwd") !== PASSWORD) {
    return json({ error: "Non autorizzato" }, 401);
  }

  try {
    const store = getStore({ name: "quiz", consistency: "strong" });
    const { blobs } = await store.list({ prefix: "q-" });
    const keys = blobs.map((b) => b.key);

    // Lettura a blocchi di 25 per non sovraccaricare la funzione
    const risultati = [];
    for (let i = 0; i < keys.length; i += 25) {
      const blocco = await Promise.all(
        keys.slice(i, i + 25).map((k) => store.get(k, { type: "json" }).catch(() => null))
      );
      for (const r of blocco) {
        if (r && Array.isArray(r.a)) risultati.push(r);
      }
    }

    return json(risultati);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
};
