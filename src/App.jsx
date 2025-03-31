import { useState, useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  getViewportForBounds,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './App.css';
import { toPng } from 'html-to-image';
import CustomNode from './CustomNode';

const imageWidth = 1024;
const imageHeight = 768;

const App = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [inputText, setInputText] = useState('');
  const [editingNode, setEditingNode] = useState(null);
  const reactFlowWrapper = useRef(null);
  const { getNodes, getNodesBounds } = useReactFlow();
  const nodesBounds = getNodesBounds(getNodes());

  const parseTextToFlow = useCallback(
    (text) => {
      const steps = text.split('→').map((step) => step.trim());
      const newNodes = steps.map((step, index) => ({
        id: `node-${index}`,
        data: { label: step },
        position: { x: index * 250, y: 100 },
        type: 'custom',
      }));

      const newEdges = steps.slice(0, -1).map((_, index) => ({
        id: `edge-${index}`,
        source: `node-${index}`,
        target: `node-${index + 1}`,
      }));

      setNodes(newNodes);
      setEdges(newEdges);
    },
    [setNodes, setEdges]
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    const mergedText = inputText || '登录 → 验证短信 → 进入主页';
    if (!inputText) setInputText(mergedText);
    parseTextToFlow(mergedText);
  };

  const onNodeDoubleClick = useCallback(
    (event, node) => {
      setEditingNode(node);
    },
    [setEditingNode]
  );

  const onNodeBlur = useCallback(
    (event, node) => {
      setEditingNode(null);
    },
    [setEditingNode]
  );

  const onNodeChange = useCallback(
    (event, nodeData) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeData.id) {
            return {
              ...n,
              data: {
                ...n.data,
                label: event.target.value,
              },
            };
          }
          return n;
        })
      );
    },
    [setNodes]
  );

  const exportToPNG = useCallback(() => {
    function downloadImage(dataUrl) {
      const a = document.createElement('a');
      a.setAttribute('download', 'reactflow.png');
      a.setAttribute('href', dataUrl);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(dataUrl);
    }

    const flowElement = reactFlowWrapper.current;
    if (!flowElement) return;

    const svg = flowElement.querySelector('.react-flow__viewport');
    if (!svg) return;
    const viewport = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2
    );
    toPng(svg, {
      backgroundColor: '#1a365d',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    }).then(downloadImage);
  }, [nodesBounds]);

  const nodeTypes = useMemo(
    () => ({
      custom: (props) => (
        <CustomNode
          {...props}
          isEditing={editingNode?.id === props.id}
          onEdit={onNodeDoubleClick}
          onBlur={onNodeBlur}
          onChange={onNodeChange}
        />
      ),
    }),
    [editingNode, onNodeDoubleClick, onNodeBlur, onNodeChange]
  );

  return (
    <div className="app-container">
      <div className="input-section">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="输入流程文本，例如：登录 → 验证短信 → 进入主页"
            className="text-input"
          />
          <button type="submit" className="submit-button">
            生成流程图
          </button>
          <button type="button" className="export-button" onClick={exportToPNG}>
            导出PNG
          </button>
        </form>
      </div>
      <div className="flow-container" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </div>
  );
};

export default App;
