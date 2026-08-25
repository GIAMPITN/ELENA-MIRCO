const { getStore } = require('@netlify/blobs');

const PASSWORD = 'Elena&Mirco2026';

exports.handler = async (event) => {
  const pwd = event.queryStringParameters && event.queryStringParameters.pwd;
  if (pwd !== PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Non autorizzato' }) };
  }

  try {
    const store = getStore('messages');
    let messages = [];
    try {
      const existing = await store.get('all', { type: 'json' });
      if (existing) messages = existing;
    } catch(e) {}

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages)
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
