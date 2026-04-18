import { Handle, Position } from 'reactflow';

export default function BaseNode({ accent, typeLabel, data, children, target = true, source = true }) {
  return (
    <div className="flow-node" style={{ '--node-accent': accent }}>
      {target ? <Handle type="target" position={Position.Left} /> : null}
      <div className="flow-node__header">
        <span className="flow-node__badge">{typeLabel}</span>
        <strong>{data.title || data.endMessage || typeLabel}</strong>
      </div>
      {children}
      {source ? <Handle type="source" position={Position.Right} /> : null}
    </div>
  );
}
