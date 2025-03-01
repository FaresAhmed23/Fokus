"use client";

import React, { ReactNode } from "react";
import { ReactFlowProvider } from "reactflow";
// Import styles only once here
import "reactflow/dist/style.css";

interface ReactFlowWrapperProps {
	children: ReactNode;
}

export default function ReactFlowWrapper({ children }: ReactFlowWrapperProps) {
	return <ReactFlowProvider>{children}</ReactFlowProvider>;
}
