import { fetchAutomations, simulateWorkflow } from './mockApi';

export const automationService = {
  getAutomations: fetchAutomations,
};

export const simulationService = {
  simulate: simulateWorkflow,
};
