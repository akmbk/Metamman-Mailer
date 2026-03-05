const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*", 
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "OK" };
  }

  try {
    const data = JSON.parse(event.body);
    const { to, subject, message, xAuthKey } = data; 

    // THE LOGIC GATE: Comparing the incoming pulse to the stored Reference Voltage
    const secretKey = process.env.COMM_KEY;

    if (!xAuthKey || xAuthKey !== secretKey) {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: "Signal Mismatch: Invalid Auth Key" })
        };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, 
        pass: process.env.GMAIL_PASS 
      }
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text: message
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Authenticated Signal Sent!" })
    };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};