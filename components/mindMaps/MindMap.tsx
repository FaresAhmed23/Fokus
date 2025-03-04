"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { EdgeOptions } from "./EdgeOptions";
import ReactFlow, {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	Background,
	Edge,
	EdgeTypes,
	Node,
	NodeTypes,
	OnConnect,
	OnEdgesChange,
	OnNodesChange,
	Panel,
	ReactFlowInstance,
	ReactFlowJsonObject,
} from "reactflow";
import "reactflow/dist/style.css";
import { TextNode } from "./nodes/TextNode";
import { CustomBezier } from "./labels/CustomBezier";
import { CustomStraight } from "./labels/CustomStraight";
import { CustomStepSharp } from "./labels/CustomStepSharp";
import { CustomStepRounded } from "./labels/CustomStepRounded";
import { Sheet } from "../ui/sheet";
import { EdgeOptionsSchema } from "@/schema/edgeOptionsSchema";
import { Tag } from "@prisma/client";
import { useDebouncedCallback } from "use-debounce";
import { LoadingScreen } from "../common/LoadingScreen";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "../ui/hover-card";
import { PlusSquare, Save } from "lucide-react";
import { DeleteAllNodes } from "./DeleteAllNodes";
import { useAutoSaveMindMap } from "@/context/AutoSaveMindMap";
import { useAutosaveIndicator } from "@/context/AutosaveIndicator";
import { Separator } from "../ui/separator";
import { MindMapTagsSelector } from "./MindMapTagSelector";
import { EditInfo } from "./editInfo/EditInfo";
import { ExtendedMindMap } from "@/types/extended";
import { useTranslations } from "next-intl";

// Define edge types with proper typing
const edgeTypes: EdgeTypes = {
	customBezier: CustomBezier,
	customStraight: CustomStraight,
	customStepSharp: CustomStepSharp,
	customStepRounded: CustomStepRounded,
};

interface MindMapProps {
	initialInfo: ExtendedMindMap;
	workspaceId: string;
	canEdit: boolean;
	initialActiveTags: Tag[];
}

