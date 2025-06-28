'use client';

import { useState } from 'react';
import { PriorityWeight, PriorityProfile } from '@/types';
import PrioritySlider from './PrioritySlider';
import PriorityChart from './PriorityChart';
import { FiSave, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface PrioritizationSectionProps {
  priorities: PriorityWeight[];
  setPriorities: React.Dispatch<React.SetStateAction<PriorityWeight[]>>;
}

// Predefined profiles for quick selection
const predefinedProfiles: PriorityProfile[] = [
  {
    name: 'Maximize Fulfillment',
    description: 'Prioritize fulfilling as many client requests as possible',
    weights: [
      { name: 'clientPriority', description: 'Client Priority Level', weight: 5 },
      { name: 'requestFulfillment', description: 'Request Fulfillment', weight: 5 },
      { name: 'fairDistribution', description: 'Fair Distribution', weight: 2 },
      { name: 'workerEfficiency', description: 'Worker Efficiency', weight: 3 },
      { name: 'phaseBalance', description: 'Phase Balance', weight: 2 }
    ]
  },
  {
    name: 'Fair Distribution',
    description: 'Balance work fairly across all workers',
    weights: [
      { name: 'clientPriority', description: 'Client Priority Level', weight: 3 },
      { name: 'requestFulfillment', description: 'Request Fulfillment', weight: 3 },
      { name: 'fairDistribution', description: 'Fair Distribution', weight: 5 },
      { name: 'workerEfficiency', description: 'Worker Efficiency', weight: 2 },
      { name: 'phaseBalance', description: 'Phase Balance', weight: 4 }
    ]
  },
  {
    name: 'Worker Efficiency',
    description: 'Optimize for worker skill utilization and efficiency',
    weights: [
      { name: 'clientPriority', description: 'Client Priority Level', weight: 2 },
      { name: 'requestFulfillment', description: 'Request Fulfillment', weight: 3 },
      { name: 'fairDistribution', description: 'Fair Distribution', weight: 2 },
      { name: 'workerEfficiency', description: 'Worker Efficiency', weight: 5 },
      { name: 'phaseBalance', description: 'Phase Balance', weight: 3 }
    ]
  },
  {
    name: 'Phase Balance',
    description: 'Distribute work evenly across all phases',
    weights: [
      { name: 'clientPriority', description: 'Client Priority Level', weight: 2 },
      { name: 'requestFulfillment', description: 'Request Fulfillment', weight: 3 },
      { name: 'fairDistribution', description: 'Fair Distribution', weight: 3 },
      { name: 'workerEfficiency', description: 'Worker Efficiency', weight: 2 },
      { name: 'phaseBalance', description: 'Phase Balance', weight: 5 }
    ]
  }
];

export default function PrioritizationSection({
  priorities,
  setPriorities
}: PrioritizationSectionProps) {
  const [customProfileName, setCustomProfileName] = useState('');

  const applyProfile = (profile: PriorityProfile) => {
    setPriorities(profile.weights);
    toast.success(`Applied profile: ${profile.name}`);
  };

  const saveCustomProfile = () => {
    if (!customProfileName.trim()) {
      toast.error('Please enter a name for your profile');
      return;
    }
    
    // In a real app, this would save to a database or localStorage
    toast.success(`Saved custom profile: ${customProfileName}`);
    setCustomProfileName('');
  };

  return (
    <div className="space-y-8">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Set Resource Allocation Priorities</h2>
        <p className="text-gray-600 mb-6">
          Adjust the importance of different factors that influence how resources are allocated.
          These settings will guide the allocation system in making decisions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Weights</h3>
            <div className="space-y-6">
              {priorities.map((priority, index) => (
                <PrioritySlider
                  key={priority.name}
                  priority={priority}
                  onChange={(value) => {
                    const newPriorities = [...priorities];
                    newPriorities[index].weight = value;
                    setPriorities(newPriorities);
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Visualization</h3>
            <PriorityChart priorities={priorities} />

            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-2">Preset Profiles</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {predefinedProfiles.map((profile) => (
                  <button
                    key={profile.name}
                    className="text-left p-3 border rounded-md hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    onClick={() => applyProfile(profile)}
                  >
                    <h5 className="font-medium text-blue-600">{profile.name}</h5>
                    <p className="text-xs text-gray-500 mt-1">{profile.description}</p>
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Save Current Profile</h4>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customProfileName}
                    onChange={(e) => setCustomProfileName(e.target.value)}
                    placeholder="Enter profile name"
                    className="input flex-grow"
                  />
                  <button
                    onClick={saveCustomProfile}
                    disabled={!customProfileName.trim()}
                    className={`btn ${!customProfileName.trim() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'btn-primary'}`}
                  >
                    <FiSave className="h-4 w-4 mr-1" />
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-blue-50 border border-blue-100">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Impact Prediction</h3>
        <p className="text-blue-700 mb-4">
          As you adjust priorities, our AI analyzes how these changes might affect your resource allocation outcomes.
        </p>
        
        <div className="p-4 bg-white rounded-lg border border-blue-200">
          <h4 className="font-medium text-gray-900 mb-2">Predicted Impact</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="inline-block w-3 h-3 rounded-full bg-green-500 mt-1 mr-2"></span>
              <span>
                <strong>Client Satisfaction:</strong> {priorities.find(p => p.name === 'clientPriority')?.weight && priorities.find(p => p.name === 'requestFulfillment')?.weight ? 'High' : 'Moderate'} - Your current settings prioritize client needs.
              </span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mt-1 mr-2"></span>
              <span>
                <strong>Worker Satisfaction:</strong> {priorities.find(p => p.name === 'fairDistribution')?.weight >= 4 ? 'High' : 'Moderate'} - {priorities.find(p => p.name === 'fairDistribution')?.weight >= 4 ? 'Workload will be balanced fairly.' : 'Some workers may have heavier workloads than others.'}
              </span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mt-1 mr-2"></span>
              <span>
                <strong>Overall Efficiency:</strong> {priorities.find(p => p.name === 'workerEfficiency')?.weight >= 4 ? 'High' : 'Moderate'} - {priorities.find(p => p.name === 'workerEfficiency')?.weight >= 4 ? 'Workers will be matched to tasks that best utilize their skills.' : 'Some skill optimization opportunities may be missed.'}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}