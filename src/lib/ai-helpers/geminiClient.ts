import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { Client, Worker, Task, ValidationError } from "@/types";

// Initialize the Gemini API with your API key
// You would need to add this to your .env.local file
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });

// Helper function to extract JSON from Gemini response
const extractJson = (text: string) => {
    const jsonMatch =
        text.match(/```json\n([\s\S]*?)\n```/) ||
        text.match(/```\n([\s\S]*?)\n```/) ||
        text.match(/{[\s\S]*?}/);

    if (jsonMatch) {
        const jsonString = jsonMatch[0].startsWith("{") ? jsonMatch[0] : jsonMatch[1];
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.error("Error parsing JSON:", e);
            throw new Error("Failed to parse JSON from Gemini response");
        }
    }

    throw new Error("Failed to extract JSON from Gemini response");
};

// 1. INTELLIGENT DATA PARSING
export async function intelligentDataParsing(
    headerRow: string[],
    sampleRows: any[],
    targetFormat: string
): Promise<{ mappedHeaders: Record<string, string> }> {
    try {
        const prompt = `
    You are an AI data parser that can map column headers to their intended fields.
    
    Here are the column headers from an uploaded file:
    ${JSON.stringify(headerRow)}
    
    Here are a few sample rows to understand the data:
    ${JSON.stringify(sampleRows.slice(0, 3))}
    
    The target data format is:
    ${targetFormat}
    
    Return a JSON mapping between the provided headers and the target format fields:
    {
      "mappedHeaders": {
        "original_header1": "target_field1",
        "original_header2": "target_field2",
        ...
      }
    }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        return extractJson(responseText);
    } catch (error) {
        console.error("Error in intelligent data parsing:", error);
        throw error;
    }
}

// 2. NATURAL LANGUAGE DATA RETRIEVAL
export async function processSearchWithGemini(
    query: string,
    clients: Client[],
    workers: Worker[],
    tasks: Task[]
) {
    try {
        // Create a concise data context to avoid hitting token limits
        const dataContext = {
            clients: clients.map((c) => ({
                id: c.ClientID,
                name: c.ClientName,
                priority: c.PriorityLevel,
                tasks: c.RequestedTaskIDs,
                group: c.GroupTag,
            })),
            workers: workers.map((w) => ({
                id: w.WorkerID,
                name: w.WorkerName,
                skills: w.Skills,
                slots: w.AvailableSlots,
                group: w.WorkerGroup,
            })),
            tasks: tasks.map((t) => ({
                id: t.TaskID,
                name: t.TaskName,
                category: t.Category,
                duration: t.Duration,
                skills: t.RequiredSkills,
                phases: t.PreferredPhases,
            })),
        };

        const prompt = `
    You are an AI assistant that helps search through resource allocation data.
    
    Here is the data context:
    ${JSON.stringify(dataContext)}
    
    User query: "${query}"
    
    Return a JSON response with the following structure:
    {
      "results": [], // Array of IDs of matching items
      "entityType": "", // "client", "worker", "task", or "mixed"
      "explanation": "" // Explanation of the search results
    }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        return extractJson(responseText);
    } catch (error) {
        console.error("Error in natural language search:", error);
        throw error;
    }
}

// 3. NATURAL LANGUAGE DATA MODIFICATION
export async function modifyDataWithNaturalLanguage(
    instruction: string,
    entityType: "client" | "worker" | "task",
    entityData: any[],
    entitySchema: string
) {
    try {
        const prompt = `
    You are an AI assistant that helps modify resource allocation data.
    
    Here is the current data:
    ${JSON.stringify(entityData)}
    
    The data schema is:
    ${entitySchema}
    
    User modification instruction: "${instruction}"
    
    Return a JSON response with the following structure:
    {
      "modifiedData": [], // Array of modified entities
      "explanation": "", // Explanation of what was changed
      "success": true/false // Whether the modification was successful
    }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        return extractJson(responseText);
    } catch (error) {
        console.error("Error in natural language data modification:", error);
        throw error;
    }
}

// 4. NATURAL LANGUAGE TO RULES CONVERTER
export async function createRuleWithGemini(
    description: string,
    clients: Client[],
    workers: Worker[],
    tasks: Task[]
) {
    try {
        // Create a concise data context
        const dataContext = {
            clientGroups: [...new Set(clients.map((c) => c.GroupTag).filter(Boolean))],
            workerGroups: [...new Set(workers.map((w) => w.WorkerGroup).filter(Boolean))],
            taskIds: tasks.map((t) => t.TaskID),
        };

        const prompt = `
    You are an AI assistant that creates business rules for resource allocation.
    
    Here is the data context:
    ${JSON.stringify(dataContext)}
    
    Available rule types:
    1. coRun - Tasks that must run together
    2. slotRestriction - Minimum common slots for a group
    3. loadLimit - Maximum slots per phase for a worker group
    4. phaseWindow - Allowed phases for a task
    5. patternMatch - Pattern matching with regex
    
    User wants to create a rule: "${description}"
    
    Return a JSON response with the following structure:
    {
      "ruleType": "", // One of the rule types above
      "parameters": {}, // Parameters specific to the rule type
      "description": "", // Human-readable description of the rule
      "success": true/false, // Whether a rule could be created
      "message": "" // Explanation or error message
    }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        return extractJson(responseText);
    } catch (error) {
        console.error("Error in natural language rule creation:", error);
        throw error;
    }
}

