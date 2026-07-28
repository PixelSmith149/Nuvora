"use client";

import { motion } from "framer-motion";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

// Types
interface DigitalAsset {
	id: number;
	symbol: string;
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	opacity: number;
	color: string;
	phase: number;
	label?: string;
}

// Clean, minimal crypto & tech symbols
const ASSETS = [
	{ symbol: "₿", color: "rgba(247, 147, 26, 0.4)", label: "BTC" },
	{ symbol: "Ξ", color: "rgba(98, 126, 234, 0.4)", label: "ETH" },
	{ symbol: "◈", color: "rgba(0, 212, 170, 0.4)", label: "SOL" },
	{ symbol: "◆", color: "rgba(139, 92, 246, 0.4)", label: "DOT" },
	{ symbol: "⬡", color: "rgba(61, 159, 255, 0.4)", label: "ADA" },
	{ symbol: "✦", color: "rgba(232, 77, 138, 0.4)", label: "LINK" },
	{ symbol: "⬟", color: "rgba(255, 107, 107, 0.4)", label: "XRP" },
	{ symbol: "⟠", color: "rgba(255, 217, 61, 0.4)", label: "DOGE" },
	{ symbol: "⚡", color: "rgba(255, 215, 0, 0.3)" },
	{ symbol: "⎔", color: "rgba(0, 229, 255, 0.3)" },
	{ symbol: "⌘", color: "rgba(0, 230, 118, 0.3)" },
	{ symbol: "≋", color: "rgba(255, 109, 0, 0.3)" },
];

