import { getStore } from "@netlify/blobs";

// Salva il risultato di una partita al quiz.
// Ogni partita ha una chiave propria: due ospiti che finiscono
// nello stesso istante non si sovrascrivono mai.
const NUM_DOMANDE = 11;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const data = await req.json();
    const scelte = data && Array.isArray(data.a) ? data.a : null;
    const valide =
      scelte &&
      scelte.length === NUM_DOMANDE &&
      scelte.every((n) => Number.isInteger(n) && n >= 0 && n <= 3);

    if (!valide) {
      return json({ ok: false, error: "Dati non validi" }, 400);
    }

    const store = getStore({ name: "quiz", consistency: "strong" });
    const key = "q-" + Date.now() + "-" + Math.random().toString(36).slice(2, 10);
    await store.setJSON(key, { a: scelte, ts: new Date().toISOString() });

    return json({ ok: true });
  } catch (e) {
    return json({ ok: false, error: e.message }, 500);
  }
};
