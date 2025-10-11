const Settings = require('../models/Settings');

class SettingsService {
  static async get(key, defaultValue = null) {
    try {
      const setting = await Settings.findOne({ key });
      return setting ? setting.value : defaultValue;
    } catch (error) {
      console.error('Settings get error:', error);
      return defaultValue;
    }
  }

  static async set(key, value, category = 'general', description = '') {
    try {
      return await Settings.findOneAndUpdate(
        { key },
        { value, category, description },
        { new: true, upsert: true }
      );
    } catch (error) {
      console.error('Settings set error:', error);
      throw error;
    }
  }

  static async getAll() {
    try {
      const settings = await Settings.find();
      return settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
    } catch (error) {
      console.error('Settings getAll error:', error);
      return {};
    }
  }
}

module.exports = SettingsService;