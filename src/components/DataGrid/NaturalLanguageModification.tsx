'use client';

import { useState } from 'react';
import { FiEdit3, FiX, FiCheck, FiLoader } from 'react-icons/fi';
import { Client, Worker, Task } from '@/types';
import { modifyDataWithNaturalLanguage } from '@/lib/ai-helpers/geminiClient';
import toast from 'react-hot-toast';

interface NaturalLanguageModificationProps {
  entityType: 'client' | 'worker' | 'task';
  data: Client[] | Worker[] | Task[];
  setData: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function NaturalLanguageModification({
  entityType,
  data,
  setData
}: NaturalLanguageModificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [modificationPreview, setModificationPreview] = useState<{
    modifiedData: any[];
    explanation: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) return;
    
    setIsProcessing(true);
    try {
      // Get entity schema based on type
      let entitySchema = '';
      if (entityType === 'client') {
        entitySchema = `
          Client data structure:
          - ClientID (string): Unique identifier for the client
          - ClientName (string): Name of the client
          - PriorityLevel (number 1-5): Priority level of the client
          - RequestedTaskIDs (array of strings): List of task IDs requested by the client
          - GroupTag (string): Group tag for categorizing clients
          - AttributesJSON (string): Additional attributes in JSON format
        `;
      } else if (entityType === 'worker') {
        entitySchema = `
          Worker data structure:
          - WorkerID (string): Unique identifier for the worker
          - WorkerName (string): Name of the worker
          - Skills (array of strings): List of skills the worker has
          - AvailableSlots (array of numbers): List of phase numbers the worker is available for
          - MaxLoadPerPhase (number): Maximum number of tasks per phase
          - WorkerGroup (string): Group tag for categorizing workers
          - QualificationLevel (string): Qualification level of the worker
        `;
      } else { // task
        entitySchema = `
          Task data structure:
          - TaskID (string): Unique identifier for the task
          - TaskName (string): Name of the task
          - Category (string): Category of the task
          - Duration (number): Number of phases the task requires
          - RequiredSkills (array of strings): List of skills required for the task
          - PreferredPhases (array of numbers or string): Preferred phases for the task
          - MaxConcurrent (number): Maximum number of concurrent assignments
        `;
      }
      
      // Call AI to modify data
      const result = await modifyDataWithNaturalLanguage(
        instruction,
        entityType,
        data,
        entitySchema
      );
      
      if (result.success) {
        setModificationPreview({
          modifiedData: result.modifiedData,
          explanation: result.explanation
        });
        toast.success('Generated modification preview');
      } else {
        toast.error('Could not process your modification request');
      }
    } catch (error) {
      console.error('Error modifying data:', error);
      toast.error('Error processing your modification request');
    } finally {
      setIsProcessing(false);
    }
  };

  const applyModifications = () => {
    if (modificationPreview) {
      setData(modificationPreview.modifiedData);
      toast.success('Applied modifications successfully');
      setModificationPreview(null);
      setInstruction('');
      setIsOpen(false);
    }
  };

  const cancel = () => {
    setModificationPreview(null);
    setInstruction('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-secondary"
      >
        <FiEdit3 className="h-4 w-4 mr-1" />
        Modify with AI
      </button>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border rounded-lg mb-4">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Modify Data with Natural Language</h3>
      <p className="text-sm text-gray-600 mb-4">
        Describe how you want to modify the {entityType} data. For example: "Set all tasks in Development category to have a duration of 3" or "Add 'python' skill to all workers in Development group"
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="input w-full h-20"
            placeholder={`Type your instructions to modify ${entityType} data...`}
            disabled={isProcessing || !!modificationPreview}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={cancel}
            className="btn btn-outline"
          >
            Cancel
          </button>
          {!modificationPreview ? (
            <button
              type="submit"
              disabled={isProcessing || !instruction.trim()}
              className={`btn btn-primary ${isProcessing ? 'opacity-75' : ''}`}
            >
              {isProcessing ? (
                <>
                  <FiLoader className="inline-block mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Generate Modifications'
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={applyModifications}
              className="btn btn-primary"
            >
              <FiCheck className="h-4 w-4 mr-1" />
              Apply Modifications
            </button>
          )}
        </div>
      </form>
      
      {modificationPreview && (
        <div className="mt-4 p-3 border rounded-md bg-green-50">
          <h4 className="font-medium text-green-800 mb-2">Modification Preview</h4>
          <p className="text-sm text-green-700 mb-3">{modificationPreview.explanation}</p>
          <div className="max-h-40 overflow-y-auto text-xs font-mono bg-white p-2 rounded border">
            <pre>{JSON.stringify(modificationPreview.modifiedData, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}