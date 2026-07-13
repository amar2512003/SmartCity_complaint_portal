const express = require("express");
const router = express.Router();
const { categorizeComplaint, chatWithAssistant } = require("../controllers/aiController");

router.post("/categorize", categorizeComplaint);
router.post("/chat", chatWithAssistant);

module.exports = router;
