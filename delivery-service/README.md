# Delivery Service Dashboard

A dedicated dashboard for delivery personnel to manage and track orders in the CareLink healthcare system.

## Features

- **Secure Authentication**: Login system for delivery personnel
- **Order Management**: View assigned orders and mark them as delivered
- **Real-time Updates**: Live tracking of order status
- **Dashboard Analytics**: View delivery statistics and performance metrics
- **Mobile Responsive**: Works on all devices

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:9000`

### Installation

1. Navigate to the delivery service directory:
   ```bash
   cd delivery-service
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5174`

## Usage

### For Delivery Personnel

1. **Login**: Use credentials provided by admin
2. **View Orders**: See all assigned orders for delivery
3. **Mark as Delivered**: Click "Mark as Delivered" button when order is successfully delivered
4. **Track Progress**: Monitor delivery statistics and performance

### For Administrators

1. **Register Personnel**: Use admin dashboard to add new delivery personnel
2. **Manage Status**: Activate/deactivate delivery personnel accounts
3. **Monitor Performance**: Track delivery statistics and ratings

## API Endpoints

### Authentication
- `POST /api/delivery/login` - Login for delivery personnel
- `POST /api/delivery/logout` - Logout delivery personnel

### Dashboard
- `GET /api/delivery/dashboard` - Get delivery dashboard data
- `PUT /api/delivery/orders/:orderId/delivered` - Mark order as delivered
- `PUT /api/delivery/location` - Update delivery personnel location

### Admin Management
- `POST /api/delivery/register` - Register new delivery personnel (Admin only)
- `GET /api/delivery/all` - Get all delivery personnel (Admin only)
- `PUT /api/delivery/:personnelId/status` - Update personnel status (Admin only)

## Security

- JWT-based authentication
- Role-based access control
- Secure password hashing
- Protected API endpoints

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **UI Components**: Lucide React Icons
- **HTTP Client**: Axios
- **Notifications**: React Toastify
- **Routing**: React Router DOM

## File Structure

```
delivery-service/
├── src/
│   ├── pages/
│   │   ├── Login.jsx          # Login page
│   │   └── Dashboard.jsx      # Main dashboard
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── package.json               # Dependencies
└── README.md                  # This file
```

## Development

### Adding New Features

1. Create new components in `src/pages/` or `src/components/`
2. Add routes in `App.jsx`
3. Update API endpoints in backend if needed
4. Test thoroughly before deployment

### Styling

The app uses Tailwind CSS for styling. Custom styles can be added in `src/index.css`.

## Troubleshooting

### Common Issues

1. **Login Failed**: Check if backend server is running
2. **Orders Not Loading**: Verify API endpoints and authentication
3. **Styling Issues**: Ensure Tailwind CSS is properly configured

### Debug Mode

Enable debug logging by adding `console.log` statements in components or checking browser developer tools.

## Support

For technical support or feature requests, contact the development team.

---

**Note**: This delivery service is part of the larger CareLink healthcare management system. Ensure the backend server is running before using this dashboard. 