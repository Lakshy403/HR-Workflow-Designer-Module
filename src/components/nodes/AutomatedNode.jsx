import BaseNode from './BaseNode';

export default function AutomatedNode({ data }) {
  return (
    <BaseNode data={data} typeLabel="Automated" accent="#2b6cb0">
      <p className="flow-node__meta">{data.actionId || 'Choose a mocked action'}</p>
    </BaseNode>
  );
}
