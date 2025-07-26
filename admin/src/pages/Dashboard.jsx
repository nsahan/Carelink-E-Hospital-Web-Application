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
  CardContent,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from '@mui/material';

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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';
import UpdateIcon from '@mui/icons-material/Update';
import ErrorIcon from '@mui/icons-material/Error';

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
import EmailIcon from '@mui/icons-material/Email';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FilterListIcon from '@mui/icons-material/FilterList';

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
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Report generation states
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [reportDateRange, setReportDateRange] = useState({ start: '', end: '' });
  const [reportFilters, setReportFilters] = useState({});
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState(null);

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
      setEmergencies(newEmergencies);
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      setEmergencies([]);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      setSuppliersLoading(true);
      const response = await api.get('/v1/api/suppliers');
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setSuppliersLoading(false);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      setAppointmentsLoading(true);
      const response = await api.get('/api/appointments/all');
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const response = await api.get('/v1/api/orders/all');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      await Promise.all([
        fetchAdminInfo(),
        fetchMedicines(),
        fetchOrderStats(),
        fetchEmergencies(),
        fetchSalesData(),
        fetchRecentActivities(),
        fetchNotifications(),
        fetchSuppliers(),
        fetchAppointments(),
        fetchOrders()
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
    fetchMedicines,
    fetchOrderStats,
    fetchEmergencies,
    fetchSalesData,
    fetchRecentActivities,
    fetchNotifications,
    fetchSuppliers,
    fetchAppointments,
    fetchOrders
  ]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle emergency completion
  const handleCompleteEmergency = useCallback(async (emergencyId) => {
    try {
      const response = await api.put(`/v1/api/emergency/${emergencyId}/complete`);

      if (response.data.success) {
        // Update the emergency in the list
        setEmergencies(prevEmergencies =>
          prevEmergencies.map(emergency =>
            emergency._id === emergencyId
              ? {
                ...emergency,
                completed: true,
                status: 'RESOLVED',
                completedAt: new Date()
              }
              : emergency
          )
        );

        setSnackbar({
          open: true,
          message: 'Emergency completed successfully',
          severity: 'success'
        });

        // If this was the active emergency, clear it
        if (activeEmergency && activeEmergency._id === emergencyId) {
          setActiveEmergency(null);
        }

        // Refresh emergencies
        fetchEmergencies();

      } else {
        throw new Error(response.data.message || 'Failed to complete emergency');
      }

    } catch (error) {
      console.error('Error completing emergency:', error);

      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to complete emergency',
        severity: 'error'
      });
    }
  }, [setEmergencies, setSnackbar, activeEmergency, setActiveEmergency, fetchEmergencies]);

  // Handle emergency acknowledgment
  const handleAcknowledgeEmergency = useCallback(async () => {
    if (!activeEmergency) return;

    try {
      const response = await api.put(`/v1/api/emergency/${activeEmergency._id}/acknowledge`);

      if (response.data.success) {
        // Update the emergency in the list
        setEmergencies(prevEmergencies =>
          prevEmergencies.map(emergency =>
            emergency._id === activeEmergency._id
              ? { ...emergency, acknowledged: true, status: 'ACTIVE', acknowledgedAt: new Date() }
              : emergency
          )
        );

        setSnackbar({
          open: true,
          message: 'Emergency acknowledged successfully',
          severity: 'success'
        });

        // Clear active emergency
        setActiveEmergency(null);

        // Refresh emergencies
        fetchEmergencies();

      } else {
        throw new Error(response.data.message || 'Failed to acknowledge emergency');
      }

    } catch (error) {
      console.error('Error acknowledging emergency:', error);

      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to acknowledge emergency',
        severity: 'error'
      });
    }
  }, [activeEmergency, setEmergencies, setSnackbar, setActiveEmergency, fetchEmergencies]);

  // Report generation functions
  const generateInventoryReport = useCallback(async (filters) => {
    try {
      setGeneratingReport(true);

      const reportData = {
        generatedAt: new Date().toISOString(),
        reportType: 'Inventory Management Report',
        reportId: `INV-${Date.now()}`,
        summary: {
          totalMedicines: medicinesCount,
          lowStockItems: lowStockMedicines.length,
          expiringItems: expiringMedicines.length,
          activeSuppliers: suppliers.filter(s => s.isActive).length,
          totalEmergencies: emergencies.length,
          criticalAlerts: lowStockMedicines.filter(med => med.stock === 0).length,
          warningAlerts: expiringMedicines.filter(med => {
            const daysUntilExpiry = Math.ceil(
              (new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
            );
            return daysUntilExpiry <= 7;
          }).length
        },
        sections: {
          criticalAlerts: {
            title: '🚨 Critical Stock Alerts',
            items: lowStockMedicines.filter(med => med.stock === 0).map(med => ({
              name: med.name,
              currentStock: med.stock,
              minRequired: med.minRequiredStock || 10,
              status: 'OUT OF STOCK',
              priority: 'CRITICAL'
            }))
          },
          lowStockItems: {
            title: '⚠️ Low Stock Items',
            items: lowStockMedicines.filter(med => med.stock > 0).map(med => ({
              name: med.name,
              currentStock: med.stock,
              minRequired: med.minRequiredStock || 10,
              status: 'LOW STOCK',
              priority: 'WARNING'
            }))
          },
          expiringMedicines: {
            title: '⏰ Expiring Soon',
            items: expiringMedicines.map(med => {
              const daysUntilExpiry = Math.ceil(
                (new Date(med.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
              );
              return {
                name: med.name,
                expiryDate: med.expiryDate,
                daysLeft: daysUntilExpiry,
                stock: med.stock,
                priority: daysUntilExpiry <= 7 ? 'CRITICAL' : 'WARNING'
              };
            })
          },
          recentEmergencies: {
            title: '🚑 Recent Emergencies',
            items: emergencies.slice(0, 10).map(emergency => ({
              patientName: emergency.patientName,
              location: emergency.location,
              status: emergency.status,
              timestamp: emergency.timestamp,
              message: emergency.message,
              priority: emergency.status === 'CRITICAL' ? 'CRITICAL' : 'NORMAL'
            }))
          },
          suppliers: {
            title: '🏥 Active Suppliers',
            items: suppliers.filter(s => s.isActive).map(supplier => ({
              name: supplier.name,
              contact: supplier.contact,
              email: supplier.email,
              status: 'ACTIVE',
              lastOrder: supplier.lastOrder
            }))
          }
        },
        recommendations: [
          'Immediately restock items with zero stock',
          'Contact suppliers for low stock items',
          'Dispose of medicines expiring within 7 days',
          'Review emergency response procedures',
          'Update supplier contact information'
        ]
      };

      setReportData(reportData);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSnackbar({
        open: true,
        message: 'Inventory report generated successfully',
        severity: 'success'
      });

      return reportData;
    } catch (error) {
      console.error('Error generating inventory report:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate inventory report',
        severity: 'error'
      });
      throw error;
    } finally {
      setGeneratingReport(false);
    }
  }, [medicinesCount, lowStockMedicines, expiringMedicines, suppliers, emergencies, setSnackbar]);

  const generateAppointmentsReport = useCallback(async (filters) => {
    try {
      setGeneratingReport(true);

      const appointmentStats = {
        total: appointments.length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
        pending: appointments.filter(a => a.status === 'pending').length,
        todayAppointments: appointments.filter(a => {
          const today = new Date().toDateString();
          return new Date(a.date).toDateString() === today;
        }).length,
        thisWeekAppointments: appointments.filter(a => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(a.date) >= weekAgo;
        }).length
      };

      const reportData = {
        generatedAt: new Date().toISOString(),
        reportType: 'Appointments Report',
        reportId: `APT-${Date.now()}`,
        summary: appointmentStats,
        sections: {
          todayAppointments: {
            title: '📅 Today\'s Appointments',
            items: appointments.filter(a => {
              const today = new Date().toDateString();
              return new Date(a.date).toDateString() === today;
            }).map(appointment => ({
              patientName: appointment.userId?.name || 'Unknown',
              doctorName: appointment.doctorId?.name || 'Unknown',
              time: appointment.time,
              status: appointment.status,
              type: appointment.appointmentType || 'Regular'
            }))
          },
          upcomingAppointments: {
            title: '⏭️ Upcoming Appointments',
            items: appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').slice(0, 10).map(appointment => ({
              patientName: appointment.userId?.name || 'Unknown',
              doctorName: appointment.doctorId?.name || 'Unknown',
              date: appointment.date,
              time: appointment.time,
              status: appointment.status,
              type: appointment.appointmentType || 'Regular'
            }))
          },
          completedAppointments: {
            title: '✅ Completed Appointments',
            items: appointments.filter(a => a.status === 'completed').slice(0, 10).map(appointment => ({
              patientName: appointment.userId?.name || 'Unknown',
              doctorName: appointment.doctorId?.name || 'Unknown',
              date: appointment.date,
              time: appointment.time,
              type: appointment.appointmentType || 'Regular'
            }))
          },
          cancelledAppointments: {
            title: '❌ Cancelled Appointments',
            items: appointments.filter(a => a.status === 'cancelled').slice(0, 10).map(appointment => ({
              patientName: appointment.userId?.name || 'Unknown',
              doctorName: appointment.doctorId?.name || 'Unknown',
              date: appointment.date,
              time: appointment.time,
              type: appointment.appointmentType || 'Regular'
            }))
          }
        },
        recommendations: [
          'Follow up with pending appointments',
          'Review cancellation patterns',
          'Optimize appointment scheduling',
          'Improve patient communication',
          'Monitor doctor availability'
        ]
      };

      setReportData(reportData);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSnackbar({
        open: true,
        message: 'Appointments report generated successfully',
        severity: 'success'
      });

      return reportData;
    } catch (error) {
      console.error('Error generating appointments report:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate appointments report',
        severity: 'error'
      });
      throw error;
    } finally {
      setGeneratingReport(false);
    }
  }, [appointments, setSnackbar]);

  const generateOrdersReport = useCallback(async (filters) => {
    try {
      setGeneratingReport(true);

      const orderStatistics = {
        total: orders.length,
        completed: orders.filter(o => o.status === 'completed').length,
        pending: orders.filter(o => o.status === 'pending').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalRevenue: orders
          .filter(o => o.status === 'completed')
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        averageOrderValue: orders.filter(o => o.status === 'completed').length > 0
          ? orders.filter(o => o.status === 'completed').reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.filter(o => o.status === 'completed').length
          : 0,
        todayOrders: orders.filter(o => {
          const today = new Date().toDateString();
          return new Date(o.createdAt).toDateString() === today;
        }).length,
        thisWeekRevenue: orders
          .filter(o => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(o.createdAt) >= weekAgo && o.status === 'completed';
          })
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      };

      const reportData = {
        generatedAt: new Date().toISOString(),
        reportType: 'Orders Report',
        reportId: `ORD-${Date.now()}`,
        summary: orderStatistics,
        sections: {
          recentOrders: {
            title: '🛒 Recent Orders',
            items: orders.slice(0, 10).map(order => ({
              orderId: order._id.slice(-8),
              customerName: order.userId?.name || 'Unknown',
              totalAmount: order.totalAmount,
              status: order.status,
              orderDate: order.createdAt,
              itemsCount: order.items?.length || 0
            }))
          },
          topRevenueOrders: {
            title: '💰 High-Value Orders',
            items: orders
              .filter(o => o.status === 'completed')
              .sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0))
              .slice(0, 10)
              .map(order => ({
                orderId: order._id.slice(-8),
                customerName: order.userId?.name || 'Unknown',
                totalAmount: order.totalAmount,
                orderDate: order.createdAt,
                itemsCount: order.items?.length || 0
              }))
          },
          pendingOrders: {
            title: '⏳ Pending Orders',
            items: orders.filter(o => o.status === 'pending').slice(0, 10).map(order => ({
              orderId: order._id.slice(-8),
              customerName: order.userId?.name || 'Unknown',
              totalAmount: order.totalAmount,
              orderDate: order.createdAt,
              itemsCount: order.items?.length || 0
            }))
          },
          topProducts: {
            title: '🏆 Top Selling Products',
            items: (salesData.topSelling || []).map(product => ({
              name: product.name,
              sales: product.sales,
              stock: product.stock,
              revenue: product.sales * (product.price || 100) // Assuming average price
            }))
          }
        },
        recommendations: [
          'Process pending orders promptly',
          'Focus on high-value customers',
          'Restock top-selling products',
          'Improve order fulfillment time',
          'Analyze cancellation reasons'
        ]
      };

      setReportData(reportData);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSnackbar({
        open: true,
        message: 'Orders report generated successfully',
        severity: 'success'
      });

      return reportData;
    } catch (error) {
      console.error('Error generating orders report:', error);
      setSnackbar({
        open: true,
        message: 'Failed to generate orders report',
        severity: 'error'
      });
      throw error;
    } finally {
      setGeneratingReport(false);
    }
  }, [orders, salesData, setSnackbar]);

  const handleGenerateReport = useCallback(async () => {
    try {
      let reportData;

      switch (reportType) {
        case 'inventory':
          reportData = await generateInventoryReport(reportFilters);
          break;
        case 'appointments':
          reportData = await generateAppointmentsReport(reportFilters);
          break;
        case 'orders':
          reportData = await generateOrdersReport(reportFilters);
          break;
        default:
          throw new Error('Invalid report type');
      }

      // Here you would typically send the report data to a PDF generation service
      // For now, we'll just show the data in a dialog
      setReportData(reportData);
      setReportDialogOpen(false);

    } catch (error) {
      console.error('Error generating report:', error);
    }
  }, [reportType, reportFilters, generateInventoryReport, generateAppointmentsReport, generateOrdersReport]);

  const handleDownloadReport = useCallback(() => {
    if (!reportData) return;

    // Create a beautifully formatted HTML report
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportData.reportType}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              border-radius: 15px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 2.5em;
              font-weight: 300;
            }
            .header p {
              margin: 10px 0 0 0;
              opacity: 0.9;
              font-size: 1.1em;
            }
            .report-id {
              background: rgba(255,255,255,0.2);
              padding: 8px 16px;
              border-radius: 20px;
              display: inline-block;
              margin-top: 10px;
              font-size: 0.9em;
            }
            .content {
              padding: 30px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .summary-card h3 {
              margin: 0 0 10px 0;
              font-size: 2em;
              font-weight: 300;
            }
            .summary-card p {
              margin: 0;
              opacity: 0.9;
              font-size: 0.9em;
            }
            .section {
              margin-bottom: 30px;
              background: #f8f9fa;
              border-radius: 10px;
              overflow: hidden;
            }
            .section-header {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
              color: white;
              padding: 15px 20px;
              font-size: 1.2em;
              font-weight: 600;
            }
            .section-content {
              padding: 20px;
            }
            .item-card {
              background: white;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 10px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
              border-left: 4px solid #4facfe;
            }
            .item-card h4 {
              margin: 0 0 8px 0;
              color: #333;
            }
            .item-details {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 10px;
              font-size: 0.9em;
              color: #666;
            }
            .priority-critical {
              border-left-color: #dc3545;
            }
            .priority-warning {
              border-left-color: #ffc107;
            }
            .priority-normal {
              border-left-color: #28a745;
            }
            .recommendations {
              background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
              padding: 20px;
              border-radius: 10px;
              margin-top: 30px;
            }
            .recommendations h3 {
              margin: 0 0 15px 0;
              color: #333;
            }
            .recommendation-item {
              background: white;
              padding: 10px 15px;
              margin-bottom: 8px;
              border-radius: 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666;
              border-top: 1px solid #dee2e6;
            }
            @media print {
              body { background: white; }
              .container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${reportData.reportType}</h1>
              <p>Generated on ${new Date(reportData.generatedAt).toLocaleString()}</p>
              <div class="report-id">Report ID: ${reportData.reportId}</div>
            </div>
            
            <div class="content">
              <div class="summary-grid">
                ${Object.entries(reportData.summary).map(([key, value]) => `
                  <div class="summary-card">
                    <h3>${typeof value === 'number' ? value.toLocaleString() : value}</h3>
                    <p>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                  </div>
                `).join('')}
              </div>
              
              ${Object.entries(reportData.sections).map(([sectionKey, section]) => `
                <div class="section">
                  <div class="section-header">${section.title}</div>
                  <div class="section-content">
                    ${section.items.map(item => `
                      <div class="item-card ${item.priority ? `priority-${item.priority.toLowerCase()}` : ''}">
                        <h4>${item.name || item.patientName || item.customerName || item.orderId}</h4>
                        <div class="item-details">
                          ${Object.entries(item).filter(([k, v]) => k !== 'name' && k !== 'patientName' && k !== 'customerName' && k !== 'orderId').map(([key, value]) => `
                            <div><strong>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> ${value}</div>
                          `).join('')}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
              
              ${reportData.recommendations ? `
                <div class="recommendations">
                  <h3>💡 Recommendations</h3>
                  ${reportData.recommendations.map(rec => `
                    <div class="recommendation-item">• ${rec}</div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <p>Generated by CareLink Admin Dashboard</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportData.reportType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: 'Beautiful HTML report downloaded successfully',
      severity: 'success'
    });
  }, [reportData, setSnackbar]);

  const handlePrintReport = useCallback(() => {
    if (!reportData) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportData.reportType}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 2.5em;
              font-weight: 300;
            }
            .header p {
              margin: 10px 0 0 0;
              opacity: 0.9;
              font-size: 1.1em;
            }
            .report-id {
              background: rgba(255,255,255,0.2);
              padding: 8px 16px;
              border-radius: 20px;
              display: inline-block;
              margin-top: 10px;
              font-size: 0.9em;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .summary-card h3 {
              margin: 0 0 10px 0;
              font-size: 2em;
              font-weight: 300;
            }
            .summary-card p {
              margin: 0;
              opacity: 0.9;
              font-size: 0.9em;
            }
            .section {
              margin-bottom: 30px;
              background: #f8f9fa;
              border-radius: 10px;
              overflow: hidden;
              page-break-inside: avoid;
            }
            .section-header {
              background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
              color: white;
              padding: 15px 20px;
              font-size: 1.2em;
              font-weight: 600;
            }
            .section-content {
              padding: 20px;
            }
            .item-card {
              background: white;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 10px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
              border-left: 4px solid #4facfe;
            }
            .item-card h4 {
              margin: 0 0 8px 0;
              color: #333;
            }
            .item-details {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
              gap: 10px;
              font-size: 0.9em;
              color: #666;
            }
            .priority-critical {
              border-left-color: #dc3545;
            }
            .priority-warning {
              border-left-color: #ffc107;
            }
            .priority-normal {
              border-left-color: #28a745;
            }
            .recommendations {
              background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
              padding: 20px;
              border-radius: 10px;
              margin-top: 30px;
            }
            .recommendations h3 {
              margin: 0 0 15px 0;
              color: #333;
            }
            .recommendation-item {
              background: white;
              padding: 10px 15px;
              margin-bottom: 8px;
              border-radius: 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666;
              border-top: 1px solid #dee2e6;
              margin-top: 30px;
            }
            @media print {
              body { background: white; }
              .container { box-shadow: none; }
              .section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${reportData.reportType}</h1>
              <p>Generated on ${new Date(reportData.generatedAt).toLocaleString()}</p>
              <div class="report-id">Report ID: ${reportData.reportId}</div>
            </div>
            
            <div class="summary-grid">
              ${Object.entries(reportData.summary).map(([key, value]) => `
                <div class="summary-card">
                  <h3>${typeof value === 'number' ? value.toLocaleString() : value}</h3>
                  <p>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
                </div>
              `).join('')}
            </div>
            
            ${Object.entries(reportData.sections).map(([sectionKey, section]) => `
              <div class="section">
                <div class="section-header">${section.title}</div>
                <div class="section-content">
                  ${section.items.map(item => `
                    <div class="item-card ${item.priority ? `priority-${item.priority.toLowerCase()}` : ''}">
                      <h4>${item.name || item.patientName || item.customerName || item.orderId}</h4>
                      <div class="item-details">
                        ${Object.entries(item).filter(([k, v]) => k !== 'name' && k !== 'patientName' && k !== 'customerName' && k !== 'orderId').map(([key, value]) => `
                          <div><strong>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> ${value}</div>
                        `).join('')}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
            
            ${reportData.recommendations ? `
              <div class="recommendations">
                <h3>💡 Recommendations</h3>
                ${reportData.recommendations.map(rec => `
                  <div class="recommendation-item">• ${rec}</div>
                `).join('')}
              </div>
            ` : ''}
            
            <div class="footer">
              <p>Generated by CareLink Admin Dashboard</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();

    setSnackbar({
      open: true,
      message: 'Beautiful report sent to printer',
      severity: 'success'
    });
  }, [reportData, setSnackbar]);

  const handleExportPDF = useCallback(() => {
    if (!reportData) return;

    // Create a PDF-friendly version of the report
    const pdfContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportData.reportType}</title>
          <style>
            @page { margin: 1in; }
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 0; 
              padding: 0; 
              background: white;
              font-size: 12px;
            }
            .header {
              background: #667eea;
              color: white;
              padding: 20px;
              text-align: center;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .header p {
              margin: 5px 0 0 0;
              font-size: 14px;
            }
            .report-id {
              background: rgba(255,255,255,0.2);
              padding: 5px 10px;
              border-radius: 10px;
              display: inline-block;
              margin-top: 10px;
              font-size: 12px;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .summary-card {
              background: #f093fb;
              color: white;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
            }
            .summary-card h3 {
              margin: 0 0 5px 0;
              font-size: 18px;
              font-weight: bold;
            }
            .summary-card p {
              margin: 0;
              font-size: 12px;
            }
            .section {
              margin-bottom: 20px;
              background: #f8f9fa;
              border-radius: 8px;
              overflow: hidden;
              page-break-inside: avoid;
            }
            .section-header {
              background: #4facfe;
              color: white;
              padding: 10px 15px;
              font-size: 14px;
              font-weight: bold;
            }
            .section-content {
              padding: 15px;
            }
            .item-card {
              background: white;
              border-radius: 5px;
              padding: 10px;
              margin-bottom: 8px;
              border-left: 3px solid #4facfe;
            }
            .item-card h4 {
              margin: 0 0 5px 0;
              color: #333;
              font-size: 14px;
              font-weight: bold;
            }
            .item-details {
              font-size: 11px;
              color: #666;
            }
            .priority-critical {
              border-left-color: #dc3545;
            }
            .priority-warning {
              border-left-color: #ffc107;
            }
            .priority-normal {
              border-left-color: #28a745;
            }
            .recommendations {
              background: #a8edea;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .recommendations h3 {
              margin: 0 0 10px 0;
              color: #333;
              font-size: 14px;
              font-weight: bold;
            }
            .recommendation-item {
              background: white;
              padding: 8px 12px;
              margin-bottom: 5px;
              border-radius: 4px;
              font-size: 11px;
            }
            .footer {
              background: #f8f9fa;
              padding: 15px;
              text-align: center;
              color: #666;
              border-top: 1px solid #dee2e6;
              margin-top: 20px;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportData.reportType}</h1>
            <p>Generated on ${new Date(reportData.generatedAt).toLocaleString()}</p>
            <div class="report-id">Report ID: ${reportData.reportId}</div>
          </div>
          
          <div class="summary-grid">
            ${Object.entries(reportData.summary).map(([key, value]) => `
              <div class="summary-card">
                <h3>${typeof value === 'number' ? value.toLocaleString() : value}</h3>
                <p>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</p>
              </div>
            `).join('')}
          </div>
          
          ${Object.entries(reportData.sections).map(([sectionKey, section]) => `
            <div class="section">
              <div class="section-header">${section.title}</div>
              <div class="section-content">
                ${section.items.map(item => `
                  <div class="item-card ${item.priority ? `priority-${item.priority.toLowerCase()}` : ''}">
                    <h4>${item.name || item.patientName || item.customerName || item.orderId}</h4>
                    <div class="item-details">
                      ${Object.entries(item).filter(([k, v]) => k !== 'name' && k !== 'patientName' && k !== 'customerName' && k !== 'orderId').map(([key, value]) => `
                        <div><strong>${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> ${value}</div>
                      `).join('')}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
          
          ${reportData.recommendations ? `
            <div class="recommendations">
              <h3>💡 Recommendations</h3>
              ${reportData.recommendations.map(rec => `
                <div class="recommendation-item">• ${rec}</div>
              `).join('')}
            </div>
          ` : ''}
          
          <div class="footer">
            <p>Generated by CareLink Admin Dashboard</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportData.reportType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: 'PDF-ready report downloaded (open in browser and print as PDF)',
      severity: 'success'
    });
  }, [reportData, setSnackbar]);

  // Tab content components
  const InventoryTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Inventory Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PictureAsPdfIcon />}
          onClick={() => {
            setReportType('inventory');
            setReportDialogOpen(true);
          }}
        >
          Generate Report
        </Button>
      </Box>

      {/* Emergency Alert */}
      {activeEmergency && (
        <Paper
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 4,
            border: '4px solid #dc2626',
            backgroundColor: 'rgba(254, 226, 226, 0.9)',
            animation: 'pulse 1.2s infinite',
            boxShadow: '0 0 30px rgba(220, 38, 38, 0.6)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <EmergencyShareIcon sx={{ fontSize: 32, color: '#dc2626' }} />
            <Typography variant="h5" sx={{ color: '#dc2626', fontWeight: 'bold' }}>
              🚨 EMERGENCY ALERT - IMMEDIATE ACTION REQUIRED!
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ backgroundColor: '#dc2626', color: 'white', p: 2, borderRadius: 2 }}>
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
              <Box sx={{ backgroundColor: 'rgba(220, 38, 38, 0.8)', color: 'white', p: 2, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Emergency Message
                </Typography>
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  {activeEmergency?.message || 'No additional information provided.'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              color="error"
              startIcon={<EmergencyShareIcon />}
              sx={{ fontWeight: 'bold' }}
              onClick={handleAcknowledgeEmergency}
            >
              Acknowledge Emergency
            </Button>
            <Button
              variant="outlined"
              size="large"
              color="error"
              startIcon={<CallIcon />}
              onClick={() => {
                setSnackbar({
                  open: true,
                  message: 'Contacting emergency services...',
                  severity: 'info'
                });
              }}
            >
              Contact Emergency Services
            </Button>
            <Button
              variant="outlined"
              size="large"
              color="error"
              startIcon={<DirectionsRunIcon />}
              onClick={() => {
                setSnackbar({
                  open: true,
                  message: 'Dispatching medical team...',
                  severity: 'info'
                });
              }}
            >
              Dispatch Medical Team
            </Button>
          </Box>
        </Paper>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <InventoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {medicinesCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Medicines
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <WarningAmberIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                  {lowStockMedicines.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Low Stock Items
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ErrorOutlineIcon sx={{ fontSize: 40, color: 'error.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  {expiringMedicines.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Expiring Soon
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocalShippingIcon sx={{ fontSize: 40, color: 'success.main' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  {suppliers.filter(s => s.isActive).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Suppliers
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Low Stock Medicines */}
      {lowStockMedicines.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 4, border: '2px solid #ff9800', backgroundColor: 'rgba(255, 152, 0, 0.1)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'warning.main' }}>
              Low Stock Alerts ({lowStockMedicines.length})
            </Typography>
            <Button
              variant="contained"
              color="warning"
              startIcon={<EmailIcon />}
              onClick={() => {
                setSnackbar({
                  open: true,
                  message: 'Notifying suppliers about low stock items',
                  severity: 'success'
                });
              }}
            >
              Notify Suppliers
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Medicine Name</TableCell>
                  <TableCell>Current Stock</TableCell>
                  <TableCell>Min Required</TableCell>
                  <TableCell>Last Restocked</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lowStockMedicines.slice(0, 5).map((medicine) => (
                  <TableRow key={medicine._id}>
                    <TableCell>{medicine.name}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="error.main" fontWeight="bold">
                        {medicine.stock}
                      </Typography>
                    </TableCell>
                    <TableCell>{medicine.minRequiredStock || 10}</TableCell>
                    <TableCell>
                      {medicine.lastRestocked
                        ? new Date(medicine.lastRestocked).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Expiring Medicines */}
      {expiringMedicines.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 4, border: '2px solid #f44336', backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: 'error.main' }}>
            Expiring Soon ({expiringMedicines.length})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Medicine Name</TableCell>
                  <TableCell>Expiry Date</TableCell>
                  <TableCell>Days Left</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expiringMedicines.slice(0, 5).map((medicine) => {
                  const daysUntilExpiry = Math.ceil(
                    (new Date(medicine.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <TableRow key={medicine._id} sx={{ backgroundColor: daysUntilExpiry <= 7 ? 'rgba(244, 67, 54, 0.1)' : 'inherit' }}>
                      <TableCell>{medicine.name}</TableCell>
                      <TableCell>
                        {new Date(medicine.expiryDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${daysUntilExpiry} days`}
                          color={daysUntilExpiry <= 7 ? 'error' : 'warning'}
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>{medicine.stock}</TableCell>
                      <TableCell>
                        <Button variant="outlined" size="small" color="error" startIcon={<DeleteIcon />}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Emergencies */}
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Recent Emergencies ({emergencies.length})
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {emergencies.slice(0, 5).map((emergency) => (
                <TableRow key={emergency._id}>
                  <TableCell>
                    {new Date(emergency.timestamp).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>{emergency.location || 'Unknown'}</TableCell>
                  <TableCell>
                    <Chip
                      label={emergency.status}
                      color={
                        emergency.status === 'CRITICAL' ? 'error' :
                          emergency.status === 'RESOLVED' ? 'success' : 'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{emergency.patientName || 'Unknown'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() => {
                          setSnackbar({
                            open: true,
                            message: `Viewing emergency details for ${emergency.patientName || 'Unknown Patient'}`,
                            severity: 'info'
                          });
                        }}
                      >
                        View
                      </Button>
                      {emergency.status !== 'RESOLVED' && (
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleCompleteEmergency(emergency._id)}
                        >
                          Complete
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );

  const AppointmentsTab = () => {
    // Calculate appointment statistics
    const appointmentStats = useMemo(() => {
      const total = appointments.length;
      const confirmed = appointments.filter(a => a.status === 'confirmed').length;
      const completed = appointments.filter(a => a.status === 'completed').length;
      const cancelled = appointments.filter(a => a.status === 'cancelled').length;
      const pending = appointments.filter(a => a.status === 'pending').length;

      return { total, confirmed, completed, cancelled, pending };
    }, [appointments]);

    // Chart data for appointments
    const appointmentChartData = {
      labels: ['Confirmed', 'Completed', 'Cancelled', 'Pending'],
      datasets: [
        {
          data: [
            appointmentStats.confirmed,
            appointmentStats.completed,
            appointmentStats.cancelled,
            appointmentStats.pending
          ],
          backgroundColor: [
            '#4caf50',
            '#2196f3',
            '#f44336',
            '#ff9800'
          ],
          borderWidth: 0
        }
      ]
    };

    const appointmentChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        }
      },
      cutout: '65%'
    };

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Appointments Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => {
              setReportType('appointments');
              setReportDialogOpen(true);
            }}
          >
            Generate Report
          </Button>
        </Box>

        {/* Appointment Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EventIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {appointmentStats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Appointments
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {appointmentStats.confirmed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Confirmed
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MedicalServicesIcon sx={{ fontSize: 40, color: 'info.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {appointmentStats.completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ErrorIcon sx={{ fontSize: 40, color: 'error.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {appointmentStats.cancelled}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cancelled
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Appointment Status Distribution
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Doughnut data={appointmentChartData} options={appointmentChartOptions} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Recent Appointments
              </Typography>
              <List>
                {appointments.slice(0, 5).map((appointment) => (
                  <ListItem key={appointment._id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight="medium">
                          {appointment.userId?.name || 'Unknown Patient'}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </Typography>
                          <Chip
                            label={appointment.status}
                            size="small"
                            color={
                              appointment.status === 'confirmed' ? 'success' :
                                appointment.status === 'cancelled' ? 'error' :
                                  appointment.status === 'completed' ? 'primary' : 'warning'
                            }
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>

        {appointmentsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                All Appointments ({appointments.length})
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EventIcon />}
              >
                Manage Appointments
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient Name</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.length > 0 ? (
                    appointments.slice(0, 10).map((appointment) => (
                      <TableRow key={appointment._id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {appointment.userId?.name || 'Unknown Patient'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {appointment.doctorId?.name || 'Unknown Doctor'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={appointment.status}
                            color={
                              appointment.status === 'confirmed' ? 'success' :
                                appointment.status === 'cancelled' ? 'error' :
                                  appointment.status === 'completed' ? 'primary' : 'warning'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {appointment.appointmentType || 'Regular'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Box sx={{ py: 3, opacity: 0.6 }}>
                          <EventIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            No appointments found
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    );
  };

  const OrdersTab = () => {
    // Calculate order statistics
    const orderStatistics = useMemo(() => {
      const total = orders.length;
      const completed = orders.filter(o => o.status === 'completed').length;
      const pending = orders.filter(o => o.status === 'pending').length;
      const cancelled = orders.filter(o => o.status === 'cancelled').length;
      const totalRevenue = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      return { total, completed, pending, cancelled, totalRevenue };
    }, [orders]);

    // Chart data for orders
    const orderChartData = {
      labels: ['Completed', 'Pending', 'Cancelled'],
      datasets: [
        {
          data: [
            orderStatistics.completed,
            orderStatistics.pending,
            orderStatistics.cancelled
          ],
          backgroundColor: [
            '#4caf50',
            '#ff9800',
            '#f44336'
          ],
          borderWidth: 0
        }
      ]
    };

    const orderChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        }
      },
      cutout: '65%'
    };

    // Revenue chart data
    const revenueChartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Monthly Revenue',
          data: [12000, 19000, 15000, 25000, 22000, 30000],
          fill: true,
          backgroundColor: 'rgba(25, 118, 210, 0.2)',
          borderColor: '#1976d2',
          tension: 0.4,
        }
      ]
    };

    const revenueChartOptions = {
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
            color: 'rgba(0,0,0,0.1)',
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    };

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Orders Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => {
              setReportType('orders');
              setReportDialogOpen(true);
            }}
          >
            Generate Report
          </Button>
        </Box>

        {/* Order Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ShoppingBasketIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {orderStatistics.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {orderStatistics.completed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <WarningAmberIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {orderStatistics.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MonetizationOnOutlinedIcon sx={{ fontSize: 40, color: 'info.main' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    Rs. {orderStatistics.totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Order Status Distribution
              </Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Doughnut data={orderChartData} options={orderChartOptions} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Monthly Revenue Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line data={revenueChartData} options={revenueChartOptions} />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {ordersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                All Orders ({orders.length})
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<ShoppingBasketIcon />}
              >
                Manage Orders
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.length > 0 ? (
                    orders.slice(0, 10).map((order) => (
                      <TableRow key={order._id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            #{order._id.slice(-8)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {order.userId?.name || 'Unknown Customer'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            Rs. {order.totalAmount?.toLocaleString() || '0'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color={
                              order.status === 'completed' ? 'success' :
                                order.status === 'cancelled' ? 'error' :
                                  order.status === 'pending' ? 'warning' : 'default'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Box sx={{ py: 3, opacity: 0.6 }}>
                          <ShoppingBasketIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            No orders found
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    );
  };

  // Delivery Personnel Tab Component
  const DeliveryPersonnelTab = () => {
    const [deliveryPersonnel, setDeliveryPersonnel] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [newPersonnel, setNewPersonnel] = useState({
      name: '',
      email: '',
      phone: '',
      employeeId: '',
      vehicleNumber: '',
      vehicleType: 'bike',
      assignedArea: '',
    });

    const fetchDeliveryPersonnel = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/delivery/all');
        if (response.data.success) {
          setDeliveryPersonnel(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching delivery personnel:', error);
        setSnackbar({
          open: true,
          message: 'Failed to fetch delivery personnel',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchDeliveryPersonnel();
    }, []);

    const handleAddPersonnel = async () => {
      try {
        const response = await api.post('/api/delivery/register', newPersonnel);
        if (response.data.success) {
          setSnackbar({
            open: true,
            message: 'Delivery personnel registered successfully. Registration email sent with temporary password.',
            severity: 'success'
          });
          setShowAddDialog(false);
          setNewPersonnel({
            name: '',
            email: '',
            phone: '',
            employeeId: '',
            vehicleNumber: '',
            vehicleType: 'bike',
            assignedArea: '',
          });
          fetchDeliveryPersonnel();
        }
      } catch (error) {
        console.error('Error adding delivery personnel:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to register delivery personnel',
          severity: 'error'
        });
      }
    };

    const handleStatusUpdate = async (personnelId, newStatus) => {
      try {
        const response = await api.put(`/api/delivery/${personnelId}/status`, { status: newStatus });
        if (response.data.success) {
          setSnackbar({
            open: true,
            message: 'Status updated successfully',
            severity: 'success'
          });
          fetchDeliveryPersonnel();
        }
      } catch (error) {
        console.error('Error updating status:', error);
        setSnackbar({
          open: true,
          message: 'Failed to update status',
          severity: 'error'
        });
      }
    };

    return (
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Delivery Personnel Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonOutlineIcon />}
            onClick={() => setShowAddDialog(true)}
          >
            Add Delivery Personnel
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Personnel
                    </Typography>
                    <Typography variant="h4" component="div">
                      {deliveryPersonnel.length}
                    </Typography>
                  </Box>
                  <LocalShippingIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Active Personnel
                    </Typography>
                    <Typography variant="h4" component="div">
                      {deliveryPersonnel.filter(p => p.status === 'active').length}
                    </Typography>
                  </Box>
                  <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Online Personnel
                    </Typography>
                    <Typography variant="h4" component="div">
                      {deliveryPersonnel.filter(p => p.isOnline).length}
                    </Typography>
                  </Box>
                  <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Deliveries
                    </Typography>
                    <Typography variant="h4" component="div">
                      {deliveryPersonnel.reduce((sum, p) => sum + (p.totalDeliveries || 0), 0)}
                    </Typography>
                  </Box>
                  <ShoppingBasketIcon color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Personnel List */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Delivery Personnel List
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Employee ID</TableCell>
                      <TableCell>Vehicle</TableCell>
                      <TableCell>Assigned Area</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Online</TableCell>
                      <TableCell>Total Deliveries</TableCell>
                      <TableCell>Rating</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deliveryPersonnel.map((personnel) => (
                      <TableRow key={personnel._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {personnel.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {personnel.name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {personnel.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {personnel.employeeId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {personnel.vehicleType} - {personnel.vehicleNumber}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {personnel.assignedArea}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={personnel.status}
                            color={
                              personnel.status === 'active' ? 'success' :
                                personnel.status === 'inactive' ? 'error' : 'warning'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={personnel.isOnline ? 'Online' : 'Offline'}
                            color={personnel.isOnline ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {personnel.totalDeliveries || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <StarIcon sx={{ color: 'gold', fontSize: 16 }} />
                            <Typography variant="body2">
                              {personnel.rating || 0}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <FormControl size="small">
                            <Select
                              value={personnel.status}
                              onChange={(e) => handleStatusUpdate(personnel._id, e.target.value)}
                              sx={{ minWidth: 120 }}
                            >
                              <MenuItem value="active">Active</MenuItem>
                              <MenuItem value="inactive">Inactive</MenuItem>
                              <MenuItem value="on_delivery">On Delivery</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Add Personnel Dialog */}
        <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonOutlineIcon />
              Add New Delivery Personnel
            </Box>
          </DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              <AlertTitle>Automatic Password Generation</AlertTitle>
              A temporary password will be automatically generated and sent to the delivery personnel's email address.
              They can use this password to log in and then change it to a permanent one.
            </Alert>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={newPersonnel.name}
                  onChange={(e) => setNewPersonnel(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={newPersonnel.email}
                  onChange={(e) => setNewPersonnel(prev => ({ ...prev, email: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={newPersonnel.phone}
                  onChange={(e) => setNewPersonnel(prev => ({ ...prev, phone: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={newPersonnel.employeeId}
                  onChange={(e) => setNewPersonnel(prev => ({ ...prev, employeeId: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vehicle Number"
                  value={newPersonnel.vehicleNumber}
                  onChange={(e) => setNewPersonnel(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Vehicle Type</InputLabel>
                  <Select
                    value={newPersonnel.vehicleType}
                    onChange={(e) => setNewPersonnel(prev => ({ ...prev, vehicleType: e.target.value }))}
                    label="Vehicle Type"
                  >
                    <MenuItem value="bike">Bike</MenuItem>
                    <MenuItem value="car">Car</MenuItem>
                    <MenuItem value="van">Van</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Assigned Area"
                  value={newPersonnel.assignedArea}
                  onChange={(e) => setNewPersonnel(prev => ({ ...prev, assignedArea: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddPersonnel} variant="contained">
              Add Personnel
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

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
        ml: { xs: 8, lg: 28 },
        mt: { xs: 7, sm: 8 },
        transition: 'all 0.3s ease',
        position: 'relative'
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
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh dashboard">
              <IconButton
                onClick={refreshData}
                disabled={refreshing}
                sx={{
                  bgcolor: 'rgba(25, 118, 210, 0.1)',
                  border: '1px solid rgba(25, 118, 210, 0.2)'
                }}
              >
                {refreshing ? (
                  <CircularProgress size={20} color="primary" />
                ) : (
                  <RefreshIcon color="primary" />
                )}
              </IconButton>
            </Tooltip>
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

        {/* Tabs */}
        <Paper sx={{ mb: 4, borderRadius: 3 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
              },
              '& .Mui-selected': {
                color: theme.palette.primary.main,
              },
            }}
          >
            <Tab
              icon={<InventoryIcon />}
              label="Inventory Management"
              iconPosition="start"
            />
            <Tab
              icon={<EventIcon />}
              label="Appointments"
              iconPosition="start"
            />
            <Tab
              icon={<ShoppingBasketIcon />}
              label="Orders"
              iconPosition="start"
            />
            <Tab
              icon={<LocalShippingIcon />}
              label="Delivery Personnel"
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {currentTab === 0 && <InventoryTab />}
        {currentTab === 1 && <AppointmentsTab />}
        {currentTab === 2 && <OrdersTab />}
        {currentTab === 3 && <DeliveryPersonnelTab />}

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
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Report Generation Dialog */}
        <Dialog
          open={reportDialogOpen}
          onClose={() => setReportDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PictureAsPdfIcon />
              Generate Report
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    label="Report Type"
                  >
                    <MenuItem value="inventory">Inventory Management Report</MenuItem>
                    <MenuItem value="appointments">Appointments Report</MenuItem>
                    <MenuItem value="orders">Orders Report</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  value={reportDateRange.start}
                  onChange={(e) => setReportDateRange(prev => ({ ...prev, start: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  value={reportDateRange.end}
                  onChange={(e) => setReportDateRange(prev => ({ ...prev, end: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Report Options
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={reportFilters.includeDetails || false}
                      onChange={(e) => setReportFilters(prev => ({ ...prev, includeDetails: e.target.checked }))}
                    />
                  }
                  label="Include detailed breakdown"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={reportFilters.includeCharts || false}
                      onChange={(e) => setReportFilters(prev => ({ ...prev, includeCharts: e.target.checked }))}
                    />
                  }
                  label="Include charts and graphs"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={reportFilters.includeRecommendations || false}
                      onChange={(e) => setReportFilters(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                    />
                  }
                  label="Include recommendations"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateReport}
              variant="contained"
              disabled={!reportType || generatingReport}
              startIcon={generatingReport ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}
            >
              {generatingReport ? 'Generating...' : 'Generate Report'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Report Display Dialog */}
        <Dialog
          open={!!reportData}
          onClose={() => setReportData(null)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                {reportData?.reportType}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleDownloadReport}
                >
                  Download HTML
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintReport}
                >
                  Print
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handleExportPDF}
                >
                  Export PDF
                </Button>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            {reportData && (
              <Box sx={{ mt: 2 }}>
                {/* Summary Cards */}
                <Typography variant="h6" sx={{ mb: 2 }}>
                  📊 Summary
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {Object.entries(reportData.summary).map(([key, value]) => (
                    <Grid item xs={6} md={3} key={key}>
                      <Paper
                        sx={{
                          p: 2,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          borderRadius: 2,
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="h4" fontWeight="bold">
                          {typeof value === 'number' ? value.toLocaleString() : value}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                {/* Sections */}
                <Typography variant="h6" sx={{ mb: 2 }}>
                  📋 Detailed Sections
                </Typography>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {Object.entries(reportData.sections).map(([sectionKey, section]) => (
                    <Paper key={sectionKey} sx={{ mb: 2, overflow: 'hidden' }}>
                      <Box
                        sx={{
                          p: 2,
                          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      >
                        {section.title}
                      </Box>
                      <Box sx={{ p: 2 }}>
                        {section.items.slice(0, 5).map((item, index) => (
                          <Paper
                            key={index}
                            sx={{
                              p: 2,
                              mb: 1,
                              borderLeft: 4,
                              borderColor: item.priority === 'CRITICAL' ? 'error.main' :
                                item.priority === 'WARNING' ? 'warning.main' : 'success.main'
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight="bold">
                              {item.name || item.patientName || item.customerName || item.orderId}
                            </Typography>
                            <Grid container spacing={1} sx={{ mt: 1 }}>
                              {Object.entries(item).filter(([k, v]) =>
                                k !== 'name' && k !== 'patientName' && k !== 'customerName' && k !== 'orderId'
                              ).map(([key, value]) => (
                                <Grid item xs={6} key={key}>
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {value}
                                  </Typography>
                                </Grid>
                              ))}
                            </Grid>
                          </Paper>
                        ))}
                        {section.items.length > 5 && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            +{section.items.length - 5} more items...
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Box>

                {/* Recommendations */}
                {reportData.recommendations && (
                  <>
                    <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>
                      💡 Recommendations
                    </Typography>
                    <Paper sx={{ p: 2, background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
                      {reportData.recommendations.map((rec, index) => (
                        <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                          • {rec}
                        </Typography>
                      ))}
                    </Paper>
                  </>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReportData(null)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard;
