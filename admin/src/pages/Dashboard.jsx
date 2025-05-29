import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Container, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Button, 
  IconButton, 
  useTheme, 
  useMediaQuery,
  Avatar,
  Badge,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Snackbar,
  Card,
  CardContent
} from '@mui/material';

// Icons
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EmergencyShareIcon from '@mui/icons-material/EmergencyShare';
import CallIcon from '@mui/icons-material/Call';
import CloseIcon from '@mui/icons-material/Close';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DeleteIcon from '@mui/icons-material/Delete';

// Chart components
import { 
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, PolarArea } from 'react-chartjs-2';
import { keyframes } from '@mui/system';
import { alpha } from '@mui/material/styles';

// Import jsPDF
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// Configure Axios defaults
const API_BASE_URL = 'http://localhost:9000';
axios.defaults.baseURL = API_BASE_URL;

// Create an axios instance with interceptors for authentication
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('atoken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Animation keyframes
const pulseAnimation = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 82, 82, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0); }
`;

const blinkAnimation = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const fadeInAnimation = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Sounds manager
class SoundManager {
  constructor() {
    this.sounds = {
      alert: new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'),
      emergency: new Audio('https://assets.mixkit.co/active_storage/sfx/989/989-preview.mp3'),
      notification: new Audio('https://assets.mixkit.co/active_storage/sfx/1629/1629-preview.mp3'),
      success: new Audio('https://assets.mixkit.co/active_storage/sfx/1326/1326-preview.mp3')
    };
    
    // Preload sounds
    Object.values(this.sounds).forEach(sound => {
      sound.load();
      sound.volume = 0.5;
    });
    
    this.intervals = {};
    this.isEnabled = true;
  }
  
  play(soundName, loop = false, duration = 0) {
    if (!this.isEnabled) return;
    
    const sound = this.sounds[soundName];
    if (!sound) return;
    
    if (loop && duration > 0) {
      sound.loop = true;
      sound.play();
      
      if (this.intervals[soundName]) {
        clearTimeout(this.intervals[soundName]);
      }
      
      this.intervals[soundName] = setTimeout(() => {
        sound.pause();
        sound.currentTime = 0;
        sound.loop = false;
      }, duration);
    } else {
      // Clone the sound to allow overlapping plays
      const soundClone = sound.cloneNode();
      soundClone.play();
    }
  }
  
  stop(soundName) {
    const sound = this.sounds[soundName];
    if (!sound) return;
    
    sound.pause();
    sound.currentTime = 0;
    sound.loop = false;
    
    if (this.intervals[soundName]) {
      clearTimeout(this.intervals[soundName]);
      delete this.intervals[soundName];
    }
  }
  
  stopAll() {
    Object.keys(this.sounds).forEach(key => {
      this.stop(key);
    });
  }
  
  toggleSound(enable) {
    this.isEnabled = enable;
    if (!enable) {
      this.stopAll();
    }
  }
}

const soundManager = new SoundManager();

// Enhanced Dashboard component
const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [admin, setAdmin] = useState({ name: 'Admin', avatar: null });
  const [notifications, setNotifications] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [medicinesCount, setMedicinesCount] = useState(0);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [expiringMedicines, setExpiringMedicines] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    canceled: 0,
    totalRevenue: 0,
    monthlyRevenue: []
  });
  const [salesData, setSalesData] = useState({
    categories: [],
    topSelling: []
  });
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data functions
  const fetchAdminInfo = useCallback(async () => {
    try {
      const response = await api.get('/v1/api/admin/profile');
      if (response.data) {
        setAdmin(response.data);  
      }
    } catch (error) {
      console.error('Error fetching admin info:', error);
      setAdmin({ name: 'Admin', avatar: null }); // Fallback data
    }
  }, []);
  
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/v1/api/medicines/notifications');
      if (response.data) {
        const newNotifications = [];
        
        // Process low stock notifications
        response.data.lowStock?.forEach(medicine => {
          newNotifications.push({
            _id: `low-${medicine._id}`,
            message: `Low stock alert: ${medicine.name} (${medicine.stock} remaining)`,
            category: 'Inventory',
            read: false,
            timestamp: new Date().toISOString()
          });
        });
        
        // Process expiring notifications
        response.data.expiring?.forEach(medicine => {
          const daysUntilExpiry = Math.ceil(
            (new Date(medicine.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
          );
          newNotifications.push({
            _id: `exp-${medicine._id}`,
            message: `Expiring soon: ${medicine.name} (${daysUntilExpiry} days left)`,
            category: 'Inventory',
            read: false,
            timestamp: new Date().toISOString()
          });
        });
        
        setNotifications(newNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]); // Set empty array on error
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/api/admin/users');
      if (response.data) {
        setUsersCount(response.data.length || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsersCount(0);
    }
  }, []);

  const fetchMedicines = useCallback(async () => {
    try {
      const response = await api.get('/v1/api/medicines/all');
      if (response.data) {
        setMedicinesCount(response.data.length);
        
        // Check for low stock medicines based on reorderLevel
        const lowStock = response.data.filter(med => 
          med.stock <= (med.reorderLevel || 10) && med.stock > 0
        );
        
        const outOfStock = response.data.filter(med => med.stock === 0);
        
        // Combine low stock and out of stock medicines
        setLowStockMedicines([...outOfStock, ...lowStock]);
        
        // Check for expiring medicines
        const today = new Date();
        const alertThresholdDays = 30;
        
        const expiring = response.data.filter(medicine => {
          const expiryDate = new Date(medicine.expiryDate);
          const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry <= alertThresholdDays && daysUntilExpiry > 0;
        });
        
        if ((lowStock.length + outOfStock.length) > 0) {
          soundManager.play('alert');
        }
        
        setExpiringMedicines(expiring);
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch medicines data',
        severity: 'error'
      });
    }
  }, []);

  const fetchOrderStats = useCallback(async () => {
    try {
      const response = await api.get('/v1/api/orders/stats');
      if (response.data) {
        setOrderStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
      setOrderStats({
        total: 0,
        pending: 0,
        completed: 0,
        canceled: 0,
        totalRevenue: 0,
        monthlyRevenue: []
      });
    }
  }, []);

  const fetchSalesData = useCallback(async () => {
    try {
      const response = await api.get('/v1/api/orders/sales-data');
      setSalesData(response.data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      // Fallback mock data for visualization purposes
      setSalesData({
        categories: [
          { name: 'Antibiotics', percentage: 25, sales: 25000 },
          { name: 'Pain Relief', percentage: 20, sales: 20000 },
          { name: 'Vitamins', percentage: 15, sales: 15000 },
          { name: 'Digestive', percentage: 12, sales: 12000 },
          { name: 'First Aid', percentage: 10, sales: 10000 },
          { name: 'Other', percentage: 18, sales: 18000 }
        ],
        topSelling: [
          { name: 'Paracetamol', sales: 1245, stock: 450 },
          { name: 'Amoxicillin', sales: 980, stock: 320 },
          { name: 'Vitamin C', sales: 865, stock: 230 },
          { name: 'Ibuprofen', sales: 720, stock: 180 },
          { name: 'Omeprazole', sales: 640, stock: 210 }
        ]
      });
    }
  }, []);

  const fetchRecentActivities = useCallback(async () => {
    try {
      const response = await api.get('/v1/api/admin/activities');
      if (response.data) {
        setRecentActivities(response.data);
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      // Use fallback data
      setRecentActivities([
        { action: 'New order placed', amount: '$250', time: '5 minutes ago', user: 'John D.' },
        { action: 'User registration', amount: '', time: '12 minutes ago', user: 'Emma W.' },
        { action: 'Stock updated', amount: '', time: '3 hours ago', user: 'Admin' }
      ]);
    }
  }, []);

  const fetchEmergencies = useCallback(async () => {
    try {
      const response = await api.get('/v1/api/emergency/all');
      const newEmergencies = response.data?.emergencies || [];
      
      if (newEmergencies.length > emergencies.length) {
        const latestEmergency = newEmergencies[0];
        setActiveEmergency(latestEmergency);
        soundManager.play('emergency', true, 30000);
      }
      
      setEmergencies(newEmergencies);
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      setEmergencies([]);
    }
  }, [emergencies.length]);

  // Handle emergency acknowledgment
  const handleAcknowledgeEmergency = useCallback(() => {
    soundManager.stop('emergency');
    if (activeEmergency) {
      api.put(`/v1/api/emergency/${activeEmergency._id}/acknowledge`)
        .then(() => {
          setSnackbar({
            open: true,
            message: 'Emergency acknowledged successfully',
            severity: 'success'
          });
          soundManager.play('success');
        })
        .catch(error => {
          console.error('Error acknowledging emergency:', error);
          setSnackbar({
            open: true,
            message: 'Failed to acknowledge emergency',
            severity: 'error'
          });
        });
    }
    setActiveEmergency(null);
  }, [activeEmergency]);

  // Handle delete medicine
  const handleDeleteMedicine = useCallback(async (medicineId, medicineName) => {
    if (window.confirm(`Are you sure you want to delete ${medicineName}?`)) {
      try {
        await api.delete(`/v1/api/medicines/${medicineId}`);
        setSnackbar({
          open: true,
          message: `${medicineName} deleted successfully`,
          severity: 'success',
        });
        soundManager.play('success');
        await fetchMedicines(); // Refresh medicines list
      } catch (error) {
        console.error('Error deleting medicine:', error);
        setSnackbar({
          open: true,
          message: `Failed to delete ${medicineName}`,
          severity: 'error',
        });
      }
    }
  }, [fetchMedicines]);

  // Handle notify suppliers (send email)
  const handleNotifySuppliers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.post('/v1/api/medicines/notify-suppliers', {
        medicines: lowStockMedicines.map(med => ({
          id: med._id,
          name: med.name,
          stock: med.stock,
          reorderQuantity: med.reorderQuantity || Math.max(50, med.minRequiredStock * 2)
        }))
      });

      setSnackbar({
        open: true,
        message: 'Suppliers notified successfully',
        severity: 'success'
      });
      soundManager.play('success');

      // After notification, trigger restock
      await handleCreatePurchaseOrder();
    } catch (error) {
      console.error('Error notifying suppliers:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to notify suppliers',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [lowStockMedicines]);

  // Handle create purchase order (auto-restock)
  const handleCreatePurchaseOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.post('/v1/api/medicines/restock', {
        medicines: lowStockMedicines.map(med => ({
          id: med._id,
          name: med.name,
          reorderQuantity: med.reorderQuantity || 50
        }))
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Purchase order created and stock updated',
          severity: 'success'
        });
        soundManager.play('success');
        await fetchMedicines();
      }
    } catch (error) {
      console.error('Error creating purchase order:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to create purchase order',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [lowStockMedicines, fetchMedicines]);

  const handleReturnMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.post('/v1/api/medicines/return', {
        medicines: expiringMedicines.map(med => ({
          id: med._id,
          name: med.name,
          returnQuantity: med.stock,
          reason: 'Expiring/Expired Stock'
        }))
      });

      setSnackbar({
        open: true,
        message: 'Medicines returned successfully',
        severity: 'success'
      });
      soundManager.play('success');
      
      // Refresh medicines data
      await fetchMedicines();
    } catch (error) {
      console.error('Error returning medicines:', error);
      setSnackbar({
        open: true,
        message: 'Failed to process returns',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [expiringMedicines, fetchMedicines]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchAdminInfo(),
        fetchUsers(),
        fetchMedicines(),
        fetchOrderStats(),
        fetchEmergencies(),
        fetchSalesData(),
        fetchRecentActivities(),
        fetchNotifications()
      ]);
      
      setSnackbar({
        open: true,
        message: 'Dashboard data refreshed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data. Please try again.');
      setSnackbar({
        open: true,
        message: 'Failed to refresh data',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    fetchAdminInfo, 
    fetchUsers, 
    fetchMedicines, 
    fetchOrderStats, 
    fetchEmergencies, 
    fetchSalesData, 
    fetchRecentActivities,
    fetchNotifications
  ]);

  // Toggle sound
  const toggleSound = useCallback(() => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    soundManager.toggleSound(newSoundState);
    setSnackbar({
      open: true,
      message: newSoundState ? 'Sound alerts enabled' : 'Sound alerts disabled',
      severity: 'info'
    });
  }, [soundEnabled]);

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Report generation function
  const generateDetailedReport = async () => {
    try {
      setLoading(true);
      
      // Fetch additional data needed for report
      const [
        ordersResponse,
        salesResponse,
        inventoryResponse
      ] = await Promise.all([
        api.get('/v1/api/orders/all'),
        api.get('/v1/api/orders/sales-analytics'),
        api.get('/v1/api/medicines/inventory-status')
      ]);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const today = format(new Date(), 'MMMM dd, yyyy');

      // Header
      doc.setFontSize(20);
      doc.text('CareLink Monthly Report', pageWidth / 2, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Generated on: ${today}`, pageWidth / 2, 30, { align: 'center' });

      // Financial Summary
      doc.setFontSize(16);
      doc.text('Financial Summary', 14, 45);
      doc.setFontSize(12);
      doc.autoTable({
        startY: 50,
        head: [['Metric', 'Value']],
        body: [
          ['Total Revenue', `Rs.${salesResponse.data.totalRevenue.toLocaleString()}`],
          ['Monthly Revenue', `Rs.${salesResponse.data.monthlyRevenue.toLocaleString()}`],
          ['Average Order Value', `Rs.${salesResponse.data.averageOrderValue.toLocaleString()}`],
          ['Total Orders', orderStats.total.toString()],
          ['Completed Orders', orderStats.completed.toString()],
          ['Pending Orders', orderStats.pending.toString()]
        ],
      });

      // Monthly Sales Trend
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Monthly Sales Trend', 14, 20);
      doc.setFontSize(12);
      doc.autoTable({
        startY: 25,
        head: [['Month', 'Revenue', 'Orders', 'Avg. Order Value']],
        body: orderStats.monthlyRevenue.map(item => [
          item.month,
          `Rs.${item.revenue.toLocaleString()}`,
          item.orderCount,
          `Rs.${(item.revenue / item.orderCount).toFixed(2)}`
        ]),
      });

      // Top Selling Products
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Top Selling Products', 14, 20);
      doc.autoTable({
        startY: 25,
        head: [['Product Name', 'Units Sold', 'Revenue', 'Current Stock']],
        body: salesData.topSelling.map(item => [
          item.name,
          item.sales,
          `Rs.${(item.sales * item.price).toLocaleString()}`,
          item.stock
        ]),
      });

      // Inventory Status
      doc.addPage();
      doc.setFontSize(16);
      doc.text('Inventory Status', 14, 20);
      doc.autoTable({
        startY: 25,
        head: [['Category', 'Total Items', 'Low Stock Items', 'Out of Stock']],
        body: inventoryResponse.data.categories.map(cat => [
          cat.name,
          cat.totalItems,
          cat.lowStockItems,
          cat.outOfStockItems
        ]),
      });

      // Critical Alerts
      if (lowStockMedicines.length > 0 || expiringMedicines.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Critical Alerts', 14, 20);
        
        // Low Stock Items
        if (lowStockMedicines.length > 0) {
          doc.setFontSize(14);
          doc.text('Low Stock Items', 14, 30);
          doc.autoTable({
            startY: 35,
            head: [['Medicine Name', 'Current Stock', 'Min Required']],
            body: lowStockMedicines.map(med => [
              med.name,
              med.stock,
              med.minRequiredStock || 10
            ]),
          });
        }

        // Expiring Items
        if (expiringMedicines.length > 0) {
          const currentY = doc.lastAutoTable.finalY + 15;
          doc.setFontSize(14);
          doc.text('Expiring Items', 14, currentY);
          doc.autoTable({
            startY: currentY + 5,
            head: [['Medicine Name', 'Expiry Date', 'Days Left', 'Stock']],
            body: expiringMedicines.map(med => [
              med.name,
              format(new Date(med.expiryDate), 'MMM dd, yyyy'),
              Math.ceil((new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)),
              med.stock
            ]),
          });
        }
      }

      // Save the PDF
      const fileName = `CareLink_Monthly_Report_${format(new Date(), 'yyyy-MM')}.pdf`;
      doc.save(fileName);

      setSnackbar({
        open: true,
        message: 'Report generated successfully!',
        severity: 'success'
      });
      soundManager.play('success');

    } catch (error) {
      console.error('Error generating report:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate report',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Quick Actions section
  const quickActions = (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          startIcon={<MedicalServicesIcon />}
          sx={{ py: 1.5 }}
          onClick={() => {
            setSnackbar({
              open: true,
              message: 'Navigating to inventory management',
              severity: 'info',
            });
          }}
        >
          Manage Inventory
        </Button>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Button
          variant="contained"
          color="secondary"
          fullWidth
          startIcon={<ShoppingCartOutlinedIcon />}
          sx={{ py: 1.5 }}
          onClick={() => {
            setSnackbar({
              open: true,
              message: 'Viewing all orders',
              severity: 'info',
            });
          }}
        >
          View Orders
        </Button>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Button
          variant="contained"
          color="info"
          fullWidth
          startIcon={<PersonOutlineIcon />}
          sx={{ py: 1.5 }}
          onClick={() => {
            setSnackbar({
              open: true,
              message: 'Managing users',
              severity: 'info',
            });
          }}
        >
          Manage Users
        </Button>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Button
          variant="contained"
          color="warning"
          fullWidth
          startIcon={<AssessmentIcon />}
          sx={{ py: 1.5 }}
          onClick={generateDetailedReport}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Generate Report'
          )}
        </Button>
      </Grid>
    </Grid>
  );

  // Initial data load
  useEffect(() => {
    refreshData();
    
    // Set up intervals for periodic updates
    const fastInterval = setInterval(() => {
      fetchEmergencies();
      fetchNotifications();
    }, 10000); // Every 10 seconds
    
    const mediumInterval = setInterval(() => {
      fetchMedicines();
      fetchOrderStats();
      fetchRecentActivities();
    }, 60000); // Every minute
    
    const slowInterval = setInterval(() => {
      fetchUsers();
      fetchSalesData();
      fetchAdminInfo();
    }, 300000); // Every 5 minutes
    
    // Clean up intervals
    return () => {
      clearInterval(fastInterval);
      clearInterval(mediumInterval);
      clearInterval(slowInterval);
      soundManager.stopAll();
    };
  }, [
    refreshData, 
    fetchEmergencies, 
    fetchNotifications, 
    fetchMedicines, 
    fetchOrderStats, 
    fetchRecentActivities, 
    fetchUsers, 
    fetchSalesData, 
    fetchAdminInfo
  ]);

  // Chart data preparation
  const revenueChartData = useMemo(() => {
    return {
      labels: orderStats.monthlyRevenue?.map(item => item.month) || [],
      datasets: [
        {
          label: 'Monthly Revenue',
          data: orderStats.monthlyRevenue?.map(item => item.revenue) || [],
          fill: true,
          backgroundColor: alpha(theme.palette.primary.main, 0.2),
          borderColor: theme.palette.primary.main,
          tension: 0.4,
          yAxisID: 'y',
        },
        {
          label: 'Orders Count',
          data: orderStats.monthlyRevenue?.map(item => item.orderCount) || [],
          fill: false,
          borderColor: theme.palette.success.main,
          borderDash: [5, 5],
          tension: 0.4,
          yAxisID: 'y1',
        }
      ],
    };
  }, [orderStats.monthlyRevenue, theme.palette.primary.main, theme.palette.success.main]);

  const categoryChartData = useMemo(() => {
    return {
      labels: salesData.categories.map(cat => cat.name),
      datasets: [
        {
          data: salesData.categories.map(cat => cat.percentage),
          backgroundColor: [
            '#3366FF',
            '#00AB55',
            '#FFC107',
            '#FF4842',
            '#04297A',
            '#7A0C2E'
          ],
          borderWidth: 0
        }
      ]
    };
  }, [salesData.categories]);

  const topSellingChartData = useMemo(() => {
    return {
      labels: salesData.topSelling.map(item => item.name),
      datasets: [
        {
          label: 'Sales',
          data: salesData.topSelling.map(item => item.sales),
          backgroundColor: alpha(theme.palette.info.main, 0.8),
          borderRadius: 5
        }
      ]
    };
  }, [salesData.topSelling, theme.palette.info.main]);

  const orderStatusData = useMemo(() => {
    return {
      labels: ['Completed', 'Pending', 'Canceled'],
      datasets: [
        {
          data: [
            orderStats.completed || 0,
            orderStats.pending || 0,
            orderStats.canceled || 0
          ],
          backgroundColor: [
            theme.palette.success.main,
            theme.palette.warning.main,
            theme.palette.error.main
          ],
          borderWidth: 0
        }
      ]
    };
  }, [
    orderStats.completed, 
    orderStats.pending, 
    orderStats.canceled, 
    theme.palette.success.main, 
    theme.palette.warning.main, 
    theme.palette.error.main
  ]);

  const inventoryStatusData = useMemo(() => {
    return {
      labels: ['Normal Stock', 'Low Stock', 'Expiring Soon'],
      datasets: [
        {
          data: [
            medicinesCount - lowStockMedicines.length - expiringMedicines.length,
            lowStockMedicines.length,
            expiringMedicines.length
          ],
          backgroundColor: [
            '#4CAF50',
            '#FF9800',
            '#F44336'
          ]
        }
      ]
    };
  }, [medicinesCount, lowStockMedicines.length, expiringMedicines.length]);

  // Chart options
  const revenueChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.raw;
            if (label === 'Monthly Revenue') {
              return `${label}: Rs.${value.toLocaleString()}`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue (Rs)'
        },
        grid: {
          color: theme.palette.divider,
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Number of Orders'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      x: {
        grid: {
          color: theme.palette.divider,
        }
      }
    },
    maintainAspectRatio: false
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      }
    },
    cutout: '65%'
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.divider,
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Stats cards data
  const statsCards = [
    { 
      title: 'Total Users',
      subtitle: 'Active platform users',
      value: usersCount.toString(),
      change: '+12.5% this month',
      trending: 'up',
      icon: <PersonOutlineIcon sx={{ fontSize: 40, color: '#3366FF' }} />,
      gradient: `linear-gradient(135deg, ${alpha('#3366FF', 0.1)} 0%, ${alpha('#3366FF', 0.2)} 100%)`,
      iconBg: alpha('#3366FF', 0.2)
    },
    { 
      title: 'Active Orders',
      subtitle: 'Orders in progress',
      value: orderStats.total?.toString() || '0',
      change: `${orderStats.pending || 0} Pending Orders`,
      trending: 'up',
      icon: <ShoppingCartOutlinedIcon sx={{ fontSize: 40, color: '#00AB55' }} />,
      gradient: `linear-gradient(135deg, ${alpha('#00AB55', 0.1)} 0%, ${alpha('#00AB55', 0.2)} 100%)`,
      iconBg: alpha('#00AB55', 0.2)
    },
    { 
      title: 'Revenue',
      subtitle: 'Total earnings',
      value: `Rs.${(orderStats.totalRevenue || 0).toLocaleString()}`,
      change: `${orderStats.completed || 0} Completed Orders`,
      trending: 'up',
      icon: <MonetizationOnOutlinedIcon sx={{ fontSize: 40, color: '#FFAB00' }} />,
      gradient: `linear-gradient(135deg, ${alpha('#FFAB00', 0.1)} 0%, ${alpha('#FFAB00', 0.2)} 100%)`,
      iconBg: alpha('#FFAB00', 0.2)
    },
    { 
      title: 'Inventory',
      subtitle: 'Available products',
      value: medicinesCount.toString(),
      change: `${lowStockMedicines.length} items low stock`,
      trending: lowStockMedicines.length > 5 ? 'down' : 'up',
      icon: <InventoryIcon sx={{ fontSize: 40, color: '#36B37E' }} />,
      gradient: `linear-gradient(135deg, ${alpha('#36B37E', 0.1)} 0%, ${alpha('#36B37E', 0.2)} 100%)`,
      iconBg: alpha('#36B37E', 0.2)
    },
  ];

  // Render function
  return (
    <Box 
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#F7F9FC',
        ml: { xs: 8, lg: 28 }, // Adjusted margin based on sidebar width
        mt: { xs: 7, sm: 8 },
        transition: 'all 0.3s ease'
      }}
    >
      <Container maxWidth="xl" sx={{ py: 4, flex: 1 }}>
        {/* Header */}
        <Box sx={{ 
          mb: 4, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 700,
              color: theme.palette.text.primary,
              mb: 1
            }}>
              Welcome back, {admin.name}
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              Here's your CareLink dashboard overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Box
          >
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title={soundEnabled ? "Disable sound alerts" : "Enable sound alerts"}>
             
            </Tooltip>
            
            <Tooltip title="Refresh dashboard">
              <IconButton 
                onClick={refreshData} 
                disabled={refreshing}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                {refreshing ? (
                  <CircularProgress size={20} color="primary" />
                ) : (
                  <RefreshIcon color="primary" />
                )}
              </IconButton>
            </Tooltip>
            
            <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
             
            </Badge>
          </Box>
        </Box>
        
        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError(null)}
          >
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index} sx={{
              animation: `${fadeInAnimation} 0.5s ease forwards`,
              animationDelay: `${index * 0.1}s`,
              opacity: 0
            }}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  background: card.gradient,
                  border: '1px solid',
                  borderColor: 'rgba(0,0,0,0.05)',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.05)',
                  }
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ 
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: card.iconBg
                  }}>
                    {card.icon}
                  </Box>
                </Box>
                
                <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary, mb: 0.5 }}>
                  {card.subtitle}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                  {card.value}
                </Typography>
                
                <Box sx={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  py: 0.5,
                  px: 1,
                  borderRadius: 2,
                  backgroundColor: card.trending === 'up' ? alpha('#00AB55', 0.1) : alpha('#FF4842', 0.1)
                }}>
                  {card.trending === 'up' ? 
                    <TrendingUpIcon sx={{ color: '#00AB55', fontSize: 16, mr: 0.5 }} /> : 
                    <TrendingDownIcon sx={{ color: '#FF4842', fontSize: 16, mr: 0.5 }} />
                  }
                  <Typography variant="caption" sx={{ 
                    color: card.trending === 'up' ? '#00AB55' : '#FF4842',
                    fontWeight: 600
                  }}>
                    {card.change}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Active Emergency Alert */}
        {activeEmergency && (
          <Grid item xs={12} sx={{ mb: 4 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                border: '4px solid #dc2626',
                backgroundColor: alpha('#fee2e2', 0.9),
                animation: `${pulseAnimation} 1.2s infinite`,
                boxShadow: '0 0 30px rgba(220, 38, 38, 0.6)',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" sx={{ 
                    color: '#dc2626',
                    fontWeight: 'bold',
                    animation: `${blinkAnimation} 1s infinite`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2
                  }}>
                    🚨 EMERGENCY ALERT - IMMEDIATE ACTION REQUIRED!
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        backgroundColor: '#dc2626',
                        color: 'white',
                        p: 2,
                        borderRadius: 2,
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Emergency Details
                        </Typography>
                        <Typography variant="body1">
                          <strong>Time:</strong> {new Date(activeEmergency?.timestamp).toLocaleTimeString()}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Location:</strong> {activeEmergency?.location || 'Unknown'}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Status:</strong> {activeEmergency?.status || 'New'}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Patient:</strong> {activeEmergency?.patientName || 'Unknown'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ 
                        backgroundColor: alpha('#dc2626', 0.8),
                        color: 'white',
                        p: 2,
                        borderRadius: 2,
                        height: '100%'
                      }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Emergency Message
                        </Typography>
                        <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                          {activeEmergency?.message || 'No additional information provided.'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  gap: 2 
                }}>
                  <Button
                    variant="contained"
                    size="large"
                    color="error"
                    startIcon={<EmergencyShareIcon />}
                    sx={{ 
                      py: 1.5,
                      fontWeight: 'bold',
                      boxShadow: '0 8px 16px rgba(220, 38, 38, 0.4)'
                    }}
                    onClick={handleAcknowledgeEmergency}
                  >
                    Acknowledge Emergency
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    color="error"
                    startIcon={<CallIcon />}
                    sx={{ py: 1.5 }}
                  >
                    Contact Emergency Services
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    color="error"
                    startIcon={<DirectionsRunIcon />}
                    sx={{ py: 1.5 }}
                  >
                    Dispatch Medical Team
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Main Dashboard Content */}
        <Grid container spacing={3}>
          {/* Revenue Chart */}
          <Grid item xs={12} lg={8} sx={{ mb: 3 }}>
            <Paper sx={{ 
              p: 3,
              height: '100%',
              borderRadius: 4,
              background: theme.palette.mode === 'dark' ? 
                'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)' :
                'linear-gradient(135deg, #ffffff 0%, #F7F9FC 100%)',
              boxShadow: '0 2px 20px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    Revenue Analytics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly revenue and order trends
                  </Typography>
                </Box>
                <Box sx={{ 
                  py: 0.5,
                  px: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    +12.5% Growth
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ height: 380 }}>
                <Line data={revenueChartData} options={revenueChartOptions} />
              </Box>
            </Paper>
          </Grid>

          {/* Order Status */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ 
              p: 3,
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 2px 20px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Order Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Distribution of orders by status
                </Typography>
              </Box>
              <Box sx={{ 
                height: 250, 
                display: 'flex', 
                justifyContent: 'center',
                position: 'relative'
              }}>
                <Doughnut data={orderStatusData} options={doughnutOptions} />
                <Box sx={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {orderStats.total || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}>
                        {orderStats.completed || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ color: theme.palette.warning.main, fontWeight: 'bold' }}>
                        {orderStats.pending || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pending
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>
                        {orderStats.canceled || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Canceled
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Top Selling Products */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ 
              p: 3,
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 2px 20px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Top Selling Products
                </Typography>
                <Chip 
                  label="This Month" 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
              <Box sx={{ height: 320 }}>
                <Bar data={topSellingChartData} options={barChartOptions} />
              </Box>
            </Paper>
          </Grid>

          {/* Inventory Status */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ 
              p: 3,
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 2px 20px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Inventory Status
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overview of product inventory health
                </Typography>
              </Box>
              <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
                <PolarArea data={inventoryStatusData} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                      }
                    }
                  }
                }} />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Inventory Health Indicators
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha('#FF9800', 0.1)
                    }}>
                      <Typography variant="body2">
                        <WarningAmberIcon sx={{ fontSize: 16, color: '#FF9800', mr: 1, verticalAlign: 'text-bottom' }} />
                        Low Stock Items
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="#FF9800">
                        {lowStockMedicines.length}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 1,
                      borderRadius: 1,
                      bgcolor: alpha('#F44336', 0.1)
                    }}>
                      <Typography variant="body2">
                        <ErrorOutlineIcon sx={{ fontSize: 16, color: '#F44336', mr: 1, verticalAlign: 'text-bottom' }} />
                        Expiring Soon
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="#F44336">
                        {expiringMedicines.length}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Notifications/Alerts */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ 
              p: 3,
              height: '100%',
              borderRadius: 4,
              boxShadow: '0 2px 20px rgba(0,0,0,0.05)'
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Notifications
                </Typography>
                <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                  <NotificationsActiveIcon color="action" />
                </Badge>
              </Box>
              <List sx={{ 
                maxHeight: 320, 
                overflow: 'auto',
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: alpha(theme.palette.primary.main, 0.05),
                },
                '&::-webkit-scrollbar-thumb': {
                  background: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: '2px',
                }
              }}>
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <React.Fragment key={index}>
                      <ListItem 
                        sx={{ 
                          px: 1, 
                          py: 1.5, 
                          borderRadius: 2,
                          bgcolor: notification.read ? 'transparent' : alpha(theme.palette.primary.main, 0.05),
                          '&:hover': {
                            bgcolor: alpha(theme.palette.primary.main, 0.1)
                          }
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography 
                              variant="body2" 
                              fontWeight={notification.read ? "normal" : "medium"}
                            >
                              {notification.message}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {notification.category || 'System'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < notifications.length - 1 && (
                        <Divider component="li" variant="inset" sx={{ ml: 1 }} />
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: 150,
                    opacity: 0.6
                  }}>
                    <NotificationsIcon sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      No notifications yet
                    </Typography>
                  </Box>
                )}
              </List>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small"
                >
                  Mark All as Read
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small"
                >
                  View All
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Expiring Medicines Alert */}
          {expiringMedicines.length > 0 && (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: `2px solid ${theme.palette.error.main}`,
                  backgroundColor: alpha(theme.palette.error.light, 0.1),
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    border: `2px solid ${theme.palette.error.main}`,
                    borderRadius: 4,
                    animation: `${pulseAnimation} 2s infinite`,
                    pointerEvents: 'none',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <WarningAmberIcon sx={{ fontSize: 32, color: theme.palette.error.main }} />
                  <Typography
                    variant="h5"
                    sx={{
                      color: theme.palette.error.main,
                      fontWeight: 'bold',
                    }}
                  >
                    Medicines Expiring Soon
                  </Typography>
                  <Chip
                    label={`${expiringMedicines.length} Items Need Attention`}
                    color="error"
                    sx={{
                      animation: `${blinkAnimation} 2s infinite`,
                      fontWeight: 'bold',
                    }}
                  />
                </Box>
                
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table stickyHeader aria-label="expiring medicines table" size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Medicine Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Batch No.</TableCell>
                        <TableCell>Expiry Date</TableCell>
                        <TableCell>Days Left</TableCell>
                        <TableCell>Stock</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expiringMedicines.map((medicine) => {
                        const daysUntilExpiry = Math.ceil(
                          (new Date(medicine.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
                        );
                        const isVeryCritical = daysUntilExpiry <= 5;
                        
                        return (
                          <TableRow
                            key={medicine._id}
                            sx={{
                              bgcolor: isVeryCritical ? alpha(theme.palette.error.main, 0.1) : 'inherit',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.error.main, 0.05),
                              },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {medicine.name}
                              </Typography>
                            </TableCell>
                            <TableCell>{medicine.category || '-'}</TableCell>
                            <TableCell>{medicine.batchNo || '-'}</TableCell>
                            <TableCell>
                              {new Date(medicine.expiryDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${daysUntilExpiry} days`}
                                size="small"
                                color={isVeryCritical ? 'error' : 'warning'}
                                sx={{ fontWeight: 'bold' }}
                              />
                            </TableCell>
                            <TableCell>{medicine.stock}</TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  startIcon={<MedicalServicesIcon />}
                                  onClick={() => {
                                    // Navigate to AddMedicine with edit mode
                                    window.location.href = `/add-medicine?editId=${medicine._id}`;
                                  }}
                                >
                                  Manage
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  startIcon={<DeleteIcon />}
                                  onClick={() => handleDeleteMedicine(medicine._id, medicine.name)}
                                >
                                  Delete
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CalendarTodayIcon />}
                    onClick={() => {
                      setSnackbar({
                        open: true,
                        message: 'Stock check scheduled',
                        severity: 'info',
                      });
                    }}
                  >
                    Schedule Stock Check
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<LocalShippingIcon />}
                    onClick={() => {
                      setSnackbar({
                        open: true,
                        message: 'Return process initiated',
                        severity: 'info',
                      });
                    }}
                  >
                    Initiate Return Process
                  </Button>
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Low Stock Medicines */}
          {lowStockMedicines.length > 0 && (
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: `2px solid ${theme.palette.warning.main}`,
                  backgroundColor: alpha(theme.palette.warning.light, 0.1),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <WarningAmberIcon sx={{ fontSize: 32, color: theme.palette.warning.main }} />
                  <Typography
                    variant="h5"
                    sx={{
                      color: theme.palette.warning.main,
                      fontWeight: 'bold',
                    }}
                  >
                    Low Stock Alerts
                  </Typography>
                  <Chip
                    label={`${lowStockMedicines.length} Items Low in Stock`}
                    color="warning"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>
                
                <TableContainer sx={{ maxHeight: 300 }}>
                  <Table stickyHeader aria-label="low stock medicines table" size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Medicine Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Current Stock</TableCell>
                        <TableCell>Min. Required</TableCell>
                        <TableCell>Last Restocked</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lowStockMedicines.map((medicine) => {
                        const isVeryCritical = medicine.stock <= 3;
                        
                        return (
                          <TableRow
                            key={medicine._id}
                            sx={{
                              bgcolor: isVeryCritical ? alpha(theme.palette.warning.main, 0.1) : 'inherit',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.warning.main, 0.05),
                              },
                            }}
                          >
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {medicine.name}
                              </Typography>
                            </TableCell>
                            <TableCell>{medicine.category || '-'}</TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color={isVeryCritical ? 'error.main' : 'text.primary'}
                              >
                                {medicine.stock}
                              </Typography>
                            </TableCell>
                            <TableCell>{medicine.minRequiredStock || 10}</TableCell>
                            <TableCell>
                              {medicine.lastRestocked
                                ? new Date(medicine.lastRestocked).toLocaleDateString()
                                : 'N/A'}
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                variant="contained"
                                color="warning"
                                size="small"
                                startIcon={<InventoryIcon />}
                                onClick={() => {
                                  setSnackbar({
                                    open: true,
                                    message: `Restock initiated for ${medicine.name}`,
                                    severity: 'info',
                                  });
                                }}
                              >
                                Restock
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<NotificationsActiveIcon />}
                    onClick={handleNotifySuppliers}
                  >
                    Notify Suppliers
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<LocalShippingIcon />}
                    onClick={handleCreatePurchaseOrder}
                  >
                    Create Purchase Order
                  </Button>
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Recent Emergencies */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Recent Emergencies
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<EmergencyShareIcon />}
                  onClick={() => {
                    setSnackbar({
                      open: true,
                      message: 'Viewing all emergencies',
                      severity: 'info',
                    });
                  }}
                >
                  View All
                </Button>
              </Box>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table stickyHeader aria-label="recent emergencies table" size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {emergencies.length > 0 ? (
                      emergencies.slice(0, 5).map((emergency) => (
                        <TableRow
                          key={emergency._id}
                          sx={{
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                            },
                          }}
                        >
                          <TableCell>
                            {new Date(emergency.timestamp).toLocaleTimeString()}
                          </TableCell>
                          <TableCell>{emergency.location || 'Unknown'}</TableCell>
                          <TableCell>
                            <Chip
                              label={emergency.status}
                              color={
                                emergency.status === 'CRITICAL'
                                  ? 'error'
                                  : emergency.status === 'RESOLVED'
                                  ? 'success'
                                  : 'warning'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{emergency.patientName || 'Unknown'}</TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {emergency.message || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              variant="contained"
                              color="primary"
                              size="small"
                              startIcon={<EmergencyShareIcon />}
                              onClick={() => {
                                setActiveEmergency(emergency);
                                soundManager.play('emergency', true, 30000);
                              }}
                              disabled={emergency.status === 'RESOLVED'}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Box
                            sx={{
                              py: 3,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              opacity: 0.6,
                            }}
                          >
                            <EmergencyShareIcon
                              sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              No recent emergencies
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 4,
                boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 3 }}>
                Quick Actions
              </Typography>
              {quickActions}
            </Paper>
          </Grid>
        </Grid>
         
        {/* Snackbar for Notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
            action={
              <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={handleSnackbarClose}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Dashboard;