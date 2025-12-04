// routes/assignLeadRoutes.js
import express from "express";
import {
  assignLeadToEmployee,
  getAssignedLeadsForEmployee,
  reassignLeadsForEmployee,
} from "../controller/assignLeadController.js";

const router = express.Router();

// POST /assignlead/ -> assign new leads to an employee
router.post("/", assignLeadToEmployee);

// POST /assignlead/reassign -> move leads from one employee to another
router.post("/reassign", reassignLeadsForEmployee);

// GET /assignlead/:employeeId -> get assigned leads for an employee
router.get("/:employeeId", getAssignedLeadsForEmployee);

export default router;
