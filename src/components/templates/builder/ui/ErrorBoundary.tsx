"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import type React from "react";
import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error("Builder Error:", error, errorInfo);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="flex flex-col items-center justify-center p-8 bg-red-500/10 border border-red-500/20 rounded-xl text-center min-h-[200px]">
					<AlertCircle className="h-10 w-10 text-red-400 mb-3" />
					<h3 className="text-sm font-bold text-white">Something went wrong</h3>
					<p className="text-xs text-zinc-400 mt-1 max-w-md">
						{this.state.error?.message || "An unexpected error occurred"}
					</p>
					<button
						onClick={this.handleReset}
						className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
					>
						<RefreshCw className="h-4 w-4" />
						Try Again
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}
