const express = require("express");
const router = express.Router();

const {
  createCandidate,
  receiveRFData,
  syncFromOnGrid,
  getCandidateById,
  shortlistCandidate,
  triggerVerification,
  rejectCandidate,
} = require("../controllers/candidateController");
const { handleWebhook } = require("../webhooks/ongridWebhook");

router.post("/candidate", createCandidate);
// Recruitment Flow Endpoints
router.post("/rf-data", receiveRFData); // 1. Receive RF application

router.get("/candidate/:id", getCandidateById); // Get candidate details
router.patch("/candidate/:id/shortlist", shortlistCandidate); // 2. HR shortlist
router.post("/candidate/:id/verify", triggerVerification); // 3. Trigger OnGrid verification
router.patch("/candidate/:id/reject", rejectCandidate); // 4. Reject candidate
// Fetch from OnGrid
// Webhook for OnGrid updates
router.post("/webhook/ongrid", handleWebhook);

module.exports = router;