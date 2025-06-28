// This is a simplified simulation of AI processing for natural language queries
// In a real application, this would call an OpenAI or similar API

import { Client, Worker, Task } from '@/types';

// Process natural language search query
export const processSearchQuery = async (
  query: string,
  clients: Client[],
  workers: Worker[],
  tasks: Task[]
): Promise<{
  results: (Client | Worker | Task)[];
  entityType: 'client' | 'worker' | 'task' | 'mixed';
  explanation: string;
}> => {
  const lowerQuery = query.toLowerCase();
  
  // Simple pattern matching for demonstration purposes
  
  // Client-related queries
  if (
    lowerQuery.includes('client') ||
    lowerQuery.includes('priority level') ||
    lowerQuery.includes('requested task')
  ) {
    let filteredClients = [...clients];
    let explanation = "Showing all clients";
    
    // Filter by priority level
    if (lowerQuery.includes('priority') && /\d+/.test(lowerQuery)) {
      const priorityLevel = parseInt(lowerQuery.match(/\d+/)?.[0] || '0');
      filteredClients = filteredClients.filter(client => client.PriorityLevel === priorityLevel);
      explanation = `Showing clients with priority level ${priorityLevel}`;
    }
    
    // Filter by high priority
    if (lowerQuery.includes('high priority') || lowerQuery.includes('highest priority')) {
      filteredClients = filteredClients.filter(client => client.PriorityLevel >= 4);
      explanation = "Showing clients with high priority (level 4-5)";
    }
    
    // Filter by requested tasks
    if (lowerQuery.includes('task')) {
      const taskMentions = tasks
        .filter(task => lowerQuery.includes(task.TaskID.toLowerCase()))
        .map(task => task.TaskID);
      
      if (taskMentions.length > 0) {
        filteredClients = filteredClients.filter(client => 
          taskMentions.some(taskId => client.RequestedTaskIDs.includes(taskId))
        );
        explanation = `Showing clients that requested tasks: ${taskMentions.join(', ')}`;
      }
    }
    
    return {
      results: filteredClients,
      entityType: 'client',
      explanation
    };
  }
  
  // Worker-related queries
  if (
    lowerQuery.includes('worker') ||
    lowerQuery.includes('skill') ||
    lowerQuery.includes('available')
  ) {
    let filteredWorkers = [...workers];
    let explanation = "Showing all workers";
    
    // Filter by skills
    const skillKeywords = [
      'database', 'frontend', 'backend', 'design', 'api', 'testing', 
      'security', 'analytics', 'mobile', 'ux', 'documentation'
    ];
    
    const mentionedSkills = skillKeywords.filter(skill => lowerQuery.includes(skill));
    
    if (mentionedSkills.length > 0) {
      filteredWorkers = filteredWorkers.filter(worker => 
        mentionedSkills.every(skill => worker.Skills.includes(skill))
      );
      explanation = `Showing workers with skills: ${mentionedSkills.join(', ')}`;
    }
    
    // Filter by available slots
    if (lowerQuery.includes('phase') && /\d+/.test(lowerQuery)) {
      const phaseNumber = parseInt(lowerQuery.match(/\d+/)?.[0] || '0');
      filteredWorkers = filteredWorkers.filter(worker => 
        worker.AvailableSlots.includes(phaseNumber)
      );
      explanation = `Showing workers available in phase ${phaseNumber}`;
    }
    
    return {
      results: filteredWorkers,
      entityType: 'worker',
      explanation
    };
  }
  
  // Task-related queries
  if (
    lowerQuery.includes('task') ||
    lowerQuery.includes('duration') ||
    lowerQuery.includes('required skill') ||
    lowerQuery.includes('category')
  ) {
    let filteredTasks = [...tasks];
    let explanation = "Showing all tasks";
    
    // Filter by duration
    if (lowerQuery.includes('duration') && /\d+/.test(lowerQuery)) {
      const durationNumber = parseInt(lowerQuery.match(/\d+/)?.[0] || '0');
      
      if (lowerQuery.includes('more than') || lowerQuery.includes('greater than')) {
        filteredTasks = filteredTasks.filter(task => task.Duration > durationNumber);
        explanation = `Showing tasks with duration more than ${durationNumber}`;
      } else if (lowerQuery.includes('less than')) {
        filteredTasks = filteredTasks.filter(task => task.Duration < durationNumber);
        explanation = `Showing tasks with duration less than ${durationNumber}`;
      } else {
        filteredTasks = filteredTasks.filter(task => task.Duration === durationNumber);
        explanation = `Showing tasks with duration equal to ${durationNumber}`;
      }
    }
    
    // Filter by category
    const categories = ['Infrastructure', 'Development', 'Security', 'Analytics', 'Support', 'Design'];
    const mentionedCategory = categories.find(category => 
      lowerQuery.includes(category.toLowerCase())
    );
    
    if (mentionedCategory) {
      filteredTasks = filteredTasks.filter(task => 
        task.Category.toLowerCase() === mentionedCategory.toLowerCase()
      );
      explanation = `Showing tasks in category: ${mentionedCategory}`;
    }
    
    // Filter by required skills
    const skillKeywords = [
      'database', 'frontend', 'backend', 'design', 'api', 'testing', 
      'security', 'analytics', 'mobile', 'ux', 'documentation'
    ];
    
    const mentionedSkills = skillKeywords.filter(skill => lowerQuery.includes(skill));
    
    if (mentionedSkills.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        mentionedSkills.some(skill => task.RequiredSkills.includes(skill))
      );
      explanation = `Showing tasks requiring skills: ${mentionedSkills.join(', ')}`;
    }
    
    return {
      results: filteredTasks,
      entityType: 'task',
      explanation
    };
  }
  
  // Default behavior: return all data with mixed type
  return {
    results: [...clients, ...workers, ...tasks],
    entityType: 'mixed',
    explanation: "Showing all data matching your query"
  };
};

