const Session = require("../../models/sensory/session");

exports.logSession = async (req, res) => {
  const { userId, sound, volume, duration } = req.body;

  try {
    const session = new Session({ userId, sound, volume, duration });
    await session.save();
    res.status(201).json({ message: "Session logged" });
    console.log("Session logged");
    
  } catch (err) {
    console.log("Sessioneee");
    // console.log("Session logging error:", err);
    res.status(500).json({ error: "Failed to log session" });
  }
};

exports.getSessionsByUser = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error("Fetching sessions failed:", err);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};
