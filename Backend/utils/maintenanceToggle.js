import mongoose from 'mongoose';
import Settings from '../models/Settings.js';
import connectdb from '../config/mongodb.js';

async function toggleMaintenanceMode(mode) {
  try {
    // Connect to database
    await connectdb();

    // Find or create settings document
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // Set maintenance mode
    settings.maintenanceMode = mode;
    await settings.save();

    console.log(`Maintenance mode ${mode ? 'ENABLED' : 'DISABLED'}`);
    return settings.maintenanceMode;
  } catch (error) {
    console.error('Error toggling maintenance mode:', error);
    throw error;
  } finally {
    // Close mongoose connection
    await mongoose.connection.close();
  }
}

// Allow direct script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2] === 'true';
  toggleMaintenanceMode(mode)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default toggleMaintenanceMode; 