// components/BlogsPage.tsx

"use client";

import {
	ArrowRight,
	BookOpen,
	Building2,
	Calendar,
	ChevronLeft,
	ChevronRight,
	Clock,
	Eye,
	Heart,
	MessageCircle,
	Package,
	Search,
	Share2,
	Sparkles,
	Tag,
	TrendingUp,
	User,
	Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BlogPost {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	featured_image: string | null;
	category: "global-market" | "smm-panel" | "social-tenant" | "platform";
	author_name: string;
	author_avatar: string | null;
	published_at: string;
	read_time: number;
	views: number;
	likes: number;
	tags: string[];
}

interface BlogsPageProps {
	posts?: BlogPost[];
	featuredPost?: BlogPost;
}

// ─── Sample Blog Data ─────────────────────────────────────────────
const samplePosts: BlogPost[] = [
	{
		id: "1",
		title: "Getting Started on Prime Boostage: Your Complete Guide",
		slug: "getting-started-prime-boostage",
		excerpt:
			"New to Prime Boostage? This comprehensive guide walks you through everything you need to know to start buying, selling, and growing on our platform.",
		content: "",
		featured_image: null,
		category: "platform",
		author_name: "Prime Boostage Team",
		author_avatar: null,
		published_at: "2024-01-15T10:00:00Z",
		read_time: 8,
		views: 1247,
		likes: 89,
		tags: ["onboarding", "guide", "beginners"],
	},
	{
		id: "2",
		title: "How to Price Your Digital Assets for Maximum Profit",
		slug: "pricing-digital-assets",
		excerpt:
			"Setting the right price for your digital assets can be the difference between a sale and a missed opportunity. Learn proven pricing strategies from top sellers.",
		content: "",
		featured_image: null,
		category: "global-market",
		author_name: "Sarah Johnson",
		author_avatar: null,
		published_at: "2024-01-12T14:30:00Z",
		read_time: 6,
		views: 856,
		likes: 67,
		tags: ["pricing", "selling", "strategy"],
	},
	{
		id: "3",
		title: "The Power of AI Design: Transforming Your Online Presence",
		slug: "ai-design-power",
		excerpt:
			"Discover how our AI-powered design services can help you create stunning websites and designs in minutes. No design experience required.",
		content: "",
		featured_image: null,
		category: "social-tenant",
		author_name: "Marcus Chen",
		author_avatar: null,
		published_at: "2024-01-10T09:15:00Z",
		read_time: 5,
		views: 623,
		likes: 45,
		tags: ["ai", "design", "website"],
	},
	{
		id: "4",
		title: "Social Media Growth Strategies That Actually Work in 2024",
		slug: "social-media-growth-2024",
		excerpt:
			"Stop wasting time on strategies that don't work. Here are the proven social media growth tactics that are delivering results for our top SMM clients.",
		content: "",
		featured_image: null,
		category: "smm-panel",
		author_name: "Priya Patel",
		author_avatar: null,
		published_at: "2024-01-08T16:45:00Z",
		read_time: 7,
		views: 934,
		likes: 78,
		tags: ["smm", "growth", "marketing"],
	},
	{
		id: "5",
		title: "Understanding Escrow Protection: A Buyer's Guide",
		slug: "escrow-buyer-guide",
		excerpt:
			"Worried about buying digital assets online? Learn how our escrow system protects you and ensures you get exactly what you paid for.",
		content: "",
		featured_image: null,
		category: "global-market",
		author_name: "David Okonkwo",
		author_avatar: null,
		published_at: "2024-01-05T11:20:00Z",
		read_time: 4,
		views: 512,
		likes: 34,
		tags: ["escrow", "buying", "protection"],
	},
	{
		id: "6",
		title: "How to Build a Professional Website in 15 Minutes",
		slug: "build-website-15-minutes",
		excerpt:
			"You don't need to be a designer or developer to create a stunning website. Here's how to use our Social Tenant platform to build your site in minutes.",
		content: "",
		featured_image: null,
		category: "social-tenant",
		author_name: "Amara Eze",
		author_avatar: null,
		published_at: "2024-01-03T13:00:00Z",
		read_time: 5,
		views: 445,
		likes: 29,
		tags: ["website", "templates", "quick-guide"],
	},
	{
		id: "7",
		title: "Building a Successful SMM Service Business",
		slug: "smm-service-business",
		excerpt:
			"From zero to profitable: learn how to build a thriving social media marketing service business on our platform.",
		content: "",
		featured_image: null,
		category: "smm-panel",
		author_name: "James Adebayo",
		author_avatar: null,
		published_at: "2024-01-01T10:30:00Z",
		read_time: 9,
		views: 378,
		likes: 52,
		tags: ["smm", "business", "entrepreneurship"],
	},
	{
		id: "8",
		title: "The Future of Digital Marketplaces: Trends to Watch",
		slug: "future-digital-marketplaces",
		excerpt:
			"What's next for digital asset trading? We explore the emerging trends that are shaping the future of online marketplaces.",
		content: "",
		featured_image: null,
		category: "platform",
		author_name: "Prime Boostage Team",
		author_avatar: null,
		published_at: "2023-12-28T08:45:00Z",
		read_time: 6,
		views: 289,
		likes: 31,
		tags: ["trends", "future", "marketplace"],
	},
	{
		id: "9",
		title: "One-Time vs Reusable Assets: Which Should You Sell?",
		slug: "one-time-reusable-assets",
		excerpt:
			"Not sure whether to list one-time or reusable assets? We break down the pros and cons of each to help you make the right decision.",
		content: "",
		featured_image: null,
		category: "global-market",
		author_name: "Sarah Johnson",
		author_avatar: null,
		published_at: "2023-12-25T15:20:00Z",
		read_time: 4,
		views: 234,
		likes: 18,
		tags: ["assets", "selling", "comparison"],
	},
];

export function BlogsPage({
	posts = samplePosts,
	featuredPost,
}: BlogsPageProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

	const postsPerPage = 6;

	const categories = [
		{
			id: "platform",
			label: "Platform",
			icon: <Sparkles className="h-4 w-4" />,
		},
		{
			id: "global-market",
			label: "Global Market",
			icon: <Package className="h-4 w-4" />,
		},
		{
			id: "smm-panel",
			label: "SMM Panel",
			icon: <Users className="h-4 w-4" />,
		},
		{
			id: "social-tenant",
			label: "Social Tenant",
			icon: <Building2 className="h-4 w-4" />,
		},
	];

	const getCategoryColor = (category: string) => {
		const colors: Record<string, string> = {
			platform: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
			"global-market": "text-blue-400 bg-blue-500/10 border-blue-500/20",
			"smm-panel": "text-purple-400 bg-purple-500/10 border-purple-500/20",
			"social-tenant": "text-sky-400 bg-sky-500/10 border-sky-500/20",
		};
		return (
			colors[category] || "text-zinc-400 bg-zinc-800/50 border-zinc-700/50"
		);
	};

	const getCategoryIcon = (category: string) => {
		const icons: Record<string, React.ReactNode> = {
			platform: <Sparkles className="h-4 w-4" />,
			"global-market": <Package className="h-4 w-4" />,
			"smm-panel": <Users className="h-4 w-4" />,
			"social-tenant": <Building2 className="h-4 w-4" />,
		};
		return icons[category] || <BookOpen className="h-4 w-4" />;
	};

	const getCategoryLabel = (category: string) => {
		const labels: Record<string, string> = {
			platform: "Platform",
			"global-market": "Global Market",
			"smm-panel": "SMM Panel",
			"social-tenant": "Social Tenant",
		};
		return labels[category] || category;
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	// ─── Filter posts ──────────────────────────────────────────────
	const filteredPosts = posts.filter((post) => {
		const matchesSearch =
			post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
			post.tags.some((tag) =>
				tag.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		const matchesCategory =
			!selectedCategory || post.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	const featured =
		featuredPost || (filteredPosts.length > 0 ? filteredPosts[0] : null);
	const regularPosts = featured
		? filteredPosts.filter((p) => p.id !== featured.id)
		: filteredPosts;

	// ─── Pagination ────────────────────────────────────────────────
	const totalPages = Math.ceil(regularPosts.length / postsPerPage);
	const paginatedPosts = regularPosts.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	// ─── If a post is selected ─────────────────────────────────────
	if (selectedPost) {
		return (
			<div className="min-h-screen bg-black text-white">
				<div className="max-w-4xl mx-auto px-4 py-8">
					<button
						onClick={() => setSelectedPost(null)}
						className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
					>
						<ChevronLeft className="h-5 w-5" />
						<span className="text-sm">Back to Blog</span>
					</button>

					<article className="space-y-6">
						{/* Category Badge */}
						<span
							className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${getCategoryColor(selectedPost.category)}`}
						>
							{getCategoryIcon(selectedPost.category)}
							{getCategoryLabel(selectedPost.category)}
						</span>

						<h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
							{selectedPost.title}
						</h1>

						<div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
							<div className="flex items-center gap-2">
								<User className="h-4 w-4" />
								<span>{selectedPost.author_name}</span>
							</div>
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								<span>{formatDate(selectedPost.published_at)}</span>
							</div>
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4" />
								<span>{selectedPost.read_time} min read</span>
							</div>
						</div>

						{selectedPost.featured_image && (
							<img
								src={selectedPost.featured_image}
								alt={selectedPost.title}
								className="w-full aspect-[16/9] object-cover rounded-2xl"
							/>
						)}

						<div className="prose prose-invert max-w-none">
							<p className="text-lg text-zinc-300 leading-relaxed">
								{selectedPost.excerpt}
							</p>
							<p className="text-zinc-400 leading-relaxed">
								This is a sample blog post content. In production, this would
								contain the full article content with rich formatting, images,
								and structured sections.
							</p>
						</div>

						<div className="flex flex-wrap gap-2 pt-4">
							{selectedPost.tags.map((tag) => (
								<span
									key={tag}
									className="text-xs text-zinc-500 bg-zinc-900/50 px-3 py-1 rounded-full border border-white/5"
								>
									#{tag}
								</span>
							))}
						</div>

						<div className="flex items-center gap-6 pt-6 border-t border-white/5">
							<button className="flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors">
								<Heart className="h-5 w-5" />
								<span className="text-sm">{selectedPost.likes}</span>
							</button>
							<button className="flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors">
								<Share2 className="h-5 w-5" />
								<span className="text-sm">Share</span>
							</button>
							<button className="flex items-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors">
								<MessageCircle className="h-5 w-5" />
								<span className="text-sm">Comment</span>
							</button>
						</div>
					</article>
				</div>
			</div>
		);
	}

	// ─── Main Render ──────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-black text-white">
			<div className="max-w-6xl mx-auto px-4 py-8">
				{/* ─── Header ──────────────────────────────────────────────── */}
				<div className="text-center space-y-4 pb-8 border-b border-white/5">
					<div className="flex items-center justify-center gap-3">
						<BookOpen className="h-8 w-8 text-emerald-400" />
						<h1 className="text-2xl sm:text-3xl font-bold text-white">
							Prime Boostage Blog
						</h1>
					</div>
					<p className="text-sm text-zinc-400 max-w-2xl mx-auto">
						Insights, guides, and stories from the Prime Boostage community.
						Stay updated on the latest trends in digital assets, social media
						marketing, and AI-powered design.
					</p>

					<div className="max-w-md mx-auto">
						<div className="relative">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
							<Input
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search articles..."
								className="h-10 pl-11 rounded-full bg-zinc-950/40 border-white/10 text-white placeholder:text-zinc-500"
							/>
						</div>
					</div>
				</div>

				{/* ─── Categories ──────────────────────────────────────────── */}
				<div className="flex flex-wrap items-center justify-center gap-2 py-6">
					<button
						onClick={() => setSelectedCategory(null)}
						className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
							!selectedCategory
								? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
								: "border-white/10 text-zinc-400 hover:border-white/20"
						}`}
					>
						All
					</button>
					{categories.map((cat) => (
						<button
							key={cat.id}
							onClick={() => setSelectedCategory(cat.id)}
							className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
								selectedCategory === cat.id
									? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
									: "border-white/10 text-zinc-400 hover:border-white/20"
							}`}
						>
							{cat.icon}
							{cat.label}
						</button>
					))}
				</div>

				{/* ─── Featured Post ───────────────────────────────────────── */}
				{featured && (
					<div className="mb-8">
						<div
							onClick={() => setSelectedPost(featured)}
							className="group relative bg-zinc-950/40 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all cursor-pointer"
						>
							<div className="p-6 sm:p-8">
								<span
									className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${getCategoryColor(featured.category)}`}
								>
									{getCategoryIcon(featured.category)}
									{getCategoryLabel(featured.category)}
								</span>
								<h2 className="text-xl sm:text-2xl font-bold text-white mt-3 group-hover:text-emerald-400 transition-colors">
									{featured.title}
								</h2>
								<p className="text-sm text-zinc-400 mt-2 max-w-2xl">
									{featured.excerpt}
								</p>
								<div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 mt-4">
									<span className="flex items-center gap-1.5">
										<User className="h-3.5 w-3.5" />
										{featured.author_name}
									</span>
									<span className="flex items-center gap-1.5">
										<Calendar className="h-3.5 w-3.5" />
										{formatDate(featured.published_at)}
									</span>
									<span className="flex items-center gap-1.5">
										<Clock className="h-3.5 w-3.5" />
										{featured.read_time} min read
									</span>
								</div>
								<div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
									<span className="flex items-center gap-1">
										<Eye className="h-3.5 w-3.5" />
										{featured.views}
									</span>
									<span className="flex items-center gap-1">
										<Heart className="h-3.5 w-3.5" />
										{featured.likes}
									</span>
								</div>
								<div className="mt-4 text-emerald-400 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
									Read More <ArrowRight className="h-4 w-4" />
								</div>
							</div>
						</div>
					</div>
				)}

				{/* ─── Posts Grid ──────────────────────────────────────────── */}
				{paginatedPosts.length === 0 ? (
					<div className="text-center py-12">
						<BookOpen className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
						<p className="text-sm text-zinc-400">
							No posts found matching your criteria.
						</p>
						<button
							onClick={() => {
								setSearchQuery("");
								setSelectedCategory(null);
							}}
							className="text-emerald-400 text-sm hover:underline mt-2"
						>
							Clear filters
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{paginatedPosts.map((post) => (
							<div
								key={post.id}
								onClick={() => setSelectedPost(post)}
								className="group bg-zinc-950/40 border border-white/5 rounded-xl overflow-hidden hover:border-white/15 transition-all cursor-pointer"
							>
								{post.featured_image && (
									<div className="aspect-[16/9] bg-zinc-900 overflow-hidden">
										<img
											src={post.featured_image}
											alt={post.title}
											className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
										/>
									</div>
								)}
								<div className="p-4">
									<span
										className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(post.category)}`}
									>
										{getCategoryIcon(post.category)}
										{getCategoryLabel(post.category)}
									</span>
									<h3 className="text-sm font-bold text-white mt-2 group-hover:text-emerald-400 transition-colors line-clamp-2">
										{post.title}
									</h3>
									<p className="text-xs text-zinc-400 mt-1.5 line-clamp-2">
										{post.excerpt}
									</p>
									<div className="flex items-center justify-between mt-3 text-[10px] text-zinc-500">
										<div className="flex items-center gap-3">
											<span className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												{formatDate(post.published_at)}
											</span>
											<span className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												{post.read_time}m
											</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="flex items-center gap-1">
												<Eye className="h-3 w-3" />
												{post.views}
											</span>
											<span className="flex items-center gap-1">
												<Heart className="h-3 w-3" />
												{post.likes}
											</span>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* ─── Pagination ──────────────────────────────────────────── */}
				{totalPages > 1 && (
					<div className="flex items-center justify-center gap-2 pt-8">
						<button
							onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}
							className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
						>
							<ChevronLeft className="h-4 w-4" />
						</button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<button
								key={page}
								onClick={() => setCurrentPage(page)}
								className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
									currentPage === page
										? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
										: "text-zinc-400 hover:text-white hover:bg-white/5"
								}`}
							>
								{page}
							</button>
						))}
						<button
							onClick={() =>
								setCurrentPage(Math.min(totalPages, currentPage + 1))
							}
							disabled={currentPage === totalPages}
							className="p-2 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
						>
							<ChevronRight className="h-4 w-4" />
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

export default BlogsPage;
