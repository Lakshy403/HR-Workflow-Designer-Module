import { NODE_TEMPLATES, NODE_TYPES } from '../types/workflow.types';

function withBase(type, id, position, data) {
  return {
    id,
    type,
    position,
    data: {
      ...NODE_TEMPLATES[type],
      ...data,
    },
  };
}

export const workflowTemplates = [
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    category: 'Lifecycle',
    summary: 'Document intake, approvals, provisioning, and welcome handoff.',
    nodes: [
      withBase(NODE_TYPES.START, 'start-1', { x: 60, y: 180 }, {
        title: 'Employee Onboarding',
        metadata: [
          { key: 'region', value: 'APAC' },
          { key: 'journey', value: 'new hire' },
        ],
      }),
      withBase(NODE_TYPES.TASK, 'task-1', { x: 340, y: 80 }, {
        title: 'Collect employee documents',
        assignee: 'HR Coordinator',
        description: 'Collect ID, tax, and signed policy documents.',
        customFields: [{ key: 'document SLA', value: '48 hours' }],
      }),
      withBase(NODE_TYPES.APPROVAL, 'approval-1', { x: 340, y: 280 }, {
        title: 'Manager approval',
        approverRole: 'Hiring Manager',
        autoApproveThreshold: '24',
      }),
      withBase(NODE_TYPES.AUTOMATED, 'automated-1', { x: 640, y: 180 }, {
        title: 'Provision systems',
        actionId: 'create_ticket',
        dynamicParameters: {
          system: 'IT access bundle',
          priority: 'high',
        },
      }),
      withBase(NODE_TYPES.END, 'end-1', { x: 940, y: 180 }, {
        endMessage: 'New hire is ready for day one.',
        summaryFlag: true,
      }),
    ],
    edges: [
      { id: 'e-start-task', source: 'start-1', target: 'task-1', type: 'labeled', data: { label: 'Begin docs' } },
      { id: 'e-start-approval', source: 'start-1', target: 'approval-1', type: 'labeled', data: { label: 'Request approval' } },
      { id: 'e-task-automated', source: 'task-1', target: 'automated-1', type: 'labeled', data: { label: 'Docs verified' } },
      { id: 'e-approval-automated', source: 'approval-1', target: 'automated-1', type: 'labeled', data: { label: 'Approved' } },
      { id: 'e-automated-end', source: 'automated-1', target: 'end-1', type: 'labeled', data: { label: 'Provisioned' } },
    ],
  },
  {
    id: 'leave-approval',
    name: 'Leave Approval',
    category: 'Approvals',
    summary: 'Balance checks, role approval, and employee notification flow.',
    nodes: [
      withBase(NODE_TYPES.START, 'start-1', { x: 60, y: 180 }, {
        title: 'Leave Request',
        metadata: [
          { key: 'policy', value: 'global leave v2' },
          { key: 'request type', value: 'planned' },
        ],
      }),
      withBase(NODE_TYPES.TASK, 'task-1', { x: 320, y: 180 }, {
        title: 'Review employee request',
        assignee: 'HR Operations',
        description: 'Verify balance, dates, and overlap rules.',
        dueDate: '2026-04-21',
      }),
      withBase(NODE_TYPES.APPROVAL, 'approval-1', { x: 620, y: 180 }, {
        title: 'Approve leave',
        approverRole: 'Reporting Manager',
        autoApproveThreshold: '8',
      }),
      withBase(NODE_TYPES.AUTOMATED, 'automated-1', { x: 900, y: 180 }, {
        title: 'Notify employee',
        actionId: 'send_email',
        dynamicParameters: {
          to: 'employee@company.com',
          subject: 'Leave request status',
        },
      }),
      withBase(NODE_TYPES.END, 'end-1', { x: 1180, y: 180 }, {
        endMessage: 'Leave request completed.',
        summaryFlag: true,
      }),
    ],
    edges: [
      { id: 'e-start-task', source: 'start-1', target: 'task-1', type: 'labeled', data: { label: 'Submit' } },
      { id: 'e-task-approval', source: 'task-1', target: 'approval-1', type: 'labeled', data: { label: 'Reviewed' } },
      { id: 'e-approval-automated', source: 'approval-1', target: 'automated-1', type: 'labeled', data: { label: 'Approved' } },
      { id: 'e-automated-end', source: 'automated-1', target: 'end-1', type: 'labeled', data: { label: 'Notified' } },
    ],
  },
  {
    id: 'document-verification',
    name: 'Document Verification',
    category: 'Compliance',
    summary: 'Intake, validation, exception handling, and issue of final status.',
    nodes: [
      withBase(NODE_TYPES.START, 'start-1', { x: 60, y: 180 }, {
        title: 'Verification Intake',
        metadata: [
          { key: 'channel', value: 'self service portal' },
          { key: 'risk tier', value: 'medium' },
        ],
      }),
      withBase(NODE_TYPES.TASK, 'task-1', { x: 330, y: 80 }, {
        title: 'Initial review',
        assignee: 'Compliance Analyst',
        description: 'Check completeness and quality of uploaded artifacts.',
      }),
      withBase(NODE_TYPES.AUTOMATED, 'automated-1', { x: 330, y: 280 }, {
        title: 'Generate verification package',
        actionId: 'generate_doc',
        dynamicParameters: {
          template: 'verification_pack',
          recipient: 'audit-team',
        },
      }),
      withBase(NODE_TYPES.APPROVAL, 'approval-1', { x: 640, y: 180 }, {
        title: 'Compliance sign-off',
        approverRole: 'Compliance Lead',
        autoApproveThreshold: '4',
      }),
      withBase(NODE_TYPES.END, 'end-1', { x: 930, y: 180 }, {
        endMessage: 'Verification outcome shared.',
        summaryFlag: true,
      }),
    ],
    edges: [
      { id: 'e-start-task', source: 'start-1', target: 'task-1', type: 'labeled', data: { label: 'Review' } },
      { id: 'e-start-auto', source: 'start-1', target: 'automated-1', type: 'labeled', data: { label: 'Auto-gen' } },
      { id: 'e-task-approval', source: 'task-1', target: 'approval-1', type: 'labeled', data: { label: 'Checked' } },
      { id: 'e-auto-approval', source: 'automated-1', target: 'approval-1', type: 'labeled', data: { label: 'Package ready' } },
      { id: 'e-approval-end', source: 'approval-1', target: 'end-1', type: 'labeled', data: { label: 'Signed off' } },
    ],
  },
];

export const defaultWorkflowTemplate = workflowTemplates[0];
