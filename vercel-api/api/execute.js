const axios = require("axios");
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.type,
    project_id: process.env.project_id,
    private_key_id: process.env.private_key_id,
    private_key: process.env.private_key.replace(/\\n/g, "\n"),
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    auth_uri: process.env.auth_uri,
    token_uri: process.env.token_uri,
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.client_x509_cert_url,
  }),
});

const clientID = process.env.JDOODLE_CLIENT_ID;
const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

module.exports = async (req, res) => {
  const allowedOrigins = [
    "http://localhost:8100",
    "capacitor://localhost",
    "http://localhost",
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const idToken = req.headers.authorization.split("Bearer ")[1];
  if (!idToken) {
    return res
      .status(401)
      .json({ error: "Unauthorized", message: "No token provided" });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const { script, language, versionIndex } = req.body;

    var program = {
      script: script,
      language: language,
      versionIndex: versionIndex,
      clientId: clientID,
      clientSecret: clientSecret,
    };

    try {
      let response = await axios.post(
        "https://api.jdoodle.com/v1/execute",
        program
      );
      if (response.data.error) {
        return res.status(500).json({
          error: "Error executing code",
          message: response.data.error,
        });
      }
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Cannot Connect", message: error.message });
    }
  } catch (error) {
    res.status(401).send("Unauthorized");
  }
};
