'use client';

import { FiTrash2, FiTag, FiList, FiUsers, FiCalendar, FiCode } from 'react-icons/fi';
import { Rule } from '@/types';

interface RuleCardProps {
  rule: Rule;
  onDelete: () => void;
}

export default function RuleCard({ rule, onDelete }: RuleCardProps) {
  // Function to get appropriate icon based on rule type
  const getRuleIcon = () => {
    switch (rule.type) {
      case 'coRun':
        return <FiList className="h-5 w-5" />;
      case 'slotRestriction':
        return <FiTag className="h-5 w-5" />;
      case 'loadLimit':
        return <FiUsers className="h-5 w-5" />;
      case 'phaseWindow':
        return <FiCalendar className="h-5 w-5" />;
      case 'patternMatch':
        return <FiCode className="h-5 w-5" />;
      default:
        return <FiTag className="h-5 w-5" />;
    }
  };

  // Function to get color scheme based on rule type
  const getColorScheme = () => {
    switch (rule.type) {
      case 'coRun':
        return 'bg-blue-50 border-blue-200';
      case 'slotRestriction':
        return 'bg-green-50 border-green-200';
      case 'loadLimit':
        return 'bg-yellow-50 border-yellow-200';
      case 'phaseWindow':
        return 'bg-purple-50 border-purple-200';
      case 'patternMatch':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Function to render rule details based on type
  const renderRuleDetails = () => {
    switch (rule.type) {
      case 'coRun':
        return (
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Tasks:</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {rule.parameters.tasks.map((taskId: string) => (
                <span key={taskId} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {taskId}
                </span>
              ))}
            </div>
          </div>
        );
      
      case 'slotRestriction':
        return (
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Group Type:</span> {rule.parameters.groupType}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Group Name:</span> {rule.parameters.groupName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Min Common Slots:</span> {rule.parameters.minCommonSlots}
            </p>
          </div>
        );
      
      case 'loadLimit':
        return (
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Worker Group:</span> {rule.parameters.workerGroup}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Max Slots Per Phase:</span> {rule.parameters.maxSlotsPerPhase}
            </p>
          </div>
        );
      
      case 'phaseWindow':
        return (
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Task ID:</span> {rule.parameters.taskId}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Allowed Phases:</span> {rule.parameters.allowedPhases.join(', ')}
            </p>
          </div>
        );
      
      case 'patternMatch':
        return (
          <div>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Pattern:</span> {rule.parameters.pattern}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Template:</span> {rule.parameters.template}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Additional Params:</span>
              <span className="text-xs font-mono ml-1">
                {JSON.stringify(rule.parameters.additionalParams)}
              </span>
            </p>
          </div>
        );
      
      default:
        return <p className="text-sm text-gray-600">Unknown rule type</p>;
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${getColorScheme()}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-white mr-3">
            {getRuleIcon()}
          </div>
          <h3 className="font-medium capitalize">
            {rule.type.replace(/([A-Z])/g, ' $1').trim()} Rule
          </h3>
        </div>
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500"
          title="Delete Rule"
        >
          <FiTrash2 className="h-5 w-5" />
        </button>
      </div>
      
      <p className="text-sm text-gray-700 mb-3">{rule.description}</p>
      
      {renderRuleDetails()}
    </div>
  );
}