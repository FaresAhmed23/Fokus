"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { ReactFlowProvider } from "reactflow";

// Try importing utils directly without aliases
import { cn } from "../../lib/utils";

interface ReactFlowWrapperProps {
	children: ReactNode;
}

export default function ReactFlowWrapper({ children }: ReactFlowWrapperProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		// Import the CSS only on the client side
		//@ts-ignore
		import("reactflow/dist/style.css");
		setMounted(true);
	}, []);

	// Use cn just to verify it's imported correctly
	return mounted ? (
		<ReactFlowProvider>{children}</ReactFlowProvider>
	) : (
		<div className={cn("w-full h-full")} />
	);
}
