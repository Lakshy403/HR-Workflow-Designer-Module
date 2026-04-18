import BaseNode from './BaseNode';

export default function ApprovalNode({ data }) {
  return (
    <BaseNode data={data} typeLabel="Approval" accent="#b83280">
      <p className="flow-node__meta">{data.approverRole || 'Approver role required'}</p>
    </BaseNode>
  );
}
