import Settings from '../models/Settings.js';

export const getMaintenance = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({ maintenanceMode: settings.maintenanceMode });
  } catch (error) {
    console.error('Error getting maintenance mode:', error);
    res.status(500).json({ message: 'Error retrieving maintenance mode' });
  }
};

export const setMaintenance = async (req, res) => {
  try {
    const { maintenanceMode } = req.body;
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({ maintenanceMode });
    } else {
      settings.maintenanceMode = maintenanceMode;
      await settings.save();
    }
    
    res.json({ maintenanceMode: settings.maintenanceMode });
  } catch (error) {
    console.error('Error setting maintenance mode:', error);
    res.status(500).json({ message: 'Error setting maintenance mode' });
  }
}; 