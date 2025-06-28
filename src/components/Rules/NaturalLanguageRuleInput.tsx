'use client';

import { useState } from 'react';
import { FiMessageCircle, FiSend, FiLoader, FiZap } from 'react-icons/fi';
import { Client, Worker, Task, Rule } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { createRuleWithGemini } from '@/lib/ai-helpers/geminiClient';
import toast from 'react-hot-toast';

interface NaturalLanguageRuleInputProps {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  onAddRule: (rule: Rule) => void;
  onCancel: () => void;
}

export default function NaturalLanguageRuleInput({
  clients,
  workers,
  tasks,
  onAddRule,
  onCancel
}: NaturalLanguageRuleInputProps) {
  const [ruleDescription, setRuleDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    message: string;
    rulePreview?: Rule;
  } | null>(null);
  const [ruleSuggestions, setRuleSuggestions] = useState<string[]>([
    "Tasks T001 and T002 must run together",
    "All database tasks must run in phases 2-4",
    "Set load limit of 2 for Development worker group",
    "Task T003 can only run in phases 2 and 3",
    "Minimum 2 common slots for Healthcare client group"
  ]);

  const processNaturalLanguageRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleDescription.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // Process the rule using Gemini
      const result = await createRuleWithGemini(ruleDescription, clients, workers, tasks);
      
      if (result.success) {
        const rule: Rule = {
          id: uuidv4(),
          type: result.ruleType as any,
          parameters: result.parameters,
          description: result.description
        };
        
        setAiResponse({
          message: "I've created a rule based on your description. Does this look correct?",
          rulePreview: rule
        });
      } else {
        setAiResponse({
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error processing natural language rule:', error);
      toast.error('Failed to process your rule. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmRule = () => {
    if (aiResponse?.rulePreview) {
      onAddRule(aiResponse.rulePreview);
      toast.success('Rule added successfully!');
      setRuleDescription('');
      setAiResponse(null);
    }
  };

  const applySuggestion = (suggestion: string) => {
    setRuleDescription(suggestion);
    // Automatically trigger processing with the suggestion
    setTimeout(() => {
      processNaturalLanguageRule({ preventDefault: () => {} } as React.FormEvent);
    }, 100);
  };

  return (
    <div className="mb-8 p-4 border rounded-lg bg-blue-50">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Create Rule with AI</h3>
      <p className="text-sm text-gray-600 mb-4">
        Describe the rule you want to create in plain English. Our AI will convert it into a formal rule.
      </p>
      
      <form onSubmit={processNaturalLanguageRule} className="mb-4">
        <div className="flex items-start space-x-2">
          <div className="flex-grow">
            <textarea
              value={ruleDescription}
              onChange={(e) => setRuleDescription(e.target.value)}
              className="input w-full h-24"
              placeholder="e.g., Tasks T001 and T002 must run together, or All database tasks must run in phases 2-4"
            />
          </div>
          <button
            type="submit"
            disabled={isProcessing || !ruleDescription.trim()}
            className={`btn ${
              isProcessing || !ruleDescription.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {isProcessing ? (
              <FiLoader className="h-4 w-4 animate-spin" />
            ) : (
              <FiSend className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
      
      {/* AI Rule Suggestions */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Try these rule suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {ruleSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => applySuggestion(suggestion)}
              className="text-xs bg-white hover:bg-gray-50 text-gray-800 px-2 py-1 rounded-full border transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
      
      {aiResponse && (
        <div className="mt-4 p-4 bg-white rounded-lg">
          <div className="flex items-start space-x-3 mb-3">
            <div className="p-2 rounded-full bg-blue-100">
              <FiMessageCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-700">{aiResponse.message}</p>
            </div>
          </div>
          
          {aiResponse.rulePreview && (
            <div className="mt-3 p-3 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-medium text-gray-800 mb-2">Rule Preview:</h4>
              <p className="text-sm text-gray-600 mb-2">{aiResponse.rulePreview.description}</p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Type:</span>{' '}
                <span className="capitalize">{aiResponse.rulePreview.type}</span>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Parameters:</span>{' '}
                <span className="text-xs font-mono">{JSON.stringify(aiResponse.rulePreview.parameters)}</span>
              </p>
              
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={confirmRule}
                  className="btn btn-primary btn-sm"
                >
                  Add This Rule
                </button>
                <button
                  onClick={() => setAiResponse(null)}
                  className="btn btn-outline btn-sm"
                >
                  Revise
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-end mt-4">
        <button
          onClick={onCancel}
          className="btn btn-outline"
        >
          Close
        </button>
      </div>
    </div>
  );
}