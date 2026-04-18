import { useState } from 'react';
import { simulationService } from '../services/api';

export function useSimulation() {
  const [logs, setLogs] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState('');

  const runSimulation = async (payload) => {
    setIsSimulating(true);
    setError('');

    try {
      const response = await simulationService.simulate(payload);
      setLogs(response.steps);
      return response;
    } catch (simulationError) {
      setError(simulationError.message || 'Simulation failed.');
      throw simulationError;
    } finally {
      setIsSimulating(false);
    }
  };

  return {
    error,
    isSimulating,
    logs,
    runSimulation,
    clearLogs: () => setLogs([]),
  };
}
