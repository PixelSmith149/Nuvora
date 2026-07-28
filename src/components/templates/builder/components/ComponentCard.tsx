"use client";

import {
	Activity,
	Activity as ActivityIcon,
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	Anchor,
	Archive,
	Balloon,
	Bandage,
	BarChart3,
	Battery,
	BatteryCharging,
	BatteryFull,
	BatteryLow,
	Bell,
	Bike,
	Bluetooth,
	Bold,
	Box,
	Brush,
	Building,
	Bus,
	Cake,
	Camera,
	Camera as CameraIcon,
	Car,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	Clapperboard,
	Clock,
	Cloud,
	CloudDrizzle,
	CloudFog,
	CloudHail,
	Cloud as CloudIcon,
	CloudLightning,
	CloudRain,
	CloudSnow,
	Code2,
	Coffee,
	Columns,
	Compass,
	Compass as CompassIcon,
	Container,
	Copy,
	Cpu,
	Crop,
	Crown,
	Database,
	Diamond,
	DollarSign,
	Download,
	Droplet,
	Droplets,
	Edit,
	Eraser,
	Eye,
	File,
	FileAudio,
	FileCode,
	FileImage,
	FileJson,
	FileMinus,
	FilePlus,
	FileText as FileTextIcon,
	FileVideo,
	Film,
	Filter,
	Flag,
	Flame,
	FlipHorizontal,
	FlipVertical,
	Flower,
	Folder,
	FolderMinus,
	FolderOpen,
	FolderPlus,
	Frame,
	Gem,
	Gift,
	Globe2,
	Grid,
	HardDrive,
	Headphones,
	Heart,
	HeartPulse,
	Home,
	Home as HomeIcon,
	Hotel,
	Image,
	ImageOff,
	ImagePlus,
	Italic,
	Laptop,
	LayoutDashboard,
	LayoutTemplate,
	LineChart,
	Link,
	Link2,
	List,
	ListOrdered,
	LogIn,
	LogOut,
	Mail,
	Map,
	MapPin,
	Maximize2,
	Menu,
	MessageSquare,
	Mic,
	MicOff,
	Minimize2,
	Monitor,
	Moon,
	Moon as MoonIcon,
	MoreHorizontal,
	MoreVertical,
	Mountain,
	Move,
	Music2,
	PaintBucket,
	Palette,
	Pencil,
	PenTool,
	Phone,
	PieChart,
	Pill,
	Pizza,
	Plane,
	Plug,
	Plus,
	Power,
	Redo,
	RefreshCw,
	RotateCcw,
	RotateCw,
	Rows,
	Ruler,
	Save,
	Scissors,
	Scissors as ScissorsIcon,
	Search,
	Send,
	Server,
	Settings,
	Settings as SettingsIcon,
	Share2,
	Ship,
	ShoppingCart,
	Sliders,
	Smartphone,
	Snowflake,
	Speaker,
	Star,
	Stethoscope,
	Sun,
	Sun as SunIcon,
	Syringe,
	Tablet,
	Theater,
	Thermometer,
	ToggleLeft,
	ToggleRight,
	Train,
	Trash2,
	TrendingUp,
	Tv,
	Type,
	Umbrella,
	Underline,
	Undo,
	Upload,
	Usb,
	User,
	UserCheck,
	UserMinus,
	UserPlus,
	Users,
	Utensils,
	Video,
	Video as VideoIcon,
	VideoOff,
	Volume2,
	VolumeX,
	Watch,
	Wifi,
	Wind,
	Wind as WindIcon,
	Zap as ZapIcon,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "@/lib/use-toast";
import { useBuilder } from "../core/BuilderProvider";
import { COMPONENT_CATEGORIES } from "./ComponentLibrary";

// ─── All Components Data ───────────────────────────────────────────────
const ALL_COMPONENTS = [
	// ─── Layout ──────────────────────────────────────────────────────────
	{
		id: "container",
		name: "Container",
		category: "layout",
		icon: Container,
		description: "Centered container with max-width",
		html: '<div class="container">\n  <!-- Content -->\n</div>',
		css: ".container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 0 20px;\n}",
	},
	{
		id: "grid-3",
		name: "3-Column Grid",
		category: "layout",
		icon: Grid,
		description: "Responsive 3-column grid",
		html: '<div class="grid-3">\n  <div class="grid-item">1</div>\n  <div class="grid-item">2</div>\n  <div class="grid-item">3</div>\n</div>',
		css: ".grid-3 {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 24px;\n}\n@media (max-width: 768px) {\n  .grid-3 {\n    grid-template-columns: 1fr;\n  }\n}",
	},
	{
		id: "flex-row",
		name: "Flex Row",
		category: "layout",
		icon: Columns,
		description: "Flexbox row layout",
		html: '<div class="flex-row">\n  <div>Item 1</div>\n  <div>Item 2</div>\n  <div>Item 3</div>\n</div>',
		css: ".flex-row {\n  display: flex;\n  gap: 16px;\n  flex-wrap: wrap;\n}\n.flex-row > * {\n  flex: 1;\n  min-width: 200px;\n}",
	},
	{
		id: "flex-column",
		name: "Flex Column",
		category: "layout",
		icon: Rows,
		description: "Flexbox column layout",
		html: '<div class="flex-col">\n  <div>Item 1</div>\n  <div>Item 2</div>\n  <div>Item 3</div>\n</div>',
		css: ".flex-col {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}",
	},
	{
		id: "sidebar-layout",
		name: "Sidebar Layout",
		category: "layout",
		icon: Frame,
		description: "Main content with sidebar",
		html: '<div class="sidebar-layout">\n  <aside class="sidebar">Sidebar</aside>\n  <main class="main-content">Main Content</main>\n</div>',
		css: ".sidebar-layout {\n  display: grid;\n  grid-template-columns: 280px 1fr;\n  gap: 24px;\n}\n@media (max-width: 768px) {\n  .sidebar-layout {\n    grid-template-columns: 1fr;\n  }\n}",
	},
	{
		id: "hero-centered",
		name: "Centered Hero",
		category: "hero",
		icon: LayoutDashboard,
		description: "Hero with centered content",
		html: '<section class="hero-centered">\n  <h1>Hero Title</h1>\n  <p>Hero subtitle goes here</p>\n  <button class="btn-primary">Get Started</button>\n</section>',
		css: ".hero-centered {\n  text-align: center;\n  padding: 80px 20px;\n  max-width: 800px;\n  margin: 0 auto;\n}\n.hero-centered h1 {\n  font-size: 3rem;\n  margin-bottom: 1rem;\n}\n.hero-centered p {\n  font-size: 1.25rem;\n  color: #666;\n  margin-bottom: 2rem;\n}",
	},
	{
		id: "hero-split",
		name: "Split Hero",
		category: "hero",
		icon: LayoutDashboard,
		description: "Hero with text and image split",
		html: '<section class="hero-split">\n  <div class="hero-text">\n    <h1>Hero Title</h1>\n    <p>Hero subtitle goes here</p>\n    <button class="btn-primary">Get Started</button>\n  </div>\n  <div class="hero-image">\n    <img src="/placeholder.jpg" alt="Hero" />\n  </div>\n</section>',
		css: ".hero-split {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 40px;\n  align-items: center;\n  padding: 60px 20px;\n}\n@media (max-width: 768px) {\n  .hero-split {\n    grid-template-columns: 1fr;\n  }\n}",
	},
	{
		id: "hero-video",
		name: "Video Hero",
		category: "hero",
		icon: Video,
		description: "Hero with video background",
		html: '<section class="hero-video">\n  <video autoplay muted loop>\n    <source src="hero.mp4" type="video/mp4" />\n  </video>\n  <div class="hero-overlay">\n    <h1>Hero Title</h1>\n    <p>Hero subtitle goes here</p>\n    <button class="btn-primary">Get Started</button>\n  </div>\n</section>',
		css: ".hero-video {\n  position: relative;\n  overflow: hidden;\n  min-height: 500px;\n}\n.hero-video video {\n  position: absolute;\n  inset: 0;\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n.hero-overlay {\n  position: relative;\n  z-index: 1;\n  text-align: center;\n  padding: 80px 20px;\n  color: white;\n  background: rgba(0,0,0,0.4);\n}",
	},

	// ─── Navigation ──────────────────────────────────────────────────────
	{
		id: "navbar-basic",
		name: "Basic Navbar",
		category: "navigation",
		icon: Menu,
		description: "Simple navigation bar",
		html: '<nav class="navbar">\n  <a href="#" class="logo">Logo</a>\n  <div class="nav-links">\n    <a href="#">Home</a>\n    <a href="#">About</a>\n    <a href="#">Services</a>\n    <a href="#">Contact</a>\n  </div>\n</nav>',
		css: ".navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 20px;\n  background: white;\n  border-bottom: 1px solid #eee;\n}\n.nav-links {\n  display: flex;\n  gap: 24px;\n}\n.nav-links a {\n  color: #333;\n  text-decoration: none;\n}",
	},
	{
		id: "navbar-glass",
		name: "Glass Navbar",
		category: "navigation",
		icon: Menu,
		description: "Frosted glass navigation",
		html: '<nav class="navbar-glass">\n  <a href="#" class="logo">Logo</a>\n  <div class="nav-links">\n    <a href="#">Home</a>\n    <a href="#">About</a>\n    <a href="#">Services</a>\n    <a href="#">Contact</a>\n  </div>\n</nav>',
		css: ".navbar-glass {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 24px;\n  background: rgba(255,255,255,0.1);\n  backdrop-filter: blur(20px);\n  border-bottom: 1px solid rgba(255,255,255,0.1);\n}\n.navbar-glass a {\n  color: white;\n  text-decoration: none;\n}",
	},
	{
		id: "navbar-mobile",
		name: "Mobile Navbar",
		category: "navigation",
		icon: Smartphone,
		description: "Mobile-friendly hamburger menu",
		html: '<nav class="navbar-mobile">\n  <a href="#" class="logo">Logo</a>\n  <button class="hamburger">☰</button>\n  <div class="mobile-menu">\n    <a href="#">Home</a>\n    <a href="#">About</a>\n    <a href="#">Services</a>\n    <a href="#">Contact</a>\n  </div>\n</nav>',
		css: ".navbar-mobile {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 16px 20px;\n}\n.hamburger {\n  background: none;\n  border: none;\n  font-size: 24px;\n  cursor: pointer;\n}\n.mobile-menu {\n  display: none;\n  flex-direction: column;\n  gap: 12px;\n  padding: 16px;\n}\n.mobile-menu.open {\n  display: flex;\n}",
	},

	// ─── Content ─────────────────────────────────────────────────────────
	{
		id: "card-basic",
		name: "Basic Card",
		category: "content",
		icon: Box,
		description: "Simple card with content",
		html: '<div class="card">\n  <div class="card-image">\n    <img src="/placeholder.jpg" alt="Card" />\n  </div>\n  <div class="card-content">\n    <h3>Card Title</h3>\n    <p>Card description goes here</p>\n    <a href="#" class="card-link">Learn More →</a>\n  </div>\n</div>',
		css: ".card {\n  background: white;\n  border-radius: 12px;\n  overflow: hidden;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.08);\n  transition: transform 0.3s ease;\n}\n.card:hover {\n  transform: translateY(-4px);\n}\n.card-content {\n  padding: 20px;\n}\n.card-link {\n  color: #10b981;\n  text-decoration: none;\n  font-weight: 600;\n}",
	},
	{
		id: "card-glass",
		name: "Glass Card",
		category: "content",
		icon: Box,
		description: "Frosted glass card",
		html: '<div class="card-glass">\n  <h3>Glass Card</h3>\n  <p>Card with glassmorphism effect</p>\n</div>',
		css: ".card-glass {\n  background: rgba(255,255,255,0.05);\n  backdrop-filter: blur(20px);\n  border: 1px solid rgba(255,255,255,0.1);\n  border-radius: 16px;\n  padding: 24px;\n  box-shadow: 0 8px 32px rgba(0,0,0,0.2);\n}",
	},
	{
		id: "card-hover",
		name: "Hover Card",
		category: "content",
		icon: Box,
		description: "Card with hover effects",
		html: '<div class="card-hover">\n  <h3>Hover Me</h3>\n  <p>Hover to see the effect</p>\n</div>',
		css: ".card-hover {\n  padding: 24px;\n  border-radius: 12px;\n  background: white;\n  transition: all 0.3s ease;\n  cursor: pointer;\n}\n.card-hover:hover {\n  transform: scale(1.02);\n  box-shadow: 0 8px 30px rgba(0,0,0,0.12);\n}",
	},
	{
		id: "testimonial",
		name: "Testimonial",
		category: "content",
		icon: Star,
		description: "Customer testimonial block",
		html: '<div class="testimonial">\n  <div class="stars">★★★★★</div>\n  <p>"Great service! Highly recommended."</p>\n  <div class="testimonial-author">\n    <img src="/avatar.jpg" alt="Author" />\n    <div>\n      <strong>John Doe</strong>\n      <span>CEO, Company</span>\n    </div>\n  </div>\n</div>',
		css: ".testimonial {\n  padding: 24px;\n  border-radius: 12px;\n  background: white;\n  box-shadow: 0 4px 20px rgba(0,0,0,0.06);\n}\n.stars {\n  color: #f59e0b;\n  font-size: 20px;\n  margin-bottom: 12px;\n}\n.testimonial-author {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  margin-top: 16px;\n}\n.testimonial-author img {\n  width: 48px;\n  height: 48px;\n  border-radius: 50%;\n}",
	},
	{
		id: "pricing-table",
		name: "Pricing Table",
		category: "content",
		icon: DollarSign,
		description: "Pricing plan comparison",
		html: '<div class="pricing">\n  <div class="pricing-card">\n    <h3>Basic</h3>\n    <div class="price">$19/mo</div>\n    <ul>\n      <li>Feature 1</li>\n      <li>Feature 2</li>\n      <li>Feature 3</li>\n    </ul>\n    <button class="btn-primary">Choose Plan</button>\n  </div>\n</div>',
		css: ".pricing-card {\n  padding: 24px;\n  border-radius: 12px;\n  background: white;\n  border: 1px solid #eee;\n  text-align: center;\n}\n.price {\n  font-size: 2rem;\n  font-weight: bold;\n  margin: 16px 0;\n}\n.pricing-card ul {\n  list-style: none;\n  padding: 0;\n  margin: 16px 0;\n}\n.pricing-card li {\n  padding: 8px 0;\n  border-bottom: 1px solid #f0f0f0;\n}",
	},

	// ─── Forms ──────────────────────────────────────────────────────────
	{
		id: "contact-form",
		name: "Contact Form",
		category: "forms",
		icon: Mail,
		description: "Full contact form with fields",
		html: '<form class="contact-form">\n  <div class="form-group">\n    <label>Name</label>\n    <input type="text" placeholder="Your name" />\n  </div>\n  <div class="form-group">\n    <label>Email</label>\n    <input type="email" placeholder="your@email.com" />\n  </div>\n  <div class="form-group">\n    <label>Message</label>\n    <textarea rows="4" placeholder="Your message"></textarea>\n  </div>\n  <button type="submit" class="btn-primary">Send Message</button>\n</form>',
		css: ".form-group {\n  margin-bottom: 16px;\n}\n.form-group label {\n  display: block;\n  margin-bottom: 4px;\n  font-weight: 600;\n}\n.form-group input,\n.form-group textarea {\n  width: 100%;\n  padding: 10px 12px;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n  font-size: 16px;\n}\n.form-group input:focus,\n.form-group textarea:focus {\n  outline: none;\n  border-color: #10b981;\n}",
	},
	{
		id: "newsletter",
		name: "Newsletter Signup",
		category: "forms",
		icon: Send,
		description: "Email newsletter subscription",
		html: '<div class="newsletter">\n  <h3>Subscribe to Newsletter</h3>\n  <p>Get the latest updates</p>\n  <form class="newsletter-form">\n    <input type="email" placeholder="Enter your email" />\n    <button type="submit">Subscribe</button>\n  </form>\n</div>',
		css: ".newsletter {\n  text-align: center;\n  padding: 40px 20px;\n  background: #f8f9fa;\n  border-radius: 12px;\n}\n.newsletter-form {\n  display: flex;\n  max-width: 500px;\n  margin: 16px auto 0;\n}\n.newsletter-form input {\n  flex: 1;\n  padding: 12px 16px;\n  border: 1px solid #ddd;\n  border-radius: 8px 0 0 8px;\n}\n.newsletter-form button {\n  padding: 12px 24px;\n  background: #10b981;\n  color: white;\n  border: none;\n  border-radius: 0 8px 8px 0;\n  cursor: pointer;\n}",
	},

	// ─── E-commerce ──────────────────────────────────────────────────────
	{
		id: "product-grid",
		name: "Product Grid",
		category: "ecommerce",
		icon: ShoppingCart,
		description: "E-commerce product grid",
		html: '<div class="product-grid">\n  <div class="product-card">\n    <img src="/product.jpg" alt="Product" />\n    <h4>Product Name</h4>\n    <div class="price">$49.99</div>\n    <button>Add to Cart</button>\n  </div>\n  <div class="product-card">\n    <img src="/product.jpg" alt="Product" />\n    <h4>Product Name</h4>\n    <div class="price">$49.99</div>\n    <button>Add to Cart</button>\n  </div>\n  <div class="product-card">\n    <img src="/product.jpg" alt="Product" />\n    <h4>Product Name</h4>\n    <div class="price">$49.99</div>\n    <button>Add to Cart</button>\n  </div>\n</div>',
		css: ".product-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));\n  gap: 24px;\n}\n.product-card {\n  text-align: center;\n  padding: 16px;\n  border-radius: 12px;\n  background: white;\n  border: 1px solid #eee;\n  transition: all 0.3s ease;\n}\n.product-card:hover {\n  transform: translateY(-4px);\n  box-shadow: 0 8px 30px rgba(0,0,0,0.08);\n}\n.product-card img {\n  width: 100%;\n  height: 200px;\n  object-fit: cover;\n  border-radius: 8px;\n}\n.price {\n  font-size: 1.25rem;\n  font-weight: bold;\n  margin: 8px 0;\n}",
	},

	// ─── Media ──────────────────────────────────────────────────────────
	{
		id: "image-gallery",
		name: "Image Gallery",
		category: "media",
		icon: Image,
		description: "Responsive image gallery",
		html: '<div class="gallery">\n  <div class="gallery-item"><img src="/img1.jpg" alt="Gallery 1" /></div>\n  <div class="gallery-item"><img src="/img2.jpg" alt="Gallery 2" /></div>\n  <div class="gallery-item"><img src="/img3.jpg" alt="Gallery 3" /></div>\n  <div class="gallery-item"><img src="/img4.jpg" alt="Gallery 4" /></div>\n</div>',
		css: ".gallery {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\n  gap: 12px;\n}\n.gallery-item {\n  aspect-ratio: 1;\n  overflow: hidden;\n  border-radius: 8px;\n}\n.gallery-item img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n  transition: transform 0.3s ease;\n}\n.gallery-item:hover img {\n  transform: scale(1.05);\n}",
	},
	{
		id: "video-embed",
		name: "Video Embed",
		category: "media",
		icon: Video,
		description: "Responsive video embed",
		html: '<div class="video-wrapper">\n  <iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>\n</div>',
		css: ".video-wrapper {\n  position: relative;\n  padding-bottom: 56.25%;\n  height: 0;\n  overflow: hidden;\n  border-radius: 12px;\n}\n.video-wrapper iframe {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}",
	},

	// ─── Interaction ────────────────────────────────────────────────────
	{
		id: "accordion",
		name: "Accordion",
		category: "interaction",
		icon: ChevronDown,
		description: "Expandable accordion sections",
		html: '<div class="accordion">\n  <div class="accordion-item">\n    <button class="accordion-header">Section 1</button>\n    <div class="accordion-content">\n      <p>Content for section 1</p>\n    </div>\n  </div>\n  <div class="accordion-item">\n    <button class="accordion-header">Section 2</button>\n    <div class="accordion-content">\n      <p>Content for section 2</p>\n    </div>\n  </div>\n</div>',
		css: ".accordion-item {\n  border-bottom: 1px solid #eee;\n}\n.accordion-header {\n  width: 100%;\n  padding: 16px;\n  background: none;\n  border: none;\n  cursor: pointer;\n  font-size: 16px;\n  font-weight: 600;\n  text-align: left;\n}\n.accordion-content {\n  padding: 0 16px 16px;\n  display: none;\n}\n.accordion-content.open {\n  display: block;\n}",
	},
	{
		id: "tabs",
		name: "Tabs",
		category: "interaction",
		icon: LayoutTemplate,
		description: "Tabbed content navigation",
		html: '<div class="tabs">\n  <div class="tab-headers">\n    <button class="tab-btn active">Tab 1</button>\n    <button class="tab-btn">Tab 2</button>\n    <button class="tab-btn">Tab 3</button>\n  </div>\n  <div class="tab-content active">Content for Tab 1</div>\n  <div class="tab-content">Content for Tab 2</div>\n  <div class="tab-content">Content for Tab 3</div>\n</div>',
		css: ".tab-headers {\n  display: flex;\n  border-bottom: 2px solid #eee;\n}\n.tab-btn {\n  padding: 12px 24px;\n  background: none;\n  border: none;\n  cursor: pointer;\n  font-weight: 600;\n  color: #666;\n}\n.tab-btn.active {\n  color: #10b981;\n  border-bottom: 2px solid #10b981;\n}\n.tab-content {\n  display: none;\n  padding: 16px 0;\n}\n.tab-content.active {\n  display: block;\n}",
	},

	// ─── Advanced ──────────────────────────────────────────────────────
	{
		id: "animated-counter",
		name: "Animated Counter",
		category: "advanced",
		icon: TrendingUp,
		description: "Number counter with animation",
		html: '<div class="counter">\n  <span class="counter-number" data-target="1000">0</span>\n  <span class="counter-label">Happy Customers</span>\n</div>',
		css: ".counter {\n  text-align: center;\n}\n.counter-number {\n  display: block;\n  font-size: 3rem;\n  font-weight: bold;\n}",
		js: 'document.addEventListener("DOMContentLoaded", function() {\n  const counters = document.querySelectorAll(".counter-number");\n  counters.forEach(counter => {\n    const target = parseInt(counter.dataset.target);\n    const increment = target / 100;\n    let current = 0;\n    const timer = setInterval(() => {\n      current += increment;\n      if (current >= target) {\n        counter.textContent = target;\n        clearInterval(timer);\n      } else {\n        counter.textContent = Math.floor(current);\n      }\n    }, 20);\n  });\n});',
	},
];

// ─── Component Card ─────────────────────────────────────────────────────
interface ComponentCardProps {
	category: string;
	searchQuery: string;
	viewMode: "grid" | "list";
}

export function ComponentCard({
	category,
	searchQuery,
	viewMode,
}: ComponentCardProps) {
	const [expandedId, setExpandedId] = useState<string | null>(null);
	const { htmlCode, cssCode, jsCode, setHtmlCode, setCssCode, setJsCode } =
		useBuilder();
	const filteredComponents = ALL_COMPONENTS.filter((comp) => {
		const matchesCategory = category === "all" || comp.category === category;
		const matchesSearch =
			comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			comp.description.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesCategory && matchesSearch;
	});

	const handleInsert = (component: (typeof ALL_COMPONENTS)[0]) => {
		const componentMarker = `<!-- ${component.name} -->`;
		const cssMarker = `/* ${component.name} */`;
		const jsMarker = `// ${component.name}`;

		// ─── Check if component already exists ─────────────────────────────
		if (htmlCode.includes(componentMarker)) {
			toast({
				title: "Component Already Added",
				description: `"${component.name}" is already in your template`,
				variant: "warning",
			});
			return;
		}

		// ─── Insert HTML ────────────────────────────────────────────────────
		setHtmlCode(htmlCode + "\n\n" + componentMarker + "\n" + component.html);

		// ─── Insert CSS if present and not already added ──────────────────
		if (component.css && !cssCode.includes(cssMarker)) {
			setCssCode(cssCode + "\n\n" + cssMarker + "\n" + component.css);
		}

		// ─── Insert JS if present and not already added ───────────────────
		if (component.js && !jsCode.includes(jsMarker)) {
			setJsCode(jsCode + "\n\n" + jsMarker + "\n" + component.js);
		}

		toast({
			title: "✅ Component Added",
			description: `"${component.name}" inserted successfully`,
			variant: "success",
		});
	};

	const handlePreview = (component: (typeof ALL_COMPONENTS)[0]) => {
		setExpandedId(expandedId === component.id ? null : component.id);
	};

	if (filteredComponents.length === 0) {
		return (
			<div className="text-center py-8 text-zinc-500 text-sm">
				No components found matching your criteria
			</div>
		);
	}

	return (
		<>
			{filteredComponents.map((component) => {
				const Icon = component.icon;
				const isExpanded = expandedId === component.id;

				if (viewMode === "grid") {
					return (
						<div
							key={component.id}
							className="bg-black/50 border border-white/5 rounded-xl p-3 hover:border-white/15 transition-all group"
						>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-2">
									<div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
										<Icon className="h-4 w-4 text-emerald-400" />
									</div>
									<div className="min-w-0">
										<p className="text-xs font-bold text-white truncate">
											{component.name}
										</p>
										<p className="text-[10px] text-zinc-500 truncate">
											{component.description}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
									<button
										onClick={() => handlePreview(component)}
										className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
										title="Preview"
									>
										<Eye className="h-3.5 w-3.5" />
									</button>
									<button
										onClick={() => handleInsert(component)}
										className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors"
										title="Insert component"
									>
										<Plus className="h-3.5 w-3.5" />
									</button>
								</div>
							</div>

							{isExpanded && (
								<div className="mt-2 p-2 bg-black rounded-lg border border-white/5">
									<pre className="text-[10px] text-zinc-400 font-mono whitespace-pre-wrap max-h-[150px] overflow-auto">
										{component.html}
									</pre>
									<div className="flex items-center gap-2 mt-1.5">
										<button
											onClick={() => handleInsert(component)}
											className="flex-1 text-center text-[10px] py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
										>
											Insert Component
										</button>
										<button
											onClick={() => setExpandedId(null)}
											className="text-[10px] py-1 px-2 text-zinc-500 hover:text-white transition-colors"
										>
											Close
										</button>
									</div>
								</div>
							)}
						</div>
					);
				}

				// ─── List View ──────────────────────────────────────────────────
				return (
					<div
						key={component.id}
						className="bg-black/50 border border-white/5 rounded-xl p-2 hover:border-white/15 transition-all group flex items-center gap-3"
					>
						<div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
							<Icon className="h-3.5 w-3.5 text-emerald-400" />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-xs font-bold text-white truncate">
								{component.name}
							</p>
							<p className="text-[10px] text-zinc-500 truncate">
								{component.description}
							</p>
						</div>
						<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
							<button
								onClick={() => handlePreview(component)}
								className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
								title="Preview"
							>
								<Eye className="h-3.5 w-3.5" />
							</button>
							<button
								onClick={() => handleInsert(component)}
								className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 transition-colors"
								title="Insert component"
							>
								<Plus className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>
				);
			})}
		</>
	);
}
