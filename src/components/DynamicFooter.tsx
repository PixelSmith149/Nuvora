import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

// Types
interface FooterLink {
	href: string;
	label: string;
}

interface Character {
	id: number;
	type: "coder" | "hacker" | "cyber" | "matrix";
	delay: number;
	x: number;
	y: number;
}

interface CyberCharacterProps {
	type: "coder" | "hacker" | "cyber" | "matrix";
	delay?: number;
}

// Cyber Character Component
const CyberCharacter: React.FC<CyberCharacterProps> = ({ type, delay = 0 }) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const animationRef = useRef<number | undefined>(undefined);
	const frameCountRef = useRef<number>(0);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const drawCoder = (
			context: CanvasRenderingContext2D,
			w: number,
			h: number,
			frame: number,
		) => {
			const bodyY = 20 + Math.sin(frame * 0.05) * 2;

			// Glowing aura
			const gradient = context.createRadialGradient(
				w / 2,
				h / 2,
				5,
				w / 2,
				h / 2,
				30,
			);
			if (gradient) {
				gradient.addColorStop(0, "rgba(0, 255, 200, 0.15)");
				gradient.addColorStop(1, "rgba(0, 255, 200, 0)");
				context.fillStyle = gradient;
				context.fillRect(0, 0, w, h);
			}

			context.shadowColor = "#00ffc8";
			context.shadowBlur = 10;

			// Body
			context.fillStyle = "#1a1a2e";
			context.fillRect(w / 2 - 12, bodyY + 15, 24, 20);

			// Head
			context.fillRect(w / 2 - 10, bodyY, 20, 18);

			// Visor
			context.shadowBlur = 20;
			context.fillStyle = "#00ffc8";
			context.fillRect(w / 2 - 8, bodyY + 4, 16, 4);

			// Scan line
			const scanY = 4 + (Math.sin(frame * 0.08) * 0.5 + 0.5) * 8;
			context.fillStyle = "rgba(0, 255, 200, 0.3)";
			context.fillRect(w / 2 - 7, bodyY + scanY, 14, 2);

			// Arms
			context.shadowBlur = 5;
			context.fillStyle = "#1a1a2e";
			const armSwing = Math.sin(frame * 0.1) * 3;
			context.fillRect(w / 2 - 18, bodyY + 18 + armSwing, 6, 10);
			context.fillRect(w / 2 + 12, bodyY + 18 - armSwing, 6, 10);

			// Floating code
			context.shadowBlur = 15;
			context.fillStyle = "#00ffc8";
			context.font = "8px monospace";
			const code = ["0", "1", "<", "/", ">", "{", "}", "(", ")"];
			for (let i = 0; i < 3; i++) {
				const x = 5 + i * 15 + Math.sin(frame * 0.05 + i) * 2;
				const y = 5 + Math.sin(frame * 0.07 + i * 2) * 3;
				context.globalAlpha = 0.3 + Math.sin(frame * 0.05 + i) * 0.2;
				context.fillText(code[(frame + i) % code.length], x, y + 8);
			}
			context.globalAlpha = 1;
			context.shadowBlur = 0;
		};

		const drawHacker = (
			context: CanvasRenderingContext2D,
			w: number,
			h: number,
			frame: number,
		) => {
			context.shadowColor = "#ff00ff";
			context.shadowBlur = 15;

			// Hood
			context.fillStyle = "#0a0a0f";
			context.beginPath();
			context.arc(w / 2, 18, 12, 0, Math.PI * 2);
			context.fill();

			// Eyes
			context.shadowBlur = 25;
			context.fillStyle = "#ff00ff";
			const eyeOffset = Math.sin(frame * 0.03) * 2;
			context.fillRect(w / 2 - 7 + eyeOffset, 15, 3, 3);
			context.fillRect(w / 2 + 4 - eyeOffset, 15, 3, 3);

			// Matrix rain
			context.shadowBlur = 10;
			context.fillStyle = "#00ff41";
			context.font = "6px monospace";
			for (let i = 0; i < 8; i++) {
				const x = 2 + i * 7;
				const y = 25 + ((frame * 2 + i * 10) % 20);
				context.globalAlpha = 0.2 + Math.sin(frame * 0.1 + i) * 0.15;
				const charCode = 0x30a0 + Math.floor(Math.random() * 96);
				context.fillText(String.fromCharCode(charCode), x, y);
			}
			context.globalAlpha = 1;

			// Glitch
			if (Math.sin(frame * 0.2) > 0.95) {
				context.fillStyle = "rgba(255, 0, 255, 0.1)";
				context.fillRect(0, Math.random() * h, w, 2);
			}

			context.shadowBlur = 0;
		};

		const drawCyberPunk = (
			context: CanvasRenderingContext2D,
			w: number,
			h: number,
			frame: number,
		) => {
			const pulse = Math.sin(frame * 0.05) * 0.5 + 0.5;

			context.shadowColor = "#00ffff";
			context.shadowBlur = 20;

			// Armor body
			const gradient = context.createLinearGradient(0, 0, 0, h);
			if (gradient) {
				gradient.addColorStop(0, "#0a1628");
				gradient.addColorStop(1, "#1a0a2e");
				context.fillStyle = gradient;
				context.fillRect(w / 2 - 14, 20, 28, 22);
			}

			// Neon trim
			context.shadowBlur = 30;
			context.strokeStyle = `hsl(${180 + pulse * 60}, 100%, 50%)`;
			context.lineWidth = 1;
			context.strokeRect(w / 2 - 14, 20, 28, 22);

			// Helmet
			context.fillStyle = "#0a1628";
			context.beginPath();
			context.arc(w / 2, 15, 10, 0, Math.PI * 2);
			context.fill();
			context.strokeStyle = `hsl(${200 + pulse * 40}, 100%, 50%)`;
			context.lineWidth = 1.5;
			context.stroke();

			// Visor
			context.shadowBlur = 25;
			context.fillStyle = `rgba(0, 255, 255, ${0.3 + pulse * 0.4})`;
			const scanPos = (Math.sin(frame * 0.06) * 0.5 + 0.5) * 12;
			context.fillRect(w / 2 - 8, 12 + scanPos, 16, 2);

			// Energy particles
			context.shadowBlur = 15;
			for (let i = 0; i < 5; i++) {
				const angle = frame * 0.03 + i * 1.26;
				const radius = 18 + Math.sin(frame * 0.05 + i) * 3;
				context.fillStyle = `hsl(${180 + i * 30 + frame}, 100%, 50%)`;
				context.beginPath();
				context.arc(
					w / 2 + Math.cos(angle) * radius,
					h / 2 + Math.sin(angle) * radius * 0.4,
					1.5 + Math.sin(frame * 0.07 + i) * 0.5,
					0,
					Math.PI * 2,
				);
				context.fill();
			}

			context.shadowBlur = 0;
		};

		const drawMatrixAgent = (
			context: CanvasRenderingContext2D,
			w: number,
			h: number,
			frame: number,
		) => {
			context.shadowColor = "#00ff41";
			context.shadowBlur = 20;

			// Suit body
			context.fillStyle = "#0a0a0a";
			context.fillRect(w / 2 - 12, 18, 24, 24);

			// Head
			context.fillRect(w / 2 - 9, 10, 18, 12);

			// Sunglasses
			context.shadowBlur = 30;
			context.fillStyle = "#00ff41";
			context.fillRect(w / 2 - 8, 13, 7, 2);
			context.fillRect(w / 2 + 1, 13, 7, 2);

			// Digital rain
			context.shadowBlur = 10;
			context.fillStyle = "#00ff41";
			context.font = "5px monospace";
			for (let i = 0; i < 6; i++) {
				const x = 3 + i * 7;
				const y = 30 + ((frame * 1.5 + i * 8) % 20);
				context.globalAlpha = 0.1 + Math.sin(frame * 0.08 + i) * 0.1;
				const charCode = 0x30a0 + Math.floor(Math.random() * 96);
				context.fillText(String.fromCharCode(charCode), x, y);
			}
			context.globalAlpha = 1;

			// Glitch
			if (Math.sin(frame * 0.15) > 0.9) {
				context.fillStyle = "rgba(0, 255, 65, 0.05)";
				context.fillRect(0, Math.random() * h, w, 3);
			}

			context.shadowBlur = 0;
		};

		const drawCharacter = (
			context: CanvasRenderingContext2D,
			width: number,
			height: number,
			characterType: string,
			frame: number,
		) => {
			context.clearRect(0, 0, width, height);

			switch (characterType) {
				case "coder":
					drawCoder(context, width, height, frame);
					break;
				case "hacker":
					drawHacker(context, width, height, frame);
					break;
				case "cyber":
					drawCyberPunk(context, width, height, frame);
					break;
				case "matrix":
					drawMatrixAgent(context, width, height, frame);
					break;
				default:
					drawCoder(context, width, height, frame);
			}
		};

		const animate = () => {
			if (!canvasRef.current) return;
			const canvas = canvasRef.current;
			const context = canvas.getContext("2d");
			if (!context) return;

			frameCountRef.current += 1;
			drawCharacter(context, 60, 60, type, frameCountRef.current);
			animationRef.current = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [type]);

	return (
		<canvas
			ref={canvasRef}
			width={60}
			height={60}
			className="w-12 h-12 pixelated"
			style={{ imageRendering: "pixelated" }}
		/>
	);
};

