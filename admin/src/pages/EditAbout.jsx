import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const EditAbout = () => {
  const [content, setContent] = useState({
    heroTitle: 'Revolutionizing Healthcare with CARELINK',
    heroSubtitle: 'Your all-in-one healthcare companion',
    visionTitle: 'Our Vision',
    visionDescription: 'At Carelink, we envision a world where quality healthcare is accessible to everyone.',
    stats: [
      { label: 'Patients Served', value: '500K+', subtitle: '' },
      { label: 'Medical Professionals', value: '3,000+', subtitle: '' },
      { label: 'Patient Satisfaction', value: '98%', subtitle: '' },
      { label: 'Around-the-clock Care', value: '24/7', subtitle: '' },
    ],
    services: [
      { title: 'Emergency Services', description: '24/7 emergency consultations with rapid response teams.', icon: 'AlertCircle' },
    ],
    values: [
      { title: 'Patient-Centered', description: 'We put patients first in everything we do.', icon: 'Users' },
    ],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const token = localStorage.getItem('atoken');
      const response = await axios.get('http://localhost:9000/api/about/content', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setContent(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch about content');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('atoken');
      if (!token) throw new Error('Please login to update content');
      const response = await axios.put(
        'http://localhost:9000/api/about/content',
        content,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.success) {
        toast.success('About content updated successfully');
      } else {
        throw new Error(response.data.message || 'Failed to update content');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.message || 'Error updating about content');
    } finally {
      setLoading(false);
    }
  };

  const addItem = (section) => {
    setContent((prev) => ({
      ...prev,
      [section]: [...prev[section], section === 'stats' ? { label: '', value: '', subtitle: '' } : { title: '', description: '', icon: '' }],
    }));
  };

  const removeItem = (section, index) => {
    setContent((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const updateItem = (section, index, field, value) => {
    setContent((prev) => {
      const newItems = [...prev[section]];
      newItems[index][field] = value;
      return { ...prev, [section]: newItems };
    });
  };

  return (
    <Box className="p-6">
      <Paper className="p-6">
        <Typography variant="h4" gutterBottom>Edit About Page Content</Typography>
        <form onSubmit={handleSubmit}>
          {/* Hero Section */}
          <Card className="mb-6">
            <CardContent>
              <Typography variant="h6" gutterBottom>Hero Section</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Hero Title"
                    value={content.heroTitle}
                    onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    label="Hero Subtitle"
                    value={content.heroSubtitle}
                    onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Vision Title"
                    value={content.visionTitle}
                    onChange={(e) => setContent({ ...content, visionTitle: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Vision Description"
                    value={content.visionDescription}
                    onChange={(e) => setContent({ ...content, visionDescription: e.target.value })}
                    required
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          {/* Stats Section */}
          <Card className="mb-6">
            <CardContent>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6">Statistics</Typography>
                <Button startIcon={<AddIcon />} onClick={() => addItem('stats')}>
                  Add Statistic
                </Button>
              </Box>
              {content.stats.map((stat, index) => (
                <Box key={index} className="mb-4 p-4 border rounded">
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Label"
                        value={stat.label}
                        onChange={(e) => updateItem('stats', index, 'label', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        label="Value"
                        value={stat.value}
                        onChange={(e) => updateItem('stats', index, 'value', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        label="Subtitle"
                        value={stat.subtitle}
                        onChange={(e) => updateItem('stats', index, 'subtitle', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton onClick={() => removeItem('stats', index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </CardContent>
          </Card>
          {/* Services Section */}
          <Card className="mb-6">
            <CardContent>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6">Services</Typography>
                <Button startIcon={<AddIcon />} onClick={() => addItem('services')}>
                  Add Service
                </Button>
              </Box>
              {content.services.map((service, index) => (
                <Box key={index} className="mb-4 p-4 border rounded">
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        label="Title"
                        value={service.title}
                        onChange={(e) => updateItem('services', index, 'title', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={service.description}
                        onChange={(e) => updateItem('services', index, 'description', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        label="Icon"
                        value={service.icon}
                        onChange={(e) => updateItem('services', index, 'icon', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton onClick={() => removeItem('services', index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </CardContent>
          </Card>
          {/* Values Section */}
          <Card className="mb-6">
            <CardContent>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6">Values</Typography>
                <Button startIcon={<AddIcon />} onClick={() => addItem('values')}>
                  Add Value
                </Button>
              </Box>
              {content.values.map((value, index) => (
                <Box key={index} className="mb-4 p-4 border rounded">
                  <Grid container spacing={2}>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        label="Title"
                        value={value.title}
                        onChange={(e) => updateItem('values', index, 'title', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={value.description}
                        onChange={(e) => updateItem('values', index, 'description', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        fullWidth
                        label="Icon"
                        value={value.icon}
                        onChange={(e) => updateItem('values', index, 'icon', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <IconButton onClick={() => removeItem('values', index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </CardContent>
          </Card>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            className="mt-4"
          >
            {loading ? 'Updating...' : 'Update Content'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default EditAbout;