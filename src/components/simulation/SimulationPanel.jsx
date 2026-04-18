import { useSimulation } from '../../hooks/useSimulation';
import { useWorkflow } from '../../hooks/useWorkflow';

export default function SimulationPanel() {
  const nodes = useWorkflow((state) => state.nodes);
  const edges = useWorkflow((state) => state.edges);
  const validation = useWorkflow((state) => state.validation);
  const activeTemplateId = useWorkflow((state) => state.activeTemplateId);
  const setLastSimulation = useWorkflow((state) => state.setLastSimulation);
  const lastSimulation = useWorkflow((state) => state.lastSimulation);
  const { logs, error, isSimulating, runSimulation, clearLogs } = useSimulation();

  const simulate = async () => {
    if (!validation.isValid) {
      return;
    }

    const payload = { nodes, edges };
    const result = await runSimulation(payload);
    setLastSimulation({
      payload,
      finishedAt: new Date().toISOString(),
      result,
    });
  };

  return (
    <div className="simulation-wrap">
      <div className="simulation-header">
        <div>
          <p className="panel-kicker">Sandbox</p>
          <h2>Simulation Panel</h2>
          <p className="config-node-id">Scenario: {activeTemplateId || 'custom workflow'}</p>
        </div>
        <div className="simulation-actions">
          <button className="secondary-button" onClick={clearLogs} type="button">
            Clear logs
          </button>
          <button
            className="primary-button"
            disabled={!validation.isValid || isSimulating}
            onClick={simulate}
            type="button"
          >
            {isSimulating ? 'Running...' : 'Run simulation'}
          </button>
        </div>
      </div>

      <div className={`validation-box ${validation.isValid ? 'valid' : 'invalid'}`}>
        <strong>{validation.isValid ? 'Workflow is valid' : 'Validation issues found'}</strong>
        {validation.issues.length ? (
          <ul>
            {validation.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        ) : (
          <p>All structural rules passed. The workflow is ready for simulation.</p>
        )}
      </div>

      <div className="run-stats">
        <article>
          <strong>{nodes.length}</strong>
          <span>Execution units</span>
        </article>
        <article>
          <strong>{edges.length}</strong>
          <span>Path branches</span>
        </article>
        <article>
          <strong>{lastSimulation?.result.steps.length || 0}</strong>
          <span>Completed steps</span>
        </article>
      </div>

      <div className="payload-box">
        <div className="payload-header">
          <strong>Serialized workflow JSON</strong>
          <span>
            {nodes.length} nodes / {edges.length} edges
          </span>
        </div>
        <pre>{JSON.stringify({ nodes, edges }, null, 2)}</pre>
      </div>

      <div className="logs-box">
        <strong>Execution log</strong>
        {error ? <p className="error-text">{error}</p> : null}
        {logs.length ? (
          <div className="log-list">
            {logs.map((log) => (
              <article key={log.id} className="log-card">
                <div>
                  <span>{log.nodeType}</span>
                  <strong>{log.title}</strong>
                  <small>{log.duration?.toFixed(2)}s</small>
                </div>
                <p>{log.message}</p>
              </article>
            ))}
          </div>
        ) : (
          <p>No simulation logs yet.</p>
        )}
      </div>

      {lastSimulation ? (
        <p className="last-run">
          Last run captured locally at {new Date(lastSimulation.finishedAt).toLocaleTimeString()}.
        </p>
      ) : null}
    </div>
  );
}