// Main Footer Component
const Footer: React.FC = () => {
	const [shuffledLinks, setShuffledLinks] = useState<FooterLink[]>([]);
	const [characters, setCharacters] = useState<Character[]>([]);
	const [isHovering, setIsHovering] = useState<boolean>(false);
	const [statusText, setStatusText] = useState<string>("95");

	const footerLinks: FooterLink[] = [
		{ href: "/privacy-policy", label: "Privacy" },
		{ href: "/terms-of-service", label: "Terms" },
		{ href: "/support", label: "Support" },
	];

	const characterTypes: Array<"coder" | "hacker" | "cyber" | "matrix"> = [
		"coder",
		"hacker",
		"cyber",
		"matrix",
	];

	const shuffleLinks = useCallback(() => {
		const shuffled = [...footerLinks];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		setShuffledLinks(shuffled);
		// Update status text randomly
		setStatusText(Math.floor(800 + Math.random() * 20).toString());
	}, []);

	useEffect(() => {
		// Initial shuffle
		shuffleLinks();

		// Shuffle links every 3 seconds
		const shuffleInterval = setInterval(shuffleLinks, 3000);

		// Create character grid
		const grid: Character[] = [];
		for (let i = 0; i < 8; i++) {
			grid.push({
				id: i,
				type: characterTypes[i % characterTypes.length],
				delay: i * 0.3,
				x: (i % 4) * 16,
				y: Math.floor(i / 4) * 16,
			});
		}
		setCharacters(grid);

		return () => {
			clearInterval(shuffleInterval);
		};
	}, [shuffleLinks]);

	return (
		<footer className="relative border-t border-white/10 backdrop-blur-xl py-8 z-40 overflow-hidden">
			{/* Cyber Grid Background */}
			<div className="absolute inset-0 opacity-5 pointer-events-none">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `
              linear-gradient(rgba(0, 255, 200, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 200, 0.1) 1px, transparent 1px)
            `,
						backgroundSize: "30px 30px",
					}}
				/>
			</div>

			{/* Animated Scan Line */}
			<motion.div
				className="absolute inset-0 pointer-events-none"
				animate={{
					background: [
						"linear-gradient(180deg, transparent 0%, rgba(0,255,200,0.02) 50%, transparent 100%)",
						"linear-gradient(180deg, transparent 20%, rgba(0,255,200,0.05) 50%, transparent 80%)",
						"linear-gradient(180deg, transparent 0%, rgba(0,255,200,0.02) 50%, transparent 100%)",
					],
				}}
				transition={{ duration: 3, repeat: Infinity }}
			/>

			{/* Glitch Effect Overlay */}
			<motion.div
				className="absolute inset-0 pointer-events-none"
				animate={{
					opacity: [0, 0.01, 0, 0.02, 0],
				}}
				transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
				style={{
					background: "rgba(0, 255, 200, 0.03)",
					clipPath: "inset(0 0 0 0)",
				}}
			/>

			<div className="max-w-7xl mx-auto px-6 relative z-10">
				{/* Cyber Characters Row */}
				<div className="flex justify-center mb-6">
					<div className="grid grid-cols-4 gap-2">
						{characters.map((char: Character) => (
							<motion.div
								key={char.id}
								initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
								animate={{
									opacity: 1,
									scale: 1,
									rotate: 0,
									y: [0, -3, 0],
								}}
								transition={{
									delay: char.delay,
									duration: 0.5,
									y: {
										duration: 2,
										repeat: Infinity,
										delay: char.delay,
										ease: "easeInOut",
									},
								}}
								whileHover={{
									scale: 1.3,
									rotate: [0, -5, 5, 0],
									transition: { duration: 0.3 },
								}}
								className="relative"
							>
								<CyberCharacter type={char.type} delay={char.delay} />

								{/* Status LED */}
								<motion.div
									className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full"
									animate={{
										backgroundColor: ["#00ffc8", "#ff00ff", "#00ffc8"],
										boxShadow: [
											"0 0 5px #00ffc8",
											"0 0 10px #ff00ff",
											"0 0 5px #00ffc8",
										],
									}}
									transition={{ duration: 1.5, repeat: Infinity }}
								/>

								{/* Activity indicator */}
								<motion.div
									className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-0.5 bg-emerald-400/30 rounded"
									animate={{
										width: ["4px", "16px", "4px"],
										opacity: [0.3, 0.8, 0.3],
									}}
									transition={{
										duration: 1,
										repeat: Infinity,
										delay: char.delay,
									}}
								/>
							</motion.div>
						))}
					</div>
				</div>

				{/* Animated Status Text */}
				<motion.div
					className="text-center mb-4"
					animate={{
						opacity: [0.4, 0.8, 0.4],
					}}
					transition={{ duration: 2, repeat: Infinity }}
				>
					<span className="text-[10px] font-mono text-emerald-400/60 tracking-widest">
						⚡ SYSTEM OPTIMIZING • {statusText}% EFFICIENT •
						<motion.span
							animate={{ opacity: [1, 0, 1] }}
							transition={{ duration: 1, repeat: Infinity }}
						>
							_
						</motion.span>
					</span>
				</motion.div>

				<div className="flex flex-col md:flex-row items-center justify-between gap-6">
					{/* Left Side */}
					<motion.div
						className="text-xs font-mono text-emerald-400/40"
						animate={{
							opacity: [0.3, 0.6, 0.3],
						}}
						transition={{ duration: 3, repeat: Infinity }}
					></motion.div>

					{/* Shuffling Links */}
					<div className="flex flex-wrap justify-center  text-sm ">
						<AnimatePresence mode="popLayout">
							{shuffledLinks.map((link: FooterLink) => (
								<motion.div
									key={link.href}
									initial={{ opacity: 0, y: 10, scale: 0.9 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: -10, scale: 0.9 }}
									transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
									className="group relative"
									onMouseEnter={() => setIsHovering(true)}
									onMouseLeave={() => setIsHovering(false)}
								>
									<Link
										href={link.href}
										className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 relative z-20 font-mono text-xs tracking-wider"
									>
										<span className="text-emerald-400/30 group-hover:text-emerald-400 transition-colors">
											{">"}
										</span>
										{link.label}
										<span className="text-xs text-emerald-400/60 group-hover:text-emerald-400 transition-colors">
											↗
										</span>
									</Link>

									{/* Cyber underline */}
									<motion.div
										className="absolute -bottom-1 left-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
										initial={{ width: "0%" }}
										whileHover={{ width: "100%" }}
										transition={{ duration: 0.3 }}
									/>

									{/* Glitch flicker */}
									<motion.div
										className="absolute inset-0 pointer-events-none"
										animate={{
											opacity: isHovering ? [0, 0.1, 0] : 0,
										}}
										transition={{ duration: 0.1 }}
										style={{
											background: "rgba(0, 255, 200, 0.05)",
											clipPath: "inset(0 10% 0 20%)",
										}}
									/>
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