const CyberPrankAnimation: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [isMounted, setIsMounted] = useState<boolean>(false);
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	// Animation state
	const assetsRef = useRef<DigitalAsset[]>([]);
	const animationFrameRef = useRef<number | undefined>(undefined);
	const timeRef = useRef<number>(0);

	// Initialize dimensions
	useEffect(() => {
		setIsMounted(true);

		const updateDimensions = () => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		updateDimensions();
		window.addEventListener("resize", updateDimensions);

		return () => {
			window.removeEventListener("resize", updateDimensions);
		};
	}, []);

	// Initialize floating assets
	const initAssets = useCallback((width: number, height: number) => {
		const newAssets: DigitalAsset[] = [];
		const count = Math.min(ASSETS.length, 12);

		for (let i = 0; i < count; i++) {
			const asset = ASSETS[i % ASSETS.length];
			const padding = 80;

			newAssets.push({
				id: i,
				symbol: asset.symbol,
				x: padding + Math.random() * (width - padding * 2),
				y: padding + Math.random() * (height - padding * 2),
				vx: (Math.random() - 0.5) * 0.4,
				vy: (Math.random() - 0.5) * 0.4,
				size: 18 + Math.random() * 14,
				opacity: 0.15 + Math.random() * 0.25,
				color: asset.color,
				phase: Math.random() * Math.PI * 2,
				label: asset.label,
			});
		}

		assetsRef.current = newAssets;
	}, []);

	// Draw function - clean and minimal
	const draw = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Clear canvas completely (transparent)
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const width = canvas.width;
		const height = canvas.height;
		const time = timeRef.current;

		// Draw floating assets
		assetsRef.current.forEach((asset) => {
			const pulse = Math.sin(time * 0.5 + asset.phase) * 0.2 + 0.8;
			const floatY = Math.sin(time * 0.3 + asset.phase) * 3;
			const floatX = Math.cos(time * 0.2 + asset.phase * 1.2) * 2;

			const x = asset.x + floatX;
			const y = asset.y + floatY;
			const size = asset.size * (0.9 + pulse * 0.1);
			const opacity = asset.opacity * (0.8 + pulse * 0.2);

			// Subtle glow
			const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
			const colorBase = asset.color
				.replace("0.4", "0.08")
				.replace("0.3", "0.05");
			gradient.addColorStop(
				0,
				asset.color.replace(/0\.\d+/, opacity.toString()),
			);
			gradient.addColorStop(0.5, colorBase);
			gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

			ctx.fillStyle = gradient;
			ctx.fillRect(x - size * 2, y - size * 2, size * 4, size * 4);

			// Main symbol
			ctx.font = `${size}px "Arial Unicode MS", "Segoe UI Symbol", sans-serif`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			// Soft shadow for readability
			ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
			ctx.shadowBlur = 5;

			// Symbol with opacity
			ctx.fillStyle = asset.color.replace(/0\.\d+/, opacity.toString());
			ctx.fillText(asset.symbol, x, y + 1);

			ctx.shadowBlur = 0;

			// Tiny label (very subtle)
			if (asset.label && size > 20) {
				ctx.font = `${size * 0.25}px monospace`;
				ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
				ctx.fillText(asset.label, x, y + size * 0.6);
			}
		});

		// Minimal connection lines (very subtle)
		const assets = assetsRef.current;
		for (let i = 0; i < assets.length; i++) {
			for (let j = i + 1; j < assets.length; j++) {
				const dx = assets[i].x - assets[j].x;
				const dy = assets[i].y - assets[j].y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				if (distance < 120) {
					const opacity = (1 - distance / 120) * 0.06;
					ctx.strokeStyle = `rgba(0, 255, 200, ${opacity})`;
					ctx.lineWidth = 0.5;

					ctx.beginPath();
					ctx.moveTo(assets[i].x, assets[i].y);
					ctx.lineTo(assets[j].x, assets[j].y);
					ctx.stroke();
				}
			}
		}

		// Minimal floating dots
		const dotCount = 20;
		for (let i = 0; i < dotCount; i++) {
			const x = (Math.sin(time * 0.005 + i * 2.3) * 0.5 + 0.5) * width;
			const y = (Math.cos(time * 0.004 + i * 1.7) * 0.5 + 0.5) * height;
			const size = 1 + Math.sin(time * 0.01 + i) * 0.5;
			const opacity = 0.03 + Math.sin(time * 0.008 + i * 0.5) * 0.02 + 0.02;

			ctx.fillStyle = `rgba(0, 255, 200, ${opacity})`;
			ctx.beginPath();
			ctx.arc(x, y, size, 0, Math.PI * 2);
			ctx.fill();
		}
	}, []);

	// Animation loop
	const animate = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const width = canvas.width;
		const height = canvas.height;

		timeRef.current += 0.016; // ~60fps

		// Update asset positions
		assetsRef.current.forEach((asset) => {
			// Gentle floating movement
			asset.x += asset.vx;
			asset.y += asset.vy;

			// Bounce off edges with padding
			const padding = 60;
			if (asset.x < padding) {
				asset.x = padding;
				asset.vx *= -1;
			}
			if (asset.x > width - padding) {
				asset.x = width - padding;
				asset.vx *= -1;
			}
			if (asset.y < padding) {
				asset.y = padding;
				asset.vy *= -1;
			}
			if (asset.y > height - padding) {
				asset.y = height - padding;
				asset.vy *= -1;
			}

			// Random gentle direction change
			if (Math.random() < 0.002) {
				asset.vx += (Math.random() - 0.5) * 0.05;
				asset.vy += (Math.random() - 0.5) * 0.05;

				// Limit speed
				const speed = Math.sqrt(asset.vx * asset.vx + asset.vy * asset.vy);
				if (speed > 0.6) {
					asset.vx = (asset.vx / speed) * 0.6;
					asset.vy = (asset.vy / speed) * 0.6;
				}
			}
		});

		// Draw everything
		draw();

		animationFrameRef.current = requestAnimationFrame(animate);
	}, [draw]);

	// Setup canvas and start animation
	useEffect(() => {
		if (!isMounted || dimensions.width === 0) return;

		const canvas = canvasRef.current;
		if (!canvas) return;

		// Set canvas size (matching container exactly)
		canvas.width = dimensions.width;
		canvas.height = dimensions.height;
		canvas.style.width = `${dimensions.width}px`;
		canvas.style.height = `${dimensions.height}px`;

		// Initialize assets
		initAssets(dimensions.width, dimensions.height);

		// Start animation
		animate();

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [isMounted, dimensions, initAssets, animate]);

	if (!isMounted) {
		return null;
	}

	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
			<canvas
				ref={canvasRef}
				className="absolute inset-0 w-full h-full"
				style={{
					display: "block",
					background: "transparent",
					mixBlendMode: "screen",
				}}
			/>
		</div>
	);
};

export default CyberPrankAnimation;
