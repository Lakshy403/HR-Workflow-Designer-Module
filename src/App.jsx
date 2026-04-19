import { useEffect, useState } from 'react';
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
  const selectedNodeId = useWorkflow((state) => state.selectedNodeId);

  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [rightTab, setRightTab] = useState('config');
  const [theme, setTheme] = useState('dark');
  const [isFullscreen, setIsFullscreen] = useState(true);

  const activeTemplate = templates.find((template) => template.id === activeTemplateId);

  useEffect(() => {
    loadAutomationActions();
  }, [loadAutomationActions]);

  useEffect(() => {
    if (!selectedNodeId) {
      return;
    }

    setRightOpen(true);
    setRightTab('config');
  }, [selectedNodeId]);

  return (
    <div 
      className={`app-shell-fullscreen ${!isFullscreen ? 'layout-inline' : ''}`} 
      data-theme={theme}
      style={{
        '--panel-left-offset': isFullscreen && leftOpen ? '324px' : '24px',
        '--panel-right-offset': isFullscreen && rightOpen ? '384px' : '24px'
      }}
    >
      {/* Top bar: Hero stats overlay */}
      <header className="hero-overlay">
        <div className="hero-brand">
          <p className="eyebrow">HR Workflow Designer</p>
          <h1>Visual Workflow Studio</h1>
        </div>
        <div className="hero-stats-bar">
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
            <span>{validation.isValid ? '● Ready' : '○ Needs fixes'}</span>
          </article>
          <article 
            style={{ cursor: 'pointer', justifyContent: 'center', transition: 'transform 0.2s' }} 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Theme"
          >
            <strong>{theme === 'dark' ? '🌙' : '☀️'}</strong>
            <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </article>
        </div>
      </header>

      <div className="work-area-bounds">
        {/* Full-screen canvas as the base layer */}
        <div className="canvas-fullscreen-wrapper">
        <section className="panel canvas-panel">
          <WorkflowCanvas />
        </section>
      </div>



      {/* Floating Left Panel Toggle */}
      <button
        className={`float-toggle float-toggle--left ${leftOpen ? 'active' : ''}`}
        onClick={() => setLeftOpen(!leftOpen)}
        type="button"
        title="Toggle node palette"
      >
        {leftOpen ? '◀' : '▶'}
      </button>

      {/* Floating Left Sidebar */}
      <aside className={`floating-panel floating-panel--left ${leftOpen ? 'open' : 'closed'}`}>
        <NodeSidebar />
      </aside>

      {/* Floating Right Panel Toggle */}
      <button
        className={`float-toggle float-toggle--right ${rightOpen ? 'active' : ''}`}
        onClick={() => setRightOpen(!rightOpen)}
        type="button"
        title="Toggle details panel"
      >
        {rightOpen ? '▶' : '◀'}
      </button>

      {/* Floating Right Panel */}
      <aside className={`floating-panel floating-panel--right ${rightOpen ? 'open' : 'closed'}`}>
        <div className="right-panel-tabs">
          <button
            className={`tab-btn ${rightTab === 'config' ? 'active' : ''}`}
            onClick={() => setRightTab('config')}
            type="button"
          >
            Config
          </button>
          <button
            className={`tab-btn ${rightTab === 'insights' ? 'active' : ''}`}
            onClick={() => setRightTab('insights')}
            type="button"
          >
            Insights
          </button>
          <button
            className={`tab-btn ${rightTab === 'simulation' ? 'active' : ''}`}
            onClick={() => setRightTab('simulation')}
            type="button"
          >
            Simulation
          </button>
        </div>
        <div className="right-panel-content">
          {rightTab === 'config' && <NodeConfigPanel />}
          {rightTab === 'insights' && <WorkflowInsightsPanel />}
          {rightTab === 'simulation' && <SimulationPanel />}
        </div>
      </aside>
      </div>
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
