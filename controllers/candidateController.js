const Candidate = require("../models/candidate");
const { createSelfRegistration, createInvite } = require("../services/ongridService");

// 1. Receive RF Data (Entry Point)
exports.receiveRFData = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      phoneCountryCode,
      employeeId,
      joiningDate,
      expiryTime,
      sendReminders,
      offerings,
      deduplicationKeys,
      tags,
      communityId,
    } = req.body;

    // basic validation
    if (!name || !email || !phone) {
      return res.status(400).json({ message: "name, email and phone are required" });
    }

    // Check if candidate already exists
    const existingCandidate = await Candidate.findOne({ email });
    if (existingCandidate) {
      return res.status(400).json({ message: "Candidate already exists" });
    }

    // Save with "applied" status
    const candidate = await Candidate.create({
      name,
      email,
      phone,
      phoneCountryCode,
      employeeId,
      joiningDate: joiningDate ? new Date(joiningDate) : undefined,
      expiryTime: expiryTime ? new Date(expiryTime) : undefined,
      sendReminders: typeof sendReminders === "boolean" ? sendReminders : true,
      offerings: Array.isArray(offerings) ? offerings : [],
      deduplicationKeys: Array.isArray(deduplicationKeys) ? deduplicationKeys : [],
      tags: Array.isArray(tags) ? tags : [],
      communityId: communityId || process.env.ONGRID_COMMUNITY_ID,
      status: "applied",
    });

    res.status(201).json({
      message: "Candidate application received",
      data: candidate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. HR Shortlist Candidate
exports.shortlistCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (candidate.status !== "applied") {
      return res.status(400).json({ message: "Only applied candidates can be shortlisted" });
    }

    candidate.status = "shortlisted";
    await candidate.save();

    res.json({
      message: "Candidate shortlisted",
      data: candidate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Trigger OnGrid Verification (HR Action)
exports.triggerVerification = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (candidate.status !== "shortlisted") {
      return res.status(400).json({ message: "Only shortlisted candidates can be verified" });
    }

    // Build invite payload from candidate data
    const communityId = candidate.communityId || process.env.ONGRID_COMMUNITY_ID;
    if (!communityId) {
      return res.status(500).json({ message: "communityId not configured on candidate or env" });
    }

    const payload = {
      name: candidate.name,
      phone: candidate.phone,
      phoneCountryCode: candidate.phoneCountryCode,
      email: candidate.email,
      employeeId: candidate.employeeId,
      joiningDate: candidate.joiningDate
        ? candidate.joiningDate.toISOString().slice(0, 10)
        : undefined,
      deduplicationKeys: candidate.deduplicationKeys || [],
      expiryTime: candidate.expiryTime
        ? candidate.expiryTime.toISOString().slice(0, 10)
        : undefined,
      sendReminders: typeof candidate.sendReminders === "boolean" ? candidate.sendReminders : true,
      offerings: Array.isArray(candidate.offerings) ? candidate.offerings : [],
      tags: Array.isArray(candidate.tags) ? candidate.tags : [],
    };

    // Remove undefined fields so only provided data is sent (name/email/phone required)
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    // Call OnGrid community invite API
    const apiResponse = await createInvite(communityId, payload);

    // Save returned ids if present
    candidate.inviteId = apiResponse.inviteId || apiResponse.invite_id || candidate.inviteId;
    candidate.individualId = apiResponse.individualId || apiResponse.individual_id || candidate.individualId;
    candidate.status = "verification_initiated";
    await candidate.save();

    res.json({
      message: "Verification initiated",
      data: candidate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Reject Candidate
exports.rejectCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.status = "rejected";
    candidate.rejectionReason = reason || "No reason provided";
    await candidate.save();

    res.json({
      message: "Candidate rejected",
      data: candidate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Get all candidates (with status filter)
exports.getCandidates = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }

    const candidates = await Candidate.find(query).sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 6. Get candidate by ID
exports.getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Old function - kept for compatibility
exports.createCandidate = async (req, res) => {
  res.status(400).json({ 
    message: "Use POST /api/rf-data instead",
    info: "This endpoint is deprecated. Please use the recruitment flow endpoints."
    });
};