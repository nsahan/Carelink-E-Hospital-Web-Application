import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  Typography
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';

const api = axios.create({
  baseURL: 'http://localhost:9000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('atoken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const MedicalTerms = () => {
  const [terms, setTerms] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTerm, setCurrentTerm] = useState({
    term: '',
    definition: '',
    category: '',
    relatedTerms: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await api.get('/medical-terms');
      setTerms(response.data);
    } catch (err) {
      setError('Failed to fetch medical terms');
    }
  };

  const handleOpen = (term = null) => {
    if (term) {
      setCurrentTerm(term);
      setEditMode(true);
    } else {
      setCurrentTerm({
        term: '',
        definition: '',
        category: '',
        relatedTerms: []
      });
      setEditMode(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditMode(false);
    setCurrentTerm({
      term: '',
      definition: '',
      category: '',
      relatedTerms: []
    });
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await api.put(`/medical-terms/${currentTerm._id}`, currentTerm);
        setSuccess('Medical term updated successfully');
      } else {
        await api.post('/medical-terms', currentTerm);
        setSuccess('Medical term added successfully');
      }
      fetchTerms();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medical term');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this term?')) {
      try {
        await api.delete(`/medical-terms/${id}`);
        setSuccess('Medical term deleted successfully');
        fetchTerms();
      } catch (err) {
        setError('Failed to delete medical term');
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Medical Terms Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen()}
        >
          Add New Term
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Term</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Definition</TableCell>
              <TableCell>Related Terms</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {terms.map((term) => (
              <TableRow key={term._id}>
                <TableCell>{term.term}</TableCell>
                <TableCell>{term.category}</TableCell>
                <TableCell>{term.definition.substring(0, 100)}...</TableCell>
                <TableCell>
                  {term.relatedTerms.map((relatedTerm, index) => (
                    <Chip
                      key={index}
                      label={relatedTerm}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(term)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(term._id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Medical Term' : 'Add New Medical Term'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Term"
              value={currentTerm.term}
              onChange={(e) => setCurrentTerm({ ...currentTerm, term: e.target.value })}
              fullWidth
            />
            <TextField
              label="Category"
              value={currentTerm.category}
              onChange={(e) => setCurrentTerm({ ...currentTerm, category: e.target.value })}
              fullWidth
            />
            <TextField
              label="Definition"
              value={currentTerm.definition}
              onChange={(e) => setCurrentTerm({ ...currentTerm, definition: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
            <TextField
              label="Related Terms (comma-separated)"
              value={currentTerm.relatedTerms.join(', ')}
              onChange={(e) => setCurrentTerm({
                ...currentTerm,
                relatedTerms: e.target.value.split(',').map(term => term.trim())
              })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MedicalTerms;
