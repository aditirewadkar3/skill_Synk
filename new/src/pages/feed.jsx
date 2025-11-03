import React from "react"

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

function PostCard({ post }) {
	return (
		<div className="bg-white rounded-xl shadow-md p-4 md:p-5 mb-5">
			{/* Author */}
			<div className="flex items-start gap-3">
				<Avatar name={post.author} />
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<p className="font-semibold text-gray-900 truncate">{post.author}</p>
						<span className={`text-xs px-2 py-0.5 rounded-full ${roleBadgeClasses[post.role] || "bg-gray-100 text-gray-700"}`}>
							{post.role}
						</span>
						<span className="text-xs text-gray-500">• {post.timestamp}</span>
					</div>
					<h3 className="mt-1 font-bold text-gray-900">{post.title}</h3>
				</div>
			</div>

			{/* Description */}
			<p className="text-gray-700 mt-3 whitespace-pre-line">{post.description}</p>

			{/* Media */}
			{post.mediaUrl && post.mediaType === "image" && (
				<div className="mt-3 overflow-hidden rounded-lg border">
					<img src={post.mediaUrl} alt="attachment" className="w-full h-auto object-cover" />
				</div>
			)}
			{post.mediaUrl && post.mediaType === "video" && (
				<div className="mt-3 overflow-hidden rounded-lg border">
					<video src={post.mediaUrl} controls className="w-full h-auto" />
				</div>
			)}

			{/* Actions */}
			<div className="mt-4 pt-3 border-t flex items-center gap-6 text-sm text-gray-600">
				<button type="button" className="hover:text-gray-900">👍 Like</button>
				<button type="button" className="hover:text-gray-900">💬 Comment</button>
				<button type="button" className="hover:text-gray-900">↗️ Share</button>
			</div>
		</div>
	)
}

export default function FeedPage() {
	const posts = [
		{
			id: 1,
			author: "Aarya Sharma",
			role: "Entrepreneur",
			timestamp: "2h ago",
			title: "Launching our beta for SkillSync",
			description: "We just opened early access. Looking for feedback from freelancers and investors. Drop your thoughts!",
			mediaType: "image",
			mediaUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop",
		},
		{
			id: 2,
			author: "Rahul Verma",
			role: "Investor",
			timestamp: "5h ago",
			title: "Market insights: SaaS growth in APAC",
			description: "APAC SaaS is growing 25% YoY. Keen to chat with founders building B2B tools for SMBs.",
			mediaType: "video",
			mediaUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
		},
		{
			id: 3,
			author: "Neha Patel",
			role: "Freelancer",
			timestamp: "1d ago",
			title: "Available for product design sprints",
			description: "Helping startups validate ideas with 1-week design sprints. Portfolio on request.",
			mediaType: null,
			mediaUrl: null,
		},
	]

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white border-b">
				<div className="max-w-2xl mx-auto px-4 py-4">
					<h1 className="text-xl font-bold text-gray-900">StartupConnect</h1>
				</div>
			</header>
			<main className="max-w-2xl mx-auto px-4 py-6">
				{posts.map((p) => (
					<PostCard key={p.id} post={p} />
				))}
			</main>
		</div>
	)
}


