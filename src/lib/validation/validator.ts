import { Client, Worker, Task, ValidationError, ValidationSummary } from '@/types';

// Utility function to check if a value is a valid JSON string
const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

// Utility function to check if an array is numeric
const isNumericArray = (arr: any[]): boolean => {
  return arr.every(item => !isNaN(Number(item)));
};

// Main validation function
export const validateAll = (
  clients: Client[],
  workers: Worker[],
  tasks: Task[]
): ValidationSummary => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // --- Check for missing required columns ---
  const checkRequiredFields = () => {
    // Check clients
    clients.forEach(client => {
      if (!client.ClientID) {
        errors.push({
          entityType: 'client',
          entityId: client.ClientName || 'unknown',
          field: 'ClientID',
          message: 'ClientID is required',
          severity: 'error'
        });
      }
      if (!client.ClientName) {
        errors.push({
          entityType: 'client',
          entityId: client.ClientID || 'unknown',
          field: 'ClientName',
          message: 'ClientName is required',
          severity: 'error'
        });
      }
    });

    // Check workers
    workers.forEach(worker => {
      if (!worker.WorkerID) {
        errors.push({
          entityType: 'worker',
          entityId: worker.WorkerName || 'unknown',
          field: 'WorkerID',
          message: 'WorkerID is required',
          severity: 'error'
        });
      }
      if (!worker.WorkerName) {
        errors.push({
          entityType: 'worker',
          entityId: worker.WorkerID || 'unknown',
          field: 'WorkerName',
          message: 'WorkerName is required',
          severity: 'error'
        });
      }
      if (!worker.Skills || worker.Skills.length === 0) {
        errors.push({
          entityType: 'worker',
          entityId: worker.WorkerID || 'unknown',
          field: 'Skills',
          message: 'Skills are required',
          severity: 'error'
        });
      }
    });

    // Check tasks
    tasks.forEach(task => {
      if (!task.TaskID) {
        errors.push({
          entityType: 'task',
          entityId: task.TaskName || 'unknown',
          field: 'TaskID',
          message: 'TaskID is required',
          severity: 'error'
        });
      }
      if (!task.TaskName) {
        errors.push({
          entityType: 'task',
          entityId: task.TaskID || 'unknown',
          field: 'TaskName',
          message: 'TaskName is required',
          severity: 'error'
        });
      }
      if (!task.RequiredSkills || task.RequiredSkills.length === 0) {
        errors.push({
          entityType: 'task',
          entityId: task.TaskID || 'unknown',
          field: 'RequiredSkills',
          message: 'RequiredSkills are required',
          severity: 'error'
        });
      }
    });
  };

  // --- Check for duplicate IDs ---
  const checkDuplicateIds = () => {
    // Check client IDs
    const clientIds = new Set<string>();
    clients.forEach(client => {
      if (clientIds.has(client.ClientID)) {
        errors.push({
          entityType: 'client',
          entityId: client.ClientID,
          field: 'ClientID',
          message: 'Duplicate ClientID found',
          severity: 'error'
        });
      }
      clientIds.add(client.ClientID);
    });

    // Check worker IDs
    const workerIds = new Set<string>();
    workers.forEach(worker => {
      if (workerIds.has(worker.WorkerID)) {
        errors.push({
          entityType: 'worker',
          entityId: worker.WorkerID,
          field: 'WorkerID',
          message: 'Duplicate WorkerID found',
          severity: 'error'
        });
      }
      workerIds.add(worker.WorkerID);
    });

    // Check task IDs
    const taskIds = new Set<string>();
    tasks.forEach(task => {
      if (taskIds.has(task.TaskID)) {
        errors.push({
          entityType: 'task',
          entityId: task.TaskID,
          field: 'TaskID',
          message: 'Duplicate TaskID found',
          severity: 'error'
        });
      }
      taskIds.add(task.TaskID);
    });
  };

  // --- Check for malformed lists ---
  const checkMalformedLists = () => {
    // Check worker available slots
    workers.forEach(worker => {
      if (!Array.isArray(worker.AvailableSlots) || !isNumericArray(worker.AvailableSlots)) {
        errors.push({
          entityType: 'worker',
          entityId: worker.WorkerID,
          field: 'AvailableSlots',
          message: 'AvailableSlots must be a numeric array',
          severity: 'error'
        });
      }
    });

    // Check task preferred phases
    tasks.forEach(task => {
      if (Array.isArray(task.PreferredPhases)) {
        if (!isNumericArray(task.PreferredPhases)) {
          errors.push({
            entityType: 'task',
            entityId: task.TaskID,
            field: 'PreferredPhases',
            message: 'PreferredPhases must contain only numbers',
            severity: 'error'
          });
        }
      } else if (typeof task.PreferredPhases === 'string') {
        // This should be handled by the parser, but adding a check here for safety
        errors.push({
          entityType: 'task',
          entityId: task.TaskID,
          field: 'PreferredPhases',
          message: 'PreferredPhases is in an unexpected string format',
          severity: 'error'
        });
      }
    });
  };

  // --- Check for out-of-range values ---
  const checkOutOfRangeValues = () => {
    // Check client priority levels
    clients.forEach(client => {
      if (client.PriorityLevel < 1 || client.PriorityLevel > 5) {
        errors.push({
          entityType: 'client',
          entityId: client.ClientID,
          field: 'PriorityLevel',
          message: 'PriorityLevel must be between 1 and 5',
          severity: 'error'
        });
      }
    });

    // Check task durations
    tasks.forEach(task => {
      if (task.Duration < 1) {
        errors.push({
          entityType: 'task',
          entityId: task.TaskID,
          field: 'Duration',
          message: 'Duration must be at least 1',
          severity: 'error'
        });
      }
    });

    // Check max concurrent
    tasks.forEach(task => {
      if (task.MaxConcurrent < 1) {
        errors.push({
          entityType: 'task',
          entityId: task.TaskID,
          field: 'MaxConcurrent',
          message: 'MaxConcurrent must be at least 1',
          severity: 'error'
        });
      }
    });
  };

  // --- Check for broken JSON in AttributesJSON ---
  const checkBrokenJSON = () => {
    clients.forEach(client => {
      if (client.AttributesJSON && !isValidJSON(client.AttributesJSON)) {
        errors.push({
          entityType: 'client',
          entityId: client.ClientID,
          field: 'AttributesJSON',
          message: 'AttributesJSON contains invalid JSON',
          severity: 'error'
        });
      }
    });
  };

  // --- Check for unknown references ---
  const checkUnknownReferences = () => {
    // Create a set of all task IDs for quick lookup
    const taskIdsSet = new Set(tasks.map(task => task.TaskID));

    // Check client requested task IDs
    clients.forEach(client => {
      if (client.RequestedTaskIDs && Array.isArray(client.RequestedTaskIDs)) {
        client.RequestedTaskIDs.forEach(taskId => {
          if (!taskIdsSet.has(taskId)) {
            errors.push({
              entityType: 'client',
              entityId: client.ClientID,
              field: 'RequestedTaskIDs',
              message: `Unknown TaskID '${taskId}' in RequestedTaskIDs`,
              severity: 'error'
            });
          }
        });
      }
    });
  };

  // --- Check for skill coverage ---
  const checkSkillCoverage = () => {
    // Create a set of all worker skills
    const allWorkerSkills = new Set<string>();
    workers.forEach(worker => {
      worker.Skills.forEach(skill => {
        allWorkerSkills.add(skill);
      });
    });

    // Check if every task required skill has at least one worker with that skill
    tasks.forEach(task => {
      task.RequiredSkills.forEach(skill => {
        if (!allWorkerSkills.has(skill)) {
          errors.push({
            entityType: 'task',
            entityId: task.TaskID,
            field: 'RequiredSkills',
            message: `No worker has the required skill '${skill}'`,
            severity: 'error'
          });
        }
      });
    });
  };

  // --- Check max concurrency feasibility ---
  const checkMaxConcurrencyFeasibility = () => {
    tasks.forEach(task => {
      // Count workers that have all required skills for this task
      let qualifiedWorkers = 0;
      
      workers.forEach(worker => {
        const workerHasAllSkills = task.RequiredSkills.every(skill => 
          worker.Skills.includes(skill)
        );
        
        if (workerHasAllSkills) {
          qualifiedWorkers++;
        }
      });
      
      if (qualifiedWorkers < task.MaxConcurrent) {
        errors.push({
          entityType: 'task',
          entityId: task.TaskID,
          field: 'MaxConcurrent',
          message: `MaxConcurrent (${task.MaxConcurrent}) exceeds the number of qualified workers (${qualifiedWorkers})`,
          severity: 'error'
        });
      }
    });
  };

  // --- Check for overloaded workers ---
  const checkOverloadedWorkers = () => {
    workers.forEach(worker => {
      if (worker.AvailableSlots.length < worker.MaxLoadPerPhase) {
        warnings.push({
          entityType: 'worker',
          entityId: worker.WorkerID,
          field: 'MaxLoadPerPhase',
          message: `MaxLoadPerPhase (${worker.MaxLoadPerPhase}) exceeds available slots (${worker.AvailableSlots.length})`,
          severity: 'warning'
        });
      }
    });
  };

  // Run all validations
  checkRequiredFields();
  checkDuplicateIds();
  checkMalformedLists();
  checkOutOfRangeValues();
  checkBrokenJSON();
  checkUnknownReferences();
  checkSkillCoverage();
  checkMaxConcurrencyFeasibility();
  checkOverloadedWorkers();

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};