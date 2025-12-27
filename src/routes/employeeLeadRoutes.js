import express from "express";
import {
  createLead,
  getAllEmployeeLeads,
  getAllLeads,
  getLeadsByEmployeeId,
  updateLead,
  markLeadAsActioned,
  transferLeadToOperation,
  updateOperationLead,
  getTransferLeadsByEmployee,
  getAllTransferLeads,
  migrateTransferFlags,
  uploadTransferLeadDocuments,
  deleteTransferDocument,
  moveTransferLeadToCustomer,
} from "../controller/employeeLeadController.js";
import { documentUpload } from "../../config/upload.js";

const router = express.Router();

//  Create a new lead
router.post("/", createLead);

//  Get all leads
router.get("/get", getAllLeads);

//  Get leads by employee ID
router.get("/employee/:employeeId", getLeadsByEmployeeId);

//  Update a lead by lead ID
router.put("/:leadId", updateLead);

//  Mark lead as actioned (when employee takes action on routed lead)
router.put("/action/:leadId", markLeadAsActioned);

// Transfer a lead to Operation collection
router.post("/transfer/:leadId", transferLeadToOperation);
router.post("/move-to-customer/:leadId", moveTransferLeadToCustomer);

// Upload documents for transfer leads (must come before /transfer/:leadId PUT)
router.post("/upload-documents", uploadTransferLeadDocuments);

// Delete a document (Cloudinary + DB)
router.delete("/document", deleteTransferDocument);

// Update an operation lead
router.put("/transfer/:leadId", updateOperationLead);
// Get all transfer leads (must come before /transfer/employee/:employeeId)
router.get("/transfer/all", getAllTransferLeads);
// Get transfer leads for an employee
router.get("/transfer/employee/:employeeId", getTransferLeadsByEmployee);
// Migrate any flagged leads (one-time helper)
router.post("/migrate-transfers", migrateTransferFlags);

router.get("/all", getAllEmployeeLeads);

export default router;