// Process natural language rule creation
export const processRuleCreation = async (
  description: string,
  clients: Client[],
  workers: Worker[],
  tasks: Task[]
): Promise<{
  ruleType: string;
  parameters: Record<string, any>;
  description: string;
  success: boolean;
  message: string;
}> => {
  const lowerDesc = description.toLowerCase();
  
  // Identify task IDs mentioned in the description
  const mentionedTaskIds = tasks
    .map(task => task.TaskID)
    .filter(id => lowerDesc.includes(id.toLowerCase()));
  
  // Identify worker groups mentioned in the description
  const mentionedWorkerGroups = Array.from(new Set(
    workers.map(worker => worker.WorkerGroup)
  )).filter(group => group && lowerDesc.includes(group.toLowerCase()));
  
  // Identify client groups mentioned in the description
  const mentionedClientGroups = Array.from(new Set(
    clients.map(client => client.GroupTag)
  )).filter(group => group && lowerDesc.includes(group.toLowerCase()));
  
  // Extract numbers from the description
  const numbers = lowerDesc.match(/\d+/g)?.map(Number) || [];
  
  // Co-Run rule
  if (
    (lowerDesc.includes('run together') || lowerDesc.includes('co-run') || lowerDesc.includes('corun')) &&
    mentionedTaskIds.length >= 2
  ) {
    return {
      ruleType: 'coRun',
      parameters: {
        tasks: mentionedTaskIds
      },
      description: `Tasks ${mentionedTaskIds.join(', ')} must run together`,
      success: true,
      message: "Created a co-run rule for the specified tasks."
    };
  }
  
  // Phase Window rule
  if (
    (lowerDesc.includes('phase') || lowerDesc.includes('window')) &&
    mentionedTaskIds.length === 1 &&
    numbers.length > 0
  ) {
    // Extract phase ranges if present
    let phases: number[] = [];
    if (lowerDesc.match(/phase\s*\d+\s*-\s*\d+/)) {
      const matches = lowerDesc.match(/phase\s*(\d+)\s*-\s*(\d+)/);
      if (matches && matches.length >= 3) {
        const start = parseInt(matches[1]);
        const end = parseInt(matches[2]);
        for (let i = start; i <= end; i++) {
          phases.push(i);
        }
      }
    } else {
      phases = numbers.filter(num => num >= 1 && num <= 10); // Assume phases are 1-10
    }
    
    if (phases.length > 0) {
      return {
        ruleType: 'phaseWindow',
        parameters: {
          taskId: mentionedTaskIds[0],
          allowedPhases: phases
        },
        description: `Task ${mentionedTaskIds[0]} can only run in phases ${phases.join(', ')}`,
        success: true,
        message: "Created a phase window rule for the specified task."
      };
    }
  }
  
  // Load Limit rule
  if (
    (lowerDesc.includes('load limit') || lowerDesc.includes('max load') || lowerDesc.includes('maximum load')) &&
    mentionedWorkerGroups.length === 1 &&
    numbers.length > 0
  ) {
    const maxLoad = numbers.find(num => num >= 1) || 1;
    
    return {
      ruleType: 'loadLimit',
      parameters: {
        workerGroup: mentionedWorkerGroups[0],
        maxSlotsPerPhase: maxLoad
      },
      description: `Worker group ${mentionedWorkerGroups[0]} has a maximum of ${maxLoad} slots per phase`,
      success: true,
      message: "Created a load limit rule for the specified worker group."
    };
  }
  
  // Slot Restriction rule
  if (
    (lowerDesc.includes('slot restriction') || lowerDesc.includes('common slots') || lowerDesc.includes('minimum slots')) &&
    (mentionedWorkerGroups.length === 1 || mentionedClientGroups.length === 1) &&
    numbers.length > 0
  ) {
    const minSlots = numbers.find(num => num >= 1) || 1;
    
    if (mentionedWorkerGroups.length === 1) {
      return {
        ruleType: 'slotRestriction',
        parameters: {
          groupType: 'worker',
          groupName: mentionedWorkerGroups[0],
          minCommonSlots: minSlots
        },
        description: `Worker group ${mentionedWorkerGroups[0]} requires at least ${minSlots} common slots`,
        success: true,
        message: "Created a slot restriction rule for the specified worker group."
      };
    } else {
      return {
        ruleType: 'slotRestriction',
        parameters: {
          groupType: 'client',
          groupName: mentionedClientGroups[0],
          minCommonSlots: minSlots
        },
        description: `Client group ${mentionedClientGroups[0]} requires at least ${minSlots} common slots`,
        success: true,
        message: "Created a slot restriction rule for the specified client group."
      };
    }
  }
  
  // If no rule could be created
  return {
    ruleType: '',
    parameters: {},
    description: '',
    success: false,
    message: "I couldn't create a rule from your description. Please try providing more details or use different phrasing."
  };
};

