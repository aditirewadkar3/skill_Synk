import React from "react"
import { postsAPI } from "@/services/api"

const roleBadgeClasses = {
	Investor: "bg-indigo-100 text-indigo-700",
	Entrepreneur: "bg-emerald-100 text-emerald-700",
	Freelancer: "bg-amber-100 text-amber-800",
}

function Avatar({ name }) {
	const initials = (name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
	return (
		<div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold shrink-0">
			{initials}
		</div>
	)
}

function summarizeText(text) {
	if (!text) return "";
	// Simple heuristic: take first 3 lines or ~240 chars
	const lines = text.split(/\n+/).filter(Boolean);
	const first = lines.slice(0, 3).join(" \n");
	const clipped = first.length > 240 ? first.slice(0, 240) + "…" : first;
	return clipped;
}

function PostCard({ post, onSummarize }) {
    const [localSummary, setLocalSummary] = React.useState("");
    const [likes, setLikes] = React.useState(post.likes || []);
    const [comments, setComments] = React.useState(post.comments || []);
    const [showComments, setShowComments] = React.useState(false);
    const [commentText, setCommentText] = React.useState("");
    const [isSubmittingComment, setIsSubmittingComment] = React.useState(false);

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const isLiked = likes.includes(currentUser.uid);

    const handleLike = async () => {
        try {
            const res = await postsAPI.likePost(post.id);
            if (res.success) {
                if (res.isLiked) {
                    setLikes([...likes, currentUser.uid]);
                } else {
                    setLikes(likes.filter(id => id !== currentUser.uid));
                }
            }
        } catch (err) {
            console.error('Like error:', err);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            setIsSubmittingComment(true);
            const res = await postsAPI.addComment(post.id, commentText, currentUser.name);
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
        const shareData = {
            title: post.title,
            text: `Check out this post by ${post.author} on SkillSync: ${post.title}`,
            url: `${window.location.origin}/post/${post.id}`
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
                alert('Link copied to clipboard! 📋');
            }
        } catch (err) {
            console.error('Share error:', err);
        }
    };

    return (
		<div className="bg-white rounded-xl shadow-md p-4 md:p-5 mb-5 border border-gray-100">
            <div className="flex items-start gap-3">
                <button
                    type="button"
                    onClick={() => { if (post.authorId) { window.history.pushState({}, '', `/client-profile?uid=${post.authorId}`); window.dispatchEvent(new Event('app:navigate')); } }}
                    className="focus:outline-none"
                    title="View profile"
                >
                    <Avatar name={post.author} />
                </button>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => { if (post.authorId) { window.history.pushState({}, '', `/client-profile?uid=${post.authorId}`); window.dispatchEvent(new Event('app:navigate')); } }}
                          className="font-semibold text-gray-900 truncate hover:underline text-left"
                          title="View profile"
                        >
                          {post.author}
                        </button>
						<span className={`text-xs px-2 py-0.5 rounded-full ${roleBadgeClasses[post.role] || "bg-gray-100 text-gray-700"}`}>
							{post.role}
						</span>
						<span className="text-xs text-gray-500">• {post.timestamp}</span>
					</div>
					<h3 className="mt-1 font-bold text-gray-900">{post.title}</h3>
				</div>
			</div>
			<p className="text-gray-700 mt-3 whitespace-pre-line">{post.description}</p>
                    {post.mediaUrl && post.mediaType === "image" && (
				<div className="mt-3 overflow-hidden rounded-lg border">
					<img src={post.mediaUrl} alt="attachment" className="w-full h-auto object-cover" />
				</div>
			)}
                    {post.mediaUrl && (post.mediaType === "youtube" || post.mediaType === "video") && (
                        <div className="mt-3">
                            <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                {post.mediaUrl}
                            </a>
                        </div>
                    )}
            <div className="mt-4 pt-3 border-t flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-6">
                    <button 
                        type="button" 
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-blue-600 font-medium' : 'hover:text-gray-900'}`}
                    >
                        {isLiked ? '❤️' : '🤍'} {likes.length || ""} Like
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setShowComments(!showComments)}
                        className={`flex items-center gap-1.5 hover:text-gray-900 ${showComments ? 'text-gray-900' : ''}`}
                    >
                        💬 {comments.length || ""} Comment
                    </button>
                    <button 
                        type="button" 
                        onClick={handleShare}
                        className="flex items-center gap-1.5 hover:text-gray-900"
                    >
                        ↗️ Share
                    </button>
                </div>
                <button
					type="button"
					className="text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => {
                        const text = post.summary || summarizeText(post.description)
                        const prefix = post.summary ? "✨ AI Summary: " : `${post.title} — `
                        setLocalSummary(`${prefix}${text}`)
                        onSummarize && onSummarize({
                            title: post.title,
                            author: post.author,
                            role: post.role,
                            text: post.summary || text,
                            isAI: !!post.summary
                        })
                    }}
				>
					📝 Summarize
				</button>
			</div>
            {localSummary && (
                <div className="mt-3 border rounded-lg p-3 bg-indigo-50/50 border-indigo-100">
                    <p className="text-sm text-indigo-900 whitespace-pre-line">{localSummary}</p>
                    <div className="mt-2 text-right">
                        <button className="text-xs text-indigo-400 hover:text-indigo-600" onClick={() => setLocalSummary("")}>Clear</button>
                    </div>
                </div>
            )}

            {showComments && (
                <div className="mt-4 pt-4 border-t space-y-4">
                    <form onSubmit={handleComment} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            disabled={isSubmittingComment}
                        />
                        <button
                            type="submit"
                            disabled={isSubmittingComment || !commentText.trim()}
                            className="bg-blue-600 text-white rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            Post
                        </button>
                    </form>
                    
                    <div className="space-y-3">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex gap-2.5">
                                    <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0">
                                        {(comment.authorName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 bg-gray-50 rounded-2xl px-3 py-2 text-sm shadow-sm">
                                        <div className="font-semibold text-gray-900 text-xs mb-0.5">{comment.authorName}</div>
                                        <div className="text-gray-700 leading-relaxed">{comment.content}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400 text-xs py-2 italic font-light">No comments yet. Be the first!</p>
                        )}
                    </div>
                </div>
            )}
		</div>
	)
}

