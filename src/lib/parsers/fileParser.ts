import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Client, Worker, Task } from '@/types';

// Helper function to normalize array values from CSV/Excel
const normalizeArrayValue = (value: string): string[] => {
  if (!value) return [];
  // Handle various formats: comma-separated strings, JSON arrays, etc.
  if (value.startsWith('[') && value.endsWith(']')) {
    try {
      return JSON.parse(value);
    } catch (e) {
      // If parsing fails, try comma split
      return value.slice(1, -1).split(',').map(item => item.trim());
    }
  }
  return value.split(',').map(item => item.trim());
};

// Helper to normalize JSON values
const normalizeJsonValue = (value: string): string => {
  if (!value) return '{}';
  if (typeof value === 'object') return JSON.stringify(value);
  
  // If it's already a string but not JSON formatted, try to parse it
  if (typeof value === 'string' && !value.startsWith('{')) {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed);
    } catch (e) {
      // If parsing fails, return a basic JSON object
      return '{}';
    }
  }
  
  return value;
};

// Helper to normalize phase formats
const normalizePhaseValue = (value: string | number[]): number[] => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  
  // Handle range format like "1-3"
  if (typeof value === 'string' && value.includes('-')) {
    const [start, end] = value.split('-').map(Number);
    const result = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  }
  
  // Handle array-like string "[1,2,3]"
  if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value.slice(1, -1).split(',').map(item => parseInt(item.trim()));
    }
  }
  
  // Handle comma-separated string "1,2,3"
  if (typeof value === 'string') {
    return value.split(',').map(item => parseInt(item.trim()));
  }
  
  return [];
};

// Parse CSV file
export const parseCSV = (file: File): Promise<Client[] | Worker[] | Task[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as any[];
          
          // Determine data type based on file name
          if (file.name.toLowerCase().includes('client')) {
            const clients: Client[] = data.map(row => ({
              ClientID: row.ClientID || row.clientID || row.clientId || row.client_id || '',
              ClientName: row.ClientName || row.clientName || row.client_name || '',
              PriorityLevel: parseInt(row.PriorityLevel || row.priorityLevel || row.priority_level || '0'),
              RequestedTaskIDs: normalizeArrayValue(row.RequestedTaskIDs || row.requestedTaskIDs || row.requested_task_ids || ''),
              GroupTag: row.GroupTag || row.groupTag || row.group_tag || '',
              AttributesJSON: normalizeJsonValue(row.AttributesJSON || row.attributesJSON || row.attributes_json || '{}')
            }));
            resolve(clients);
          } else if (file.name.toLowerCase().includes('worker')) {
            const workers: Worker[] = data.map(row => ({
              WorkerID: row.WorkerID || row.workerID || row.workerId || row.worker_id || '',
              WorkerName: row.WorkerName || row.workerName || row.worker_name || '',
              Skills: normalizeArrayValue(row.Skills || row.skills || ''),
              AvailableSlots: normalizeArrayValue(row.AvailableSlots || row.availableSlots || row.available_slots || '').map(Number),
              MaxLoadPerPhase: parseInt(row.MaxLoadPerPhase || row.maxLoadPerPhase || row.max_load_per_phase || '0'),
              WorkerGroup: row.WorkerGroup || row.workerGroup || row.worker_group || '',
              QualificationLevel: row.QualificationLevel || row.qualificationLevel || row.qualification_level || ''
            }));
            resolve(workers);
          } else if (file.name.toLowerCase().includes('task')) {
            const tasks: Task[] = data.map(row => ({
              TaskID: row.TaskID || row.taskID || row.taskId || row.task_id || '',
              TaskName: row.TaskName || row.taskName || row.task_name || '',
              Category: row.Category || row.category || '',
              Duration: parseInt(row.Duration || row.duration || '0'),
              RequiredSkills: normalizeArrayValue(row.RequiredSkills || row.requiredSkills || row.required_skills || ''),
              PreferredPhases: normalizePhaseValue(row.PreferredPhases || row.preferredPhases || row.preferred_phases || ''),
              MaxConcurrent: parseInt(row.MaxConcurrent || row.maxConcurrent || row.max_concurrent || '0')
            }));
            resolve(tasks);
          } else {
            reject(new Error('Unknown file type'));
          }
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

// Parse Excel file
export const parseExcel = async (file: File): Promise<Client[] | Worker[] | Task[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Determine data type based on file name
        if (file.name.toLowerCase().includes('client')) {
          const clients: Client[] = jsonData.map((row: any) => ({
            ClientID: row.ClientID || row.clientID || row.clientId || row.client_id || '',
            ClientName: row.ClientName || row.clientName || row.client_name || '',
            PriorityLevel: parseInt(row.PriorityLevel || row.priorityLevel || row.priority_level || '0'),
            RequestedTaskIDs: normalizeArrayValue(row.RequestedTaskIDs || row.requestedTaskIDs || row.requested_task_ids || ''),
            GroupTag: row.GroupTag || row.groupTag || row.group_tag || '',
            AttributesJSON: normalizeJsonValue(row.AttributesJSON || row.attributesJSON || row.attributes_json || '{}')
          }));
          resolve(clients);
        } else if (file.name.toLowerCase().includes('worker')) {
          const workers: Worker[] = jsonData.map((row: any) => ({
            WorkerID: row.WorkerID || row.workerID || row.workerId || row.worker_id || '',
            WorkerName: row.WorkerName || row.workerName || row.worker_name || '',
            Skills: normalizeArrayValue(row.Skills || row.skills || ''),
            AvailableSlots: normalizeArrayValue(row.AvailableSlots || row.availableSlots || row.available_slots || '').map(Number),
            MaxLoadPerPhase: parseInt(row.MaxLoadPerPhase || row.maxLoadPerPhase || row.max_load_per_phase || '0'),
            WorkerGroup: row.WorkerGroup || row.workerGroup || row.worker_group || '',
            QualificationLevel: row.QualificationLevel || row.qualificationLevel || row.qualification_level || ''
          }));
          resolve(workers);
        } else if (file.name.toLowerCase().includes('task')) {
          const tasks: Task[] = jsonData.map((row: any) => ({
            TaskID: row.TaskID || row.taskID || row.taskId || row.task_id || '',
            TaskName: row.TaskName || row.taskName || row.task_name || '',
            Category: row.Category || row.category || '',
            Duration: parseInt(row.Duration || row.duration || '0'),
            RequiredSkills: normalizeArrayValue(row.RequiredSkills || row.requiredSkills || row.required_skills || ''),
            PreferredPhases: normalizePhaseValue(row.PreferredPhases || row.preferredPhases || row.preferred_phases || ''),
            MaxConcurrent: parseInt(row.MaxConcurrent || row.maxConcurrent || row.max_concurrent || '0')
          }));
          resolve(tasks);
        } else {
          reject(new Error('Unknown file type'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsBinaryString(file);
  });
};