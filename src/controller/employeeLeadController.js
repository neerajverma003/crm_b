import EmployeeLead from "../models/employeeLeadModel.js";
import OperationLead from "../models/operationLeadModel.js";
import CustomerCreation from "../models/customerCreation.js";
import { cloudinary } from "../../config/upload.js";

export const createLead = async (req, res) => {
  try {
    const {
      employeeId,
      employee: employeeFromBody,
      name,
      phone,
      email,
      whatsAppNo,
      departureCity,
      destination,
      expectedTravelDate,
      leadSource,
      leadType,
      tripType,
      leadStatus,
      notes,
      noOfDays,
      customNoOfDays,
      groupNumber,
      placesToCover,
      noOfPerson,
      noOfChild,
      childAges,
      routedFromEmployee,
      isActioned,
    } = req.body;

    // Support both `employeeId` and `employee` incoming field names.
    const employeeToUse = employeeId || employeeFromBody || req.body.employee || req.body.employeeId;

    if (!employeeToUse) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }

    const lead = await EmployeeLead.create({
      name,
      phone,
      email,
      whatsAppNo,
      departureCity,
      destination,
      expectedTravelDate,
      leadSource,
      leadType,
      tripType,
      leadStatus,
      notes,
      noOfDays,
      customNoOfDays,
      placesToCover,
      noOfPerson,
      noOfChild,
      childAges,
      groupNumber,
      employee: employeeToUse,
      routedFromEmployee: routedFromEmployee || null,
      isActioned: isActioned !== undefined ? isActioned : false,
    });

    console.log("New Lead Created:", lead);
    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const getAllLeads = async (req, res) => {
  try {
    const leads = await EmployeeLead.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getLeadsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    // Populate both employee and routedFromEmployee fields
    const leads = await EmployeeLead.find({ employee: employeeId })
      .populate("employee", "fullName email department")
      .populate("routedFromEmployee", "fullName email department");

    // Return empty list if no leads found instead of 404 — frontend expects a success response
    return res.status(200).json({
      success: true,
      count: leads.length,
      leads: leads || [],
    });
  } catch (error) {
    console.error("Error fetching leads by employee ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching leads",
      error: error.message,
    });
  }
};

export const updateLead = async (req, res) => {
  try {
    const { leadId } = req.params; // ID of the lead to update
    const updateData = req.body; // Fields to update

    if (!leadId) {
      return res.status(400).json({ success: false, message: "Lead ID is required" });
    }

    // Find the lead by ID and update
    const updatedLead = await EmployeeLead.findByIdAndUpdate(
      leadId,
      updateData,
      { new: true, runValidators: true } // return the updated document and validate fields
    );

    if (!updatedLead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating lead",
      error: error.message,
    });
  }
};


export const getAllEmployeeLeads = async (req, res) => {
  try {
    // Fetch all leads with employee info
    const leads = await EmployeeLead.find()
      .populate("employee", "fullName email department") // populate employee details
      .sort({ createdAt: -1 }); // latest first

    // Return empty array if none found to make client logic simpler
    return res.status(200).json({
      success: true,
      count: leads.length,
      leads: leads || [],
    });
  } catch (error) {
    console.error("Error fetching all employee leads:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching all employee leads",
      error: error.message,
    });
  }
};

export const markLeadAsActioned = async (req, res) => {
  try {
    const { leadId } = req.params;

    if (!leadId) {
      return res.status(400).json({ message: "Lead ID is required" });
    }

    // Update the lead to mark it as actioned
    const updatedLead = await EmployeeLead.findByIdAndUpdate(
      leadId,
      { isActioned: true },
      { new: true }
    ).populate("employee", "fullName email department")
     .populate("routedFromEmployee", "fullName email department");

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Lead marked as actioned",
      data: updatedLead,
    });
  } catch (error) {
    console.error("Error marking lead as actioned:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking lead as actioned",
      error: error.message,
    });
  }
};


// ----------------- Transfer to Operation handlers -----------------

