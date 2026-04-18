const automationActions = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'create_ticket', label: 'Create IT Ticket', params: ['system', 'priority'] },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchAutomations() {
  await sleep(350);
  return automationActions;
}

export async function simulateWorkflow(payload) {
  await sleep(650);

  const durations = [0.18, 0.42, 0.35, 0.27, 0.16, 0.51];

  return {
    startedAt: new Date().toISOString(),
    steps: payload.nodes.map((node, index) => ({
      id: `${node.id}-${index}`,
      nodeId: node.id,
      nodeType: node.type,
      title: node.data.title || node.data.endMessage || `Step ${index + 1}`,
      status: 'completed',
      duration: durations[index % durations.length],
      message:
        node.type === 'automated'
          ? `Executed "${node.data.actionId || 'automation'}" with mocked parameters.`
          : `Processed ${node.type} node successfully.`,
    })),
    summary: {
      completed: payload.nodes.length,
      branches: payload.edges.length,
      automationCoverage: payload.nodes.length
        ? Math.round(
            (payload.nodes.filter((node) => node.type === 'automated').length / payload.nodes.length) * 100,
          )
        : 0,
    },
  };
}
