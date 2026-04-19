import { useCallback, useRef, useState } from 'react';
import ReactFlow, { Background, MiniMap, Panel, useReactFlow } from 'reactflow';
import { useWorkflow } from '../../hooks/useWorkflow';
import { NODE_TYPES } from '../../types/workflow.types';
import { nodeTypes } from '../nodes';
import LabeledEdge from './LabeledEdge';

const edgeTypes = { labeled: LabeledEdge };

function ToolbarIcon({ children }) {
  return <span className="canvas-toolbar__icon" aria-hidden="true">{children}</span>;
}

function ZoomInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
      <path d="M11 8v6" />
      <path d="M8 11h6" />
    </svg>
  );
}

function ZoomOutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
      <path d="M8 11h6" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 14 5-5-5-5" />
      <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21V9" />
      <path d="m7 14 5-5 5 5" />
      <path d="M5 3h14" />
    </svg>
  );
}

function FitIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M16 3h3a2 2 0 0 1 2 2v3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
      <path d="M9 3v15" />
      <path d="M15 6v15" />
    </svg>
  );
}

function ChevronIcon({ collapsed = false }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={collapsed ? 'm9 6 6 6-6 6' : 'm6 9 6 6 6-6'} />
    </svg>
  );
}

export default function WorkflowCanvas() {
  const fileInputRef = useRef(null);
  const [isControlDockMinimized, setIsControlDockMinimized] = useState(true);
  const [isMiniMapMinimized, setIsMiniMapMinimized] = useState(true);
  const { screenToFlowPosition, zoomIn, zoomOut, fitView } = useReactFlow();
  const nodes = useWorkflow((state) => state.nodes);
  const edges = useWorkflow((state) => state.edges);
  const onNodesChange = useWorkflow((state) => state.onNodesChange);
  const onEdgesChange = useWorkflow((state) => state.onEdgesChange);
  const onConnect = useWorkflow((state) => state.onConnect);
  const addNode = useWorkflow((state) => state.addNode);
  const addConnectedNodeFromSelection = useWorkflow((state) => state.addConnectedNodeFromSelection);
  const autoArrangeNodes = useWorkflow((state) => state.autoArrangeNodes);
  const duplicateSelectedNode = useWorkflow((state) => state.duplicateSelectedNode);
  const selectNode = useWorkflow((state) => state.selectNode);
  const deleteSelectedNode = useWorkflow((state) => state.deleteSelectedNode);
  const activeTemplateId = useWorkflow((state) => state.activeTemplateId);
  const loadWorkflow = useWorkflow((state) => state.loadWorkflow);
  const saveHistory = useWorkflow((state) => state.saveHistory);
  const undo = useWorkflow((state) => state.undo);
  const redo = useWorkflow((state) => state.redo);
  const past = useWorkflow((state) => state.past);
  const future = useWorkflow((state) => state.future);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [addNode, screenToFlowPosition],
  );

  const handleExport = useCallback(() => {
    const data = JSON.stringify({ nodes, edges, activeTemplateId }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `workflow-${activeTemplateId || 'custom'}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [activeTemplateId, edges, nodes]);

  const handleImportFile = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.nodes && data.edges) {
          saveHistory();
          loadWorkflow(data.nodes, data.edges, data.activeTemplateId);
        }
      } catch (error) {
        console.error('Failed to import workflow:', error);
      } finally {
        event.target.value = '';
      }
    },
    [loadWorkflow, saveHistory],
  );

  return (
    <div className="canvas-shell">
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
        }}
        onNodeDragStart={() => saveHistory()}
        onNodeClick={(_, node) => selectNode(node.id)}
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
      >
        <Panel position="top-right">
          <div className="canvas-actions">
            <button className="ghost-button" onClick={() => { saveHistory(); autoArrangeNodes(); }} type="button">
              Auto arrange
            </button>
            <button className="ghost-button" onClick={() => { saveHistory(); duplicateSelectedNode(); }} type="button">
              Duplicate
            </button>
            <button className="ghost-button" onClick={() => { saveHistory(); deleteSelectedNode(); }} type="button">
              Delete
            </button>
          </div>
        </Panel>

        <Panel
          position="bottom-center"
          className={`canvas-control-dock-panel ${isControlDockMinimized ? 'is-minimized' : ''}`}
        >
          <div className="canvas-control-dock">
            <div className="canvas-control-dock__header">
              <div className="canvas-control-dock__header-copy">
                <span className="canvas-control-dock__eyebrow">Canvas Controls</span>
                <strong>{isControlDockMinimized ? 'Collapsed quick tools' : 'Build, edit, and navigate the workflow'}</strong>
              </div>
              <button
                aria-expanded={!isControlDockMinimized}
                className="canvas-control-dock__toggle"
                onClick={() => setIsControlDockMinimized((value) => !value)}
                title={isControlDockMinimized ? 'Expand control panel' : 'Minimize control panel'}
                type="button"
              >
                <ToolbarIcon><ChevronIcon collapsed={isControlDockMinimized} /></ToolbarIcon>
                <span>{isControlDockMinimized ? 'Expand' : 'Minimize'}</span>
              </button>
            </div>

            <div className="canvas-control-dock__content">
              <section className="canvas-control-dock__section">
                <span className="canvas-control-dock__label">Quick Add</span>
                <div className="canvas-control-dock__row canvas-control-dock__row--chips">
                  <button className="mini-chip" onClick={() => addConnectedNodeFromSelection(NODE_TYPES.TASK)} type="button">
                    <ToolbarIcon><PlusCircleIcon /></ToolbarIcon>
                    <span>Task</span>
                  </button>
                  <button className="mini-chip" onClick={() => addConnectedNodeFromSelection(NODE_TYPES.APPROVAL)} type="button">
                    <ToolbarIcon><PlusCircleIcon /></ToolbarIcon>
                    <span>Approval</span>
                  </button>
                  <button className="mini-chip" onClick={() => addConnectedNodeFromSelection(NODE_TYPES.AUTOMATED)} type="button">
                    <ToolbarIcon><PlusCircleIcon /></ToolbarIcon>
                    <span>Automation</span>
                  </button>
                  <button className="mini-chip" onClick={() => addConnectedNodeFromSelection(NODE_TYPES.END)} type="button">
                    <ToolbarIcon><PlusCircleIcon /></ToolbarIcon>
                    <span>End</span>
                  </button>
                </div>
              </section>

              <section className="canvas-control-dock__section canvas-control-dock__section--tools">
                <span className="canvas-control-dock__label">Canvas Tools</span>
                <div className="canvas-toolbar">
                  <div className="canvas-toolbar__group">
                    <button className="canvas-toolbar__button" onClick={() => zoomOut({ duration: 180 })} title="Zoom out" type="button">
                      <ToolbarIcon><ZoomOutIcon /></ToolbarIcon>
                      <span>Zoom Out</span>
                    </button>
                    <button className="canvas-toolbar__button" onClick={() => zoomIn({ duration: 180 })} title="Zoom in" type="button">
                      <ToolbarIcon><ZoomInIcon /></ToolbarIcon>
                      <span>Zoom In</span>
                    </button>
                    <button className="canvas-toolbar__button" onClick={() => fitView({ duration: 220, padding: 0.2 })} title="Fit view" type="button">
                      <ToolbarIcon><FitIcon /></ToolbarIcon>
                      <span>Fit View</span>
                    </button>
                  </div>

                  <div className="canvas-toolbar__divider" />

                  <div className="canvas-toolbar__group">
                    <button className="canvas-toolbar__button" disabled={past.length === 0} onClick={undo} title="Undo" type="button">
                      <ToolbarIcon><UndoIcon /></ToolbarIcon>
                      <span>Undo</span>
                    </button>
                    <button className="canvas-toolbar__button" disabled={future.length === 0} onClick={redo} title="Redo" type="button">
                      <ToolbarIcon><RedoIcon /></ToolbarIcon>
                      <span>Redo</span>
                    </button>
                  </div>

                  <div className="canvas-toolbar__divider" />

                  <div className="canvas-toolbar__group">
                    <button className="canvas-toolbar__button canvas-toolbar__button--accent" onClick={handleExport} title="Export JSON" type="button">
                      <ToolbarIcon><ExportIcon /></ToolbarIcon>
                      <span>Export JSON</span>
                    </button>
                    <button className="canvas-toolbar__button canvas-toolbar__button--accent" onClick={() => fileInputRef.current?.click()} title="Import JSON" type="button">
                      <ToolbarIcon><ImportIcon /></ToolbarIcon>
                      <span>Import JSON</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
          <input
            ref={fileInputRef}
            accept=".json,application/json"
            className="hidden-input"
            onChange={handleImportFile}
            type="file"
          />
        </Panel>

        <Panel
          position="bottom-right"
          className={`canvas-minimap-panel ${isMiniMapMinimized ? 'is-minimized' : ''}`}
        >
          <div className="canvas-minimap-card">
            <div className="canvas-minimap-card__toolbar">
              <button
                aria-expanded={!isMiniMapMinimized}
                className="canvas-minimap-card__toggle"
                onClick={() => setIsMiniMapMinimized((value) => !value)}
                title={isMiniMapMinimized ? 'Expand mini map' : 'Minimize mini map'}
                type="button"
              >
                <ToolbarIcon><MapIcon /></ToolbarIcon>
              </button>
              <button
                aria-expanded={!isMiniMapMinimized}
                className="canvas-minimap-card__toggle"
                onClick={() => setIsMiniMapMinimized((value) => !value)}
                title={isMiniMapMinimized ? 'Expand mini map' : 'Minimize mini map'}
                type="button"
              >
                <ToolbarIcon><ChevronIcon collapsed={isMiniMapMinimized} /></ToolbarIcon>
              </button>
            </div>

            <div className="canvas-minimap-card__body">
              <MiniMap className="canvas-minimap" pannable zoomable />
            </div>
          </div>
        </Panel>
        <Background gap={18} size={1} />
      </ReactFlow>
    </div>
  );
}
