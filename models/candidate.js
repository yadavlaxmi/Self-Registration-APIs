const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
      verificationId: String,
      inviteId: Number,
      individualId: Number,
      phoneCountryCode: String,
      employeeId: String,
      joiningDate: Date,
      expiryTime: Date,
      sendReminders: { type: Boolean, default: true },
      deduplicationKeys: [String],
      offerings: [
        {
          offeringCode: String,
          count: { type: Number, default: 0 },
          additionalRequiredIds: [Number],
        },
      ],
      tags: [
        {
          communityTagId: Number,
          value: String,
        },
      ],
      communityId: String,
    status: {
      type: String,
       enum: [
         "applied",
         "shortlisted",
         "verification_initiated",
         "in_progress",
         "verified",
         "failed",
         "rejected",
       ],
       default: "applied",
    },
    package: {
      type: String,
      default: "basic_bgv",
    },
     rejectionReason: String,
    webhookLogs: [
      {
        payload: Object,
        receivedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Candidate", candidateSchema);