import hospitalPricingModel from '../models/hospitalPricing.js';

// Get all pricing configurations
const getAllPricing = async (req, res) => {
  try {
    const pricing = await hospitalPricingModel.find({ isActive: true }).sort({ specialty: 1 });
    res.status(200).json({
      success: true,
      data: pricing,
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pricing configurations',
      error: error.message,
    });
  }
};

// Get pricing by specialty
const getPricingBySpecialty = async (req, res) => {
  try {
    const { specialty } = req.params;
    const pricing = await hospitalPricingModel.findOne({ 
      specialty: { $regex: new RegExp(specialty, 'i') },
      isActive: true 
    });

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: 'Pricing not found for this specialty',
      });
    }

    res.status(200).json({
      success: true,
      data: pricing,
    });
  } catch (error) {
    console.error('Error fetching pricing by specialty:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pricing configuration',
      error: error.message,
    });
  }
};

// Create new pricing configuration
const createPricing = async (req, res) => {
  try {
    const { specialty, consultationFee, description } = req.body;

    // Validate required fields
    if (!specialty || consultationFee === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Specialty and consultation fee are required',
      });
    }

    if (consultationFee < 0) {
      return res.status(400).json({
        success: false,
        message: 'Consultation fee must be a positive number',
      });
    }

    // Check if pricing for this specialty already exists
    const existingPricing = await hospitalPricingModel.findOne({ 
      specialty: { $regex: new RegExp(specialty, 'i') }
    });

    if (existingPricing) {
      return res.status(400).json({
        success: false,
        message: 'Pricing configuration for this specialty already exists',
      });
    }

    const pricing = new hospitalPricingModel({
      specialty: specialty.trim(),
      consultationFee: Number(consultationFee),
      description: description || '',
    });

    await pricing.save();

    res.status(201).json({
      success: true,
      message: 'Pricing configuration created successfully',
      data: pricing,
    });
  } catch (error) {
    console.error('Error creating pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating pricing configuration',
      error: error.message,
    });
  }
};

// Update pricing configuration
const updatePricing = async (req, res) => {
  try {
    const { id } = req.params;
    const { specialty, consultationFee, description, isActive } = req.body;

    const pricing = await hospitalPricingModel.findById(id);

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: 'Pricing configuration not found',
      });
    }

    // Check if updating specialty would conflict with existing one
    if (specialty && specialty !== pricing.specialty) {
      const existingPricing = await hospitalPricingModel.findOne({ 
        specialty: { $regex: new RegExp(specialty, 'i') },
        _id: { $ne: id }
      });

      if (existingPricing) {
        return res.status(400).json({
          success: false,
          message: 'Pricing configuration for this specialty already exists',
        });
      }
    }

    // Update fields
    if (specialty) pricing.specialty = specialty.trim();
    if (consultationFee !== undefined) {
      if (consultationFee < 0) {
        return res.status(400).json({
          success: false,
          message: 'Consultation fee must be a positive number',
        });
      }
      pricing.consultationFee = Number(consultationFee);
    }
    if (description !== undefined) pricing.description = description;
    if (isActive !== undefined) pricing.isActive = isActive;

    await pricing.save();

    res.status(200).json({
      success: true,
      message: 'Pricing configuration updated successfully',
      data: pricing,
    });
  } catch (error) {
    console.error('Error updating pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating pricing configuration',
      error: error.message,
    });
  }
};

// Delete pricing configuration
const deletePricing = async (req, res) => {
  try {
    const { id } = req.params;

    const pricing = await hospitalPricingModel.findByIdAndDelete(id);

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: 'Pricing configuration not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pricing configuration deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting pricing configuration',
      error: error.message,
    });
  }
};

// Get pricing for doctor consultation
const getDoctorConsultationFee = async (req, res) => {
  try {
    const { specialty } = req.params;
    
    const pricing = await hospitalPricingModel.findOne({ 
      specialty: { $regex: new RegExp(specialty, 'i') },
      isActive: true 
    });

    if (!pricing) {
      return res.status(404).json({
        success: false,
        message: 'No pricing found for this specialty',
        consultationFee: 0,
      });
    }

    res.status(200).json({
      success: true,
      consultationFee: pricing.consultationFee,
      specialty: pricing.specialty,
    });
  } catch (error) {
    console.error('Error fetching consultation fee:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consultation fee',
      error: error.message,
    });
  }
};

export {
  getAllPricing,
  getPricingBySpecialty,
  createPricing,
  updatePricing,
  deletePricing,
  getDoctorConsultationFee,
}; 