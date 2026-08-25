const fs = require('fs');
const path = require('path');

// Netlify Blobs — storage persistente incluso nel piano gratuito
const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const store = getStore('messages');

    // Leggi messaggi esistenti
    let messages = [];
    try {
      const existing = await store.get('all', { type: 'json' });
      if (existing) messages = existing;
    } catch(e) {}

    // Aggiungi nuovo messaggio
    const entry = {
      id: Date.now(),
      nome: data.nome,
      r1: data.r1 || '',
      r2: data.r2 || '',
      r3: data.r3 || '',
      r4: data.r4 || '',
      ts: new Date().toISOString()
    };
    messages.push(entry);

    await store.setJSON('all', messages);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
