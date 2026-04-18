import { useMemo } from 'react';
import { useWorkflow } from '../../hooks/useWorkflow';
import { NODE_LABELS, NODE_TYPES } from '../../types/workflow.types';

function KeyValueEditor({ label, items = [], onChange }) {
  const updateItem = (index, field, value) => {
    const next = items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    );
    onChange(next);
  };

  return (
    <div className="field-group">
      <label>{label}</label>
      <div className="kv-list">
        {items.map((item, index) => (
          <div key={`${label}-${index}`} className="kv-row">
            <input
              placeholder="Key"
              value={item.key}
              onChange={(event) => updateItem(index, 'key', event.target.value)}
            />
            <input
              placeholder="Value"
              value={item.value}
              onChange={(event) => updateItem(index, 'value', event.target.value)}
            />
          </div>
        ))}
      </div>
      <button
        className="secondary-button"
        type="button"
        onClick={() => onChange([...(items || []), { key: '', value: '' }])}
      >
        Add row
      </button>
    </div>
  );
}

export default function NodeConfigPanel() {
  const nodes = useWorkflow((state) => state.nodes);
  const selectedNodeId = useWorkflow((state) => state.selectedNodeId);
  const updateSelectedNode = useWorkflow((state) => state.updateSelectedNode);
  const duplicateSelectedNode = useWorkflow((state) => state.duplicateSelectedNode);
  const addConnectedNodeFromSelection = useWorkflow((state) => state.addConnectedNodeFromSelection);
  const automationActions = useWorkflow((state) => state.automationActions);
  const automationLoading = useWorkflow((state) => state.automationLoading);
  const automationError = useWorkflow((state) => state.automationError);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId),
    [nodes, selectedNodeId],
  );

  const selectedAction = automationActions.find(
    (action) => action.id === selectedNode?.data.actionId,
  );

  if (!selectedNode) {
    return (
      <div className="config-panel">
        <p className="panel-kicker">Node Configuration</p>
        <h2>No node selected</h2>
        <p>Select a node on the canvas to edit its configuration.</p>
      </div>
    );
  }

  const setField = (field, value) => updateSelectedNode({ [field]: value });

  return (
    <div className="config-panel">
      <p className="panel-kicker">Node Configuration</p>
      <h2>{NODE_LABELS[selectedNode.type]}</h2>
      <p className="config-node-id">Editing `{selectedNode.id}`</p>

      <div className="section-heading">
        <strong>Quick actions</strong>
      </div>
      <div className="inline-action-row">
        <button className="secondary-button" onClick={duplicateSelectedNode} type="button">
          Duplicate node
        </button>
        {selectedNode.type !== NODE_TYPES.END ? (
          <button
            className="secondary-button"
            onClick={() => addConnectedNodeFromSelection(NODE_TYPES.END)}
            type="button"
          >
            Append end node
          </button>
        ) : null}
      </div>

      {(selectedNode.type === NODE_TYPES.START ||
        selectedNode.type === NODE_TYPES.TASK ||
        selectedNode.type === NODE_TYPES.APPROVAL ||
        selectedNode.type === NODE_TYPES.AUTOMATED) && (
        <div className="field-group">
          <label>Title</label>
          <input
            value={selectedNode.data.title || ''}
            onChange={(event) => setField('title', event.target.value)}
          />
        </div>
      )}

      {selectedNode.type === NODE_TYPES.START && (
        <KeyValueEditor
          label="Metadata"
          items={selectedNode.data.metadata}
          onChange={(value) => setField('metadata', value)}
        />
      )}

      {selectedNode.type === NODE_TYPES.TASK && (
        <>
          <div className="field-group">
            <label>Description</label>
            <textarea
              rows="3"
              value={selectedNode.data.description || ''}
              onChange={(event) => setField('description', event.target.value)}
            />
          </div>
          <div className="field-group">
            <label>Assignee</label>
            <input
              value={selectedNode.data.assignee || ''}
              onChange={(event) => setField('assignee', event.target.value)}
            />
          </div>
          <div className="field-group">
            <label>Due Date</label>
            <input
              type="date"
              value={selectedNode.data.dueDate || ''}
              onChange={(event) => setField('dueDate', event.target.value)}
            />
          </div>
          <KeyValueEditor
            label="Custom fields"
            items={selectedNode.data.customFields}
            onChange={(value) => setField('customFields', value)}
          />
        </>
      )}

      {selectedNode.type === NODE_TYPES.APPROVAL && (
        <>
          <div className="field-group">
            <label>Approver Role</label>
            <input
              value={selectedNode.data.approverRole || ''}
              onChange={(event) => setField('approverRole', event.target.value)}
            />
          </div>
          <div className="field-group">
            <label>Auto-approve Threshold</label>
            <input
              type="number"
              placeholder="e.g. 2500"
              value={selectedNode.data.autoApproveThreshold || ''}
              onChange={(event) => setField('autoApproveThreshold', event.target.value)}
            />
          </div>
        </>
      )}

      {selectedNode.type === NODE_TYPES.AUTOMATED && (
        <>
          <div className="field-group">
            <label>Action</label>
            <select
              value={selectedNode.data.actionId || ''}
              onChange={(event) => {
                const actionId = event.target.value;
                const action = automationActions.find((item) => item.id === actionId);
                const dynamicParameters = action
                  ? Object.fromEntries(action.params.map((param) => [param, '']))
                  : {};

                updateSelectedNode({
                  actionId,
                  dynamicParameters,
                });
              }}
            >
              <option value="">Select action</option>
              {automationActions.map((action) => (
                <option key={action.id} value={action.id}>
                  {action.label}
                </option>
              ))}
            </select>
            {automationLoading ? <small>Loading actions...</small> : null}
            {automationError ? <small className="error-text">{automationError}</small> : null}
          </div>

          {selectedAction?.params.map((param) => (
            <div key={param} className="field-group">
              <label>{param}</label>
              <input
                value={selectedNode.data.dynamicParameters?.[param] || ''}
                onChange={(event) =>
                  updateSelectedNode({
                    dynamicParameters: {
                      ...selectedNode.data.dynamicParameters,
                      [param]: event.target.value,
                    },
                  })
                }
              />
            </div>
          ))}
        </>
      )}

      {selectedNode.type === NODE_TYPES.END && (
        <>
          <div className="field-group">
            <label>End Message</label>
            <textarea
              rows="3"
              value={selectedNode.data.endMessage || ''}
              onChange={(event) => setField('endMessage', event.target.value)}
            />
          </div>
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={Boolean(selectedNode.data.summaryFlag)}
              onChange={(event) => setField('summaryFlag', event.target.checked)}
            />
            Include summary in completion output
          </label>
        </>
      )}

      <div className="summary-card compact">
        <strong>Node status</strong>
        <p>
          {selectedNode.type === NODE_TYPES.AUTOMATED
            ? selectedAction
              ? `Bound to ${selectedAction.label} with ${selectedAction.params.length} runtime parameter(s).`
              : 'Select an automation action to make this step executable in the sandbox.'
            : `This ${NODE_LABELS[selectedNode.type].toLowerCase()} node is part of the active workflow graph.`}
        </p>
      </div>
    </div>
  );
}
