'use client';

import { useState, useEffect } from 'react';
import { FiZap, FiPlus, FiLoader, FiInfo } from 'react-icons/fi';
import { Client, Worker, Task, Rule } from '@/types';
import { generateRuleRecommendations } from '@/lib/ai-helpers/geminiClient';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface AIRuleRecommendationsProps {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  onAddRule: (rule: Rule) => void;
}

export default function AIRuleRecommendations({
  clients,
  workers,
  tasks,
  onAddRule
}: AIRuleRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Clear recommendations when data changes
    setRecommendations([]);
  }, [clients, workers, tasks]);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const result = await generateRuleRecommendations(clients, workers, tasks);
      setRecommendations(result.recommendations || []);
      
      if (result.recommendations.length === 0) {
        toast.info('No rule recommendations found for your data');
      } else {
        toast.success(`Generated ${result.recommendations.length} rule recommendations`);
      }
    } catch (error) {
      console.error('Error generating rule recommendations:', error);
      toast.error('Failed to generate rule recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  const addRecommendedRule = (recommendation: any) => {
    try {
      const rule: Rule = {
        id: uuidv4(),
        type: recommendation.ruleType as any,
        parameters: recommendation.parameters,
        description: recommendation.description
      };
      
      onAddRule(rule);
      toast.success('Rule added successfully!');
      
      // Remove from recommendations
      setRecommendations(prev => prev.filter(r => r !== recommendation));
    } catch (error) {
      console.error('Error adding recommended rule:', error);
      toast.error('Failed to add rule');
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800"
      >
        <FiZap className="mr-2 h-5 w-5" />
        <span>Get AI Rule Recommendations</span>
      </button>
    );
  }

  return (
    <div className="mb-8 p-4 border rounded-lg bg-blue-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">AI Rule Recommendations</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <FiInfo className="h-5 w-5" />
        </button>
      </div>
      
      <p className="text-sm text-gray-600 mb-4">
        Let AI analyze your data and suggest business rules that might improve your resource allocation.
      </p>
      
      <button
        onClick={generateRecommendations}
        disabled={isGenerating}
        className={`btn ${isGenerating ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'btn-primary'} mb-4`}
      >
        {isGenerating ? (
          <>
            <FiLoader className="inline-block mr-2 h-4 w-4 animate-spin" />
            Generating recommendations...
          </>
        ) : (
          <>
            <FiZap className="mr-2 h-4 w-4" />
            Generate Recommendations
          </>
        )}
      </button>
      
      {recommendations.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            {recommendations.length} recommendation{recommendations.length !== 1 ? 's' : ''} found:
          </p>
          
          {recommendations.map((recommendation, index) => (
            <div key={index} className="p-3 bg-white rounded-lg border">
              <h4 className="font-medium text-gray-900 mb-1">{recommendation.description}</h4>
              <p className="text-xs text-gray-500 mb-2">
                <span className="capitalize">{recommendation.ruleType}</span> rule
              </p>
              <p className="text-sm text-gray-600 mb-3">{recommendation.reasoning}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => addRecommendedRule(recommendation)}
                  className="btn btn-sm btn-primary"
                >
                  <FiPlus className="mr-1 h-3 w-3" />
                  Add Rule
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : !isGenerating && (
        <div className="p-6 text-center bg-white rounded-lg border">
          <FiZap className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-gray-500">
            Click "Generate Recommendations" to have AI suggest rules based on your data
          </p>
        </div>
      )}
    </div>
  );
}