// Token utility functions
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decode JWT token (payload is base64 encoded)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired (with 5 minute buffer)
    return payload.exp < (currentTime + 300);
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

export const getTokenExpiryTime = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Error parsing token expiry:', error);
    return null;
  }
};

export const getTokenPayload = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error parsing token payload:', error);
    return null;
  }
};

// Check if token will expire soon (within 5 minutes)
export const isTokenExpiringSoon = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token expires within 5 minutes
    return payload.exp < (currentTime + 300);
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
}; 