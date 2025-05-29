import Emergency from '../models/Emergency.js';

export const.createEmergency = async (req, res) => {
  try {
    const emergency = new Emergency({
      patientName: req.body.patientName,
      location: req.body.location,
      message: req.body.message,
      status: 'CRITICAL',
      contactNumber: req.body.contactNumber,
      timestamp: new Date()
    });

    const savedEmergency = await emergency.save();

    // Emit through socket if available
    if (req.app.io) {
      req.app.io.emit('newEmergency', savedEmergency);
    }

    res.status(201).json({
      success: true,
      data: savedEmergency
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
