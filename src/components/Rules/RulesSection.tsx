'use client';

import { useState } from 'react';
import { Client, Worker, Task, Rule } from '@/types';
import RuleCard from './RuleCard';
import RuleForm from './RuleForm';
import NaturalLanguageRuleInput from './NaturalLanguageRuleInput';
import AIRuleRecommendations from './AIRuleRecommendations';

interface RulesSectionProps {
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  rules: Rule[];
  setRules: React.Dispatch<React.SetStateAction<Rule[]>>;
}

export default function RulesSection({
  clients,
  workers,
  tasks,
  rules,
  setRules
}: RulesSectionProps) {
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [selectedRuleType, setSelectedRuleType] = useState<string>('');
  const [showNaturalLanguageInput, setShowNaturalLanguageInput] = useState(false);

  const addRule = (rule: Rule) => {
    setRules(prev => [...prev, rule]);
    setIsAddingRule(false);
    setSelectedRuleType('');
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(rule => rule.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Business Rules</h2>
        <p className="text-gray-600 mb-6">
          Define rules to constrain how resources are allocated. These rules will be used by the allocation system
          to ensure your business requirements are met.
        </p>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            className="btn btn-primary"
            onClick={() => {
              setIsAddingRule(true);
              setShowNaturalLanguageInput(false);
            }}
          >
            Add Rule
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setShowNaturalLanguageInput(true);
              setIsAddingRule(false);
            }}
          >
            Create Rule with AI
          </button>
        </div>
        
        {/* AI Rule Recommendations */}
        <AIRuleRecommendations
          clients={clients}
          workers={workers}
          tasks={tasks}
          onAddRule={addRule}
        />

        {isAddingRule && (
          <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add a New Rule</h3>
            
            {!selectedRuleType ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-2">Select a rule type to continue:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    className="p-4 border rounded-md hover:bg-blue-50 hover:border-blue-200 text-left"
                    onClick={() => setSelectedRuleType('coRun')}
                  >
                    <h4 className="font-medium text-blue-600">Co-Run Rule</h4>
                    <p className="text-sm text-gray-500 mt-1">Specify tasks that must run together</p>
                  </button>
                  <button
                    className="p-4 border rounded-md hover:bg-blue-50 hover:border-blue-200 text-left"
                    onClick={() => setSelectedRuleType('slotRestriction')}
                  >
                    <h4 className="font-medium text-blue-600">Slot Restriction</h4>
                    <p className="text-sm text-gray-500 mt-1">Set minimum common slots for groups</p>
                  </button>
                  <button
                    className="p-4 border rounded-md hover:bg-blue-50 hover:border-blue-200 text-left"
                    onClick={() => setSelectedRuleType('loadLimit')}
                  >
                    <h4 className="font-medium text-blue-600">Load Limit</h4>
                    <p className="text-sm text-gray-500 mt-1">Set maximum slots per phase for worker groups</p>
                  </button>
                  <button
                    className="p-4 border rounded-md hover:bg-blue-50 hover:border-blue-200 text-left"
                    onClick={() => setSelectedRuleType('phaseWindow')}
                  >
                    <h4 className="font-medium text-blue-600">Phase Window</h4>
                    <p className="text-sm text-gray-500 mt-1">Define allowed phases for specific tasks</p>
                  </button>
                  <button
                    className="p-4 border rounded-md hover:bg-blue-50 hover:border-blue-200 text-left"
                    onClick={() => setSelectedRuleType('patternMatch')}
                  >
                    <h4 className="font-medium text-blue-600">Pattern Match</h4>
                    <p className="text-sm text-gray-500 mt-1">Create rules using regex patterns</p>
                  </button>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    className="btn btn-outline"
                    onClick={() => setIsAddingRule(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <RuleForm
                ruleType={selectedRuleType}
                clients={clients}
                workers={workers}
                tasks={tasks}
                onCancel={() => setSelectedRuleType('')}
                onSubmit={addRule}
              />
            )}
          </div>
        )}

        {showNaturalLanguageInput && (
          <NaturalLanguageRuleInput
            clients={clients}
            workers={workers}
            tasks={tasks}
            onAddRule={addRule}
            onCancel={() => setShowNaturalLanguageInput(false)}
          />
        )}

        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Rules</h3>
        
        {rules.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-gray-50">
            <p className="text-gray-500">No rules defined yet. Add rules using the buttons above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rules.map(rule => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onDelete={() => deleteRule(rule.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="card bg-blue-50 border border-blue-100">
        <h3 className="text-lg font-medium text-blue-900 mb-2">AI-Powered Rule Creation</h3>
        <p className="text-blue-700">
          Our AI provides two powerful ways to create rules:
        </p>
        <ul className="list-disc pl-5 mt-2 text-sm text-blue-700">
          <li><strong>Natural Language Rule Creation:</strong> Define rules in plain English</li>
          <li><strong>Rule Recommendations:</strong> Get AI-suggested rules based on patterns in your data</li>
        </ul>
      </div>
    </div>
  );
}