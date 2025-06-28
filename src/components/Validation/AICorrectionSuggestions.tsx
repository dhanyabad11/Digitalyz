'use client';

import { useState, useEffect } from 'react';
import { FiZap, FiCheckCircle, FiX, FiLoader } from 'react-icons/fi';
import { Client, Worker, Task, ValidationError } from '@/types';
import { suggestCorrectionsWithGemini } from '@/lib/ai-helpers/geminiClient';
import toast from 'react-hot-toast';

interface AICorrectionSuggestionsProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  workers: Worker[];
  setWorkers: React.Dispatch<React.SetStateAction<Worker[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  errors: ValidationError[];
}

export default function AICorrectionSuggestions({
  clients,
  setClients,
  workers,
  setWorkers,
  tasks,
  setTasks,
  errors
}: AICorrectionSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Reset suggestions when errors change
    setSuggestions([]);
  }, [errors]);

  const generateSuggestions = async () => {
    if (errors.length === 0) {
      toast.success('No errors to fix!');
      return;
    }
    
    setIsGenerating(true);
    try {
      const result = await suggestCorrectionsWithGemini(errors, clients, workers, tasks);
      setSuggestions(result.suggestions);
      
      if (result.suggestions.length === 0) {
        toast.info('No automatic fixes available for these errors');
      } else {
        toast.success(`Generated ${result.suggestions.length} suggestions`);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const applySuggestion = (suggestion: any) => {
    try {
      if (suggestion.entityType === 'client') {
        setClients(prevClients => 
          prevClients.map(client => 
            client.ClientID === suggestion.entityId
              ? { ...client, [suggestion.field]: suggestion.suggestedValue }
              : client
          )
        );
      } else if (suggestion.entityType === 'worker') {
        setWorkers(prevWorkers => 
          prevWorkers.map(worker => 
            worker.WorkerID === suggestion.entityId
              ? { ...worker, [suggestion.field]: suggestion.suggestedValue }
              : worker
          )
        );
      } else if (suggestion.entityType === 'task') {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.TaskID === suggestion.entityId
              ? { ...task, [suggestion.field]: suggestion.suggestedValue }
              : task
          )
        );
      }
      
      toast.success('Applied suggestion successfully');
      
      // Remove the applied suggestion
      setSuggestions(prev => prev.filter(s => 
        !(s.entityId === suggestion.entityId && 
          s.field === suggestion.field)
      ));
    } catch (error) {
      console.error('Error applying suggestion:', error);
      toast.error('Failed to apply suggestion');
    }
  };

  const applyAllSuggestions = () => {
    try {
      // Group suggestions by entity type
      const clientSuggestions = suggestions.filter(s => s.entityType === 'client');
      const workerSuggestions = suggestions.filter(s => s.entityType === 'worker');
      const taskSuggestions = suggestions.filter(s => s.entityType === 'task');
      
      // Apply client suggestions
      if (clientSuggestions.length > 0) {
        setClients(prevClients => 
          prevClients.map(client => {
            const clientSugs = clientSuggestions.filter(s => s.entityId === client.ClientID);
            if (clientSugs.length === 0) return client;
            
            const updatedClient = { ...client };
            clientSugs.forEach(sug => {
              updatedClient[sug.field] = sug.suggestedValue;
            });
            
            return updatedClient;
          })
        );
      }
      
      // Apply worker suggestions
      if (workerSuggestions.length > 0) {
        setWorkers(prevWorkers => 
          prevWorkers.map(worker => {
            const workerSugs = workerSuggestions.filter(s => s.entityId === worker.WorkerID);
            if (workerSugs.length === 0) return worker;
            
            const updatedWorker = { ...worker };
            workerSugs.forEach(sug => {
              updatedWorker[sug.field] = sug.suggestedValue;
            });
            
            return updatedWorker;
          })
        );
      }
      
      // Apply task suggestions
      if (taskSuggestions.length > 0) {
        setTasks(prevTasks => 
          prevTasks.map(task => {
            const taskSugs = taskSuggestions.filter(s => s.entityId === task.TaskID);
            if (taskSugs.length === 0) return task;
            
            const updatedTask = { ...task };
            taskSugs.forEach(sug => {
              updatedTask[sug.field] = sug.suggestedValue;
            });
            
            return updatedTask;
          })
        );
      }
      
      toast.success('Applied all suggestions successfully');
      setSuggestions([]);
    } catch (error) {
      console.error('Error applying all suggestions:', error);
      toast.error('Failed to apply all suggestions');
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">AI Correction Suggestions</h3>
        <button
          onClick={generateSuggestions}
          disabled={isGenerating || errors.length === 0}
          className={`btn ${
            isGenerating || errors.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {isGenerating ? (
            <>
              <FiLoader className="inline-block mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FiZap className="h-4 w-4 mr-1" />
              Generate Suggestions
            </>
          )}
        </button>
      </div>

      {suggestions.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-600">
              {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} generated
            </p>
            <button
              onClick={applyAllSuggestions}
              className="btn btn-sm btn-outline"
            >
              Apply All
            </button>
          </div>
          
          <ul className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="border rounded-lg p-3 bg-green-50">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {suggestion.explanation}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Entity: <span className="font-medium capitalize">{suggestion.entityType}</span> | 
                      ID: <span className="font-medium">{suggestion.entityId}</span> | 
                      Field: <span className="font-medium">{suggestion.field}</span>
                    </p>
                    <div className="mt-2 text-xs">
                      <p className="text-red-600">
                        <span className="font-medium">Current:</span> {
                          Array.isArray(suggestion.currentValue) 
                            ? JSON.stringify(suggestion.currentValue) 
                            : suggestion.currentValue
                        }
                      </p>
                      <p className="text-green-600">
                        <span className="font-medium">Suggested:</span> {
                          Array.isArray(suggestion.suggestedValue) 
                            ? JSON.stringify(suggestion.suggestedValue) 
                            : suggestion.suggestedValue
                        }
                      </p>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => applySuggestion(suggestion)}
                      className="text-white bg-green-500 hover:bg-green-600 p-1 rounded-full"
                      title="Apply suggestion"
                    >
                      <FiCheckCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        errors.length > 0 && !isGenerating && (
          <div className="text-center py-6 border rounded-lg bg-gray-50">
            <FiZap className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-gray-500">
              Click "Generate Suggestions" to have AI help fix your errors
            </p>
          </div>
        )
      )}
      
      {errors.length === 0 && (
        <div className="text-center py-6 border rounded-lg bg-green-50">
          <FiCheckCircle className="mx-auto h-8 w-8 text-green-500" />
          <p className="mt-2 text-green-700">
            No errors to fix! Your data is valid.
          </p>
        </div>
      )}
    </div>
  );
}