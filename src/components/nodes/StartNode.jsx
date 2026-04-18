import BaseNode from './BaseNode';

export default function StartNode({ data }) {
  return (
    <BaseNode data={data} typeLabel="Start" accent="#2f855a" target={false}>
      <p className="flow-node__meta">Entry point with workflow metadata.</p>
    </BaseNode>
  );
}