export default function Feed({ onSummarize, filterAuthorId, filterMode = 'exclude' }) {
    const [posts, setPosts] = React.useState(null);
    React.useEffect(() => {
        (async () => {
            try {
                const fetchedPosts = await postsAPI.getAll();
                if (Array.isArray(fetchedPosts)) {
                    // Map backend fields to Feed shape
                    const mapped = fetchedPosts.map(p => ({
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
                    setPosts(mapped);
                } else {
                    setPosts([]);
                }
            } catch (err) {
                console.error('Feed load error:', err);
                setPosts([]);
            }
        })();
    }, []);
    const fallbackPosts = [
		{
			id: 1,
			author: "Aarya Sharma",
			role: "Entrepreneur",
			timestamp: "2h ago",
			title: "Launching our beta for SkillSync",
			description: "After months of user interviews and design iterations, we're opening early access for SkillSync.\n\nWhat we built:\n- Matching engine to connect founders, investors, and freelancers\n- Realtime chat with typing indicators and read receipts\n- Lightweight profiles focused on outcomes, not vanity metrics\n\nLooking for feedback on onboarding friction and profile completeness. If you're an investor or freelancer, tell us what signal you care about most.",
			mediaType: "image",
			mediaUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
			hasPitchDeck: true,
		},
		{
			id: 2,
			author: "Rahul Verma",
			role: "Investor",
			timestamp: "5h ago",
			title: "Market insights: SaaS growth in APAC",
			description: "APAC SaaS continues to compound at ~25% YoY with tailwinds in SME digitization.\n\nWhat I’m tracking:\n- Vertical SaaS with embedded payments\n- AI copilots that deliver measurable ROI within 30 days\n- Infra companies reducing cloud and data costs by 30–50%\n\nFounders building in these areas—DM with traction (MRR, retention, top 3 logos).",
			mediaType: "video",
			mediaUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
		},
		{
			id: 3,
			author: "Neha Patel",
			role: "Freelancer",
			timestamp: "1d ago",
			title: "Available for product design sprints",
			description: "Running 1-week product design sprints for startups. Deliverables include:\n- Prototype covering the core user journey\n- Tested with 5–7 target users\n- Prioritized backlog for the next 2 sprints\n\nRecent work: B2B payments onboarding (cut drop-off by 18%).",
			mediaType: null,
			mediaUrl: null,
		},
		{
			id: 4,
			author: "BlueLedger AI",
			role: "Entrepreneur",
			timestamp: "1d ago",
			title: "Pitch: AI-assisted bookkeeping for SMBs",
			description: "Problem: SMBs spend ~12 hrs/month reconciling books and still make compliance errors.\nSolution: AI-first bookkeeping with human-in-the-loop QA.\nTraction: 120 paying SMEs, $38k MRR, 92% logo retention.\nAsk: $750k to accelerate integrations + expand sales in APAC.",
			mediaType: "image",
			mediaUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop",
			hasPitchDeck: true,
		},
		{
			id: 5,
			author: "Nina Kapoor",
			role: "Investor",
			timestamp: "2d ago",
			title: "Hiring: Platform Ops (Portfolio Support)",
			description: "We’re building a small platform team to support our seed portfolio with GTM, finance ops, and hiring playbooks.\nIf you’ve scaled ops at a 0→1 startup and like working across companies, DM with your experience.",
			mediaType: null,
			mediaUrl: null,
		},
		{
			id: 6,
			author: "OrbitWorks",
			role: "Entrepreneur",
			timestamp: "3d ago",
			title: "We open-sourced our feature flag system",
			description: "We just open-sourced a lightweight feature flag system that supports gradual rollouts, per-user targeting, and kill switches.\nBuilt for speed: <2ms local eval, zero external network calls on hot path.\nRepo link in comments.",
			mediaType: "image",
			mediaUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200&auto=format&fit=crop",
		},
	]

	return (
        <div className="max-w-2xl mx-auto">
            {((posts ?? fallbackPosts).filter(p => {
                if (!filterAuthorId) return true;
                if (filterMode === 'only') return p.authorId === filterAuthorId;
                return p.authorId !== filterAuthorId;
            })).map((p) => (
				<PostCard key={p.id} post={p} onSummarize={onSummarize} />
			))}
		</div>
	)
}


