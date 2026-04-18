import { useMemo } from 'react';
import { useWorkflow } from '../../hooks/useWorkflow';
import { NODE_LABELS, NODE_TYPES } from '../../types/workflow.types';

const items = [
  { type: NODE_TYPES.START, description: 'Single workflow entry point' },
  { type: NODE_TYPES.TASK, description: 'Manual HR action or assignment' },
  { type: NODE_TYPES.APPROVAL, description: 'Decision step with role ownership' },
  { type: NODE_TYPES.AUTOMATED, description: 'Mocked backend automation' },
  { type: NODE_TYPES.END, description: 'Terminal completion step' },
];

export default function NodeSidebar() {
  const nodes = useWorkflow((state) => state.nodes);
  const templates = useWorkflow((state) => state.workflowTemplates);
  const activeTemplateId = useWorkflow((state) => state.activeTemplateId);
  const loadTemplate = useWorkflow((state) => state.loadTemplate);
  const resetWorkflow = useWorkflow((state) => state.resetWorkflow);
  const hasStart = useMemo(() => nodes.some((node) => node.type === NODE_TYPES.START), [nodes]);

  const onDragStart = (event, type) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="sidebar">
      <div>
        <p className="panel-kicker">Node Palette</p>
        <h2>Design surface</h2>
      </div>

      <div className="sidebar-list">
        {items.map((item) => {
          const isDisabled = item.type === NODE_TYPES.START && hasStart;
          return (
            <button
              key={item.type}
              className="palette-card"
              draggable={!isDisabled}
              disabled={isDisabled}
              onDragStart={(event) => onDragStart(event, item.type)}
              type="button"
            >
              <span>{NODE_LABELS[item.type]}</span>
              <small>{item.description}</small>
              {isDisabled ? <em>Already used</em> : null}
            </button>
          );
        })}
      </div>

      <div className="template-section">
        <div className="section-heading">
          <strong>Workflow starters</strong>
          <button className="tiny-button" onClick={resetWorkflow} type="button">
            Reset
          </button>
        </div>
        <div className="template-list">
          {templates.map((template) => (
            <button
              key={template.id}
              className={`template-card ${template.id === activeTemplateId ? 'active' : ''}`}
              onClick={() => loadTemplate(template.id)}
              type="button"
            >
              <span>{template.name}</span>
              <small>{template.category}</small>
              <p>{template.summary}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-tip">
        <strong>Prototype behavior</strong>
        <p>
          Drag cards onto the canvas, connect nodes from left to right, then use the
          config panel to edit node details.
        </p>
      </div>
    </div>
  );
}
