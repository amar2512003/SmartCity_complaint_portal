const express = require("express");
const router = express.Router();
const { chatWithAssistant } = require("../controllers/aiController");

router.post("/recommend", chatWithAssistant);

module.exports = router;
