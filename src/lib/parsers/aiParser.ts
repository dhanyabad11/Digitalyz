import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Client, Worker, Task } from '@/types';
import { intelligentDataParsing } from '@/lib/ai-helpers/geminiClient';

// AI-enhanced CSV parser
export const parseCSVWithAI = async (file: File): Promise<Client[] | Worker[] | Task[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data as any[];
          if (data.length === 0) {
            reject(new Error("File contains no data rows"));
            return;
          }
          
          const headers = Object.keys(data[0]);
          
          // Determine entity type based on file name
          let targetFormat = '';
          let entityType = '';
          
          if (file.name.toLowerCase().includes('client')) {
            entityType = 'client';
            targetFormat = `
              Client data should have these fields:
              - ClientID (string): Unique identifier for the client
              - ClientName (string): Name of the client
              - PriorityLevel (number 1-5): Priority level of the client
              - RequestedTaskIDs (array of strings): List of task IDs requested by the client
              - GroupTag (string): Group tag for categorizing clients
              - AttributesJSON (JSON string): Additional attributes in JSON format
            `;
          } else if (file.name.toLowerCase().includes('worker')) {
            entityType = 'worker';
            targetFormat = `
              Worker data should have these fields:
              - WorkerID (string): Unique identifier for the worker
              - WorkerName (string): Name of the worker
              - Skills (array of strings): List of skills the worker has
              - AvailableSlots (array of numbers): List of phase numbers the worker is available for
              - MaxLoadPerPhase (number): Maximum number of tasks per phase
              - WorkerGroup (string): Group tag for categorizing workers
              - QualificationLevel (string): Qualification level of the worker
            `;
          } else if (file.name.toLowerCase().includes('task')) {
            entityType = 'task';
            targetFormat = `
              Task data should have these fields:
              - TaskID (string): Unique identifier for the task
              - TaskName (string): Name of the task
              - Category (string): Category of the task
              - Duration (number): Number of phases the task requires
              - RequiredSkills (array of strings): List of skills required for the task
              - PreferredPhases (array of numbers or range string): Preferred phases for the task
              - MaxConcurrent (number): Maximum number of concurrent assignments
            `;
          } else {
            reject(new Error("Could not determine entity type from file name"));
            return;
          }
          
          // Use AI to map headers
          const mappingResult = await intelligentDataParsing(headers, data.slice(0, 3), targetFormat);
          const headerMapping = mappingResult.mappedHeaders;
          
          // Apply mapping and normalize values
          const mappedData = data.map(row => {
            const mappedRow: Record<string, any> = {};
            
            for (const originalHeader of headers) {
              const targetHeader = headerMapping[originalHeader];
              if (targetHeader) {
                mappedRow[targetHeader] = row[originalHeader];
              }
            }
            
            return mappedRow;
          });
          
          // Apply normalization based on entity type
          if (entityType === 'client') {
            const clients: Client[] = mappedData.map(row => ({
              ClientID: row.ClientID || '',
              ClientName: row.ClientName || '',
              PriorityLevel: parseInt(row.PriorityLevel || '0'),
              RequestedTaskIDs: normalizeArrayValue(row.RequestedTaskIDs || ''),
              GroupTag: row.GroupTag || '',
              AttributesJSON: normalizeJsonValue(row.AttributesJSON || '{}')
            }));
            resolve(clients);
          } else if (entityType === 'worker') {
            const workers: Worker[] = mappedData.map(row => ({
              WorkerID: row.WorkerID || '',
              WorkerName: row.WorkerName || '',
              Skills: normalizeArrayValue(row.Skills || ''),
              AvailableSlots: normalizeArrayValue(row.AvailableSlots || '').map(Number),
              MaxLoadPerPhase: parseInt(row.MaxLoadPerPhase || '0'),
              WorkerGroup: row.WorkerGroup || '',
              QualificationLevel: row.QualificationLevel || ''
            }));
            resolve(workers);
          } else if (entityType === 'task') {
            const tasks: Task[] = mappedData.map(row => ({
              TaskID: row.TaskID || '',
              TaskName: row.TaskName || '',
              Category: row.Category || '',
              Duration: parseInt(row.Duration || '0'),
              RequiredSkills: normalizeArrayValue(row.RequiredSkills || ''),
              PreferredPhases: normalizePhaseValue(row.PreferredPhases || ''),
              MaxConcurrent: parseInt(row.MaxConcurrent || '0')
            }));
            resolve(tasks);
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

// AI-enhanced Excel parser
export const parseExcelWithAI = async (file: File): Promise<Client[] | Worker[] | Task[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        if (jsonData.length === 0) {
          reject(new Error("File contains no data rows"));
          return;
        }
        
        const headers = Object.keys(jsonData[0] as object);
        
        // Determine entity type based on file name
        let targetFormat = '';
        let entityType = '';
        
        if (file.name.toLowerCase().includes('client')) {
          entityType = 'client';
          targetFormat = `
            Client data should have these fields:
            - ClientID (string): Unique identifier for the client
            - ClientName (string): Name of the client
            - PriorityLevel (number 1-5): Priority level of the client
            - RequestedTaskIDs (array of strings): List of task IDs requested by the client
            - GroupTag (string): Group tag for categorizing clients
            - AttributesJSON (JSON string): Additional attributes in JSON format
          `;
        } else if (file.name.toLowerCase().includes('worker')) {
          entityType = 'worker';
          targetFormat = `
            Worker data should have these fields:
            - WorkerID (string): Unique identifier for the worker
            - WorkerName (string): Name of the worker
            - Skills (array of strings): List of skills the worker has
            - AvailableSlots (array of numbers): List of phase numbers the worker is available for
            - MaxLoadPerPhase (number): Maximum number of tasks per phase
            - WorkerGroup (string): Group tag for categorizing workers
            - QualificationLevel (string): Qualification level of the worker
          `;
        } else if (file.name.toLowerCase().includes('task')) {
          entityType = 'task';
          targetFormat = `
            Task data should have these fields:
            - TaskID (string): Unique identifier for the task
            - TaskName (string): Name of the task
            - Category (string): Category of the task
            - Duration (number): Number of phases the task requires
            - RequiredSkills (array of strings): List of skills required for the task
            - PreferredPhases (array of numbers or range string): Preferred phases for the task
            - MaxConcurrent (number): Maximum number of concurrent assignments
          `;
        } else {
          reject(new Error("Could not determine entity type from file name"));
          return;
        }
        
        // Use AI to map headers
        const mappingResult = await intelligentDataParsing(headers, jsonData.slice(0, 3), targetFormat);
        const headerMapping = mappingResult.mappedHeaders;
        
        // Apply mapping and normalize values
        const mappedData = jsonData.map((row: any) => {
          const mappedRow: Record<string, any> = {};
          
          for (const originalHeader of headers) {
            const targetHeader = headerMapping[originalHeader];
            if (targetHeader) {
              mappedRow[targetHeader] = row[originalHeader];
            }
          }
          
          return mappedRow;
        });
        
        // Apply normalization based on entity type
        if (entityType === 'client') {
          const clients: Client[] = mappedData.map((row: any) => ({
            ClientID: row.ClientID || '',
            ClientName: row.ClientName || '',
            PriorityLevel: parseInt(row.PriorityLevel || '0'),
            RequestedTaskIDs: normalizeArrayValue(row.RequestedTaskIDs || ''),
            GroupTag: row.GroupTag || '',
            AttributesJSON: normalizeJsonValue(row.AttributesJSON || '{}')
          }));
          resolve(clients);
        } else if (entityType === 'worker') {
          const workers: Worker[] = mappedData.map((row: any) => ({
            WorkerID: row.WorkerID || '',
            WorkerName: row.WorkerName || '',
            Skills: normalizeArrayValue(row.Skills || ''),
            AvailableSlots: normalizeArrayValue(row.AvailableSlots || '').map(Number),
            MaxLoadPerPhase: parseInt(row.MaxLoadPerPhase || '0'),
            WorkerGroup: row.WorkerGroup || '',
            QualificationLevel: row.QualificationLevel || ''
          }));
          resolve(workers);
        } else if (entityType === 'task') {
          const tasks: Task[] = mappedData.map((row: any) => ({
            TaskID: row.TaskID || '',
            TaskName: row.TaskName || '',
            Category: row.Category || '',
            Duration: parseInt(row.Duration || '0'),
            RequiredSkills: normalizeArrayValue(row.RequiredSkills || ''),
            PreferredPhases: normalizePhaseValue(row.PreferredPhases || ''),
            MaxConcurrent: parseInt(row.MaxConcurrent || '0')
          }));
          resolve(tasks);
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

// Helper functions from the original parser
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