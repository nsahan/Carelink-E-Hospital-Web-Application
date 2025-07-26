import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  Paper,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Button,
  TextField,
  Slider,
  Alert,
  CircularProgress
} from '@mui/material';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    language: 'en',
    autoSave: true,
    userRegistration: true,
    maintenanceMode: false,
    minPasswordLength: 8,
    requireSpecialChars: true,

    // API Configuration
    apiEndpoint: 'https://api.example.com',
    apiVersion: 'v1',
    apiRateLimit: 100,

    // Backup Settings
    autoBackup: true,
    backupFrequency: 24, // hours
    backupRetention: 30, // days

    // Analytics
    googleAnalytics: false,
    googleAnalyticsId: '',
    mixpanel: false,
    mixpanelToken: '',

    // Session Management
    sessionTimeout: 30, // minutes
    maxLoginAttempts: 5,
    forcePasswordReset: 90, // days

    // Advanced Security
    enableTwoFactor: false,
    ipWhitelist: '',
    sslOnly: true,
    jwtExpiration: 24, // hours

    // Performance
    cacheLifetime: 60, // minutes
    maxUploadSize: 10, // MB
    compressionEnabled: true,

    // Logging
    errorLogging: true,
    auditLogging: true,
    logRetention: 90 // days
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [loadingMaintenance, setLoadingMaintenance] = useState(true);

  // Fetch maintenance mode from backend on mount
  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const res = await fetch('http://localhost:9000/v1/api/settings/maintenance');
        const data = await res.json();
        setSettings(prev => ({ ...prev, maintenanceMode: data.maintenanceMode }));
      } catch (err) {
        setSaveStatus({ type: 'error', message: 'Failed to fetch maintenance mode' });
      } finally {
        setLoadingMaintenance(false);
      }
    };
    fetchMaintenance();
  }, []);

  const handleChange = (setting) => (event) => {
    setSettings({
      ...settings,
      [setting]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus({ type: 'success', message: 'Settings saved successfully' });
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMaintenanceModeChange = async (event) => {
    const newValue = event.target.checked;
    // Prevent enabling if already enabled
    if (settings.maintenanceMode && newValue) {
      setSaveStatus({
        type: 'warning',
        message: 'Maintenance mode is already active.'
      });
      return;
    }
    setIsSaving(true);
    try {
      await fetch('http://localhost:9000/v1/api/settings/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maintenanceMode: newValue })
      });
      setSettings(prev => ({
        ...prev,
        maintenanceMode: newValue
      }));
      setSaveStatus({
        type: 'success',
        message: `Maintenance mode ${newValue ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      setSaveStatus({
        type: 'error',
        message: 'Failed to update maintenance mode'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto', mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      

      
     

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          System Maintenance
        </Typography>
        <Stack spacing={2}>
          <Box sx={{
            p: 2,
            border: '1px solid',
            borderColor: settings.maintenanceMode ? 'warning.main' : 'divider',
            borderRadius: 1,
            bgcolor: settings.maintenanceMode ? 'warning.lighter' : 'background.paper',
            transition: 'all 0.3s ease'
          }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="subtitle1" color={settings.maintenanceMode ? 'warning.dark' : 'text.primary'}>
                  Maintenance Mode
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  When enabled, users will see a maintenance message and most features will be disabled
                </Typography>
              </Box>
              {loadingMaintenance ? (
                <CircularProgress size={24} />
              ) : (
                <Switch
                  checked={settings.maintenanceMode}
                  onChange={handleMaintenanceModeChange}
                  color="warning"
                  disabled={isSaving}
                />
              )}
            </Box>
            {settings.maintenanceMode && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Maintenance mode is currently active. Users cannot access most features.
              </Alert>
            )}
          </Box>
        </Stack>
      </Paper>

      <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
        <Box>
          {saveStatus && (
            <Alert severity={saveStatus.type} sx={{ mb: 2 }}>
              {saveStatus.message}
            </Alert>
          )}
        </Box>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          startIcon={isSaving && <CircularProgress size={20} />}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;
