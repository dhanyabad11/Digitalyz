'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiX, FiInfo, FiLoader } from 'react-icons/fi';
import { Client, Worker, Task } from '@/types';
import { processSearchWithGemini } from '@/lib/ai-helpers/geminiClient';
import toast from 'react-hot-toast';

interface NaturalLanguageSearchProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  clients: Client[];
  workers: Worker[];
  tasks: Task[];
  setFilteredIds: React.Dispatch<React.SetStateAction<string[]>>;
  setFilteredEntityType: React.Dispatch<React.SetStateAction<string>>;
}

export default function NaturalLanguageSearch({
  searchQuery,
  setSearchQuery,
  clients,
  workers,
  tasks,
  setFilteredIds,
  setFilteredEntityType
}: NaturalLanguageSearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    explanation: string;
    entityType: string;
  } | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    "Show me all high priority clients",
    "Find workers with database skills",
    "Tasks with duration more than 2",
    "Workers available in phase 3",
    "Development tasks requiring frontend skills"
  ]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsLoading(true);
    try {
      // Process the search query using Gemini
      const result = await processSearchWithGemini(searchQuery, clients, workers, tasks);
      
      // Update the filtered results
      setFilteredIds(result.results);
      setFilteredEntityType(result.entityType);
      
      setSearchResult({
        explanation: result.explanation,
        entityType: result.entityType
      });
      
      toast.success('Search completed successfully');
    } catch (error) {
      console.error('Error processing search query:', error);
      toast.error('Error processing your search query');
      // Reset filters if search fails
      setFilteredIds([]);
      setFilteredEntityType('');
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    // Automatically trigger search with the suggestion
    setTimeout(() => {
      handleSearch({ preventDefault: () => {} } as React.FormEvent);
    }, 100);
  };

  // Reset filters when search query is cleared
  useEffect(() => {
    if (!searchQuery) {
      setFilteredIds([]);
      setFilteredEntityType('');
      setSearchResult(null);
    }
  }, [searchQuery, setFilteredIds, setFilteredEntityType]);

  return (
    <div className="mb-6">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search in natural language (e.g., 'All tasks with duration more than 2')"
          />
          {searchQuery && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
        <button
          type="submit"
          className={`mt-2 btn btn-primary ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          disabled={isLoading || !searchQuery}
        >
          {isLoading ? (
            <>
              <FiLoader className="inline-block mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Search'
          )}
        </button>
      </form>
      
      {searchResult && (
        <div className="mt-4 p-3 border rounded-md bg-blue-50 flex items-start">
          <FiInfo className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-blue-700 font-medium">Search Result</p>
            <p className="text-sm text-blue-600">{searchResult.explanation}</p>
            {searchResult.entityType !== 'mixed' && (
              <p className="text-xs text-blue-500 mt-1">
                Navigate to the {searchResult.entityType === 'client' ? 'Clients' : searchResult.entityType === 'worker' ? 'Workers' : 'Tasks'} tab to see the filtered results
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* AI Search Suggestions */}
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">Try these searches:</p>
        <div className="flex flex-wrap gap-2">
          {aiSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => applySuggestion(suggestion)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}