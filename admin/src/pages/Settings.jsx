import React, { useState } from 'react';
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
} from '@mui/material';

const Settings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: false,
    language: 'en',
    autoSave: true
  });

  const handleChange = (setting) => (event) => {
    setSettings({
      ...settings,
      [setting]: event.target.type === 'checkbox' ? event.target.checked : event.target.value
    });
  };

  const handleSave = () => {
    // Save settings to backend/localStorage
    console.log('Settings saved:', settings);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
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

      <Box display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={handleSave}>
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;
