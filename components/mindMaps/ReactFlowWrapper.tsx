"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { ReactFlowProvider } from "reactflow";

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

	if (!mounted) {
		// Return a placeholder with the same dimensions until client-side hydration is complete
		return <div className="w-full h-full" />;
	}

	return <ReactFlowProvider>{children}</ReactFlowProvider>;
}
