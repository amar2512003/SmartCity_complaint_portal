const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");

router.get("/stats", async (req, res) => {
  try {
    const [totalComplaints, pendingComplaints, resolvedComplaints, inProgressComplaints] =
      await Promise.all([
        Complaint.countDocuments(),
        Complaint.countDocuments({ status: "Pending" }),
        Complaint.countDocuments({ status: "Resolved" }),
        Complaint.countDocuments({ status: "In Progress" }),
      ]);

    res.json({
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      inProgressComplaints,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
