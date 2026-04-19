import { create } from 'zustand';
import { addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import { workflowTemplates, defaultWorkflowTemplate } from '../data/workflowTemplates';
import { automationService } from '../services/api';
import { NODE_LABELS, NODE_TEMPLATES, NODE_TYPES } from '../types/workflow.types';
import { validateWorkflow } from '../utils/validation';

let nodeCount = defaultWorkflowTemplate.nodes.length;

function clone(value) {
  if (value === undefined) {
    return undefined;
  }
  return JSON.parse(JSON.stringify(value));
}

function syncNodeCounter(nodes) {
  const highest = nodes.reduce((max, node) => {
    const suffix = Number.parseInt(String(node.id).split('-').pop(), 10);
    return Number.isNaN(suffix) ? max : Math.max(max, suffix);
  }, 0);
  nodeCount = Math.max(nodeCount, highest);
}

function createNode(type, position, overrides = {}) {
  nodeCount += 1;
  return {
    id: `${type}-${nodeCount}`,
    type,
    position,
    data: {
      ...clone(NODE_TEMPLATES[type]),
      ...clone(overrides),
      title: overrides.title ?? NODE_TEMPLATES[type].title ?? NODE_LABELS[type],
    },
  };
}

function stripNodeMeta(nodes) {
  return nodes.map((node) => ({ ...node, data: { ...(node.data || {}) } }));
}

function createStateFromTemplate(template) {
  const nodes = stripNodeMeta(clone(template.nodes));
  const edges = clone(template.edges);
  syncNodeCounter(nodes);

  return {
    nodes,
    edges,
    selectedNodeId: null,
    activeTemplateId: template.id,
    validation: validateWorkflow(nodes, edges),
  };
}

function getSelectedNode(state) {
  return state.nodes.find((node) => node.id === state.selectedNodeId) || null;
}

function buildAutoLayout(nodes, edges) {
  const outgoing = new Map(nodes.map((node) => [node.id, []]));
  edges.forEach((edge) => {
    if (outgoing.has(edge.source)) {
      outgoing.get(edge.source).push(edge.target);
    }
  });

  const startNode = nodes.find((node) => node.type === NODE_TYPES.START);
  const depths = new Map();

  if (startNode) {
    const queue = [{ id: startNode.id, depth: 0 }];
    while (queue.length) {
      const current = queue.shift();
      if (depths.has(current.id)) {
        continue;
      }
      depths.set(current.id, current.depth);
      (outgoing.get(current.id) || []).forEach((targetId) => {
        queue.push({ id: targetId, depth: current.depth + 1 });
      });
    }
  }

  const columns = new Map();
  nodes.forEach((node) => {
    const depth = depths.get(node.id) ?? 0;
    const bucket = columns.get(depth) || [];
    bucket.push(node);
    columns.set(depth, bucket);
  });

  return nodes.map((node) => {
    const depth = depths.get(node.id) ?? 0;
    const siblings = columns.get(depth) || [node];
    const row = siblings.findIndex((candidate) => candidate.id === node.id);

    return {
      ...node,
      position: {
        x: 80 + depth * 290,
        y: 120 + row * 190,
      },
    };
  });
}

function isTransientNodeChange(change) {
  return (
    change.type === 'select' ||
    change.type === 'dimensions' ||
    change.type === 'position'
  );
}

const initialTemplateState = createStateFromTemplate(defaultWorkflowTemplate);

function pushHistory(state) {
  const newPast = [...state.past, { nodes: clone(state.nodes), edges: clone(state.edges) }];
  if (newPast.length > 50) newPast.shift();
  return { past: newPast, future: [] };
}

export const useWorkflow = create((set) => ({
  ...initialTemplateState,
  past: [],
  future: [],
  workflowTemplates,
  automationActions: [],
  automationLoading: false,
  automationError: '',
  lastSimulation: null,

  loadAutomationActions: async () => {
    set({ automationLoading: true, automationError: '' });

    try {
      const automationActions = await automationService.getAutomations();
      set({ automationActions, automationLoading: false });
    } catch (error) {
      set({
        automationError: error.message || 'Unable to load automations.',
        automationLoading: false,
      });
    }
  },

  onNodesChange: (changes) =>
    set((state) => {
      const nodes = stripNodeMeta(applyNodeChanges(changes, state.nodes));
      const selectionChange = changes.find((change) => change.type === 'select');
      const removeChange = changes.find((change) => change.type === 'remove');
      const isActiveDragOnly =
        changes.length > 0 &&
        changes.every(
          (change) => change.type === 'select' || (change.type === 'position' && change.dragging === true),
        );

      if (isActiveDragOnly) {
        return {
          nodes,
          edges: state.edges,
          selectedNodeId: selectionChange
            ? selectionChange.selected
              ? selectionChange.id
              : state.selectedNodeId === selectionChange.id
                ? null
                : state.selectedNodeId
            : state.selectedNodeId,
          activeTemplateId: state.activeTemplateId,
          validation: state.validation,
        };
      }

      return {
        nodes,
        edges: state.edges,
        selectedNodeId: selectionChange
          ? selectionChange.selected
            ? selectionChange.id
            : state.selectedNodeId === selectionChange.id
              ? null
              : state.selectedNodeId
          : removeChange && state.selectedNodeId === removeChange.id
            ? null
            : state.selectedNodeId,
        activeTemplateId: state.activeTemplateId,
        validation: validateWorkflow(nodes, state.edges),
      };
    }),

  onEdgesChange: (changes) =>
    set((state) => {
      const edges = applyEdgeChanges(changes, state.edges);
      return {
        edges,
        validation: validateWorkflow(state.nodes, edges),
      };
    }),

  onConnect: (connection) =>
    set((state) => {
      const sourceNode = state.nodes.find((node) => node.id === connection.source);
      const targetNode = state.nodes.find((node) => node.id === connection.target);

      if (
        !sourceNode ||
        !targetNode ||
        sourceNode.type === NODE_TYPES.END ||
        targetNode.type === NODE_TYPES.START ||
        state.edges.some((edge) => edge.source === connection.source && edge.target === connection.target)
      ) {
        return state;
      }

      const edges = addEdge(
        {
          ...connection,
          id: `e-${connection.source}-${connection.target}-${state.edges.length + 1}`,
          animated: sourceNode.type === NODE_TYPES.AUTOMATED,
          type: 'labeled',
          data: { label: '' },
        },
        state.edges,
      );

      return {
        edges,
        validation: validateWorkflow(state.nodes, edges),
      };
    }),

  addNode: (type, position) =>
    set((state) => {
      if (type === NODE_TYPES.START && state.nodes.some((node) => node.type === NODE_TYPES.START)) {
        return state;
      }

      const node = createNode(type, position);
      const nodes = [...state.nodes, node];

      return {
        nodes,
        selectedNodeId: node.id,
        activeTemplateId: 'custom',
        validation: validateWorkflow(nodes, state.edges),
      };
    }),

  addConnectedNodeFromSelection: (type) =>
    set((state) => {
      const selectedNode = getSelectedNode(state);
      if (!selectedNode) {
        return state;
      }

      if (type === NODE_TYPES.START && state.nodes.some((node) => node.type === NODE_TYPES.START)) {
        return state;
      }

      const node = createNode(type, {
        x: selectedNode.position.x + 280,
        y: selectedNode.position.y,
      });

      const nodes = [...state.nodes, node];
      const edges =
        selectedNode.type === NODE_TYPES.END
          ? state.edges
          : addEdge(
              {
                id: `e-${selectedNode.id}-${node.id}-${state.edges.length + 1}`,
                source: selectedNode.id,
                target: node.id,
                animated: selectedNode.type === NODE_TYPES.AUTOMATED,
                type: 'labeled',
                data: { label: '' },
              },
              state.edges,
            );

      return {
        nodes,
        edges,
        selectedNodeId: node.id,
        activeTemplateId: 'custom',
        validation: validateWorkflow(nodes, edges),
      };
    }),

  duplicateSelectedNode: () =>
    set((state) => {
      const selectedNode = getSelectedNode(state);
      if (!selectedNode || selectedNode.type === NODE_TYPES.START) {
        return state;
      }

      const duplicate = createNode(
        selectedNode.type,
        { x: selectedNode.position.x + 40, y: selectedNode.position.y + 140 },
        selectedNode.data,
      );

      const nodes = [...state.nodes, duplicate];
      return {
        nodes,
        selectedNodeId: duplicate.id,
        activeTemplateId: 'custom',
        validation: validateWorkflow(nodes, state.edges),
      };
    }),

  autoArrangeNodes: () =>
    set((state) => {
      const nodes = buildAutoLayout(state.nodes, state.edges);
      return {
        nodes,
        validation: validateWorkflow(nodes, state.edges),
      };
    }),

  loadTemplate: (templateId) =>
    set((state) => {
      const template = state.workflowTemplates.find((item) => item.id === templateId);
      if (!template) {
        return state;
      }

      return {
        ...createStateFromTemplate(template),
        lastSimulation: null,
      };
    }),

  resetWorkflow: () =>
    set(() => ({
      ...createStateFromTemplate(defaultWorkflowTemplate),
      lastSimulation: null,
      past: [],
      future: []
    })),

  saveHistory: () => set((state) => pushHistory(state)),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return {};
      const prev = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);
      return {
        past: newPast,
        future: [{ nodes: clone(state.nodes), edges: clone(state.edges) }, ...state.future],
        nodes: prev.nodes,
        edges: prev.edges,
        selectedNodeId: null,
        validation: validateWorkflow(prev.nodes, prev.edges),
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return {};
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, { nodes: clone(state.nodes), edges: clone(state.edges) }],
        future: newFuture,
        nodes: next.nodes,
        edges: next.edges,
        selectedNodeId: null,
        validation: validateWorkflow(next.nodes, next.edges),
      };
    }),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  updateSelectedNode: (updates) =>
    set((state) => {
      const nodes = state.nodes.map((node) =>
        node.id === state.selectedNodeId
          ? {
              ...node,
              data: { ...node.data, ...updates },
            }
          : node,
      );

      return {
        nodes,
        activeTemplateId: 'custom',
        validation: validateWorkflow(nodes, state.edges),
      };
    }),

  deleteSelectedNode: () =>
    set((state) => {
      if (!state.selectedNodeId) {
        return state;
      }

      const nodes = state.nodes.filter((node) => node.id !== state.selectedNodeId);
      const edges = state.edges.filter(
        (edge) => edge.source !== state.selectedNodeId && edge.target !== state.selectedNodeId,
      );

      return {
        nodes,
        edges,
        selectedNodeId: null,
        activeTemplateId: 'custom',
        validation: validateWorkflow(nodes, edges),
      };
    }),

  setLastSimulation: (lastSimulation) => set({ lastSimulation }),

  loadWorkflow: (nodes, edges, activeTemplateId = 'custom') => 
    set({
      nodes: stripNodeMeta(nodes),
      edges,
      selectedNodeId: null,
      activeTemplateId,
      validation: validateWorkflow(nodes, edges)
    }),

  updateEdgeLabel: (edgeId, label) =>
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === edgeId
          ? { ...edge, data: { ...edge.data, label } }
          : edge,
      ),
    })),
}));
