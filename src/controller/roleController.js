import Role from "../models/roleModel.js";

export const createRole = async (req, res) => {
  try {
    let { role, subRole } = req.body;

    // Ensure subRole is always an array of objects { subRoleName, points }
    if (!Array.isArray(subRole)) {
      subRole = [];
    } else {
      subRole = subRole.map((s) => {
        // If frontend sends a string
        if (typeof s === "string") {
          return { subRoleName: s, points: [] };
        }

        // If frontend sends in { name, points } format
        return {
          subRoleName: s.subRoleName || s.name || "",
          points: Array.isArray(s.points) ? s.points : [],
        };
      });
    }

    const newRole = await Role.create({ role, subRole });
    console.log(newRole);
    res.status(201).json({ success: true, data: newRole });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllRole = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    let { role, subRole } = req.body;

    if (!id) return res.status(400).json({ success: false, message: "Role id is required" });

    // Normalize subRole incoming formats
    if (!Array.isArray(subRole)) {
      subRole = [];
    } else {
      subRole = subRole.map((s) => ({
        subRoleName: s.subRoleName || s.name || "",
        points: Array.isArray(s.points) ? s.points : [],
      }));
    }

    const updated = await Role.findByIdAndUpdate(
      id,
      { role, subRole },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Role not found" });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("updateRole error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: "Role id is required" });

    const deleted = await Role.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Role not found" });

    res.status(200).json({ success: true, message: "Role deleted" });
  } catch (error) {
    console.error("deleteRole error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