// Process natural language data correction suggestions
export const generateDataCorrectionSuggestions = async (
  errors: any[],
  clients: Client[],
  workers: Worker[],
  tasks: Task[]
): Promise<{
  suggestions: {
    entityId: string;
    entityType: string;
    field: string;
    currentValue: any;
    suggestedValue: any;
    explanation: string;
  }[];
}> => {
  const suggestions = [];
  
  // Process each error and generate suggestions
  for (const error of errors) {
    if (error.field === 'RequiredSkills' && error.message.includes('No worker has the required skill')) {
      // Suggestion for missing skills
      const skillMatch = error.message.match(/'([^']+)'/);
      if (skillMatch && skillMatch[1]) {
        const missingSkill = skillMatch[1];
        const commonSkills = Array.from(new Set(
          workers.flatMap(worker => worker.Skills)
        ));
        
        // Find most similar skill
        const similarSkill = commonSkills.find(skill => 
          skill.toLowerCase().includes(missingSkill.toLowerCase()) || 
          missingSkill.toLowerCase().includes(skill.toLowerCase())
        );
        
        if (similarSkill) {
          suggestions.push({
            entityId: error.entityId,
            entityType: error.entityType,
            field: error.field,
            currentValue: tasks.find(t => t.TaskID === error.entityId)?.RequiredSkills || [],
            suggestedValue: tasks.find(t => t.TaskID === error.entityId)?.RequiredSkills.map(s => 
              s === missingSkill ? similarSkill : s
            ) || [],
            explanation: `Replace unknown skill '${missingSkill}' with available skill '${similarSkill}'`
          });
        }
      }
    }
    
    else if (error.field === 'MaxConcurrent' && error.message.includes('exceeds the number of qualified workers')) {
      // Suggestion for MaxConcurrent value
      const task = tasks.find(t => t.TaskID === error.entityId);
      if (task) {
        const qualifiedWorkerCount = workers.filter(worker => 
          task.RequiredSkills.every(skill => worker.Skills.includes(skill))
        ).length;
        
        suggestions.push({
          entityId: error.entityId,
          entityType: error.entityType,
          field: error.field,
          currentValue: task.MaxConcurrent,
          suggestedValue: qualifiedWorkerCount,
          explanation: `Reduce MaxConcurrent to ${qualifiedWorkerCount}, which is the number of qualified workers`
        });
      }
    }
    
    else if (error.field === 'RequestedTaskIDs' && error.message.includes('Unknown TaskID')) {
      // Suggestion for unknown task IDs
      const taskIdMatch = error.message.match(/'([^']+)'/);
      if (taskIdMatch && taskIdMatch[1]) {
        const unknownTaskId = taskIdMatch[1];
        const validTaskIds = tasks.map(task => task.TaskID);
        
        // Find most similar task ID
        const similarTaskId = validTaskIds.find(id => 
          id.toLowerCase().includes(unknownTaskId.toLowerCase()) || 
          unknownTaskId.toLowerCase().includes(id.toLowerCase())
        );
        
        const client = clients.find(c => c.ClientID === error.entityId);
        if (similarTaskId && client) {
          suggestions.push({
            entityId: error.entityId,
            entityType: error.entityType,
            field: error.field,
            currentValue: client.RequestedTaskIDs,
            suggestedValue: client.RequestedTaskIDs.map(id => 
              id === unknownTaskId ? similarTaskId : id
            ),
            explanation: `Replace unknown task ID '${unknownTaskId}' with valid task ID '${similarTaskId}'`
          });
        }
      }
    }
    
    else if (error.field === 'AttributesJSON' && error.message.includes('invalid JSON')) {
      // Suggestion for invalid JSON
      const client = clients.find(c => c.ClientID === error.entityId);
      if (client) {
        suggestions.push({
          entityId: error.entityId,
          entityType: error.entityType,
          field: error.field,
          currentValue: client.AttributesJSON,
          suggestedValue: '{}',
          explanation: 'Fix invalid JSON by using an empty object'
        });
      }
    }
  }
  
  return { suggestions };
};