import BaseNode from './BaseNode';

export default function EndNode({ data }) {
  return (
    <BaseNode data={data} typeLabel="End" accent="#4a5568" source={false}>
      <p className="flow-node__meta">{data.endMessage}</p>
    </BaseNode>
  );
}
