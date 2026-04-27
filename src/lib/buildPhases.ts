export interface PhaseTask {
  title: string;
  status: 'in_progress' | 'planned';
}

export interface BuildPhase {
  name: string;
  outcome: string;
  tasks: PhaseTask[];
}

export const buildPhases: BuildPhase[] = [
  {
    name: 'Phase 1',
    outcome: 'MVP foundation for customer booking, owner operations, staff basics, and platform visibility.',
    tasks: [
      { title: 'Refine public customer journey', status: 'in_progress' },
      { title: 'Stabilize owner dashboard basics', status: 'in_progress' },
      { title: 'Refine staff portal essentials', status: 'planned' },
      { title: 'Refine platform admin essentials', status: 'planned' },
      { title: 'Improve responsive system and empty states', status: 'in_progress' },
    ],
  },
  {
    name: 'Phase 2',
    outcome: 'Operational depth for real business workflows.',
    tasks: [
      { title: 'Expand service and booking management', status: 'planned' },
      { title: 'Deepen portfolio and review workflows', status: 'planned' },
      { title: 'Improve analytics and notifications', status: 'planned' },
    ],
  },
  {
    name: 'Phase 3',
    outcome: 'Production readiness, validation, security, and performance.',
    tasks: [
      { title: 'Validate schema and RLS end to end', status: 'planned' },
      { title: 'Harden validation and edge-case handling', status: 'planned' },
      { title: 'Reduce performance and bundle risks', status: 'planned' },
    ],
  },
];
