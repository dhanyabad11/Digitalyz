'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Client, Worker, Task, ValidationSummary } from '@/types';
import DataGrid from './DataGrid';
import NaturalLanguageSearch from './NaturalLanguageSearch';
import NaturalLanguageModification from './NaturalLanguageModification';

interface DataSectionProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  workers: Worker[];
  setWorkers: React.Dispatch<React.SetStateAction<Worker[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  validationSummary: ValidationSummary;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DataSection({
  clients,
  setClients,
  workers,
  setWorkers,
  tasks,
  setTasks,
  validationSummary
}: DataSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIds, setFilteredIds] = useState<string[]>([]);
  const [filteredEntityType, setFilteredEntityType] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Your Data</h2>
        <p className="text-gray-600 mb-6">
          View and edit your data in the grid below. Changes are validated in real-time.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <NaturalLanguageSearch 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            clients={clients}
            workers={workers}
            tasks={tasks}
            setFilteredIds={setFilteredIds}
            setFilteredEntityType={setFilteredEntityType}
          />
        </div>

        <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/10 p-1 mb-4">
            {['Clients', 'Workers', 'Tasks'].map((category, idx) => (
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
                onClick={() => {
                  // When changing tabs, clear the search if it's not the right entity type
                  if (filteredEntityType && 
                      filteredEntityType !== 'mixed' &&
                      filteredEntityType !== ['client', 'worker', 'task'][idx]) {
                    setSearchQuery('');
                    setFilteredIds([]);
                    setFilteredEntityType('');
                  }
                }}
              >
                {category}
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels>
            <Tab.Panel>
              <NaturalLanguageModification
                entityType="client"
                data={clients}
                setData={setClients}
              />
              <DataGrid 
                data={clients}
                setData={setClients}
                entityType="client"
                errors={validationSummary.errors.filter(e => e.entityType === 'client')}
                warnings={validationSummary.warnings.filter(w => w.entityType === 'client')}
                filteredIds={filteredEntityType === 'client' || filteredEntityType === 'mixed' ? filteredIds : []}
              />
            </Tab.Panel>
            
            <Tab.Panel>
              <NaturalLanguageModification
                entityType="worker"
                data={workers}
                setData={setWorkers}
              />
              <DataGrid 
                data={workers}
                setData={setWorkers}
                entityType="worker"
                errors={validationSummary.errors.filter(e => e.entityType === 'worker')}
                warnings={validationSummary.warnings.filter(w => w.entityType === 'worker')}
                filteredIds={filteredEntityType === 'worker' || filteredEntityType === 'mixed' ? filteredIds : []}
              />
            </Tab.Panel>
            
            <Tab.Panel>
              <NaturalLanguageModification
                entityType="task"
                data={tasks}
                setData={setTasks}
              />
              <DataGrid 
                data={tasks}
                setData={setTasks}
                entityType="task"
                errors={validationSummary.errors.filter(e => e.entityType === 'task')}
                warnings={validationSummary.warnings.filter(w => w.entityType === 'task')}
                filteredIds={filteredEntityType === 'task' || filteredEntityType === 'mixed' ? filteredIds : []}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      <div className="card bg-blue-50 border border-blue-100">
        <h3 className="text-lg font-medium text-blue-900 mb-2">AI Data Management Features</h3>
        <p className="text-blue-700 mb-2">
          Try these powerful AI capabilities:
        </p>
        <ul className="space-y-1 text-sm text-blue-700 list-disc pl-5">
          <li><strong>Natural Language Search:</strong> Search for data using plain English queries</li>
          <li><strong>AI-Powered Data Modification:</strong> Modify data using simple instructions</li>
          <li><strong>Intelligent Data Parsing:</strong> Our AI automatically maps columns even if they're misnamed</li>
        </ul>
      </div>
    </div>
  );
}