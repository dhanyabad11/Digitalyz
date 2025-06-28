'use client';

import { useState } from 'react';
import { FiDownload, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { Client, Worker, Task, Rule, ValidationSummary, PriorityWeight } from '@/types';
import fileDownload from 'js-file-download';
import toast from 'react-hot-toast';

interface ExportSectionProps {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  rules: Rule[];
  priorities: PriorityWeight[];
  validationSummary: ValidationSummary;
}

export default function ExportSection({
  clients,
  workers,
  tasks,
  rules,
  priorities,
  validationSummary
}: ExportSectionProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = async () => {
    setIsExporting(true);
    
    try {
      // Prepare the export data
      const exportData = {
        clients,
        workers,
        tasks,
        rules,
        prioritization: priorities
      };
      
      // Generate JSON string
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // Download the file
      fileDownload(jsonData, 'resource-allocation-config.json');
      
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${(error as Error).message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Export Your Configuration</h2>
        <p className="text-gray-600 mb-6">
          Export your clean data, rules, and priority settings for use in downstream allocation systems.
        </p>

        {/* Export Overview */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-medium text-blue-800 mb-2">Data Summary</h3>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>Clients: {clients.length}</li>
              <li>Workers: {workers.length}</li>
              <li>Tasks: {tasks.length}</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4 bg-purple-50">
            <h3 className="font-medium text-purple-800 mb-2">Rules</h3>
            <ul className="space-y-1 text-sm text-purple-700">
              {rules.length === 0 ? (
                <li>No rules defined</li>
              ) : (
                <>
                  <li>Total Rules: {rules.length}</li>
                  {Array.from(new Set(rules.map(r => r.type))).map(type => (
                    <li key={type} className="capitalize">
                      {type}: {rules.filter(r => r.type === type).length}
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>
          
          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="font-medium text-green-800 mb-2">Prioritization</h3>
            <ul className="space-y-1 text-sm text-green-700">
              {priorities.map(p => (
                <li key={p.name}>
                  {p.description}: {p.weight}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Validation Status */}
        <div className="mb-8 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-medium text-gray-800 mb-3">Validation Status</h3>
          
          {validationSummary.valid ? (
            <div className="flex items-center text-green-600">
              <FiCheckCircle className="h-5 w-5 mr-2" />
              <span>All validations passed successfully!</span>
            </div>
          ) : (
            <div>
              <div className="flex items-center text-red-600 mb-2">
                <FiAlertTriangle className="h-5 w-5 mr-2" />
                <span>
                  There are {validationSummary.errors.length} errors and {validationSummary.warnings.length} warnings in your data.
                </span>
              </div>
              <p className="text-sm text-gray-600">
                You can still export your data, but it may cause issues in downstream systems.
                Consider fixing the issues before exporting.
              </p>
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="flex justify-center">
          <button
            onClick={exportData}
            disabled={isExporting}
            className={`btn btn-primary px-8 py-3 text-lg ${isExporting ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isExporting ? (
              <>
                <span className="inline-block mr-2 h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                Exporting...
              </>
            ) : (
              <>
                <FiDownload className="h-5 w-5 mr-2" />
                Export Configuration
              </>
            )}
          </button>
        </div>
      </div>

      <div className="card bg-blue-50 border border-blue-100">
        <h3 className="text-lg font-medium text-blue-900 mb-2">What Happens Next?</h3>
        <p className="text-blue-700 mb-4">
          The exported JSON file contains everything needed for downstream resource allocation systems:
        </p>
        <ul className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mt-1 mr-2"></span>
            <span>
              <strong>Clean Data:</strong> Validated and properly formatted client, worker, and task data.
            </span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mt-1 mr-2"></span>
            <span>
              <strong>Business Rules:</strong> All your defined constraints and requirements.
            </span>
          </li>
          <li className="flex items-start">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mt-1 mr-2"></span>
            <span>
              <strong>Priority Weights:</strong> Your preferences for how resources should be allocated.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}