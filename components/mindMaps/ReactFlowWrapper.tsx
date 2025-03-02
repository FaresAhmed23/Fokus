"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { ReactFlowProvider } from "reactflow";
import { cn } from "../../lib/utils";

// Don't import the CSS here directly

interface ReactFlowWrapperProps {
	children: ReactNode;
}

export default function ReactFlowWrapper({ children }: ReactFlowWrapperProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		// Import CSS dynamically only on client side
		import("reactflow/dist/style.css").catch(console.error);
		setMounted(true);
	}, []);

	return mounted ? (
		<ReactFlowProvider>{children}</ReactFlowProvider>
	) : (
		<div className={cn("w-full h-full")} />
	);
}
