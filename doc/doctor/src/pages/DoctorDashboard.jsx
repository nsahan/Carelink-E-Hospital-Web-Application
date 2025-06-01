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
} from '@mui/material';
import {
  Person,
  CalendarMonth,
  AccessTime,
  People,
  TrendingUp,
} from '@mui/icons-material';
import { LogOut } from 'lucide-react';
import { format } from 'date-fns';

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

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const doctorToken = localStorage.getItem('doctorToken');
      if (!doctorToken) {
        throw new Error('Unauthorized. Please log in again.');
      }

      const response = await axios.put(
        `http://localhost:9000/api/appointments/${appointmentId}`,
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
      toast.error(error.message || 'Failed to update appointment status');
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={100} sx={{ mb: 3 }} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Skeleton variant="rectangular" height={120} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Skeleton variant="rectangular" height={120} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Skeleton variant="rectangular" height={120} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Skeleton variant="rectangular" height={120} />
        </Grid>
        <Grid item xs={12}>
          <Skeleton variant="rectangular" height={400} />
        </Grid>
      </Grid>
    </Container>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={doctor?.image || ''} alt={doctor?.name || 'Doctor'} sx={{ width: 56, height: 56 }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h5">Welcome, Dr. {doctor?.name || 'N/A'}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {doctor?.specialty || 'N/A'}
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogOut />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e3f2fd' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarMonth color="primary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Today's Appointments
                </Typography>
              </Box>
              <Typography variant="h4">{stats.todayAppointments}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#e8f5e9' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People color="success" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Total Patients
                </Typography>
              </Box>
              <Typography variant="h4">{stats.totalPatients}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fff3e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTime color="warning" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Upcoming
                </Typography>
              </Box>
              <Typography variant="h4">{stats.upcomingAppointments}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#fce4ec' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="secondary" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  Completed
                </Typography>
              </Box>
              <Typography variant="h4">{stats.completedAppointments}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Appointments Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Today's Appointments
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment._id}>
                      <TableCell>{appointment.userId?.name || 'Unknown Patient'}</TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.status || 'Unknown'}
                          color={
                            appointment.status === 'confirmed'
                              ? 'success'
                              : appointment.status === 'cancelled'
                              ? 'error'
                              : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {appointment.date
                          ? format(new Date(appointment.date), 'MMM dd, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {appointment.time
                          ? format(new Date(appointment.time), 'hh:mm a')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {appointment.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleUpdateStatus(appointment._id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {appointments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No appointments for today. Your schedule is clear.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DoctorDashboard;