export const MindMap = ({
	initialInfo,
	workspaceId,
	canEdit,
	initialActiveTags,
}: MindMapProps) => {
	const [clickedEdge, setClickedEdge] = useState<Edge | null>(null);
	const [openSheet, setOpenSheet] = useState<boolean>(false);
	const [nodes, setNodes] = useState<Node[]>([]);
	const [edges, setEdges] = useState<Edge[]>([]);
	const nodeTypes = useMemo<NodeTypes>(() => ({ textNode: TextNode }), []);
	const [isMounted, setIsMounted] = useState<boolean>(false);
	const [isEditable, setIsEditable] = useState<boolean>(canEdit);
	const t = useTranslations("MIND_MAP");

	const { setRfInstance, onSave, onSetIds } = useAutoSaveMindMap();
	const { onSetStatus, status } = useAutosaveIndicator();

	// Use debounce for better performance when saving mind map changes
	const debouncedMindMapInfo = useDebouncedCallback(() => {
		onSetStatus("pending");
		onSave();
	}, 3000);

	// Initialize component
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Load initial content
	useEffect(() => {
		const { content } = initialInfo;
		if (content) {
			const { nodes = [], edges = [] } =
				content as unknown as ReactFlowJsonObject;
			setNodes(nodes);
			setEdges(edges);
		}
		onSetIds(initialInfo.id, workspaceId);
	}, [initialInfo, initialInfo.id, workspaceId, onSetIds]);

	// Update editable state when canEdit prop changes
	useEffect(() => {
		setIsEditable(canEdit);
	}, [canEdit]);

	// Add a new node
	const onAddNode = useCallback(() => {
		const newNode: Node = {
			id: `node-${Math.random().toString(36).substring(2, 9)}`,
			type: "textNode",
			position: { x: 0, y: 0 },
			data: { text: "New Node", color: 12 },
		};

		setNodes((nds) => nds.concat(newNode));
		onSetStatus("unsaved");
		debouncedMindMapInfo();
	}, [debouncedMindMapInfo, onSetStatus]);

	// Handle node changes
	const onNodesChange: OnNodesChange = useCallback(
		(changes) => {
			setNodes((nds) => applyNodeChanges(changes, nds));
			// Don't trigger save on selection changes
			if (changes.some((change) => change.type !== "select")) {
				onSetStatus("unsaved");
				debouncedMindMapInfo();
			}
		},
		[debouncedMindMapInfo, onSetStatus],
	);

	// Handle edge changes
	const onEdgesChange: OnEdgesChange = useCallback(
		(changes) => {
			setEdges((eds) => applyEdgeChanges(changes, eds));
			// Don't trigger save on selection changes
			if (changes.some((change) => change.type !== "select")) {
				onSetStatus("unsaved");
				debouncedMindMapInfo();
			}
		},
		[debouncedMindMapInfo, onSetStatus],
	);

	// Handle edge click
	const onEdgeClick = useCallback(
		(event: React.MouseEvent, edge: Edge) => {
			if (!isEditable) return;
			setClickedEdge(edge);
			setOpenSheet(true);
		},
		[isEditable],
	);

	// Handle new connections
	const onConnect: OnConnect = useCallback(
		(params) => {
			setEdges((eds) => addEdge({ ...params, type: "customBezier" }, eds));
			onSetStatus("unsaved");
			debouncedMindMapInfo();
		},
		[debouncedMindMapInfo, onSetStatus],
	);

	// Save edge changes
	const onSaveChange = useCallback(
		(data: EdgeOptionsSchema) => {
			const { animated, edgeId, label, color, type } = data;
			setEdges((prevEdges) => {
				return prevEdges.map((edge) =>
					edge.id === edgeId
						? {
								...edge,
								data: { ...edge.data, label, color },
								type,
								animated,
						  }
						: edge,
				);
			});
			setOpenSheet(false);
			onSetStatus("unsaved");
			debouncedMindMapInfo();
		},
		[debouncedMindMapInfo, onSetStatus],
	);

	// Delete an edge
	const onDeleteEdge = useCallback(
		(edgeId: string) => {
			setEdges((prevEdges) => prevEdges.filter((edge) => edge.id !== edgeId));
			setOpenSheet(false);
			onSetStatus("unsaved");
			debouncedMindMapInfo();
		},
		[debouncedMindMapInfo, onSetStatus],
	);

	// Handle node drag
	const onNodeDrag = useCallback(() => {
		onSetStatus("unsaved");
		debouncedMindMapInfo();
	}, [debouncedMindMapInfo, onSetStatus]);

	// Handle node deletion
	const onNodesDelete = useCallback(() => {
		onSetStatus("unsaved");
		debouncedMindMapInfo();
	}, [debouncedMindMapInfo, onSetStatus]);

	// Handle manual save
	const handleManualSave = useCallback(() => {
		onSetStatus("pending");
		onSave();
	}, [onSave, onSetStatus]);

	// Set React Flow instance
	const handleInit = useCallback(
		(instance: ReactFlowInstance) => {
			setRfInstance(instance);
		},
		[setRfInstance],
	);

	if (!isMounted) return <LoadingScreen />;

	return (
		<div className="w-full h-full flex flex-col">
			{clickedEdge && (
				<Sheet open={openSheet} onOpenChange={setOpenSheet}>
					<EdgeOptions
						clickedEdge={clickedEdge}
						isOpen={openSheet}
						onSave={onSaveChange}
						onDeleteEdge={onDeleteEdge}
					/>
				</Sheet>
			)}

			<div className="h-full">
				<ReactFlow
					fitView
					onInit={handleInit}
					onNodeDrag={onNodeDrag}
					nodes={nodes}
					nodeTypes={nodeTypes}
					edges={edges}
					edgeTypes={edgeTypes}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					onEdgeClick={onEdgeClick}
					onNodesDelete={onNodesDelete}
					connectOnClick={isEditable}
					edgesUpdatable={isEditable}
					edgesFocusable={isEditable}
					nodesDraggable={isEditable}
					nodesConnectable={isEditable}
					nodesFocusable={isEditable}
					elementsSelectable={isEditable}
					deleteKeyCode={["Backspace", "Delete"]}
					proOptions={{
						hideAttribution: true,
					}}
				>
					{isEditable && (
						<Panel
							position="top-left"
							className="bg-background z-50 shadow-sm border rounded-sm py-0.5 px-3"
						>
							<div className="flex gap-2 w-full items-center">
								<HoverCard openDelay={250} closeDelay={250}>
									<HoverCardTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											onClick={onAddNode}
											aria-label={t("HOVER_TIP.ADD_TITLE")}
										>
											<PlusSquare size={22} />
										</Button>
									</HoverCardTrigger>
									<HoverCardContent align="start">
										{t("HOVER_TIP.ADD_TITLE")}
									</HoverCardContent>
								</HoverCard>

								<EditInfo
									workspaceId={workspaceId}
									title={initialInfo.title}
									mapId={initialInfo.id}
									emoji={initialInfo.emoji}
								/>

								<HoverCard openDelay={250} closeDelay={250}>
									<HoverCardTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											onClick={handleManualSave}
											disabled={status === "pending" || status === "saved"}
											aria-label={t("HOVER_TIP.SAVE")}
										>
											<Save size={22} />
										</Button>
									</HoverCardTrigger>
									<HoverCardContent align="start" sideOffset={8}>
										{t("HOVER_TIP.SAVE")}
									</HoverCardContent>
								</HoverCard>

								<DeleteAllNodes
									workspaceId={workspaceId}
									mindMapId={initialInfo.id}
								/>

								<div className="h-8">
									<Separator orientation="vertical" />
								</div>

								<MindMapTagsSelector
									initialActiveTags={initialActiveTags}
									mindMapId={initialInfo.id}
									isMounted={isMounted}
									workspaceId={workspaceId}
								/>
							</div>
						</Panel>
					)}

					<Background />
				</ReactFlow>
			</div>
		</div>
	);
};
