const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");

const allowedFields = [
  "title",
  "description",
  "category",
  "location",
  "priority",
  "status",
  "citizenName",
  "createdBy",
];

const pickComplaintFields = (body) =>
  allowedFields.reduce((data, field) => {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
    return data;
  }, {});

router.post("/", async (req, res) => {
  try {
    const complaint = await Complaint.create(pickComplaintFields(req.body));
    res.status(201).json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      pickComplaintFields(req.body),
      { new: true, runValidators: true },
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json(complaint);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
