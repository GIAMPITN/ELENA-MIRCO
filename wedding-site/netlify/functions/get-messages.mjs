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
    const existing = await store.get("all", { type: "json" });
    const messages = Array.isArray(existing) ? existing : [];

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
