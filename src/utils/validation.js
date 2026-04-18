import { NODE_TYPES } from '../types/workflow.types';

function buildAdjacency(nodes, edges) {
  const outgoing = new Map(nodes.map((node) => [node.id, []]));
  const incoming = new Map(nodes.map((node) => [node.id, []]));

  edges.forEach((edge) => {
    if (outgoing.has(edge.source)) {
      outgoing.get(edge.source).push(edge.target);
    }
    if (incoming.has(edge.target)) {
      incoming.get(edge.target).push(edge.source);
    }
  });

  return { outgoing, incoming };
}

function hasCycle(nodes, outgoing) {
  const visiting = new Set();
  const visited = new Set();

  const visit = (nodeId) => {
    if (visiting.has(nodeId)) {
      return true;
    }
    if (visited.has(nodeId)) {
      return false;
    }

    visiting.add(nodeId);

    for (const next of outgoing.get(nodeId) || []) {
      if (visit(next)) {
        return true;
      }
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  };

  return nodes.some((node) => visit(node.id));
}

function getReachableNodes(startNodeId, outgoing) {
  const seen = new Set();
  const stack = [startNodeId];

  while (stack.length) {
    const current = stack.pop();
    if (seen.has(current)) {
      continue;
    }

    seen.add(current);
    (outgoing.get(current) || []).forEach((next) => stack.push(next));
  }

  return seen;
}

function validateRequiredFields(node) {
  switch (node.type) {
    case NODE_TYPES.TASK:
      return node.data.title?.trim() ? null : `Task node "${node.id}" is missing a title.`;
    case NODE_TYPES.AUTOMATED:
      return node.data.actionId ? null : `Automated node "${node.id}" must select an action.`;
    default:
      return null;
  }
}

export function validateWorkflow(nodes, edges) {
  const issues = [];
  const startNodes = nodes.filter((node) => node.type === NODE_TYPES.START);
  const endNodes = nodes.filter((node) => node.type === NODE_TYPES.END);

  if (startNodes.length !== 1) {
    issues.push('Exactly one Start node is required.');
  }

  if (endNodes.length < 1) {
    issues.push('At least one End node is required.');
  }

  if (!nodes.length) {
    issues.push('Add at least one node to design a workflow.');
    return { isValid: false, issues };
  }

  const { outgoing, incoming } = buildAdjacency(nodes, edges);

  if (hasCycle(nodes, outgoing)) {
    issues.push('Cycles are not allowed in the workflow.');
  }

  const startNode = startNodes[0];
  if (startNode) {
    if ((incoming.get(startNode.id) || []).length > 0) {
      issues.push('Start node must be the first step and cannot have incoming edges.');
    }

    const reachable = getReachableNodes(startNode.id, outgoing);
    const disconnected = nodes.filter((node) => !reachable.has(node.id));
    if (disconnected.length) {
      issues.push(
        `Disconnected nodes found: ${disconnected
          .map((node) => node.data.title || node.id)
          .join(', ')}.`,
      );
    }
  }

  nodes.forEach((node) => {
    const missingFieldIssue = validateRequiredFields(node);
    if (missingFieldIssue) {
      issues.push(missingFieldIssue);
    }

    if (node.type === NODE_TYPES.END && (outgoing.get(node.id) || []).length > 0) {
      issues.push(`End node "${node.data.endMessage || node.id}" cannot have outgoing edges.`);
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
  };
}
