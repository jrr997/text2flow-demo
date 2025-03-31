import React from 'react';
import { Handle, Position } from '@xyflow/react';

const CustomNode = ({ id, data, isEditing, onEdit, onBlur, onChange }) => {
  return (
    <div className="node-content">
      <Handle type="target" position={Position.Left} />
      {isEditing ? (
        <input
          type="text"
          value={data.label}
          onChange={(e) => onChange(e, { id, ...data })}
          onBlur={(e) => onBlur(e, { id, ...data })}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onBlur(e, { id, ...data });
            }
          }}
        />
      ) : (
        <div onDoubleClick={(e) => onEdit(e, { id, ...data })}>
          {data.label}
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default CustomNode;
