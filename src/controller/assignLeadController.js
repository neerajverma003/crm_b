// controllers/assignLeadController.js
import AssignLead from "../models/AssignLeadModel.js";
import Lead from "../models/LeadModel.js";
import Employee from "../models/employeeModel.js";

/**
 * Assign a lead to an employee
 */
export const assignLeadToEmployee = async (req, res) => {
  try {
    const { leadIds, employeeId } = req.body;

    if (!employeeId || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({ message: "employeeId and leadIds are required" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const validLeads = await Lead.find({ _id: { $in: leadIds } });
    if (validLeads.length === 0) {
      return res.status(404).json({ message: "No valid leads found" });
    }

    const assignments = await Promise.all(
      validLeads.map((lead) =>
        AssignLead.create({ lead: lead._id, employee: employeeId })
      )
    );

    await Employee.updateOne(
      { _id: employeeId },
      { $addToSet: { assignLeads: { $each: leadIds } } }
    );

    const updatedEmployee = await Employee.findById(employeeId).populate("assignLeads");

    res.status(201).json({
      message: "Leads assigned successfully",
      count: assignments.length,
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error("Error assigning lead:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get assigned leads for a specific employee
export const getAssignedLeadsForEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) return res.status(400).json({ message: 'employeeId is required' });
    const assignments = await AssignLead.find({ employee: employeeId }).populate({
      path: 'lead',
      // include _id explicitly and commonly used fields
      select: '_id name email phone whatsAppNo destination',
    });
    const leads = assignments.map((a) => a.lead).filter(Boolean);
    return res.status(200).json({ data: leads });
  } catch (error) {
    console.error('Error fetching assigned leads:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
