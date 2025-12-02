import Cheque from "../models/ChequeModel.js"

export const createCheque = async (req, res) => {
  try {
    const cheque = await Cheque.create(req.body);
    console.log("✅ Cheque Created:", cheque);
    res.status(201).json({ success: true, data: cheque });
  } catch (error) {
    console.error("❌ Error creating cheque:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllCheque = async(req,res)=>{
    try {
        const data = await Cheque.find({})
        if(!data){
            return res.status(400).json({message:"No cheque record found"})
        }
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"Server error"})
    }
}

export const updateCheque = async (req, res) => {
  try {
    const { id } = req.params;
    // Prevent entryDate from being changed via update
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'entryDate')) {
      delete req.body.entryDate;
    }
    const updated = await Cheque.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Cheque not found" });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ Error updating cheque:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};