import { useCallback, useState, useRef, useEffect } from 'react';
import { getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { useWorkflow } from '../../hooks/useWorkflow';

export default function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) {
  const updateEdgeLabel = useWorkflow((state) => state.updateEdgeLabel);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const label = data?.label || '';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const onDoubleClick = useCallback((evt) => {
    evt.stopPropagation();
    setIsEditing(true);
  }, []);

  const onBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  const onKeyDown = useCallback(
    (evt) => {
      if (evt.key === 'Enter') {
        setIsEditing(false);
      }
      if (evt.key === 'Escape') {
        setIsEditing(false);
      }
    },
    [],
  );

  const onChange = useCallback(
    (evt) => {
      updateEdgeLabel(id, evt.target.value);
    },
    [id, updateEdgeLabel],
  );

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          className={`edge-label-container ${selected ? 'edge-label--selected' : ''} ${label ? 'edge-label--has-text' : ''}`}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          onDoubleClick={onDoubleClick}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              className="edge-label-input"
              value={label}
              onChange={onChange}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
              placeholder="Add label…"
            />
          ) : (
            <span className="edge-label-text" title="Double-click to edit">
              {label || '⊕'}
            </span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
