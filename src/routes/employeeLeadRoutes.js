import express from "express";
import {
  createLead,
  getAllEmployeeLeads,
  getAllLeads,
  getLeadsByEmployeeId,
  updateLead,
  markLeadAsActioned,
} from "../controller/employeeLeadController.js";

const router = express.Router();

// 🟢 Create a new lead
router.post("/", createLead);

// 🟢 Get all leads
router.get("/get", getAllLeads);

// 🟢 Get leads by employee ID
router.get("/employee/:employeeId", getLeadsByEmployeeId);

// 🟢 Update a lead by lead ID
router.put("/:leadId", updateLead);

// 🟢 Mark lead as actioned (when employee takes action on routed lead)
router.put("/action/:leadId", markLeadAsActioned);

router.get("/all", getAllEmployeeLeads);

export default router;
