import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Avatar,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  Card,
  CardContent,
  Fade,
  Grow,
  IconButton,
  Divider,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  Person,
  CalendarMonth,
  AccessTime,
  People,
  TrendingUp,
  LocalHospital,
  Schedule,
  CheckCircle,
  Cancel,
  Pending,
  Star,
  Timeline,
  Lock,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { LogOut, Stethoscope, Heart, Clock, Calendar, Settings } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    completedAppointments: 0,
    upcomingAppointments: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [animationDelay, setAnimationDelay] = useState(0);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const doctorInfo = localStorage.getItem('doctorInfo');
        const doctorToken = localStorage.getItem('doctorToken');

        if (!doctorInfo || !doctorToken) {
          navigate('/login');
          return;
        }

        const doc = JSON.parse(doctorInfo);
        setDoctor(doc);

        const response = await axios.get(
          `http://localhost:9000/api/appointments/doctor/${doc._id}/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${doctorToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.success) {
          setStats(response.data.stats);
          setAppointments(response.data.appointments);
        } else {
          throw new Error(response.data.message || 'Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error(error.response?.data?.message || 'Failed to load dashboard data');
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorInfo');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handlePasswordChange = async () => {
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setPasswordLoading(true);
    try {
      const doctorToken = localStorage.getItem('doctorToken');
      const doctorInfo = JSON.parse(localStorage.getItem('doctorInfo'));

      const response = await axios.put(
        `http://localhost:9000/api/doctor/${doctorInfo._id}/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${doctorToken}` },
        }
      );

      if (response.data.success) {
        toast.success('Password changed successfully');
        setPasswordModalOpen(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const openPasswordModal = () => {
    setPasswordModalOpen(true);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const doctorToken = localStorage.getItem('doctorToken');
      if (!doctorToken) {
        throw new Error('Unauthorized. Please log in again.');
      }

      const response = await axios.put(
        `http://localhost:9000/api/appointments/${appointmentId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${doctorToken}` },
        }
      );

      if (response.data.success) {
        setAppointments((prev) =>
          prev.map((apt) => (apt._id === appointmentId ? { ...apt, status } : apt))
        );
        toast.success(`Appointment ${status} successfully`);
      } else {
        throw new Error(response.data.message || 'Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error(error.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const formatAppointmentDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'MMM dd, yyyy') : 'N/A';
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle sx={{ color: '#4caf50' }} />;
      case 'cancelled': return <Cancel sx={{ color: '#f44336' }} />;
      case 'completed': return <Star sx={{ color: '#ff9800' }} />;
      default: return <Pending sx={{ color: '#2196f3' }} />;
    }
  };

  const StatCard = ({ title, value, icon, color, delay, description, trend }) => (
    <Grow in={!loading} timeout={1000} style={{ transitionDelay: `${delay}ms` }}>
      <Card
        sx={{
          height: '100%',
          background: 'white',
          border: `2px solid ${color}30`,
          borderRadius: 3,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 12px 24px ${color}25`,
            border: `2px solid ${color}50`,
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {icon}
            </Box>
            {trend && (
              <Chip
                size="small"
                label={trend}
                sx={{
                  bgcolor: `${color}30`,
                  color: color,
                  fontWeight: 'bold'
                }}
              />
            )}
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: color, mb: 1 }}>
            {value}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {description}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min((value / 50) * 100, 100)}
            sx={{
              mt: 2,
              height: 6,
              borderRadius: 3,
              bgcolor: `${color}20`,
              '& .MuiLinearProgress-bar': {
                bgcolor: color,
                borderRadius: 3,
              }
            }}
          />
        </CardContent>
      </Card>
    </Grow>
  );

  // Enhanced Loading Component
  const LoadingSkeleton = () => (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3, mb: 3 }} />
      </Box>
      <Grid container spacing={3}>
        {[...Array(4)].map((_, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
        </Grid>
      </Grid>
    </Container>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }
  
  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(100deg, #661eea 0%, #ffffff 80%)',
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Enhanced Header */}
        <Fade in={!loading} timeout={800}>
          <Paper
            elevation={12}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={doctor?.image || ''}
                    alt={doctor?.name || 'Doctor'}
                    sx={{
                      width: 80,
                      height: 80,
                      border: '4px solid #667eea30',
                      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
                    }}
                  >
                    <Person sx={{ fontSize: 40 }} />
                  </Avatar>
                  <Box sx={{
                    position: 'absolute',
                    bottom: -2,
                    right: -2,
                    bgcolor: '#4caf50',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid white'
                  }}>
                    <Heart size={12} color="white" />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Welcome back,  {doctor?.name || 'N/A'} 👋
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                      icon={<Stethoscope size={16} />}
                      label={doctor?.specialty || 'General Medicine'}
                      sx={{
                        bgcolor: '#667eea20',
                        color: '#667eea',
                        fontWeight: 600
                      }}
                    />
                    <Chip
                      icon={<LocalHospital />}
                      label="Active"
                      color="success"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>
              <Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<LogOut />}
                onClick={handleLogout}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 8px 24px rgba(244, 67, 54, 0.3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(244, 67, 54, 0.4)',
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          </Paper>
        </Fade>

        {/* Settings Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Settings size={20} />}
            onClick={openPasswordModal}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#667eea',
              color: '#667eea',
              '&:hover': {
                borderColor: '#5a67d8',
                backgroundColor: '#667eea10',
              }
            }}
          >
            Change Password
          </Button>
        </Box>
              
        {/* Enhanced Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Today's Schedule"
              value={stats.todayAppointments}
              icon={<CalendarMonth sx={{ fontSize: 28, color: '#2196f3' }} />}
              color="#2196f3"
              delay={200}
              description="Appointments scheduled for today"
              trend="+12%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Patients"
              value={stats.totalPatients}
              icon={<People sx={{ fontSize: 28, color: '#4caf50' }} />}
              color="#4caf50"
              delay={400}
              description="Patients under your care"
              trend="+8%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Upcoming"
              value={stats.upcomingAppointments}
              icon={<AccessTime sx={{ fontSize: 28, color: '#ff9800' }} />}
              color="#ff9800"
              delay={600}
              description="Future appointments"
              trend="+5%"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completed"
              value={stats.completedAppointments}
              icon={<TrendingUp sx={{ fontSize: 28, color: '#9c27b0' }} />}
              color="#9c27b0"
              delay={800}
              description="Successfully completed"
              trend="+15%"
            />
          </Grid>
        </Grid>

        {/* Enhanced Appointments Table */}
        <Fade in={!loading} timeout={1200}>
          <Paper
            elevation={12}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
            }}
          >
            <Box sx={{
              p: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Schedule sx={{ fontSize: 28 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Today's Appointments Schedule
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
                Manage your daily patient appointments efficiently
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              <TableContainer>
                <Table sx={{ '& .MuiTableCell-head': { fontWeight: 700 } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: '1rem' }}>Patient Information</TableCell>
                      <TableCell sx={{ fontSize: '1rem' }}>Status</TableCell>
                      <TableCell sx={{ fontSize: '1rem' }}>Date</TableCell>
                      <TableCell sx={{ fontSize: '1rem' }}>Time</TableCell>
                      <TableCell sx={{ fontSize: '1rem' }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments.map((appointment, index) => (
                      <Grow key={appointment._id} in={!loading} timeout={1000 + (index * 200)}>
                        <TableRow
                          sx={{
                            '&:hover': {
                              bgcolor: '#f5f5f5',
                              transform: 'scale(1.01)',
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar sx={{ bgcolor: '#667eea20', color: '#667eea' }}>
                                <Person />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {appointment.userId?.name || 'Unknown Patient'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  Patient ID: #{appointment._id.slice(-6)}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getStatusIcon(appointment.status)}
                              <Chip
                                label={appointment.status || 'Unknown'}
                                size="small"
                                color={
                                  appointment.status === 'confirmed'
                                    ? 'success'
                                    : appointment.status === 'cancelled'
                                      ? 'error'
                                      : appointment.status === 'completed'
                                        ? 'primary'
                                        : 'warning'
                                }
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {formatAppointmentDate(appointment.date)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Clock size={16} />
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {appointment.time || 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            {appointment.status === 'pending' && (
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleUpdateStatus(appointment._id, 'confirmed')}
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    minWidth: 80
                                  }}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="error"
                                  onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    minWidth: 80
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="primary"
                                  onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                                  sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    minWidth: 80
                                  }}
                                >
                                  Complete
                                </Button>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      </Grow>
                    ))}
                    {appointments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Calendar size={48} color="#ccc" />
                            <Typography variant="h6" color="textSecondary">
                              No appointments scheduled for today
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Enjoy your free day! 🌟
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Fade>
      </Container>

      {/* Password Change Modal */}
      <Dialog
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Lock sx={{ fontSize: 28 }} />
          Change Password
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Please enter your current password and choose a new secure password.
          </Alert>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Current Password */}
            <TextField
              fullWidth
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => togglePasswordVisibility('current')}
                    edge="end"
                  >
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            {/* New Password */}
            <TextField
              fullWidth
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => togglePasswordVisibility('new')}
                    edge="end"
                  >
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              helperText="Password must be at least 6 characters long"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            {/* Confirm New Password */}
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => togglePasswordVisibility('confirm')}
                    edge="end"
                  >
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
              helperText={
                passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''
                  ? 'Passwords do not match'
                  : ''
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setPasswordModalOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePasswordChange}
            variant="contained"
            disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              }
            }}
          >
            {passwordLoading ? 'Changing Password...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorDashboard;