// Auth utilities for client-side

export const setAuth = (token, user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const getAuth = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    return {
      token,
      user: userStr ? JSON.parse(userStr) : null,
    };
  }
  return { token: null, user: null };
};

export const clearAuth = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('token');
  }
  return false;
};

export const hasRole = (role) => {
  const { user } = getAuth();
  return user?.role === role;
};

export const hasAnyRole = (...roles) => {
  const { user } = getAuth();
  return user && roles.includes(user.role);
};

