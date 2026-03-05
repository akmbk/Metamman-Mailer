const dns = require('dns').promises;

exports.handler = async (event) => {
  let body;
  try {
    body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const email = body?.email;

  if (!email || !email.includes('@')) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Valid email address required' }),
    };
  }

  const domain = email.split('@')[1];

  try {
    const mxRecords = await dns.resolveMx(domain);

    if (mxRecords && mxRecords.length > 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          exists: true,
          domain,
          mx: mxRecords.sort((a, b) => a.priority - b.priority),
        }),
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ exists: false, message: 'No MX records found' }),
    };

  } catch (error) {
    // Handle domain not found or timeout
    return {
      statusCode: 404,
      body: JSON.stringify({
        exists: false,
        error: error.code === 'ENOTFOUND' ? 'Domain not found' : 'DNS lookup failed',
      }),
    };
  }
};