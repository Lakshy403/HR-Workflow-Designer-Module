import { useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Panel, useReactFlow } from 'reactflow';
import { useWorkflow } from '../../hooks/useWorkflow';
import { NODE_TYPES } from '../../types/workflow.types';
import { nodeTypes } from '../nodes';

export default function WorkflowCanvas() {
  const { screenToFlowPosition } = useReactFlow();
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

  return (
    <div className="canvas-shell">
      <ReactFlow
        fitView
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
        }}
        onNodeClick={(_, node) => selectNode(node.id)}
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Panel position="top-right">
          <div className="canvas-actions">
            <button className="ghost-button" onClick={autoArrangeNodes} type="button">
              Auto arrange
            </button>
            <button className="ghost-button" onClick={duplicateSelectedNode} type="button">
              Duplicate
            </button>
            <button className="ghost-button" onClick={deleteSelectedNode} type="button">
              Delete
            </button>
          </div>
        </Panel>
        <Panel position="bottom-center">
          <div className="quick-add-bar">
            <span>Quick add after selection</span>
            <div>
              <button className="mini-chip" onClick={() => addConnectedNodeFromSelection(NODE_TYPES.TASK)} type="button">
                + Task
              </button>
              <button
                className="mini-chip"
                onClick={() => addConnectedNodeFromSelection(NODE_TYPES.APPROVAL)}
                type="button"
              >
                + Approval
              </button>
              <button
                className="mini-chip"
                onClick={() => addConnectedNodeFromSelection(NODE_TYPES.AUTOMATED)}
                type="button"
              >
                + Automation
              </button>
              <button className="mini-chip" onClick={() => addConnectedNodeFromSelection(NODE_TYPES.END)} type="button">
                + End
              </button>
            </div>
          </div>
        </Panel>
        <MiniMap pannable zoomable />
        <Controls />
        <Background gap={18} size={1} />
      </ReactFlow>
    </div>
  );
}
