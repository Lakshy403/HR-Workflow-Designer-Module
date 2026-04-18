import { useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import WorkflowCanvas from './components/canvas/WorkflowCanvas';
import NodeConfigPanel from './components/forms/NodeConfigPanel';
import WorkflowInsightsPanel from './components/insights/WorkflowInsightsPanel';
import NodeSidebar from './components/sidebar/NodeSidebar';
import SimulationPanel from './components/simulation/SimulationPanel';
import { useWorkflow } from './hooks/useWorkflow';

function AppShell() {
  const loadAutomationActions = useWorkflow((state) => state.loadAutomationActions);
  const nodes = useWorkflow((state) => state.nodes);
  const edges = useWorkflow((state) => state.edges);
  const activeTemplateId = useWorkflow((state) => state.activeTemplateId);
  const templates = useWorkflow((state) => state.workflowTemplates);
  const validation = useWorkflow((state) => state.validation);

  const activeTemplate = templates.find((template) => template.id === activeTemplateId);

  useEffect(() => {
    loadAutomationActions();
  }, [loadAutomationActions]);

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">HR Workflow Designer</p>
          <h1>Build onboarding, approval, and automation flows visually.</h1>
        </div>
        <div className="hero-side">
          <p className="hero-copy">
            Drag nodes onto the canvas, configure each step, validate the structure,
            and run a sandbox simulation with mocked APIs.
          </p>
          <div className="hero-stats">
            <article>
              <strong>{nodes.length}</strong>
              <span>Nodes</span>
            </article>
            <article>
              <strong>{edges.length}</strong>
              <span>Transitions</span>
            </article>
            <article>
              <strong>{activeTemplate?.name || 'Custom Flow'}</strong>
              <span>{validation.isValid ? 'Simulation-ready' : 'Needs validation'}</span>
            </article>
          </div>
        </div>
      </header>

      <main className="workspace">
        <aside className="panel sidebar-panel">
          <NodeSidebar />
        </aside>

        <section className="panel canvas-panel">
          <WorkflowCanvas />
        </section>

        <aside className="stack">
          <section className="panel details-panel">
            <NodeConfigPanel />
          </section>

          <section className="panel insights-shell">
            <WorkflowInsightsPanel />
          </section>

          <section className="panel simulation-panel">
            <SimulationPanel />
          </section>
        </aside>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <AppShell />
    </ReactFlowProvider>
  );
}
