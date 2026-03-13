import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
    ActivityIndicator, RefreshControl, TextInput, Modal, Alert, StatusBar,
    Linking, Share,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { postsAPI, getCurrentUser } from '../services/api';
import { getItem, getJSON } from '../services/storage';
import { THEME, SHADOW } from '../theme';

// ───── Rich fallback posts (same as web) ─────
const FALLBACK_POSTS = [
    {
        id: '1', author: 'Aarya Sharma', role: 'Entrepreneur', authorId: 'u1', timestamp: '2h ago',
        title: 'Launching our beta for SkillSync',
        description: "After months of user interviews and design iterations, we're opening early access for SkillSync.\n\nWhat we built:\n- Matching engine to connect founders, investors, and freelancers\n- Realtime chat with typing indicators and read receipts\n- Lightweight profiles focused on outcomes, not vanity metrics\n\nLooking for feedback on onboarding friction and profile completeness. If you're an investor or freelancer, tell us what signal you care about most.",
        mediaType: 'image', mediaUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop',
    },
    {
        id: '2', author: 'Rahul Verma', role: 'Investor', authorId: 'u2', timestamp: '5h ago',
        title: 'Market insights: SaaS growth in APAC',
        description: "APAC SaaS continues to compound at ~25% YoY with tailwinds in SME digitization.\n\nWhat I'm tracking:\n- Vertical SaaS with embedded payments\n- AI copilots that deliver measurable ROI within 30 days\n- Infra companies reducing cloud and data costs by 30–50%\n\nFounders building in these areas—DM with traction (MRR, retention, top 3 logos).",
        mediaType: 'youtube', mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
        id: '3', author: 'Neha Patel', role: 'Freelancer', authorId: 'u3', timestamp: '1d ago',
        title: 'Available for product design sprints',
        description: "Running 1-week product design sprints for startups. Deliverables include:\n- Prototype covering the core user journey\n- Tested with 5–7 target users\n- Prioritized backlog for the next 2 sprints\n\nRecent work: B2B payments onboarding (cut drop-off by 18%).",
        mediaType: null, mediaUrl: null,
    },
    {
        id: '4', author: 'BlueLedger AI', role: 'Entrepreneur', authorId: 'u4', timestamp: '1d ago',
        title: 'Pitch: AI-assisted bookkeeping for SMBs',
        description: "Problem: SMBs spend ~12 hrs/month reconciling books and still make compliance errors.\nSolution: AI-first bookkeeping with human-in-the-loop QA.\nTraction: 120 paying SMEs, $38k MRR, 92% logo retention.\nAsk: $750k to accelerate integrations + expand sales in APAC.",
        mediaType: 'image', mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop',
    },
    {
        id: '5', author: 'Nina Kapoor', role: 'Investor', authorId: 'u5', timestamp: '2d ago',
        title: 'Hiring: Platform Ops (Portfolio Support)',
        description: "We're building a small platform team to support our seed portfolio with GTM, finance ops, and hiring playbooks.\nIf you've scaled ops at a 0→1 startup and like working across companies, DM with your experience.",
        mediaType: null, mediaUrl: null,
    },
    {
        id: '6', author: 'OrbitWorks', role: 'Entrepreneur', authorId: 'u6', timestamp: '3d ago',
        title: 'We open-sourced our feature flag system',
        description: "We just open-sourced a lightweight feature flag system that supports gradual rollouts, per-user targeting, and kill switches.\nBuilt for speed: <2ms local eval, zero external network calls on hot path.\nRepo link in comments.",
        mediaType: 'image', mediaUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop',
    },
];

function summarizeText(description, title) {
    if (!description) return '';
    const lines = description.split(/\n+/).filter(Boolean);
    const first = lines.slice(0, 3).join('\n');
    const clipped = first.length > 240 ? first.slice(0, 240) + '…' : first;
    return `${title} — ${clipped}`;
}

