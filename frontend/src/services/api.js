// API service for backend communication
import { auth } from '@/config/firebase';
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

// Refresh Firebase ID token and persist
const refreshAuthToken = async () => {
  // Use the imported auth instance directly
  const user = auth.currentUser
  if (!user) {
    // If currentUser is null, it might be that Auth is still initializing. 
    // We can wait for it briefly or just fail.
    setAuthToken(null)
    throw new Error('No authenticated user')
  }
  try {
    const newToken = await user.getIdToken(true) // Force refresh
    setAuthToken(newToken)
    try { window.dispatchEvent(new CustomEvent('auth:token-refreshed', { detail: { token: newToken } })) } catch {}
    return newToken
  } catch (error) {
    console.error('Failed to refresh Firebase token:', error)
    throw error
  }
}

// API request helper
const apiRequest = async (endpoint, options = {}, retry = true) => {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
      const unauthorized = response.status === 401
      const tokenErrorText = (data?.message || data?.error || '').toString().toLowerCase()
      // More robust check for token expiration/errors
      const tokenError = tokenErrorText.includes('id-token') || 
                         tokenErrorText.includes('expired') || 
                         tokenErrorText.includes('invalid token') ||
                         tokenErrorText.includes('id token')
      
      if (unauthorized && tokenError && retry) {
        try {
          console.log('🔄 Token expired, attempting refresh...');
          await refreshAuthToken()
          // Retry the request with the new token and retry=false to avoid loops
          return await apiRequest(endpoint, options, false)
        } catch (e) {
          console.error('❌ Token refresh failed:', e.message);
        }
      }

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
              role: response.user?.role,
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
          role: response.user?.role,
        });
        try { localStorage.setItem('uid', user.uid); } catch {}
        
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
            // Ensure Firestore user document exists with role/name
            try {
              await apiRequest('/auth/create-user-document', {
                method: 'POST',
                body: JSON.stringify({
                  uid: user.uid,
                  email: user.email,
                  name: response.user?.name || user.displayName || email.split('@')[0],
                  role: response.user?.role,
                }),
              });
            } catch {}
            
            setAuthToken(idToken);
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              name: user.displayName || email.split('@')[0],
              role: response.user?.role,
            });
            try { localStorage.setItem('uid', user.uid); } catch {}
            
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
      try { localStorage.setItem('uid', user.uid); } catch {}

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

  // Update profile fields (name, bio, skills, rate, etc.)
  updateProfile: async (fields) => {
    return await apiRequest('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(fields),
    });
  },
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

// Meetings API
export const meetingsAPI = {
  schedule: async ({ participantId, participantName }) => {
    return await apiRequest('/meetings/schedule', {
      method: 'POST',
      body: JSON.stringify({ participantId, participantName }),
    });
  },
  join: async (roomName) => {
    return await apiRequest('/meetings/join', {
      method: 'POST',
      body: JSON.stringify({ roomName }),
    });
  },
};

// Community API
export const communityAPI = {
  request: async (targetUid) => {
    return await apiRequest('/community/request', {
      method: 'POST',
      body: JSON.stringify({ targetUid }),
    });
  },
  getNotifications: async () => {
    const response = await apiRequest('/community/notifications');
    return response.notifications || [];
  },
  respond: async (requestId, action) => {
    return await apiRequest('/community/respond', {
      method: 'POST',
      body: JSON.stringify({ requestId, action }),
    });
  },
  markRead: async (notificationId) => {
    return await apiRequest('/community/mark-read', {
      method: 'POST',
      body: JSON.stringify({ notificationId }),
    });
  },
  getMembers: async (chatId) => {
    const response = await apiRequest(`/community/${chatId}/members`);
    return response.members || [];
  },
  updateName: async (chatId, name) => {
    return await apiRequest(`/community/${chatId}/name`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },
  leave: async (chatId) => {
    return await apiRequest(`/community/${chatId}/leave`, {
      method: 'POST',
    });
  },
  removeMember: async (chatId, targetUid) => {
    return await apiRequest(`/community/${chatId}/remove`, {
      method: 'POST',
      body: JSON.stringify({ targetUid }),
    });
  },
  invite: async (chatId, targetUid) => {
    return await apiRequest(`/community/${chatId}/invite`, {
      method: 'POST',
      body: JSON.stringify({ targetUid }),
    });
  },
};

// News API
export const newsAPI = {
  getNews: async () => {
    return await apiRequest('/news');
  },
};

// Posts API
export const postsAPI = {
  // Get all posts
  getAll: async () => {
    const response = await apiRequest('/posts');
    return response.posts || [];
  },

  // Get AI recommended posts
  getRecommendations: async () => {
    const response = await apiRequest('/posts/recommend', {
      method: 'POST',
    });
    return response.posts || [];
  },

  // Like or unlike a post
  likePost: async (postId) => {
    return await apiRequest(`/posts/${postId}/like`, {
      method: 'POST',
    });
  },

  // Add a comment to a post
  addComment: async (postId, content, authorName) => {
    return await apiRequest(`/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content, authorName }),
    });
  },
};

// Analytics API
export const analyticsAPI = {
  getEntrepreneurData: async () => {
    const res = await apiRequest('/analytics/entrepreneur');
    return res.data;
  },
  getInvestorData: async () => {
    return await apiRequest('/analytics/investor');
  },
  getFreelancerData: async () => {
    return await apiRequest('/analytics/freelancer');
  },
  trackView: async (targetUid) => {
    return await apiRequest('/analytics/track-view', {
      method: 'POST',
      body: JSON.stringify({ targetUid }),
    });
  },
  interest: async (targetUid) => {
    return await apiRequest('/analytics/interest', {
      method: 'POST',
      body: JSON.stringify({ targetUid }),
    });
  },
};

// Pitch Practice API
export const pitchPracticeAPI = {
  analyze: async (videoBlob) => {
    const formData = new FormData();
    formData.append('video', videoBlob, 'pitch.webm');
    
    return await apiRequest('/pitch-practice/analyze', {
      method: 'POST',
      body: formData,
    });
  }
};

export { getAuthToken, setAuthToken, getCurrentUser, setCurrentUser };
