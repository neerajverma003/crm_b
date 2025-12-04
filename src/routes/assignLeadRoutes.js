// routes/assignLeadRoutes.js
import express from "express";
import { assignLeadToEmployee, getAssignedLeadsForEmployee } from "../controller/assignLeadController.js";

const router = express.Router();

// POST /assign-lead
router.post("/", assignLeadToEmployee);

// GET /assignlead/:employeeId -> get assigned leads for an employee
router.get("/:employeeId", getAssignedLeadsForEmployee);

export default router;