function PostCard({ post }) {
    const roleColors = THEME.roleBadgeColors[post.role] || { bg: '#f1f5f9', text: THEME.textMuted };
    const initials = (post.author || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const [summary, setSummary] = useState('');
    const [likes, setLikes] = useState(post.likes || []);
    const [comments, setComments] = useState(post.comments || []);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [me, setMe] = useState(null);

    useEffect(() => {
        (async () => {
            const user = await getCurrentUser();
            setMe(user);
        })();
    }, []);

    const isLiked = me && likes.includes(me.uid);
    const isYoutube = post.mediaType === 'youtube' || post.mediaType === 'video';
    const isImage = post.mediaType === 'image';

    const handleLike = async () => {
        if (!me) return;
        try {
            const res = await postsAPI.likePost(post.id);
            if (res.success) {
                if (res.isLiked) {
                    setLikes([...likes, me.uid]);
                } else {
                    setLikes(likes.filter(id => id !== me.uid));
                }
            }
        } catch (err) {
            console.error('Like error:', err);
        }
    };

    const handleComment = async () => {
        if (!me || !commentText.trim()) return;
        try {
            setIsSubmittingComment(true);
            const res = await postsAPI.addComment(post.id, commentText, me.name);
            if (res.success) {
                setComments([...comments, res.comment]);
                setCommentText("");
            }
        } catch (err) {
            console.error('Comment error:', err);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                title: post.title,
                message: `Check out this post by ${post.author} on SkillSync: ${post.title}\n\n${post.description.substring(0, 100)}...`,
                url: `https://skillsync.app/post/${post.id}` // Placeholder URL
            });
        } catch (error) {
            console.error('Share error:', error.message);
        }
    };

    return (
        <View style={styles.post}>
            {/* Author Row */}
            <View style={styles.postHeader}>
                <View style={[styles.avatar, { backgroundColor: roleColors.bg }]}>
                    <Text style={[styles.avatarText, { color: roleColors.text }]}>{initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={styles.authorRow}>
                        <Text style={styles.author}>{post.author}</Text>
                        <View style={[styles.roleBadge, { backgroundColor: roleColors.bg }]}>
                            <Text style={[styles.roleText, { color: roleColors.text }]}>{post.role}</Text>
                        </View>
                    </View>
                    <Text style={styles.timestamp}>{post.timestamp}</Text>
                </View>
            </View>

            {/* Title */}
            <Text style={styles.postTitle}>{post.title}</Text>

            {/* Full description */}
            <Text style={styles.postDesc}>{post.description}</Text>

            {/* Image */}
            {isImage && post.mediaUrl ? (
                <Image source={{ uri: post.mediaUrl }} style={styles.postImage} resizeMode="cover" />
            ) : null}

            {/* YouTube / Video link */}
            {isYoutube && post.mediaUrl ? (
                <TouchableOpacity style={styles.ytLink} onPress={() => Linking.openURL(post.mediaUrl)}>
                    <Text style={styles.ytIcon}>▶</Text>
                    <Text style={styles.ytText} numberOfLines={1}>{post.mediaUrl}</Text>
                </TouchableOpacity>
            ) : null}

            {/* Summary preview */}
            {summary ? (
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryText}>{summary}</Text>
                    <TouchableOpacity onPress={() => setSummary('')}>
                        <Text style={styles.summaryClose}>Clear summary</Text>
                    </TouchableOpacity>
                </View>
            ) : null}

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
                    <Text style={[styles.actionText, isLiked && { color: '#2563eb', fontWeight: '700' }]}>
                        {isLiked ? '❤️' : '🤍'} {likes.length || ""} Like
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => setShowComments(!showComments)}>
                    <Text style={[styles.actionText, showComments && { color: THEME.text }]}>
                        💬 {comments.length || ""} Comment
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={handleShare}><Text style={styles.actionText}>↗️ Share</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { marginLeft: 'auto' }]} onPress={() => setSummary(summarizeText(post.description, post.title))}>
                    <Text style={styles.summarizeBtn}>📝 Summarize</Text>
                </TouchableOpacity>
            </View>

            {/* Comments Section */}
            {showComments && (
                <View style={styles.commentSection}>
                    <View style={styles.commentInputRow}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Add a comment..."
                            placeholderTextColor={THEME.textSecondary}
                            value={commentText}
                            onChangeText={setCommentText}
                            disabled={isSubmittingComment}
                        />
                        <TouchableOpacity 
                            onPress={handleComment} 
                            disabled={isSubmittingComment || !commentText.trim()}
                            style={[styles.commentSubmit, (!commentText.trim() || isSubmittingComment) && { opacity: 0.5 }]}
                        >
                            <Text style={styles.commentSubmitText}>Post</Text>
                        </TouchableOpacity>
                    </View>

                    {comments.map((c) => (
                        <View key={c.id} style={styles.commentItem}>
                            <View style={styles.commentAvatar}>
                                <Text style={styles.commentAvatarText}>{(c.authorName || 'U')[0].toUpperCase()}</Text>
                            </View>
                            <View style={styles.commentBubble}>
                                <Text style={styles.commentAuthor}>{c.authorName}</Text>
                                <Text style={styles.commentContent}>{c.content}</Text>
                            </View>
                        </View>
                    ))}
                    {comments.length === 0 && (
                        <Text style={styles.noComments}>No comments yet.</Text>
                    )}
                </View>
            )}
        </View>
    );
}

