// API service for mobile — same endpoints as web, AsyncStorage instead of localStorage
import { getItem, setItem, removeItem, getJSON, setJSON } from './storage';
import { auth } from '../config/firebase';

const API_BASE_URL = 'http://172.16.67.31:3001/api'; // Your machine's LAN IP + port
// For emulator use: http://10.0.2.2:3001/api (Android) or http://localhost:3001/api (Expo web)

const getAuthToken = async () => getItem('authToken');
const setAuthToken = async (token) => {
    if (token) await setItem('authToken', token);
    else await removeItem('authToken');
};

export const getCurrentUser = async () => getJSON('currentUser');
export const setCurrentUser = async (user) => {
    if (user) await setJSON('currentUser', user);
    else await removeItem('currentUser');
};

const apiRequest = async (endpoint, options = {}, retry = true) => {
    const token = await getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });
        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 && retry) {
                try {
                    const user = auth.currentUser;
                    if (user) {
                        const newToken = await user.getIdToken(true);
                        await setAuthToken(newToken);
                        return await apiRequest(endpoint, options, false);
                    }
                } catch { }
            }
            throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        }

        return data;
    } catch (error) {
        throw error;
    }
};

// Auth API
export const authAPI = {
    register: async (email, password, name, role) => {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, role }),
        });
        return response;
    },

    verifyOTP: async (email, otp, password) => {
        const response = await apiRequest('/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        });

        if (response.success && password) {
            try {
                const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                if (response.user?.name) {
                    await updateProfile(user, { displayName: response.user.name });
                }

                const idToken = await user.getIdToken();

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
                } catch { }

                await setAuthToken(idToken);
                await setCurrentUser({
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || response.user?.name || email.split('@')[0],
                    role: response.user?.role,
                });
                await setItem('uid', user.uid);

                return {
                    success: true,
                    user: {
                        uid: user.uid,
                        email: user.email,
                        name: user.displayName || response.user?.name || email.split('@')[0],
                    },
                    idToken,
                };
            } catch (firebaseError) {
                if (firebaseError.code === 'auth/email-already-in-use') {
                    const { signInWithEmailAndPassword } = await import('firebase/auth');
                    try {
                        const userCredential = await signInWithEmailAndPassword(auth, email, password);
                        const user = userCredential.user;
                        const idToken = await user.getIdToken();
                        await setAuthToken(idToken);
                        await setCurrentUser({
                            uid: user.uid,
                            email: user.email,
                            name: user.displayName || email.split('@')[0],
                            role: response.user?.role,
                        });
                        await setItem('uid', user.uid);
                        return {
                            success: true,
                            user: { uid: user.uid, email: user.email },
                            idToken,
                        };
                    } catch { }
                }
                throw firebaseError;
            }
        }
        return response;
    },

    login: async (email, password) => {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const idToken = await user.getIdToken();

        const response = await apiRequest('/auth/get-user', {
            method: 'POST',
            body: JSON.stringify({ uid: user.uid }),
        }).catch(() => ({
            user: {
                uid: user.uid,
                email: user.email,
                name: user.displayName || user.email?.split('@')[0] || 'User',
            },
        }));

        await setAuthToken(idToken);
        await setCurrentUser(
            response.user || { uid: user.uid, email: user.email, name: user.displayName || 'User' }
        );
        await setItem('uid', user.uid);

        return { success: true, user: response.user || { uid: user.uid, email: user.email }, idToken };
    },

    resendOTP: async (email) => {
        return await apiRequest('/auth/resend-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    logout: async () => {
        await setAuthToken(null);
        await setCurrentUser(null);
        await removeItem('uid');
        await removeItem('role');
        try {
            const { signOut } = await import('firebase/auth');
            await signOut(auth);
        } catch { }
    },

    getRole: async (uid) => {
        try {
            const res = await apiRequest('/auth/get-user', {
                method: 'POST',
                body: JSON.stringify({ uid }),
            });
            return res?.user?.role || null;
        } catch {
            return null;
        }
    },
};

// Helper: ensure the Firebase ID token is fresh before secure requests
const ensureFreshToken = async () => {
    try {
        const user = auth.currentUser;
        if (user) {
            const freshToken = await user.getIdToken(false); // false = use cached unless expired
            const stored = await getAuthToken();
            if (!stored || freshToken !== stored) {
                await setAuthToken(freshToken);
            }
        }
    } catch (e) {
        // best-effort; apiRequest will retry if 401
    }
};

