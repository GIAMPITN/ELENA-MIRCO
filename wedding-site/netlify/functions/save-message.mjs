import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const data = await req.json();
    const store = getStore({ name: "messaggi", consistency: "strong" });

    const existing = await store.get("all", { type: "json" });
    const messages = Array.isArray(existing) ? existing : [];

    messages.push({
      id: Date.now(),
      nome: String(data.nome || "").slice(0, 60),
      r1: String(data.r1 || "").slice(0, 3000),
      ts: new Date().toISOString()
    });

    await store.setJSON("all", messages);

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