export const transferLeadToOperation = async (req, res) => {
  try {
    const { leadId } = req.params;
    if (!leadId) return res.status(400).json({ success: false, message: "leadId is required" });

    const lead = await EmployeeLead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

    // Create a new OperationLead document
    const op = await OperationLead.create({
      originalLeadId: lead._id,
      employee: lead.employee,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      whatsAppNo: lead.whatsAppNo,
      departureCity: lead.departureCity,
      destination: lead.destination,
      expectedTravelDate: lead.expectedTravelDate,
      noOfDays: lead.noOfDays,
      customNoOfDays: lead.customNoOfDays,
      placesToCover: lead.placesToCover,
      noOfPerson: lead.noOfPerson,
      noOfChild: lead.noOfChild,
      childAges: lead.childAges,
      groupNumber: lead.groupNumber,
      leadSource: lead.leadSource,
      leadType: lead.leadType,
      tripType: lead.tripType,
      leadStatus: lead.leadStatus,
      notes: lead.notes,
      routedFromEmployee: lead.routedFromEmployee,
      originalCreatedAt: lead.createdAt,
    });

    // Delete original lead
    await EmployeeLead.findByIdAndDelete(leadId);

    return res.status(200).json({ success: true, message: "Lead transferred to operation", data: op });
  } catch (error) {
    console.error("Error transferring lead to operation:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Move an OperationLead into customer creation (customer-data) including documents
export const moveTransferLeadToCustomer = async (req, res) => {
  try {
    const { leadId } = req.params;
    console.log('moveTransferLeadToCustomer called for leadId:', leadId, 'from IP:', req.ip || req.headers['x-forwarded-for'] || 'unknown');
    if (!leadId) return res.status(400).json({ success: false, message: 'leadId is required' });

    const opLead = await OperationLead.findById(leadId);
    if (!opLead) return res.status(404).json({ success: false, message: 'Operation lead not found' });
    // Build customer data by copying relevant fields from the operation lead
    const customerData = {
      name: opLead.name || '',
      phone: opLead.phone || '',
      groupNo: opLead.groupNumber || opLead.groupNo || '',
      email: opLead.email || '',
      address: opLead.destination || opLead.departureCity || '',

      // Copy operation-lead specific fields
      employee: opLead.employee || null,
      whatsAppNo: opLead.whatsAppNo || '',
      departureCity: opLead.departureCity || '',
      destination: opLead.destination || '',
      expectedTravelDate: opLead.expectedTravelDate || null,
      noOfDays: opLead.noOfDays || opLead.customNoOfDays || '',
      customNoOfDays: opLead.customNoOfDays || '',
      placesToCover: opLead.placesToCover || '',
      noOfPerson: opLead.noOfPerson || 0,
      noOfChild: opLead.noOfChild || 0,
      childAges: opLead.childAges || [],
      groupNumber: opLead.groupNumber || opLead.groupNo || '',
      leadSource: opLead.leadSource || '',
      leadType: opLead.leadType || '',
      tripType: opLead.tripType || '',
      leadStatus: opLead.leadStatus || '',
      notes: opLead.notes || '',
      routedFromEmployee: opLead.routedFromEmployee || null,
      originalLeadId: opLead.originalLeadId || opLead._id,
      originalCreatedAt: opLead.originalCreatedAt || opLead.createdAt || null,

      documents: opLead.documents || [],
    };

    console.log('Creating customer with data:', JSON.stringify(customerData, null, 2));
    
    const createdCustomer = await CustomerCreation.create(customerData);
    console.log('Customer created successfully:', createdCustomer._id);

    // Keep the operation lead in database (don't delete) - just copy to customer-data
    console.log(`Successfully moved lead ${leadId} to customer-data while keeping it in OperationLead`);

    return res.status(200).json({ success: true, message: 'Lead moved to customer-data', data: createdCustomer });
  } catch (error) {
    console.error('Error moving lead to customer-data:', error.message);
    console.error('Full error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update an OperationLead (transfer leads) by ID
export const updateOperationLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const updateData = req.body;
    if (!leadId) return res.status(400).json({ success: false, message: "leadId is required" });

    const updated = await OperationLead.findByIdAndUpdate(leadId, updateData, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: "Operation lead not found" });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating operation lead:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTransferLeadsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) return res.status(400).json({ success: false, message: "employeeId is required" });

    const leads = await OperationLead.find({ employee: employeeId }).sort({ transferredAt: -1 });
    return res.status(200).json({ success: true, count: leads.length, data: leads });
  } catch (error) {
    console.error("Error fetching transfer leads:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTransferLeads = async (req, res) => {
  try {
    const leads = await OperationLead.find().populate('employee', 'fullName phone officialNo department').sort({ transferredAt: -1 });
    return res.status(200).json({ success: true, count: leads.length, data: leads });
  } catch (error) {
    console.error("Error fetching all transfer leads:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const migrateTransferFlags = async (req, res) => {
  try {
    // Find any EmployeeLead docs that have transferToOperation true (if any were set erroneously)
    const flagged = await EmployeeLead.find({ transferToOperation: true });
    if (!flagged || flagged.length === 0) {
      return res.status(200).json({ success: true, message: "No flagged leads to migrate", migrated: 0 });
    }

    const created = [];
    for (const lead of flagged) {
      const op = await OperationLead.create({
        originalLeadId: lead._id,
        employee: lead.employee,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        whatsAppNo: lead.whatsAppNo,
        departureCity: lead.departureCity,
        destination: lead.destination,
        expectedTravelDate: lead.expectedTravelDate,
        noOfDays: lead.noOfDays,
        customNoOfDays: lead.customNoOfDays,
        placesToCover: lead.placesToCover,
        noOfPerson: lead.noOfPerson,
        noOfChild: lead.noOfChild,
        childAges: lead.childAges,
        groupNumber: lead.groupNumber,
        leadSource: lead.leadSource,
        leadType: lead.leadType,
        tripType: lead.tripType,
        leadStatus: lead.leadStatus,
        notes: lead.notes,
        routedFromEmployee: lead.routedFromEmployee,
        originalCreatedAt: lead.createdAt,
      });
      created.push(op);
      await EmployeeLead.findByIdAndDelete(lead._id);
    }

    return res.status(200).json({ success: true, message: "Migrated flagged leads", migrated: created.length });
  } catch (error) {
    console.error("Error migrating flagged leads:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadTransferLeadDocuments = async (req, res) => {
  try {
    console.log("=== Upload Documents Handler ===");
    const { leadId, leadName } = req.body;
    const peopleData = Array.isArray(req.body.peopleData) ? req.body.peopleData : [];
    const files = Array.isArray(req.body.files) ? req.body.files : [];

    console.log("Received payload:", {
      leadId,
      leadName,
      peopleDataLength: peopleData.length,
      filesLength: files.length,
      keptExistingIdsProvided: Object.prototype.hasOwnProperty.call(req.body, 'keptExistingIds')
    });

    if (!leadId) {
      return res.status(400).json({ 
        success: false, 
        message: "Lead ID is required" 
      });
    }

    // If caller provided neither new files nor any indication about which existing
    // documents to keep/remove, reject as ambiguous. However if the caller explicitly
    // sent `keptExistingIds` (even an empty array), allow the request to proceed
    // because an empty array signifies "remove all existing documents".

    if (files.length === 0 && !Object.prototype.hasOwnProperty.call(req.body, 'keptExistingIds')) {
      return res.status(400).json({ 
        success: false, 
        message: "No documents provided and no keptExistingIds specified"
      });
    }

    console.log(`Uploading ${files.length} documents for lead: ${leadName} (${leadId})`);

    // Create a map of personId -> personName for quick lookup
    const personMap = {};
    peopleData.forEach(person => {
      personMap[person.id] = person.name;
    });

    console.log("Person map:", personMap);

    // Upload files to Cloudinary and collect document metadata
    const documents = [];
    
    for (const fileData of files) {
      try {
        console.log(`Processing file: ${fileData.fileName} (${fileData.fileSize} bytes)`);

        const { personId, docType, base64, fileType, fileName } = fileData;

        // Convert base64 back to buffer
        const buffer = Buffer.from(base64, 'base64');
        
        // Upload to Cloudinary from buffer
        const folder = `customer_data/${leadName}/documents`;
        const publicId = `${Date.now()}-${personId}-${docType}`;
        
        console.log(`Uploading to Cloudinary: folder=${folder}, publicId=${publicId}, fileType=${fileType}`);

        // Determine resource type based on file type
        let resourceType = 'auto';
        if (fileType && (fileType.includes('pdf') || fileType === 'application/pdf')) {
          resourceType = 'raw';
        }

        // Upload stream
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: folder,
              public_id: publicId,
              resource_type: resourceType,
              type: 'upload',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(buffer);
        });

        console.log("Cloudinary upload result:", {
          public_id: result.public_id,
          secure_url: result.secure_url,
        });

        // Add document metadata
        documents.push({
          personName: personMap[personId] || `Person ${personId}`,
          personId: personId,
          documentType: docType,
          fileName: fileName,
          fileUrl: result.secure_url,
          fileType: fileType,
          cloudinaryPublicId: result.public_id,
          uploadedAt: new Date(),
        });

      } catch (fileError) {
        console.error("Error uploading file to Cloudinary:", fileError);
        return res.status(400).json({
          success: false,
          message: `Failed to upload ${fileData.fileName}: ${fileError.message}`
        });
      }
    }

    // If there were files sent but none uploaded successfully, return an error.
    if (documents.length === 0 && files.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Failed to upload any documents" 
      });
    }

    console.log("Documents to save:", documents);

    // Reconcile with existing documents: keep only those specified in keptExistingIds
    const existingLead = await OperationLead.findById(leadId);
    if (!existingLead) {
      console.error(`Lead not found: ${leadId}`);
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    // Interpret keptExistingIds: if the client explicitly provided the key (even an empty array)
    // then we respect it: empty array => remove all existing documents. If the key was omitted
    // entirely, default behaviour is to keep existing documents.
    const keptExistingIdsRaw = req.body.keptExistingIds;
    const keptExistingIdsProvided = Object.prototype.hasOwnProperty.call(req.body, 'keptExistingIds');

    let existingKept = [];
    if (keptExistingIdsProvided) {
      const keptExistingIds = Array.isArray(keptExistingIdsRaw) ? keptExistingIdsRaw : [];
      if (keptExistingIds.length > 0) {
        // Keep documents explicitly referenced by public id
        existingKept = (existingLead.documents || []).filter(d => keptExistingIds.includes(d.cloudinaryPublicId));
      } else {
        // Explicit empty array: infer kept documents from provided peopleData so that
        // removing one person doesn't wipe out others when the frontend couldn't
        // supply public ids. Keep any existing document whose personId matches
        // one of the people submitted in this request.
        const peopleIds = peopleData.map(p => String(p.id));
        existingKept = (existingLead.documents || []).filter(d => d.personId && peopleIds.includes(String(d.personId)));
      }
    } else {
      // Key missing: default to keeping existing documents
      existingKept = existingLead.documents || [];
    }

    const finalDocuments = [...existingKept, ...documents];

    // Overwrite the documents array to reflect deletions and additions
    const updatedLead = await OperationLead.findByIdAndUpdate(
      leadId,
      { documents: finalDocuments },
      { new: true }
    );

    if (!updatedLead) {
      console.error(`Lead not found: ${leadId}`);
      return res.status(404).json({ 
        success: false, 
        message: "Lead not found" 
      });
    }

    console.log(`Successfully uploaded ${documents.length} documents for lead ${leadName}`);
    return res.status(200).json({ 
      success: true, 
      message: "Documents uploaded successfully", 
      lead: updatedLead 
    });
  } catch (error) {
    console.error("=== Error uploading documents ===");
    console.error("Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message
    });
  }
};

export const deleteTransferDocument = async (req, res) => {
  try {
    console.log("=== Delete Transfer Document ===");
    const { leadId, cloudinaryPublicId } = req.body;

    if (!leadId || !cloudinaryPublicId) {
      return res.status(400).json({ success: false, message: "leadId and cloudinaryPublicId are required" });
    }

    // Delete from Cloudinary
    try {
      const destroyResult = await cloudinary.uploader.destroy(cloudinaryPublicId, { resource_type: 'auto' });
      console.log('Cloudinary destroy result:', destroyResult);
    } catch (cloudErr) {
      console.error('Cloudinary delete error:', cloudErr);
      // continue to try removing from DB even if cloud deletion fails
    }

    // Remove document record from OperationLead
    const updatedLead = await OperationLead.findByIdAndUpdate(
      leadId,
      { $pull: { documents: { cloudinaryPublicId: cloudinaryPublicId } } },
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({ success: false, message: 'Operation lead not found' });
    }

    return res.status(200).json({ success: true, message: 'Document removed', lead: updatedLead });
  } catch (error) {
    console.error('Error deleting transfer document:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
