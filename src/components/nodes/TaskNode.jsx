import BaseNode from './BaseNode';

export default function TaskNode({ data }) {
  return (
    <BaseNode data={data} typeLabel="Task" accent="#c05621">
      <p className="flow-node__meta">{data.assignee || 'No assignee selected'}</p>
    </BaseNode>
  );
}
