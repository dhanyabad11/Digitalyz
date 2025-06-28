'use client';

import { useState } from 'react';
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiFilter } from 'react-icons/fi';
import { Client, Worker, Task, ValidationError, ValidationSummary } from '@/types';
import { validateAll } from '@/lib/validation/validator';
import AICorrectionSuggestions from './AICorrectionSuggestions';
import AIValidator from './AIValidator';
import toast from 'react-hot-toast';

interface ValidationSectionProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  workers: Worker[];
  setWorkers: React.Dispatch<React.SetStateAction<Worker[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  validationSummary: ValidationSummary;
  setValidationSummary: React.Dispatch<React.SetStateAction<ValidationSummary>>;
}

export default function ValidationSection({
  clients,
  setClients,
  workers,
  setWorkers,
  tasks,
  setTasks,
  validationSummary,
  setValidationSummary
}: ValidationSectionProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'errors' | 'warnings'>('all');
  const [entityFilter, setEntityFilter] = useState<'all' | 'client' | 'worker' | 'task'>('all');

  const runValidation = async () => {
    setIsValidating(true);
    try {
      const result = await validateAll(clients, workers, tasks);
      setValidationSummary(result);
      
      if (result.valid) {
        toast.success('All validations passed successfully!');
      } else {
        toast.error(`Found ${result.errors.length} errors and ${result.warnings.length} warnings`);
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error(`Error during validation: ${(error as Error).message}`);
    } finally {
      setIsValidating(false);
    }
  };

  // Filter issues based on current filter settings
  const filteredIssues = [...validationSummary.errors, ...validationSummary.warnings].filter(issue => {
    if (filter === 'errors' && issue.severity !== 'error') return false;
    if (filter === 'warnings' && issue.severity !== 'warning') return false;
    if (entityFilter !== 'all' && issue.entityType !== entityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Validate Your Data</h2>
        <p className="text-gray-600 mb-6">
          Run validations to check for errors and warnings in your data. Fix issues before proceeding to rule creation.
        </p>

        <div className="mb-6">
          <button
            onClick={runValidation}
            disabled={isValidating}
            className={`btn ${isValidating ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'btn-primary'}`}
          >
            {isValidating ? (
              <>
                <span className="inline-block mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                Validating...
              </>
            ) : (
              'Run Basic Validation'
            )}
          </button>
        </div>

        {/* Validation Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Validation Summary</h3>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <div className={`p-2 rounded-full ${validationSummary.errors.length === 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <FiAlertCircle className={`h-5 w-5 ${validationSummary.errors.length === 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <span className="ml-2 text-sm font-medium">
                {validationSummary.errors.length} Errors
              </span>
            </div>
            <div className="flex items-center">
              <div className={`p-2 rounded-full ${validationSummary.warnings.length === 0 ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <FiAlertTriangle className={`h-5 w-5 ${validationSummary.warnings.length === 0 ? 'text-green-500' : 'text-yellow-500'}`} />
              </div>
              <span className="ml-2 text-sm font-medium">
                {validationSummary.warnings.length} Warnings
              </span>
            </div>
            <div className="flex items-center">
              <div className={`p-2 rounded-full ${validationSummary.valid ? 'bg-green-100' : 'bg-gray-100'}`}>
                <FiCheckCircle className={`h-5 w-5 ${validationSummary.valid ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
              <span className="ml-2 text-sm font-medium">
                {validationSummary.valid ? 'Valid' : 'Invalid'}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Issue Type</label>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 text-sm rounded-md ${filter === 'all' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md ${filter === 'errors' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setFilter('errors')}
              >
                Errors
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md ${filter === 'warnings' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setFilter('warnings')}
              >
                Warnings
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Entity Type</label>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 text-sm rounded-md ${entityFilter === 'all' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setEntityFilter('all')}
              >
                All
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md ${entityFilter === 'client' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setEntityFilter('client')}
              >
                Clients
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md ${entityFilter === 'worker' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setEntityFilter('worker')}
              >
                Workers
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md ${entityFilter === 'task' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setEntityFilter('task')}
              >
                Tasks
              </button>
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="border rounded-lg overflow-hidden">
          {filteredIssues.length === 0 ? (
            <div className="p-6 text-center">
              <FiCheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No issues found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {validationSummary.errors.length === 0 && validationSummary.warnings.length === 0
                  ? 'All validations passed successfully!'
                  : 'No issues match the current filters.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredIssues.map((issue, index) => (
                <li key={index} className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {issue.severity === 'error' ? (
                        <FiAlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <FiAlertTriangle className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {issue.severity === 'error' ? 'Error' : 'Warning'}: {issue.message}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Entity: <span className="font-medium capitalize">{issue.entityType}</span> | 
                        ID: <span className="font-medium">{issue.entityId}</span> | 
                        Field: <span className="font-medium">{issue.field}</span>
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* AI Correction Suggestions */}
        <AICorrectionSuggestions
          clients={clients}
          setClients={setClients}
          workers={workers}
          setWorkers={setWorkers}
          tasks={tasks}
          setTasks={setTasks}
          errors={validationSummary.errors}
        />
        
        {/* AI Validator */}
        <AIValidator
          clients={clients}
          workers={workers}
          tasks={tasks}
        />
      </div>

      <div className="card bg-blue-50 border border-blue-100">
        <h3 className="text-lg font-medium text-blue-900 mb-2">AI-Powered Validation Suite</h3>
        <p className="text-blue-700 mb-2">
          Our AI-powered validation toolkit includes:
        </p>
        <ul className="space-y-1 text-sm text-blue-700 list-disc pl-5">
          <li><strong>Basic Validation:</strong> Checks for common issues like missing fields and malformed data</li>
          <li><strong>AI Deep Validation:</strong> Identifies complex issues like circular dependencies and resource conflicts</li>
          <li><strong>Error Correction:</strong> Suggests intelligent fixes for validation errors</li>
        </ul>
      </div>
    </div>
  );
}