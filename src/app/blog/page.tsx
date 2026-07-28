// app/blog/page.tsx

import BlogsPage from "@/components/BlogsPage";

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

const posts: BlogPost[] = [
	/* ... */
];

export default function BlogRoute() {
	return <BlogsPage posts={posts} />;
}
