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
    setIsSaving(true);
    try {
      // Simulate API call - replace with your actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
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
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' , mt: 8}}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Notifications
        </Typography>
        <Stack spacing={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>Email Notifications</Typography>
            <Switch
              checked={settings.emailNotifications}
              onChange={handleChange('emailNotifications')}
            />
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>Push Notifications</Typography>
            <Switch
              checked={settings.pushNotifications}
              onChange={handleChange('pushNotifications')}
            />
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Appearance
        </Typography>
        <Stack spacing={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>Dark Mode</Typography>
            <Switch
              checked={settings.darkMode}
              onChange={handleChange('darkMode')}
            />
          </Box>
          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              value={settings.language}
              label="Language"
              onChange={handleChange('language')}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
              <MenuItem value="de">German</MenuItem>
              <MenuItem value="it">Italian</MenuItem>
              <MenuItem value="pt">Portuguese</MenuItem>
              <MenuItem value="ru">Russian</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          General
        </Typography>
        <Stack spacing={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>Auto Save</Typography>
            <Switch
              checked={settings.autoSave}
              onChange={handleChange('autoSave')}
            />
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Management
        </Typography>
        <Stack spacing={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>Allow User Registration</Typography>
            <Switch
              checked={settings.userRegistration}
              onChange={handleChange('userRegistration')}
            />
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Security
        </Typography>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Minimum Password Length</InputLabel>
            <Select
              value={settings.minPasswordLength}
              label="Minimum Password Length"
              onChange={handleChange('minPasswordLength')}
            >
              <MenuItem value={6}>6 characters</MenuItem>
              <MenuItem value={8}>8 characters</MenuItem>
              <MenuItem value={12}>12 characters</MenuItem>
            </Select>
          </FormControl>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>Require Special Characters</Typography>
            <Switch
              checked={settings.requireSpecialChars}
              onChange={handleChange('requireSpecialChars')}
            />
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>API Configuration</Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="API Endpoint"
            value={settings.apiEndpoint}
            onChange={handleChange('apiEndpoint')}
          />
          <FormControl fullWidth>
            <InputLabel>API Version</InputLabel>
            <Select
              value={settings.apiVersion}
              label="API Version"
              onChange={handleChange('apiVersion')}
            >
              <MenuItem value="v1">v1</MenuItem>
              <MenuItem value="v2">v2</MenuItem>
              <MenuItem value="v3">v3</MenuItem>
            </Select>
          </FormControl>
          <Box>
            <Typography gutterBottom>API Rate Limit (requests/minute)</Typography>
            <Slider
              value={settings.apiRateLimit}
              onChange={handleChange('apiRateLimit')}
              min={10}
              max={1000}
              step={10}
              marks={[
                { value: 10, label: '10' },
                { value: 1000, label: '1000' }
              ]}
            />
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Backup & Recovery</Typography>
        <Stack spacing={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>Automatic Backups</Typography>
            <Switch
              checked={settings.autoBackup}
              onChange={handleChange('autoBackup')}
            />
          </Box>
          <FormControl fullWidth>
            <InputLabel>Backup Retention (days)</InputLabel>
            <Select
              value={settings.backupRetention}
              label="Backup Retention (days)"
              onChange={handleChange('backupRetention')}
            >
              <MenuItem value={7}>7 days</MenuItem>
              <MenuItem value={30}>30 days</MenuItem>
              <MenuItem value={90}>90 days</MenuItem>
              <MenuItem value={365}>1 year</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

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
              <Switch
                checked={settings.maintenanceMode}
                onChange={handleMaintenanceModeChange}
                color="warning"
              />
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
