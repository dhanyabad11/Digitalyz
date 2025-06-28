// Data Types
export interface Client {
  ClientID: string;
  ClientName: string;
  PriorityLevel: number;
  RequestedTaskIDs: string[];
  GroupTag: string;
  AttributesJSON: string;
}

export interface Worker {
  WorkerID: string;
  WorkerName: string;
  Skills: string[];
  AvailableSlots: number[];
  MaxLoadPerPhase: number;
  WorkerGroup: string;
  QualificationLevel: string;
}

export interface Task {
  TaskID: string;
  TaskName: string;
  Category: string;
  Duration: number;
  RequiredSkills: string[];
  PreferredPhases: string | number[];
  MaxConcurrent: number;
}

// Validation Types
export interface ValidationError {
  entityType: 'client' | 'worker' | 'task';
  entityId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationSummary {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Rule Types
export type RuleType = 
  | 'coRun' 
  | 'slotRestriction' 
  | 'loadLimit' 
  | 'phaseWindow' 
  | 'patternMatch' 
  | 'precedenceOverride';

export interface Rule {
  id: string;
  type: RuleType;
  parameters: Record<string, any>;
  description: string;
  priority?: number;
}

export interface CoRunRule extends Rule {
  type: 'coRun';
  parameters: {
    tasks: string[];
  };
}

export interface SlotRestrictionRule extends Rule {
  type: 'slotRestriction';
  parameters: {
    groupType: 'client' | 'worker';
    groupName: string;
    minCommonSlots: number;
  };
}

export interface LoadLimitRule extends Rule {
  type: 'loadLimit';
  parameters: {
    workerGroup: string;
    maxSlotsPerPhase: number;
  };
}

export interface PhaseWindowRule extends Rule {
  type: 'phaseWindow';
  parameters: {
    taskId: string;
    allowedPhases: number[];
  };
}

export interface PatternMatchRule extends Rule {
  type: 'patternMatch';
  parameters: {
    pattern: string;
    template: string;
    additionalParams: Record<string, any>;
  };
}

export interface PrecedenceOverrideRule extends Rule {
  type: 'precedenceOverride';
  parameters: {
    globalRules: string[];
    specificRules: string[];
    priorityOrder: string[];
  };
}

// Prioritization Types
export interface PriorityWeight {
  name: string;
  description: string;
  weight: number;
}

export interface PriorityProfile {
  name: string;
  description: string;
  weights: PriorityWeight[];
}

// Export Types
export interface ExportData {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  rules: Rule[];
  prioritization: PriorityWeight[];
}