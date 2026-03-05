const aksharamukha = require('aksharamukha');

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { text, source, target } = JSON.parse(event.body);

    const result = aksharamukha.transliterate(text, source, target);

    return {
      statusCode: 200,
      body: JSON.stringify({ transliteratedText: result }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
