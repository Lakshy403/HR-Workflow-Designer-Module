import { useMemo } from 'react';
import { useWorkflow } from '../../hooks/useWorkflow';
import { NODE_TYPES } from '../../types/workflow.types';

function formatPercent(value) {
  return `${Math.round(value)}%`;
}

export default function WorkflowInsightsPanel() {
  const nodes = useWorkflow((state) => state.nodes);
  const edges = useWorkflow((state) => state.edges);
  const validation = useWorkflow((state) => state.validation);
  const lastSimulation = useWorkflow((state) => state.lastSimulation);

  const metrics = useMemo(() => {
    const counts = {
      automated: nodes.filter((node) => node.type === NODE_TYPES.AUTOMATED).length,
      approvals: nodes.filter((node) => node.type === NODE_TYPES.APPROVAL).length,
      tasks: nodes.filter((node) => node.type === NODE_TYPES.TASK).length,
      ends: nodes.filter((node) => node.type === NODE_TYPES.END).length,
    };

    const automationCoverage = nodes.length ? (counts.automated / nodes.length) * 100 : 0;
    const branchDensity = nodes.length ? ((edges.length - (nodes.length - 1)) / nodes.length) * 100 : 0;
    const readiness = validation.isValid
      ? 92 - Math.max(0, counts.tasks - counts.automated * 2)
      : Math.max(32, 70 - validation.issues.length * 9);

    return [
      {
        label: 'Automation Coverage',
        value: formatPercent(automationCoverage),
        tone: counts.automated ? 'good' : 'neutral',
        note: `${counts.automated} automated step${counts.automated === 1 ? '' : 's'}`,
      },
      {
        label: 'Review Load',
        value: `${counts.approvals + counts.tasks}`,
        tone: counts.approvals > 1 ? 'warn' : 'good',
        note: `${counts.approvals} approvals / ${counts.tasks} manual tasks`,
      },
      {
        label: 'Flow Complexity',
        value: formatPercent(Math.max(12, branchDensity + 36)),
        tone: branchDensity > 20 ? 'warn' : 'neutral',
        note: `${edges.length} transitions across ${nodes.length} nodes`,
      },
      {
        label: 'Launch Readiness',
        value: formatPercent(readiness),
        tone: validation.isValid ? 'good' : 'risk',
        note: validation.isValid ? 'Simulation-ready' : `${validation.issues.length} issue(s) blocking run`,
      },
    ];
  }, [edges.length, nodes, validation]);

  const highlights = useMemo(() => {
    const startNode = nodes.find((node) => node.type === NODE_TYPES.START);
    const endNode = nodes.find((node) => node.type === NODE_TYPES.END);
    const automatedNode = nodes.find((node) => node.type === NODE_TYPES.AUTOMATED);

    return [
      {
        title: 'Entry point',
        detail: startNode?.data.title || 'Missing start node',
      },
      {
        title: 'Primary output',
        detail: endNode?.data.endMessage || 'No end state defined',
      },
      {
        title: 'Automation action',
        detail: automatedNode?.data.actionId || 'No automation attached yet',
      },
    ];
  }, [nodes]);

  return (
    <div className="insights-panel">
      <div className="insights-header">
        <div>
          <p className="panel-kicker">Performance Overview</p>
          <h2>Studio Intelligence</h2>
        </div>
        <span className={`status-pill ${validation.isValid ? 'good' : 'risk'}`}>
          {validation.isValid ? 'Ready' : 'Needs fixes'}
        </span>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="metric-card">
            <span>{metric.label}</span>
            <strong className={`metric-value ${metric.tone}`}>{metric.value}</strong>
            <small>{metric.note}</small>
          </article>
        ))}
      </div>

      <div className="highlights-list">
        {highlights.map((item) => (
          <article key={item.title} className="highlight-card">
            <strong>{item.title}</strong>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>

      <div className="summary-card">
        <strong>Sandbox summary</strong>
        <p>
          {lastSimulation
            ? `Last run executed ${lastSimulation.result.steps.length} steps and captured an updated local snapshot.`
            : 'Run a simulation to generate execution evidence and delivery signals.'}
        </p>
      </div>
    </div>
  );
}