// Chat API
export const chatAPI = {
    sendMessage: async (receiverId, content) => {
        await ensureFreshToken();
        const response = await apiRequest('/chat/messages', {
            method: 'POST',
            body: JSON.stringify({ receiverId, content }),
        });
        if (!response.success) throw new Error(response.error || 'Failed to send message');
        return response;
    },

    getMessages: async (userId) => {
        await ensureFreshToken();
        const response = await apiRequest(`/chat/messages/${userId}`);
        if (!response.success) throw new Error(response.error || 'Failed to load messages');
        return response.messages || [];
    },

    getConversations: async () => {
        await ensureFreshToken();
        const response = await apiRequest('/chat/conversations');
        if (!response.success) throw new Error(response.error || 'Failed to load conversations');
        // Normalize chatId → id so screens can use item.id as a key
        return (response.conversations || []).map(c => ({
            ...c,
            id: c.id || c.chatId,
        }));
    },

    getUsers: async () => {
        await ensureFreshToken();
        const response = await apiRequest('/chat/users');
        if (!response.success) throw new Error(response.error || 'Failed to load users');
        // Backend returns { id, name, role } — normalize id → uid so screens use item.uid
        return (response.users || []).map(u => ({
            ...u,
            uid: u.uid || u.id,
        }));
    },
};

// Posts API
export const postsAPI = {
    getAll: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/posts`);
            const data = await res.json();
            if (data?.success && Array.isArray(data.posts)) {
                return data.posts.map((p) => ({
                    id: p.id,
                    author: p.authorName,
                    role: p.role,
                    timestamp: p.createdAt ? new Date(p.createdAt).toLocaleString() : 'now',
                    title: p.title,
                    description: p.description,
                    summary: p.summary,
                    likes: p.likes || [],
                    comments: p.comments || [],
                    mediaType: p.mediaType,
                    mediaUrl: p.mediaUrl,
                    authorId: p.authorId,
                }));
            }
        } catch { }
        return [];
    },

    // create — sends multipart/form-data so multer on the backend can parse it
    // postData: { title, description, youtubeUrl?, imageUri?, imageType?, imageName? }
    create: async (postData) => {
        const token = await getAuthToken();

        // Read user details from storage
        const currentUser = await getJSON('currentUser');
        const authorId = currentUser?.uid || (await getItem('uid')) || 'anon';
        const authorName = currentUser?.name || currentUser?.email?.split('@')[0] || 'User';
        const role = currentUser?.role || (await getItem('role')) || 'entrepreneur';

        const fd = new FormData();
        fd.append('authorId', authorId);
        fd.append('authorName', authorName);
        fd.append('role', role);
        fd.append('title', (postData.title || '').trim());
        fd.append('description', (postData.description || '').trim());

        if (postData.youtubeUrl) {
            fd.append('mediaType', 'youtube');
            fd.append('youtubeUrl', postData.youtubeUrl.trim());
        } else if (postData.imageUri) {
            // imageUri is a local file:// URI from the image picker
            fd.append('mediaType', 'image');
            fd.append('image', {
                uri: postData.imageUri,
                type: postData.imageType || 'image/jpeg',
                name: postData.imageName || 'photo.jpg',
            });
        }
        // else: text-only post (no mediaType field)

        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        // Do NOT set Content-Type — fetch sets it automatically with the correct boundary for FormData

        const res = await fetch(`${API_BASE_URL}/posts`, {
            method: 'POST',
            headers,
            body: fd,
        });

        const data = await res.json();
        if (!res.ok || !data?.success) {
            throw new Error(data?.error || data?.message || `Post failed (${res.status})`);
        }
        return data;
    },

    // Like or unlike a post
    likePost: async (postId) => {
        await ensureFreshToken();
        const response = await apiRequest(`/posts/${postId}/like`, {
            method: 'POST',
        });
        return response;
    },

    // Add a comment to a post
    addComment: async (postId, content, authorName) => {
        await ensureFreshToken();
        const response = await apiRequest(`/posts/${postId}/comment`, {
            method: 'POST',
            body: JSON.stringify({ content, authorName }),
        });
        return response;
    },
};

// Analytics API
export const analyticsAPI = {
    getEntrepreneurData: async () => {
        await ensureFreshToken();
        const response = await apiRequest('/analytics/entrepreneur');
        return response.data;
    },
    getInvestorData: async () => {
        await ensureFreshToken();
        return await apiRequest('/analytics/investor');
    },
    getFreelancerData: async () => {
        await ensureFreshToken();
        return await apiRequest('/analytics/freelancer');
    },
    trackView: async (targetUid) => {
        await ensureFreshToken();
        return await apiRequest('/analytics/track-view', {
            method: 'POST',
            body: JSON.stringify({ targetUid })
        });
    },
    toggleInterest: async (targetUid) => {
        await ensureFreshToken();
        return await apiRequest('/analytics/interest', {
            method: 'POST',
            body: JSON.stringify({ targetUid })
        });
    }
};

