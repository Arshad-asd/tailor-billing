# Restaurant Management SaaS - Frontend

## Redux Store Setup

This project uses Redux Toolkit for state management with the following structure:

### Store Configuration
- **Location**: `src/store/store.js`
- **Slices**: auth, restaurant, customer, admin, ui
- **Middleware**: Redux Toolkit with serializable check configuration
- **DevTools**: Enabled in development mode

### API Configuration
- **Location**: `src/services/api.js`
- **Base URL**: Configurable via `VITE_API_BASE_URL` environment variable
- **Interceptors**: Automatic token management and refresh
- **Error Handling**: 401 errors trigger automatic token refresh

### Environment Variables
Copy `env.example` to `.env.local` and configure:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=Restaurant Management SaaS

# Authentication
VITE_JWT_STORAGE_KEY=restaurant_saas_token
VITE_REFRESH_TOKEN_KEY=restaurant_saas_refresh_token

# Development
VITE_APP_ENV=development
VITE_DEBUG=true
```

## Redux Slices

### 1. Auth Slice (`src/store/slices/authSlice.js`)
Manages authentication state for all user types:
- Customer, Restaurant, and Admin authentication
- Token management (access & refresh tokens)
- User profile information
- Loading and error states

**Actions:**
- `customerLogin`, `restaurantLogin`, `adminLogin`
- `customerRegister`, `restaurantRegister`
- `logout`, `getCurrentUser`
- `forgotPassword`, `resetPassword`

### 2. Restaurant Slice (`src/store/slices/restaurantSlice.js`)
Manages restaurant-specific data:
- Menu management (CRUD operations)
- Orders and order status updates
- Table management
- Inventory tracking
- Employee management
- Sales and inventory reports

### 3. Customer Slice (`src/store/slices/customerSlice.js`)
Manages customer-specific data:
- Order history and management
- Profile information
- Favorites management
- Order creation and cancellation

### 4. Admin Slice (`src/store/slices/adminSlice.js`)
Manages admin platform data:
- Restaurant management
- User management
- Subscription management
- Analytics and reporting

### 5. UI Slice (`src/store/slices/uiSlice.js`)
Manages UI state:
- Modal states
- Notifications
- Sidebar state
- Loading states
- Theme configuration
- Search and pagination
- Sorting preferences

## API Service Structure

### Authentication API
```javascript
// Customer authentication
customerLogin(credentials)
customerRegister(userData)

// Restaurant authentication
restaurantLogin(credentials)
restaurantRegister(restaurantData)

// Admin authentication
adminLogin(credentials)

// Common auth methods
refreshToken(refreshToken)
logout()
forgotPassword(email)
resetPassword(token, password)
getCurrentUser()
```

### Restaurant API
```javascript
// Menu management
getMenu(), createMenuItem(itemData), updateMenuItem(id, itemData), deleteMenuItem(id)

// Orders
getOrders(params), getOrder(id), updateOrderStatus(id, status)

// Tables
getTables(), createTable(tableData), updateTable(id, tableData), deleteTable(id)

// Inventory
getInventory(), updateInventory(id, inventoryData)

// Employees
getEmployees(), createEmployee(employeeData), updateEmployee(id, employeeData), deleteEmployee(id)

// Reports
getSalesReport(params), getInventoryReport(params)
```

### Admin API
```javascript
// Restaurant management
getRestaurants(params), getRestaurant(id), createRestaurant(restaurantData), updateRestaurant(id, restaurantData), deleteRestaurant(id)

// User management
getUsers(params), getUser(id), createUser(userData), updateUser(id, userData), deleteUser(id)

// Subscriptions
getSubscriptions(params), updateSubscription(id, subscriptionData)

// Analytics
getDashboardStats(), getRevenueStats(params)
```

### Customer API
```javascript
// Orders
getOrders(params), getOrder(id), createOrder(orderData), cancelOrder(id)

// Profile
getProfile(), updateProfile(profileData)

// Favorites
getFavorites(), addToFavorites(restaurantId), removeFromFavorites(restaurantId)
```

## Usage Examples

### Using Redux in Components
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { customerLogin } from '../store/slices/authSlice';

const MyComponent = () => {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogin = (credentials) => {
    dispatch(customerLogin(credentials));
  };

  return (
    // Component JSX
  );
};
```

### Using Notifications
```javascript
import { useNotification } from '../hooks/useNotification';

const MyComponent = () => {
  const { showSuccess, showError } = useNotification();

  const handleSuccess = () => {
    showSuccess('Success!', 'Operation completed successfully');
  };

  const handleError = () => {
    showError('Error!', 'Something went wrong');
  };
};
```

### Using API Service
```javascript
import { restaurantAPI } from '../services/api';

const fetchMenu = async () => {
  try {
    const response = await restaurantAPI.getMenu();
    return response.data;
  } catch (error) {
    console.error('Failed to fetch menu:', error);
  }
};
```

## Token Management

The API service automatically handles:
- Adding JWT tokens to request headers
- Refreshing expired tokens
- Clearing tokens on logout
- Redirecting to login on authentication failure

## Error Handling

All API calls include comprehensive error handling:
- Network errors
- Authentication errors (401)
- Validation errors
- Server errors

Errors are automatically displayed as notifications and stored in Redux state for component access.

## Development

To start development:
1. Copy `env.example` to `.env.local`
2. Configure your API base URL
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`

The Redux DevTools are available in development mode for debugging state changes.
