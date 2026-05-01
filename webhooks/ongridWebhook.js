const Candidate = require("../models/candidate");

const handleWebhook = async (req, res) => {
  try {
    const { status } = req.body;

    // try multiple id keys that OnGrid may send
    const inviteId = req.body.inviteId || req.body.invite_id;
    const individualId = req.body.individualId || req.body.individual_id;
    const verification_id = req.body.verification_id;

    // Map OnGrid status to our enum
    const statusMap = {
      completed: "verified",
      verified: "verified",
      rejected: "failed",
      failed: "failed",
      in_progress: "in_progress",
      pending: "in_progress",
    };

    const mappedStatus = statusMap[status] || status;

    // Build query to find candidate by any known id
    const query = [];
    if (verification_id) query.push({ verificationId: verification_id });
    if (inviteId) query.push({ inviteId: inviteId });
    if (individualId) query.push({ individualId: individualId });

    const selector = query.length ? { $or: query } : { verificationId: null };

    await Candidate.findOneAndUpdate(
      selector,
      {
        status: mappedStatus,
        $push: {
          webhookLogs: { payload: req.body },
        },
      },
      { new: true }
    );

    console.log("Webhook received:", req.body);

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.sendStatus(500);
  }
};

module.exports = { handleWebhook };