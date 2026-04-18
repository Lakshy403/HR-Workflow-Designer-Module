export const NODE_TYPES = {
  START: 'start',
  TASK: 'task',
  APPROVAL: 'approval',
  AUTOMATED: 'automated',
  END: 'end',
};

export const NODE_LABELS = {
  [NODE_TYPES.START]: 'Start',
  [NODE_TYPES.TASK]: 'Task',
  [NODE_TYPES.APPROVAL]: 'Approval',
  [NODE_TYPES.AUTOMATED]: 'Automated Step',
  [NODE_TYPES.END]: 'End',
};

export const NODE_TEMPLATES = {
  [NODE_TYPES.START]: {
    title: 'New workflow',
    metadata: [{ key: 'department', value: 'HR' }],
  },
  [NODE_TYPES.TASK]: {
    title: 'HR Task',
    description: '',
    assignee: '',
    dueDate: '',
    customFields: [],
  },
  [NODE_TYPES.APPROVAL]: {
    title: 'Manager approval',
    approverRole: '',
    autoApproveThreshold: '',
  },
  [NODE_TYPES.AUTOMATED]: {
    title: 'Automated action',
    actionId: '',
    dynamicParameters: {},
  },
  [NODE_TYPES.END]: {
    endMessage: 'Workflow completed successfully.',
    summaryFlag: true,
  },
};