export default function FeedScreen() {
    const [posts, setPosts] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showPostModal, setShowPostModal] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [postDesc, setPostDesc] = useState('');
    const [postYtUrl, setPostYtUrl] = useState('');
    const [imageAsset, setImageAsset] = useState(null); // { uri, type, fileName }
    const [postType, setPostType] = useState('text'); // 'text' | 'image' | 'youtube'
    const [posting, setPosting] = useState(false);

    const load = async () => {
        try {
            const data = await postsAPI.getAll();
            setPosts(data.length > 0 ? data : FALLBACK_POSTS);
        } catch { setPosts(FALLBACK_POSTS); }
    };

    useEffect(() => { load(); }, []);

    const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Allow access to your photo library to attach images.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
            allowsEditing: true,
        });
        if (!result.canceled && result.assets?.[0]) {
            const asset = result.assets[0];
            setImageAsset({ uri: asset.uri, type: asset.mimeType || 'image/jpeg', fileName: asset.fileName || 'photo.jpg' });
        }
    };

    const resetModal = () => {
        setPostTitle(''); setPostDesc(''); setPostYtUrl('');
        setImageAsset(null); setPostType('text'); setShowPostModal(false);
    };

    const handlePost = async () => {
        if (!postTitle.trim()) { Alert.alert('Error', 'Title is required'); return; }
        if (postType === 'image' && !imageAsset) { Alert.alert('Error', 'Please pick an image first'); return; }
        if (postType === 'youtube' && !postYtUrl.trim()) { Alert.alert('Error', 'Please enter a YouTube URL'); return; }
        setPosting(true);
        try {
            await postsAPI.create({
                title: postTitle,
                description: postDesc,
                ...(postType === 'youtube' ? { youtubeUrl: postYtUrl.trim() } : {}),
                ...(postType === 'image' && imageAsset ? {
                    imageUri: imageAsset.uri,
                    imageType: imageAsset.type,
                    imageName: imageAsset.fileName,
                } : {}),
            });
            Alert.alert('Posted!', 'Your update is live.');
            resetModal();
            load();
        } catch (err) {
            Alert.alert('Post failed', err.message || 'Could not create post. Check your network and backend.');
        } finally { setPosting(false); }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={THEME.background} />
            <View style={styles.topBar}>
                <Text style={styles.screenTitle}>Feed</Text>
                <TouchableOpacity style={styles.newPostBtn} onPress={() => setShowPostModal(true)}>
                    <Text style={styles.newPostBtnText}>+ New Post</Text>
                </TouchableOpacity>
            </View>

            {posts === null ? (
                <View style={styles.loading}><ActivityIndicator size="large" color={THEME.primary} /></View>
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => <PostCard post={item} />}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.primary} />}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <Modal visible={showPostModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>✏️ Share an Update</Text>

                        <TextInput style={styles.modalInput} placeholder="Post title *" placeholderTextColor={THEME.textSecondary} value={postTitle} onChangeText={setPostTitle} />
                        <TextInput style={[styles.modalInput, { height: 90, textAlignVertical: 'top' }]} placeholder="What's on your mind?" placeholderTextColor={THEME.textSecondary} value={postDesc} onChangeText={setPostDesc} multiline />

                        {/* Attachment type */}
                        <Text style={styles.modalLabel}>Attachment</Text>
                        <View style={styles.typeRow}>
                            {[{ k: 'text', l: '📝 None' }, { k: 'image', l: '🖼️ Image' }, { k: 'youtube', l: '▶️ YouTube' }].map(opt => (
                                <TouchableOpacity key={opt.k}
                                    style={[styles.typeBtn, postType === opt.k && { backgroundColor: THEME.primary, borderColor: THEME.primary }]}
                                    onPress={() => { setPostType(opt.k); setImageAsset(null); setPostYtUrl(''); }}
                                >
                                    <Text style={[styles.typeBtnText, postType === opt.k && { color: '#fff' }]}>{opt.l}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {postType === 'image' && (
                            <View style={styles.imagePickerBox}>
                                {imageAsset ? (
                                    <View>
                                        <Image source={{ uri: imageAsset.uri }} style={styles.imagePreview} resizeMode="cover" />
                                        <TouchableOpacity onPress={() => setImageAsset(null)}>
                                            <Text style={styles.clearImage}>✕ Remove image</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
                                        <Text style={styles.pickBtnIcon}>📷</Text>
                                        <Text style={styles.pickBtnText}>Tap to choose a photo</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {postType === 'youtube' && (
                            <TextInput style={styles.modalInput} placeholder="https://youtu.be/VIDEO_ID" placeholderTextColor={THEME.textSecondary} value={postYtUrl} onChangeText={setPostYtUrl} keyboardType="url" autoCapitalize="none" />
                        )}

                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: THEME.backgroundMuted, flex: 1 }]} onPress={resetModal}>
                                <Text style={{ color: THEME.text, fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: THEME.primary, flex: 1 }]} onPress={handlePost} disabled={posting}>
                                {posting ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>Post</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.backgroundMuted },
    topBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
        backgroundColor: THEME.background, borderBottomWidth: 1, borderBottomColor: THEME.cardBorder,
    },
    screenTitle: { fontSize: 22, fontWeight: '800', color: THEME.text },
    newPostBtn: { backgroundColor: THEME.primary, borderRadius: THEME.radius, paddingHorizontal: 12, paddingVertical: 7 },
    newPostBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    post: { backgroundColor: THEME.card, borderRadius: THEME.radiusLg, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: THEME.cardBorder, ...SHADOW.sm },
    postHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
    avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontWeight: '700', fontSize: 15 },
    authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    author: { color: THEME.text, fontWeight: '700', fontSize: 14 },
    roleBadge: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
    roleText: { fontSize: 11, fontWeight: '600' },
    timestamp: { color: THEME.textSecondary, fontSize: 12, marginTop: 2 },
    postTitle: { color: THEME.text, fontWeight: '700', fontSize: 16, marginBottom: 8 },
    postDesc: { color: '#374151', fontSize: 14, lineHeight: 22, marginBottom: 10 }, // gray-700 same as web
    postImage: { width: '100%', height: 200, borderRadius: THEME.radius, marginBottom: 10, borderWidth: 1, borderColor: THEME.cardBorder },

    ytLink: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10,
        backgroundColor: '#eff6ff', borderRadius: THEME.radius, padding: 10,
        borderWidth: 1, borderColor: '#bfdbfe',
    },
    ytIcon: { fontSize: 16, color: '#2563eb' },
    ytText: { color: '#2563eb', fontSize: 13, flex: 1, textDecorationLine: 'underline' },

    summaryBox: { backgroundColor: THEME.backgroundMuted, borderRadius: THEME.radius, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: THEME.cardBorder },
    summaryText: { color: THEME.text, fontSize: 13, lineHeight: 19 },
    summaryClose: { color: THEME.textMuted, fontSize: 12, marginTop: 8, textAlign: 'right' },

    actions: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: THEME.cardBorder, paddingTop: 10, flexWrap: 'wrap' },
    actionBtn: { paddingVertical: 4 },
    actionText: { color: THEME.textMuted, fontSize: 13 },
    summarizeBtn: { color: '#2563eb', fontSize: 13 },

    commentSection: { marginTop: 12, borderTopWidth: 1, borderTopColor: THEME.cardBorder, paddingTop: 12 },
    commentInputRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    commentInput: { flex: 1, backgroundColor: THEME.backgroundMuted, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, color: THEME.text, borderWidth: 1, borderColor: THEME.cardBorder },
    commentSubmit: { backgroundColor: THEME.primary, borderRadius: 8, paddingHorizontal: 12, justifyContent: 'center' },
    commentSubmitText: { color: '#fff', fontWeight: '700', fontSize: 13 },
    commentItem: { flexDirection: 'row', gap: 10, marginBottom: 10 },
    commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
    commentAvatarText: { fontSize: 10, fontWeight: '700', color: THEME.textMuted },
    commentBubble: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 8 },
    commentAuthor: { fontSize: 12, fontWeight: '700', color: THEME.text, marginBottom: 2 },
    commentContent: { fontSize: 13, color: '#334155' },
    noComments: { textAlign: 'center', color: THEME.textMuted, fontSize: 12, fontStyle: 'italic', paddingVertical: 8 },

    modalOverlay: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
    modalCard: { backgroundColor: THEME.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, borderTopWidth: 1, borderColor: THEME.cardBorder },
    modalTitle: { fontSize: 17, fontWeight: '700', color: THEME.text, marginBottom: 14 },
    modalLabel: { color: THEME.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 8 },
    modalInput: { backgroundColor: THEME.backgroundMuted, borderRadius: THEME.radius, borderWidth: 1, borderColor: THEME.inputBorder, color: THEME.text, paddingHorizontal: 12, paddingVertical: 11, marginBottom: 12, fontSize: 15 },
    modalBtn: { padding: 13, borderRadius: THEME.radius, alignItems: 'center' },

    typeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    typeBtn: { flex: 1, borderRadius: THEME.radius, borderWidth: 1, borderColor: THEME.inputBorder, paddingVertical: 8, alignItems: 'center', backgroundColor: THEME.backgroundMuted },
    typeBtnText: { color: THEME.textMuted, fontWeight: '600', fontSize: 12 },

    imagePickerBox: { marginBottom: 12 },
    pickBtn: { borderWidth: 1, borderColor: THEME.inputBorder, borderStyle: 'dashed', borderRadius: THEME.radiusLg, padding: 24, alignItems: 'center', backgroundColor: THEME.backgroundMuted },
    pickBtnIcon: { fontSize: 28, marginBottom: 6 },
    pickBtnText: { color: THEME.textMuted, fontSize: 14 },
    imagePreview: { width: '100%', height: 150, borderRadius: THEME.radius, marginBottom: 6 },
    clearImage: { color: THEME.destructive, fontSize: 13, textAlign: 'right' },
});
