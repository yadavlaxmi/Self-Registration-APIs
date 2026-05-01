const axios = require("axios");

const createSelfRegistration = async (candidate) => {
  try {
    const response = await axios.post(
      `${process.env.ONGRID_BASE_URL}/self-registration`,
      {
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        package: candidate.package,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.ONGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("OnGrid API Error:", error.response?.data || error.message);
    throw error;
  }
};

// Create or update invite in community (OnGrid SR invite)
const createInvite = async (communityId, candidatePayload) => {
  try {
    const base = process.env.ONGRID_BASE_URL.replace(/\/\/$/, "");
    const url = `${base}/app/v1/community/${communityId}/invite`;

    const response = await axios.post(url, candidatePayload, {
      headers: {
        Authorization: `Bearer ${process.env.ONGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("OnGrid Invite Error:", error.response?.data || error.message);
    throw error;
  }
};

// Fetch candidates/reports from OnGrid
const fetchFromOnGrid = async (endpoint = "candidates") => {
  try {
    const response = await axios.get(
      `${process.env.ONGRID_BASE_URL}/${endpoint}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("OnGrid Fetch Error:", error.response?.data || error.message);
    throw error;
  }
};

// Fetch report by ID
const fetchReportFromOnGrid = async (reportId) => {
  try {
    const response = await axios.get(
      `${process.env.ONGRID_BASE_URL}/reports/${reportId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.ONGRID_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("OnGrid Report Fetch Error:", error.response?.data || error.message);
    throw error;
  }
};

module.exports = { createSelfRegistration, createInvite, fetchFromOnGrid, fetchReportFromOnGrid };