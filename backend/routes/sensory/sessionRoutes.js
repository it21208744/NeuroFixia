// routes/sensory/sessionRoutes.js
const express = require("express");
const router = express.Router();
const { logSession, getSessionsByUser } = require("../../controllers/sensory/sessionController");

router.post("/", logSession);
router.get("/:userId", getSessionsByUser);

module.exports = router;

