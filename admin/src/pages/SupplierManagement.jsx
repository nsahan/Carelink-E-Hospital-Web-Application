import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Paper,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Alert,
    Snackbar,
    CircularProgress,
    Grid,
    Card,
    CardContent,
    Rating,
    List,
    ListItem,
    ListItemText,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    Tooltip,
    Badge,
    Checkbox
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Email as EmailIcon,
    History as HistoryIcon,
    Star as StarIcon,
    Business as BusinessIcon,
    Person as PersonIcon,
    Phone as PhoneIcon,
    LocationOn as LocationIcon,
    Notifications as NotificationsIcon,
    Refresh as RefreshIcon,
    CheckCircle as CheckCircleIcon,
    Search as SearchIcon
} from '@mui/icons-material';

const API_BASE_URL = 'http://localhost:9000';
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

function SupplierManagement() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
    const [openNotificationDialog, setOpenNotificationDialog] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [notificationHistory, setNotificationHistory] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [notifying, setNotifying] = useState(false);
    const [lowStockMedicines, setLowStockMedicines] = useState([]);
    const [showInactive, setShowInactive] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSpecialty, setFilterSpecialty] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [showAnalytics, setShowAnalytics] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        contactPerson: '',
        specialties: [],
        notes: '',
        rating: 5
    });

    const [notificationData, setNotificationData] = useState({
        notificationType: 'low_stock',
        selectedMedicines: []
    });

    const specialtyOptions = [
        'antibiotics',
        'pain_relief',
        'vitamins',
        'first_aid',
        'surgical_supplies',
        'equipment',
        'generic_medicines',
        'diabetes',
        'cardiology',
        'specialty_medicines',
        'oncology',
        'rare_diseases',
        'pediatric_medicines',
        'maternal_health',
        'vaccines'
    ];

    const notificationTypes = [
        { value: 'low_stock', label: 'Low Stock Alert' },
        { value: 'expiry', label: 'Expiry Alert' },
        { value: 'reorder', label: 'Reorder Request' },
        { value: 'return', label: 'Return Notification' }
    ];

    const fetchSuppliers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/v1/api/suppliers');
            setSuppliers(response.data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            setSnackbar({
                open: true,
                message: 'Failed to fetch suppliers',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchLowStockMedicines = useCallback(async () => {
        try {
            const response = await api.get('/v1/api/medicines/all');
            const medicines = response.data || [];
            const lowStock = medicines.filter(med =>
                med.stock <= (med.reorderLevel || 10) && med.stock > 0
            );
            setLowStockMedicines(lowStock);
        } catch (error) {
            console.error('Error fetching low stock medicines:', error);
        }
    }, []);

    const fetchNotificationHistory = useCallback(async (supplierId) => {
        try {
            const response = await api.get(`/v1/api/suppliers/${supplierId}/notifications`);
            setNotificationHistory(response.data || []);
        } catch (error) {
            console.error('Error fetching notification history:', error);
            setSnackbar({
                open: true,
                message: 'Failed to fetch notification history',
                severity: 'error'
            });
        }
    }, []);

    useEffect(() => {
        fetchSuppliers();
        fetchLowStockMedicines();
    }, [fetchSuppliers, fetchLowStockMedicines]);

    const handleOpenDialog = (supplier = null) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                name: supplier.name,
                email: supplier.email,
                phone: supplier.phone || '',
                address: supplier.address || '',
                company: supplier.company || '',
                contactPerson: supplier.contactPerson || '',
                specialties: supplier.specialties || [],
                notes: supplier.notes || '',
                rating: supplier.rating || 5
            });
        } else {
            setEditingSupplier(null);
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: '',
                company: '',
                contactPerson: '',
                specialties: [],
                notes: '',
                rating: 5
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingSupplier(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            company: '',
            contactPerson: '',
            specialties: [],
            notes: '',
            rating: 5
        });
    };

    const handleSubmit = async () => {
        try {
            if (editingSupplier) {
                await api.put(`/v1/api/suppliers/${editingSupplier._id}`, formData);
                setSnackbar({
                    open: true,
                    message: 'Supplier updated successfully',
                    severity: 'success'
                });
            } else {
                await api.post('/v1/api/suppliers', formData);
                setSnackbar({
                    open: true,
                    message: 'Supplier added successfully',
                    severity: 'success'
                });
            }
            handleCloseDialog();
            fetchSuppliers();
        } catch (error) {
            console.error('Error saving supplier:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to save supplier',
                severity: 'error'
            });
        }
    };

    const handleDelete = async (supplier) => {
        if (window.confirm(`Are you sure you want to deactivate ${supplier.name}?`)) {
            try {
                await api.delete(`/v1/api/suppliers/${supplier._id}`);
                setSnackbar({
                    open: true,
                    message: 'Supplier deactivated successfully',
                    severity: 'success'
                });
                fetchSuppliers();
            } catch (error) {
                console.error('Error deleting supplier:', error);
                setSnackbar({
                    open: true,
                    message: 'Failed to deactivate supplier',
                    severity: 'error'
                });
            }
        }
    };

    const handleActivate = async (supplier) => {
        if (window.confirm(`Are you sure you want to activate ${supplier.name}?`)) {
            try {
                await api.put(`/v1/api/suppliers/${supplier._id}/activate`);
                setSnackbar({
                    open: true,
                    message: 'Supplier activated successfully',
                    severity: 'success'
                });
                fetchSuppliers();
            } catch (error) {
                console.error('Error activating supplier:', error);
                setSnackbar({
                    open: true,
                    message: 'Failed to activate supplier',
                    severity: 'error'
                });
            }
        }
    };

    const handleBulkAction = async () => {
        if (selectedSuppliers.length === 0) {
            setSnackbar({
                open: true,
                message: 'Please select suppliers for bulk action',
                severity: 'warning'
            });
            return;
        }

        const actionText = bulkAction === 'activate' ? 'activate' :
            bulkAction === 'deactivate' ? 'deactivate' :
                bulkAction === 'notify' ? 'notify' : 'delete';

        if (window.confirm(`Are you sure you want to ${actionText} ${selectedSuppliers.length} supplier(s)?`)) {
            try {
                if (bulkAction === 'notify') {
                    // Bulk notify
                    await handleNotifyAllSuppliers();
                } else {
                    // Bulk activate/deactivate
                    const promises = selectedSuppliers.map(supplierId => {
                        const endpoint = bulkAction === 'activate' ? 'activate' : 'deactivate';
                        return api.put(`/v1/api/suppliers/${supplierId}/${endpoint}`);
                    });
                    await Promise.all(promises);
                }

                setSnackbar({
                    open: true,
                    message: `Successfully ${actionText}d ${selectedSuppliers.length} supplier(s)`,
                    severity: 'success'
                });
                setSelectedSuppliers([]);
                setBulkAction('');
                fetchSuppliers();
            } catch (error) {
                console.error(`Error in bulk ${actionText}:`, error);
                setSnackbar({
                    open: true,
                    message: `Failed to ${actionText} suppliers`,
                    severity: 'error'
                });
            }
        }
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedSuppliers(filteredAndSortedSuppliers.map(s => s._id));
        } else {
            setSelectedSuppliers([]);
        }
    };

    const handleSelectSupplier = (supplierId) => {
        setSelectedSuppliers(prev =>
            prev.includes(supplierId)
                ? prev.filter(id => id !== supplierId)
                : [...prev, supplierId]
        );
    };

    const handlePermanentlyDelete = async (supplier) => {
        if (window.confirm(`Are you sure you want to permanently delete ${supplier.name}? This action cannot be undone.`)) {
            try {
                await api.delete(`/v1/api/suppliers/${supplier._id}/permanent`);
                setSnackbar({
                    open: true,
                    message: 'Supplier permanently deleted',
                    severity: 'success'
                });
                fetchSuppliers();
            } catch (error) {
                console.error('Error permanently deleting supplier:', error);
                setSnackbar({
                    open: true,
                    message: 'Failed to delete supplier',
                    severity: 'error'
                });
            }
        }
    };

    const handleViewHistory = async (supplier) => {
        setSelectedSupplier(supplier);
        await fetchNotificationHistory(supplier._id);
        setOpenHistoryDialog(true);
    };

    const handleNotifySupplier = async (supplier) => {
        setSelectedSupplier(supplier);
        setNotificationData({
            notificationType: 'low_stock',
            selectedMedicines: lowStockMedicines.map(med => ({
                id: med._id,
                name: med.name,
                stock: med.stock,
                reorderQuantity: med.reorderQuantity || 50
            }))
        });
        setOpenNotificationDialog(true);
    };

    const handleSendNotification = async () => {
        try {
            setNotifying(true);
            const response = await api.post(`/v1/api/suppliers/${selectedSupplier._id}/notify`, {
                medicines: notificationData.selectedMedicines,
                notificationType: notificationData.notificationType
            });

            setSnackbar({
                open: true,
                message: response.data.message,
                severity: 'success'
            });
            setOpenNotificationDialog(false);
            fetchSuppliers(); // Refresh to update lastContacted
        } catch (error) {
            console.error('Error sending notification:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to send notification',
                severity: 'error'
            });
        } finally {
            setNotifying(false);
        }
    };

    const handleNotifyAllSuppliers = async () => {
        try {
            setNotifying(true);
            const response = await api.post('/v1/api/suppliers/notify-all', {
                medicines: lowStockMedicines.map(med => ({
                    id: med._id,
                    name: med.name,
                    stock: med.stock,
                    reorderQuantity: med.reorderQuantity || 50
                })),
                notificationType: 'low_stock'
            });

            setSnackbar({
                open: true,
                message: response.data.message,
                severity: 'success'
            });
            fetchSuppliers();
        } catch (error) {
            console.error('Error notifying all suppliers:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to notify suppliers',
                severity: 'error'
            });
        } finally {
            setNotifying(false);
        }
    };

    const getStatusColor = (isActive) => {
        return isActive ? 'success' : 'error';
    };

    const getStatusText = (isActive) => {
        return isActive ? 'Active' : 'Inactive';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getNotificationTypeColor = (type) => {
        switch (type) {
            case 'low_stock': return 'error';
            case 'expiry': return 'warning';
            case 'reorder': return 'info';
            case 'return': return 'default';
            default: return 'default';
        }
    };

    const getNotificationTypeLabel = (type) => {
        switch (type) {
            case 'low_stock': return 'Low Stock';
            case 'expiry': return 'Expiry Alert';
            case 'reorder': return 'Reorder';
            case 'return': return 'Return';
            default: return type;
        }
    };

    // Filter and sort suppliers
    const filteredAndSortedSuppliers = useMemo(() => {
        let filtered = suppliers;

        // Filter by active/inactive status
        if (!showInactive) {
            filtered = filtered.filter(s => s.isActive);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.name.toLowerCase().includes(term) ||
                s.email.toLowerCase().includes(term) ||
                s.company?.toLowerCase().includes(term) ||
                s.contactPerson?.toLowerCase().includes(term)
            );
        }

        // Filter by specialty
        if (filterSpecialty !== 'all') {
            filtered = filtered.filter(s =>
                s.specialties?.includes(filterSpecialty)
            );
        }

        // Sort suppliers
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'rating':
                    aValue = a.rating || 0;
                    bValue = b.rating || 0;
                    break;
                case 'lastContacted':
                    aValue = a.lastContacted ? new Date(a.lastContacted) : new Date(0);
                    bValue = b.lastContacted ? new Date(b.lastContacted) : new Date(0);
                    break;
                case 'createdAt':
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [suppliers, showInactive, searchTerm, filterSpecialty, sortBy, sortOrder]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="220px" maxWidth="1100px" mx="auto">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 9, maxWidth: 1450, minHeight: 220, mx: "auto" }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Supplier Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => {
                            fetchSuppliers();
                            fetchLowStockMedicines();
                        }}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant={showInactive ? "contained" : "outlined"}
                        color="secondary"
                        onClick={() => setShowInactive(!showInactive)}
                    >
                        {showInactive ? 'Hide Inactive' : 'Show Inactive'}
                    </Button>
                    <Button
                        variant={showAnalytics ? "contained" : "outlined"}
                        color="info"
                        onClick={() => setShowAnalytics(!showAnalytics)}
                    >
                        {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add Supplier
                    </Button>
                    {lowStockMedicines.length > 0 && (
                        <Button
                            variant="contained"
                            color="warning"
                            startIcon={<EmailIcon />}
                            onClick={handleNotifyAllSuppliers}
                            disabled={notifying}
                        >
                            {notifying ? 'Notifying...' : `Notify All (${suppliers.filter(s => s.isActive).length})`}
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Search and Filter Controls */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Search suppliers by name, email, or company..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Filter by Specialty</InputLabel>
                            <Select
                                value={filterSpecialty}
                                onChange={(e) => setFilterSpecialty(e.target.value)}
                                label="Filter by Specialty"
                            >
                                <MenuItem value="all">All Specialties</MenuItem>
                                {specialtyOptions.map((specialty) => (
                                    <MenuItem key={specialty} value={specialty}>
                                        {specialty.replace('_', ' ').toUpperCase()}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                label="Sort By"
                            >
                                <MenuItem value="name">Name</MenuItem>
                                <MenuItem value="rating">Rating</MenuItem>
                                <MenuItem value="lastContacted">Last Contacted</MenuItem>
                                <MenuItem value="createdAt">Date Added</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => {
                                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                            }}
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'} Sort
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Supplier Statistics */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Suppliers
                            </Typography>
                            <Typography variant="h4">
                                {suppliers.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Active Suppliers
                            </Typography>
                            <Typography variant="h4" color="success.main">
                                {suppliers.filter(s => s.isActive).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Inactive Suppliers
                            </Typography>
                            <Typography variant="h4" color="error.main">
                                {suppliers.filter(s => !s.isActive).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Low Stock Items
                            </Typography>
                            <Typography variant="h4" color="warning.main">
                                {lowStockMedicines.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Suppliers Table */}
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                {/* Results Counter */}
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'grey.200' }}>
                    <Typography variant="body2" color="textSecondary">
                        Showing {filteredAndSortedSuppliers.length} of {suppliers.length} suppliers
                        {searchTerm && ` (filtered by "${searchTerm}")`}
                        {filterSpecialty !== 'all' && ` (specialty: ${filterSpecialty.replace('_', ' ').toUpperCase()})`}
                    </Typography>
                </Box>

                {/* Bulk Actions */}
                {selectedSuppliers.length > 0 && (
                    <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item>
                                <Typography variant="body2">
                                    {selectedSuppliers.length} supplier(s) selected
                                </Typography>
                            </Grid>
                            <Grid item>
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <Select
                                        value={bulkAction}
                                        onChange={(e) => setBulkAction(e.target.value)}
                                        sx={{ bgcolor: 'white', color: 'text.primary' }}
                                    >
                                        <MenuItem value="">Select Action</MenuItem>
                                        <MenuItem value="activate">Activate</MenuItem>
                                        <MenuItem value="deactivate">Deactivate</MenuItem>
                                        <MenuItem value="notify">Notify</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleBulkAction}
                                    disabled={!bulkAction}
                                    sx={{ bgcolor: 'white', color: 'primary.main' }}
                                >
                                    Apply
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                        setSelectedSuppliers([]);
                                        setBulkAction('');
                                    }}
                                    sx={{ color: 'white', borderColor: 'white' }}
                                >
                                    Clear
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectedSuppliers.length === filteredAndSortedSuppliers.length && filteredAndSortedSuppliers.length > 0}
                                        indeterminate={selectedSuppliers.length > 0 && selectedSuppliers.length < filteredAndSortedSuppliers.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                <TableCell>Supplier Name</TableCell>
                                <TableCell>Contact Person</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Specialties</TableCell>
                                <TableCell>Rating</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Last Contacted</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredAndSortedSuppliers.map((supplier) => (
                                <TableRow key={supplier._id} hover>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedSuppliers.includes(supplier._id)}
                                            onChange={() => handleSelectSupplier(supplier._id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                {supplier.name}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {supplier.company}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{supplier.contactPerson}</TableCell>
                                    <TableCell>{supplier.email}</TableCell>
                                    <TableCell>{supplier.phone}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {supplier.specialties?.slice(0, 2).map((specialty, index) => (
                                                <Chip
                                                    key={index}
                                                    label={specialty}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ))}
                                            {supplier.specialties?.length > 2 && (
                                                <Chip
                                                    label={`+${supplier.specialties.length - 2}`}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Rating value={supplier.rating} readOnly size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusText(supplier.isActive)}
                                            color={getStatusColor(supplier.isActive)}
                                            size="small"
                                            variant={supplier.isActive ? "filled" : "outlined"}
                                            icon={supplier.isActive ? <CheckCircleIcon /> : <BusinessIcon />}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {supplier.lastContacted ? (
                                            <Typography variant="caption">
                                                {formatDate(supplier.lastContacted)}
                                            </Typography>
                                        ) : (
                                            <Typography variant="caption" color="textSecondary">
                                                Never
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                            <Tooltip title="View Notification History">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewHistory(supplier)}
                                                >
                                                    <HistoryIcon />
                                                </IconButton>
                                            </Tooltip>

                                            {supplier.isActive && lowStockMedicines.length > 0 && (
                                                <Tooltip title="Send Notification">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => handleNotifySupplier(supplier)}
                                                    >
                                                        <EmailIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                            <Tooltip title="Send Custom Notification">
                                                <IconButton
                                                    size="small"
                                                    color="secondary"
                                                    onClick={() => handleNotifySupplier(supplier)}
                                                >
                                                    <NotificationsIcon />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Edit Supplier">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenDialog(supplier)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>

                                            {supplier.isActive ? (
                                                <Tooltip title="Deactivate Supplier">
                                                    <IconButton
                                                        size="small"
                                                        color="warning"
                                                        onClick={() => handleDelete(supplier)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : (
                                                <Tooltip title="Activate Supplier">
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleActivate(supplier)}
                                                    >
                                                        <CheckCircleIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                            <Tooltip title="Permanently Delete">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handlePermanentlyDelete(supplier)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Analytics Section */}
            {showAnalytics && (
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        📊 Supplier Analytics & Insights
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Top Performing Suppliers
                                    </Typography>
                                    <List>
                                        {suppliers
                                            .filter(s => s.isActive)
                                            .sort((a, b) => b.rating - a.rating)
                                            .slice(0, 3)
                                            .map((supplier, index) => (
                                                <ListItem key={supplier._id}>
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    {index + 1}. {supplier.name}
                                                                </Typography>
                                                                <Rating value={supplier.rating} readOnly size="small" />
                                                            </Box>
                                                        }
                                                        secondary={`${supplier.specialties?.slice(0, 2).join(', ')}`}
                                                    />
                                                </ListItem>
                                            ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Recent Activity
                                    </Typography>
                                    <List>
                                        {suppliers
                                            .filter(s => s.lastContacted)
                                            .sort((a, b) => new Date(b.lastContacted) - new Date(a.lastContacted))
                                            .slice(0, 3)
                                            .map((supplier) => (
                                                <ListItem key={supplier._id}>
                                                    <ListItemText
                                                        primary={supplier.name}
                                                        secondary={`Last contacted: ${formatDate(supplier.lastContacted)}`}
                                                    />
                                                </ListItem>
                                            ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Specialty Distribution
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {Object.entries(
                                            suppliers
                                                .filter(s => s.isActive)
                                                .flatMap(s => s.specialties || [])
                                                .reduce((acc, specialty) => {
                                                    acc[specialty] = (acc[specialty] || 0) + 1;
                                                    return acc;
                                                }, {})
                                        )
                                            .sort(([, a], [, b]) => b - a)
                                            .slice(0, 6)
                                            .map(([specialty, count]) => (
                                                <Grid item xs={6} sm={4} md={2} key={specialty}>
                                                    <Box sx={{ textAlign: 'center', p: 1 }}>
                                                        <Typography variant="h6" color="primary">
                                                            {count}
                                                        </Typography>
                                                        <Typography variant="caption" color="textSecondary">
                                                            {specialty.replace('_', ' ').toUpperCase()}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            ))}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {/* Quick Actions Section */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    ⚡ Quick Actions
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<EmailIcon />}
                            onClick={() => {
                                const activeSuppliers = suppliers.filter(s => s.isActive);
                                if (activeSuppliers.length > 0) {
                                    setSelectedSuppliers(activeSuppliers.map(s => s._id));
                                    setBulkAction('notify');
                                    handleBulkAction();
                                }
                            }}
                            disabled={suppliers.filter(s => s.isActive).length === 0}
                        >
                            Notify All Active
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<CheckCircleIcon />}
                            onClick={() => {
                                const inactiveSuppliers = suppliers.filter(s => !s.isActive);
                                if (inactiveSuppliers.length > 0) {
                                    setSelectedSuppliers(inactiveSuppliers.map(s => s._id));
                                    setBulkAction('activate');
                                    handleBulkAction();
                                }
                            }}
                            disabled={suppliers.filter(s => !s.isActive).length === 0}
                        >
                            Activate All Inactive
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<BusinessIcon />}
                            onClick={() => {
                                setFilterSpecialty('all');
                                setSearchTerm('');
                                setShowInactive(true);
                                setSortBy('rating');
                                setSortOrder('desc');
                            }}
                        >
                            Find Top Rated
                        </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<HistoryIcon />}
                            onClick={() => {
                                setFilterSpecialty('all');
                                setSearchTerm('');
                                setShowInactive(false);
                                setSortBy('lastContacted');
                                setSortOrder('asc');
                            }}
                        >
                            Find Inactive Long Time
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Add/Edit Supplier Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Supplier Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Company"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Contact Person"
                                value={formData.contactPerson}
                                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Rating"
                                type="number"
                                inputProps={{ min: 1, max: 5 }}
                                value={formData.rating}
                                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address"
                                multiline
                                rows={2}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Specialties</InputLabel>
                                <Select
                                    multiple
                                    value={formData.specialties}
                                    onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                                    input={<OutlinedInput label="Specialties" />}
                                >
                                    {specialtyOptions.map((specialty) => (
                                        <MenuItem key={specialty} value={specialty}>
                                            {specialty.replace('_', ' ').toUpperCase()}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Notes"
                                multiline
                                rows={3}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingSupplier ? 'Update' : 'Add'} Supplier
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification History Dialog */}
            <Dialog open={openHistoryDialog} onClose={() => setOpenHistoryDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Notification History - {selectedSupplier?.name}
                </DialogTitle>
                <DialogContent>
                    {notificationHistory.length > 0 ? (
                        <List>
                            {notificationHistory.map((notification, index) => (
                                <React.Fragment key={index}>
                                    <ListItem>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Chip
                                                        label={getNotificationTypeLabel(notification.type)}
                                                        color={getNotificationTypeColor(notification.type)}
                                                        size="small"
                                                    />
                                                    <Typography variant="body2">
                                                        {formatDate(notification.timestamp)}
                                                    </Typography>
                                                    <Chip
                                                        label={notification.status}
                                                        size="small"
                                                        color={notification.status === 'sent' ? 'success' : notification.status === 'failed' ? 'error' : 'warning'}
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    {notification.medicines?.length > 0 && (
                                                        <Box sx={{ mb: 1 }}>
                                                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                                                Medicines Notified:
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                                {notification.medicines.map((med, medIndex) => (
                                                                    <Chip
                                                                        key={medIndex}
                                                                        label={`${med.name} (${med.stock})`}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        color={med.stock <= 3 ? 'error' : 'default'}
                                                                    />
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    )}
                                                    {notification.response && (
                                                        <Typography variant="body2" color="textSecondary">
                                                            Response: {notification.response}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < notificationHistory.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                            <EmailIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                            <Typography variant="body2" color="textSecondary">
                                No notification history found for this supplier
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenHistoryDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Send Notification Dialog */}
            <Dialog open={openNotificationDialog} onClose={() => setOpenNotificationDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Send Notification to {selectedSupplier?.name}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Notification Type</InputLabel>
                                <Select
                                    value={notificationData.notificationType}
                                    onChange={(e) => setNotificationData({ ...notificationData, notificationType: e.target.value })}
                                    label="Notification Type"
                                >
                                    {notificationTypes.map((type) => (
                                        <MenuItem key={type.value} value={type.value}>
                                            {type.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>
                                Selected Medicines ({notificationData.selectedMedicines.length})
                            </Typography>
                            <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
                                {notificationData.selectedMedicines.length > 0 ? (
                                    notificationData.selectedMedicines.map((medicine, index) => (
                                        <Box key={index} sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 1,
                                            mb: 1,
                                            bgcolor: medicine.stock <= 3 ? '#fff3e0' : '#f5f5f5',
                                            borderRadius: 1,
                                            border: medicine.stock <= 3 ? '1px solid #ff9800' : '1px solid #e0e0e0'
                                        }}>
                                            <Box>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {medicine.name}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary">
                                                    Stock: {medicine.stock} | Required: {medicine.reorderQuantity}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={medicine.stock <= 3 ? 'URGENT' : 'Normal'}
                                                size="small"
                                                color={medicine.stock <= 3 ? 'error' : 'default'}
                                            />
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                                        No medicines selected for notification
                                    </Typography>
                                )}
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Alert severity="info" sx={{ mt: 1 }}>
                                <Typography variant="body2">
                                    This notification will be sent to <strong>{selectedSupplier?.email}</strong> and saved in the notification history.
                                </Typography>
                            </Alert>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenNotificationDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleSendNotification}
                        variant="contained"
                        disabled={notifying || notificationData.selectedMedicines.length === 0}
                        startIcon={notifying ? <CircularProgress size={20} /> : <EmailIcon />}
                    >
                        {notifying ? 'Sending...' : 'Send Notification'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default SupplierManagement;