import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { postsAPI } from '../services/api';

const ROLE_COLORS = {
    Investor: '#6366f1',
    Entrepreneur: '#10b981',
    Freelancer: '#f59e0b',
};

const FALLBACK_POSTS = [
    {
        id: '1', author: 'Aarya Sharma', role: 'Entrepreneur', timestamp: '2h ago',
        title: 'Launching our beta for SkillSync',
        description: 'After months of user interviews and design iterations, we\'re opening early access for SkillSync.\n\nWhat we built:\n- Matching engine\n- Realtime chat\n- Lightweight profiles\n\nLooking for feedback on onboarding friction.',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop',
    },
    {
        id: '2', author: 'Rahul Verma', role: 'Investor', timestamp: '5h ago',
        title: 'Market insights: SaaS growth in APAC',
        description: 'APAC SaaS continues to compound at ~25% YoY.\n\nWhat I\'m tracking:\n- Vertical SaaS with embedded payments\n- AI copilots with measurable ROI\n- Infra companies reducing cloud costs',
        mediaType: null, mediaUrl: null,
    },
    {
        id: '3', author: 'Neha Patel', role: 'Freelancer', timestamp: '1d ago',
        title: 'Available for product design sprints',
        description: 'Running 1-week design sprints. Deliverables: prototype, user testing, backlog.\n\nRecent: B2B payments onboarding (cut drop-off by 18%).',
        mediaType: null, mediaUrl: null,
    },
    {
        id: '4', author: 'BlueLedger AI', role: 'Entrepreneur', timestamp: '1d ago',
        title: 'Pitch: AI-assisted bookkeeping for SMBs',
        description: 'Traction: 120 paying SMEs, $38k MRR, 92% logo retention.\nAsk: $750k to accelerate integrations.',
        mediaType: 'image',
        mediaUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop',
    },
];

function PostCard({ post }) {
    const roleColor = ROLE_COLORS[post.role] || '#8b5cf6';
    const initials = (post.author || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    const [showSummary, setShowSummary] = useState(false);

    return (
        <View style={styles.postCard}>
            <View style={styles.postHeader}>
                <View style={[styles.avatar, { backgroundColor: roleColor + '33' }]}>
                    <Text style={[styles.avatarText, { color: roleColor }]}>{initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={styles.authorRow}>
                        <Text style={styles.authorName}>{post.author}</Text>
                        <View style={[styles.roleBadge, { backgroundColor: roleColor + '22', borderColor: roleColor + '44' }]}>
                            <Text style={[styles.roleText, { color: roleColor }]}>{post.role}</Text>
                        </View>
                    </View>
                    <Text style={styles.timestamp}>{post.timestamp}</Text>
                </View>
            </View>

            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postDesc} numberOfLines={showSummary ? undefined : 4}>{post.description}</Text>

            {showSummary && (
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryTitle}>✨ AI Summary</Text>
                    <Text style={styles.summaryText}>{post.summary || "Summarizing description..."}</Text>
                </View>
            )}

            {post.mediaType === 'image' && post.mediaUrl ? (
                <Image source={{ uri: post.mediaUrl }} style={styles.postImage} resizeMode="cover" />
            ) : null}

            <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionText}>👍 Like</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => setShowSummary(!showSummary)}
                >
                    <Text style={[styles.actionText, showSummary && { color: '#6366f1' }]}>
                        📝 {showSummary ? 'Hide' : 'Summary'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionText}>↗️ Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    postCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    authorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    authorName: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#1f2937',
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
    },
    roleText: {
        fontSize: 10,
        fontWeight: '600',
    },
    timestamp: {
        fontSize: 12,
        color: '#6b7280',
    },
    postTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    postDesc: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 12,
    },
    summaryBox: {
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#6366f1',
    },
    summaryTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#4f46e5',
        marginBottom: 4,
    },
    summaryText: {
        fontSize: 13,
        color: '#4b5563',
        fontStyle: 'italic',
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 12,
    },
    actions: {
        flexDirection: 'row',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        justifyContent: 'space-between',
    },
    actionBtn: {
        flex: 1,
        alignItems: 'center',
    },
    actionText: {
        fontSize: 14,
        color: '#4b5563',
    },
});

export { PostCard, FALLBACK_POSTS };
