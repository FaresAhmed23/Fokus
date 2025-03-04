"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import { cn } from "@/lib/utils";

interface ReactFlowWrapperProps {
	children: ReactNode;
}

/**
 * A wrapper component for ReactFlow that ensures CSS is loaded client-side
 * and prevents hydration mismatches
 */
export default function ReactFlowWrapper({ children }: ReactFlowWrapperProps) {
	const [mounted, setMounted] = useState<boolean>(false);

	useEffect(() => {
		// Dynamic import for CSS to avoid server-side rendering issues
		const loadStyles = async () => {
			try {
				await import("reactflow/dist/style.css");
				setMounted(true);
			} catch (error) {
				console.error("Failed to load ReactFlow styles:", error);
			}
		};

		loadStyles();

		return () => {
			// Cleanup if necessary
		};
	}, []);

	// Show a placeholder with matching dimensions until the component is mounted
	if (!mounted) {
		return (
			<div className={cn("w-full h-full bg-background")} aria-hidden="true" />
		);
	}

	return <ReactFlowProvider>{children}</ReactFlowProvider>;
}
