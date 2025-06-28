'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Client, Worker, Task, Rule, ValidationSummary, PriorityWeight } from '@/types';
import FileUploadSection from '@/components/FileUpload/FileUploadSection';
import DataSection from '@/components/DataGrid/DataSection';
import ValidationSection from '@/components/Validation/ValidationSection';
import RulesSection from '@/components/Rules/RulesSection';
import PrioritizationSection from '@/components/Prioritization/PrioritizationSection';
import ExportSection from '@/components/Export/ExportSection';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Home() {
  // State for each entity type
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Validation state
  const [validationSummary, setValidationSummary] = useState<ValidationSummary>({
    valid: false,
    errors: [],
    warnings: []
  });
  
  // Rules state
  const [rules, setRules] = useState<Rule[]>([]);
  
  // Prioritization state
  const [priorities, setPriorities] = useState<PriorityWeight[]>([
    { name: 'clientPriority', description: 'Client Priority Level', weight: 5 },
    { name: 'requestFulfillment', description: 'Request Fulfillment', weight: 4 },
    { name: 'fairDistribution', description: 'Fair Distribution', weight: 3 },
    { name: 'workerEfficiency', description: 'Worker Efficiency', weight: 3 },
    { name: 'phaseBalance', description: 'Phase Balance', weight: 2 }
  ]);

  // Current date and user info - for the internship submission context
  const currentDate = "2025-06-28 06:59:43";
  const currentUser = "dhanyabad11";

  return (
    <main className="min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Data Alchemist</h1>
          <p className="text-xl text-gray-600">Forge Your Own AI Resource-Allocation Configurator</p>
          <p className="text-sm text-gray-500 mt-2">
            Developed by: {currentUser} | Last updated: {currentDate}
          </p>
        </div>
        
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/10 p-1 mb-8">
            {['Upload Data', 'Edit Data', 'Validate', 'Create Rules', 'Set Priorities', 'Export'].map((category) => (
              <Tab
                key={category}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white shadow'
                      : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
                  )
                }
              >
                {category}
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels className="mt-2">
            <Tab.Panel>
              <FileUploadSection 
                setClients={setClients} 
                setWorkers={setWorkers} 
                setTasks={setTasks} 
                setValidationSummary={setValidationSummary}
              />
            </Tab.Panel>
            
            <Tab.Panel>
              <DataSection 
                clients={clients} 
                setClients={setClients} 
                workers={workers} 
                setWorkers={setWorkers} 
                tasks={tasks} 
                setTasks={setTasks} 
                validationSummary={validationSummary}
              />
            </Tab.Panel>
            
            <Tab.Panel>
              <ValidationSection 
                clients={clients}
                setClients={setClients}
                workers={workers}
                setWorkers={setWorkers}
                tasks={tasks}
                setTasks={setTasks}
                validationSummary={validationSummary} 
                setValidationSummary={setValidationSummary}
              />
            </Tab.Panel>
            
            <Tab.Panel>
              <RulesSection 
                clients={clients} 
                workers={workers} 
                tasks={tasks} 
                rules={rules} 
                setRules={setRules}
              />
            </Tab.Panel>
            
            <Tab.Panel>
              <PrioritizationSection 
                priorities={priorities} 
                setPriorities={setPriorities}
              />
            </Tab.Panel>
            
            <Tab.Panel>
              <ExportSection 
                clients={clients} 
                workers={workers} 
                tasks={tasks} 
                rules={rules} 
                priorities={priorities} 
                validationSummary={validationSummary}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </main>
  );
}