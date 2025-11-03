// API service for backend communication
const API_BASE_URL = 'http://localhost:3001/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Set auth token in localStorage
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

// Get current user from localStorage
const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

// Set current user in localStorage
const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      console.error('API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        endpoint: endpoint,
        error: data.error,
        message: data.message,
        code: data.code
      });
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  // Register - sends OTP to email
  register: async (email, password, name, role) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
    
    // Store OTP if returned (development mode)
    if (response.otp) {
      sessionStorage.setItem(`otp_${email}`, response.otp);
    }
    
    return response;
  },

  // Verify OTP and create account
  verifyOTP: async (email, otp, password) => {
    // First verify OTP with backend
    const response = await apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });

    // If OTP is valid, create user using Firebase Client SDK (bypasses service account permission issues)
    if (response.success && password) {
      try {
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
        const { auth } = await import('@/config/firebase');
        
        // Create user with Firebase Client SDK
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update display name if provided
        if (response.user?.name) {
          await updateProfile(user, { displayName: response.user.name });
        }
        
        // Get ID token
        const idToken = await user.getIdToken();
        
        // Create user document in Firestore via backend
        try {
          await apiRequest('/auth/create-user-document', {
            method: 'POST',
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              name: response.user?.name || user.displayName || email.split('@')[0],
            }),
          });
        } catch (err) {
          console.log('Could not create Firestore user document, but user is created in Firebase Auth');
        }
        
        // Store token and user info
        setAuthToken(idToken);
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          name: user.displayName || response.user?.name || email.split('@')[0],
        });
        
        return {
          success: true,
          message: 'Account created successfully',
          user: {
            uid: user.uid,
            email: user.email,
            name: user.displayName || response.user?.name || email.split('@')[0],
          },
          idToken,
        };
      } catch (firebaseError) {
        console.error('Firebase user creation error:', firebaseError);
        // If user already exists (maybe created by another process), try to sign in
        if (firebaseError.code === 'auth/email-already-in-use') {
          // Try to sign in with the password
          const { signInWithEmailAndPassword } = await import('firebase/auth');
          const { auth } = await import('@/config/firebase');
          
          try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const idToken = await user.getIdToken();
            
            setAuthToken(idToken);
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              name: user.displayName || email.split('@')[0],
            });
            
            return {
              success: true,
              message: 'Account already exists. Signed in successfully.',
              user: {
                uid: user.uid,
                email: user.email,
                name: user.displayName || email.split('@')[0],
              },
              idToken,
            };
          } catch (signInError) {
            throw new Error('Account exists but password verification failed. Please contact support.');
          }
        }
        throw firebaseError;
      }
    }

    // Fallback: if no password provided, use backend customToken (if available)
    if (response.customToken) {
      // Store token and user info
      setAuthToken(response.customToken);
      setCurrentUser(response.user);
    }

    return response;
  },

  // Login with email and password using Firebase Auth
  login: async (email, password) => {
    // Import Firebase Auth functions
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const { auth } = await import('@/config/firebase');
    
    try {
      // Sign in with Firebase Auth (verifies password)
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get ID token
      const idToken = await user.getIdToken();
      
      // Get user data from backend/Firestore
      const response = await apiRequest('/auth/get-user', {
        method: 'POST',
        body: JSON.stringify({ uid: user.uid }),
      }).catch(() => {
        // If endpoint doesn't exist, use user data from Firebase Auth
        return {
          user: {
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email?.split('@')[0] || 'User',
          }
        };
      });

      // Store token and user info
      setAuthToken(idToken);
      setCurrentUser(response.user || {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || 'User',
      });

      return {
        success: true,
        user: response.user || {
          uid: user.uid,
          email: user.email,
          name: user.displayName || user.email?.split('@')[0] || 'User',
        },
        idToken,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Invalid email or password');
    }
  },

  // Resend OTP
  resendOTP: async (email) => {
    return await apiRequest('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Logout
  logout: () => {
    setAuthToken(null);
    setCurrentUser(null);
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },

  // Get current user
  getCurrentUser,
};

// Chat API
export const chatAPI = {
  // Send a message
  sendMessage: async (receiverId, content) => {
    return await apiRequest('/chat/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, content }),
    });
  },

  // Get messages with a user
  getMessages: async (userId) => {
    const response = await apiRequest(`/chat/messages/${userId}`);
    return response.messages || [];
  },

  // Get all conversations
  getConversations: async () => {
    const response = await apiRequest('/chat/conversations');
    return response.conversations || [];
  },

  // Get all users
  getUsers: async () => {
    const response = await apiRequest('/chat/users');
    return response.users || [];
  },
};

export { getAuthToken, setAuthToken, getCurrentUser, setCurrentUser };