// 5. AI RULE RECOMMENDATIONS
export async function generateRuleRecommendations(
    clients: Client[],
    workers: Worker[],
    tasks: Task[]
) {
    try {
        // Create a concise data context
        const dataContext = {
            clients: clients.map((c) => ({
                id: c.ClientID,
                tasks: c.RequestedTaskIDs,
                group: c.GroupTag,
            })),
            workers: workers.map((w) => ({
                id: w.WorkerID,
                skills: w.Skills,
                slots: w.AvailableSlots,
                group: w.WorkerGroup,
                maxLoad: w.MaxLoadPerPhase,
            })),
            tasks: tasks.map((t) => ({
                id: t.TaskID,
                category: t.Category,
                skills: t.RequiredSkills,
                phases: t.PreferredPhases,
            })),
        };

        const prompt = `
    You are an AI assistant that analyzes resource allocation data and suggests business rules.
    
    Here is the data context:
    ${JSON.stringify(dataContext)}
    
    Analyze the data to find patterns that might suggest business rules. Look for:
    1. Tasks that are frequently requested together by clients
    2. Worker groups that might be overloaded
    3. Tasks that have similar skill requirements
    4. Phase restrictions that might be needed
    
    Return a JSON response with rule recommendations:
    {
      "recommendations": [
        {
          "ruleType": "", // coRun, slotRestriction, loadLimit, phaseWindow, or patternMatch
          "parameters": {}, // Parameters for the rule
          "description": "", // Human-readable description
          "reasoning": "" // Explanation of why this rule is recommended
        }
      ]
    }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        return extractJson(responseText);
    } catch (error) {
        console.error("Error generating rule recommendations:", error);
        throw error;
    }
}

// 6. AI-BASED ERROR CORRECTION
export async function suggestCorrectionsWithGemini(
    errors: ValidationError[],
    clients: Client[],
    workers: Worker[],
    tasks: Task[]
) {
    try {
        // Create a concise data context focusing on the entities with errors
        const errorEntityIds = new Set(errors.map((e) => e.entityId));

        const dataContext = {
            errors: errors,
            affectedClients: clients.filter((c) => errorEntityIds.has(c.ClientID)),
            affectedWorkers: workers.filter((w) => errorEntityIds.has(w.WorkerID)),
            affectedTasks: tasks.filter((t) => errorEntityIds.has(t.TaskID)),
            allClientIds: clients.map((c) => c.ClientID),
            allWorkerIds: workers.map((w) => w.WorkerID),
            allTaskIds: tasks.map((t) => t.TaskID),
            allSkills: [...new Set(workers.flatMap((w) => w.Skills))],
        };

        const prompt = `
    You are an AI assistant that helps fix errors in resource allocation data.
    
    Here is the data context:
    ${JSON.stringify(dataContext)}
    
    Return a JSON response with suggestions to fix these errors:
    {
      "suggestions": [
        {
          "entityId": "",
          "entityType": "", // client, worker, or task
          "field": "",
          "currentValue": null, // Current value (can be any type)
          "suggestedValue": null, // Suggested value (can be any type)
          "explanation": "" // Explanation of the suggestion
        }
      ]
    }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        return extractJson(responseText);
    } catch (error) {
        console.error("Error generating correction suggestions:", error);
        throw error;
    }
}

// 7. AI-BASED VALIDATOR
export async function runAIValidation(clients: Client[], workers: Worker[], tasks: Task[]) {
    try {
        // Create a concise data context
        const dataContext = {
            clientCount: clients.length,
            workerCount: workers.length,
            taskCount: tasks.length,
            clientSample: clients.slice(0, 3),
            workerSample: workers.slice(0, 3),
            taskSample: tasks.slice(0, 3),
        };

        const prompt = `
    You are an AI validator for resource allocation data.
    
    Here is the data context:
    ${JSON.stringify(dataContext)}
    
    Perform deep validation on this data, looking for issues like:
    1. Circular dependencies
    2. Resource bottlenecks
    3. Skill coverage issues
    4. Phase allocation problems
    5. Any other complex validation issues
    
    Return a JSON response with validation results:
    {
      "validationIssues": [
        {
          "entityType": "", // client, worker, task, or system
          "entityId": "", // ID of the affected entity, or "global" for system-level issues
          "severity": "", // error or warning
          "message": "", // Description of the issue
          "recommendation": "" // Recommended fix
        }
      ]
    }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        return extractJson(responseText);
    } catch (error) {
        console.error("Error in AI validation:", error);
        throw error;
    }
}
