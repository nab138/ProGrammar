const axios = require('axios');

const clientID = process.env.JDOODLE_CLIENT_ID;
const clientSecret = process.env.JDOODLE_CLIENT_SECRET;
const authToken = process.env.API_AUTH_TOKEN;
module.exports = async (req, res) => {
  const allowedOrigins = ['http://localhost:8100', 'capacitor://localhost', 'http://localhost'];

  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, X-API-Key');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  // Check the auth token to make sure it matches
  if (!req.headers || req.headers['X-API-Key'] !== authToken) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }
  const { script, language, versionIndex } = req.body;

  var program = {
    script: script,
    language: language,
    versionIndex: versionIndex,
    clientId: clientID,
    clientSecret: clientSecret,
  };


  try {
    let response = await axios.post("https://api.jdoodle.com/v1/execute", program);
    if(response.data.error){
      return res.status(500).json({ error: 'Error executing code', message: response.data.error });
    }
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Cannot Connect', message: error.message });
  }
};