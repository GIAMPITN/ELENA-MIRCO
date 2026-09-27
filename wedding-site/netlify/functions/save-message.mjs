import { getStore } from "@netlify/blobs";

// Ogni messaggio viene salvato con una chiave propria.
// Così due ospiti che inviano nello stesso istante non si
// sovrascrivono a vicenda (prima tutto finiva in un'unica lista "all").
export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const data = await req.json();
    const store = getStore({ name: "messaggi", consistency: "strong" });

    const now = Date.now();
    const key = "m-" + now + "-" + Math.random().toString(36).slice(2, 10);

    await store.setJSON(key, {
      id: now,
      nome: String(data.nome || "").slice(0, 60),
      r1: String(data.r1 || "").slice(0, 3000),
      ts: new Date().toISOString()
    });

    return new Response(JSON.stringify({ ok: true }), {
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
