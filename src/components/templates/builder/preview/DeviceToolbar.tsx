"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import type React from "react";
import { type DeviceView, useBuilder } from "../core/BuilderProvider";

const DEVICES: { id: DeviceView; label: string; icon: React.ElementType }[] = [
	{ id: "desktop", label: "Desktop", icon: Monitor },
	{ id: "tablet", label: "Tablet", icon: Tablet },
	{ id: "mobile", label: "Mobile", icon: Smartphone },
];

export function DeviceToolbar() {
	const { deviceView, setDeviceView } = useBuilder();

	return (
		<div className="flex items-center gap-0.5 p-0.5 bg-zinc-950/40 border border-white/5 rounded-xl">
			{DEVICES.map((device) => {
				const Icon = device.icon;
				const isActive = deviceView === device.id;
				return (
					<button
						key={device.id}
						onClick={() => setDeviceView(device.id)}
						className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
							isActive
								? "bg-white/10 text-white"
								: "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
						}`}
						title={`Switch to ${device.label} view`}
					>
						<Icon
							className={`h-3.5 w-3.5 ${isActive ? "text-emerald-400" : ""}`}
						/>
						<span className="hidden sm:inline">{device.label}</span>
					</button>
				);
			})}
		</div>
	);
}
