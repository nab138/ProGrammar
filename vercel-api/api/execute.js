const axios = require('axios');

const clientID = process.env.JDOODLE_CLIENT_ID;
const clientSecret = process.env.JDOODLE_CLIENT_SECRET;
module.exports = async (req, res) => {
    // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error executing code' });
  }
};