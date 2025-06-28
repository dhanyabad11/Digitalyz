"use client";

import { useState } from "react";
import {
    Client,
    Worker,
    Task,
    Rule,
    CoRunRule,
    SlotRestrictionRule,
    LoadLimitRule,
    PhaseWindowRule,
    PatternMatchRule,
} from "@/types";
import { v4 as uuidv4 } from "uuid";

interface RuleFormProps {
    ruleType: string;
    clients: Client[];
    workers: Worker[];
    tasks: Task[];
    onCancel: () => void;
    onSubmit: (rule: Rule) => void;
}

export default function RuleForm({
    ruleType,
    clients,
    workers,
    tasks,
    onCancel,
    onSubmit,
}: RuleFormProps) {
    // Form state for Co-Run rule
    const [coRunTasks, setCoRunTasks] = useState<string[]>([]);

    // Form state for Slot Restriction rule
    const [slotRestrictionGroup, setSlotRestrictionGroup] = useState<{
        groupType: "client" | "worker";
        groupName: string;
        minCommonSlots: number;
    }>({
        groupType: "client",
        groupName: "",
        minCommonSlots: 1,
    });

    // Form state for Load Limit rule
    const [loadLimit, setLoadLimit] = useState<{
        workerGroup: string;
        maxSlotsPerPhase: number;
    }>({
        workerGroup: "",
        maxSlotsPerPhase: 1,
    });

    // Form state for Phase Window rule
    const [phaseWindow, setPhaseWindow] = useState<{
        taskId: string;
        allowedPhases: string;
    }>({
        taskId: "",
        allowedPhases: "",
    });

    // Form state for Pattern Match rule
    const [patternMatch, setPatternMatch] = useState<{
        pattern: string;
        template: string;
        additionalParams: string;
    }>({
        pattern: "",
        template: "",
        additionalParams: "{}",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let rule: Rule;

        switch (ruleType) {
            case "coRun":
                rule = {
                    id: uuidv4(),
                    type: "coRun",
                    parameters: {
                        tasks: coRunTasks,
                    },
                    description: `Tasks ${coRunTasks.join(", ")} must run together`,
                } as CoRunRule;
                break;

            case "slotRestriction":
                rule = {
                    id: uuidv4(),
                    type: "slotRestriction",
                    parameters: {
                        groupType: slotRestrictionGroup.groupType,
                        groupName: slotRestrictionGroup.groupName,
                        minCommonSlots: slotRestrictionGroup.minCommonSlots,
                    },
                    description: `${
                        slotRestrictionGroup.groupType === "client" ? "Client" : "Worker"
                    } group ${slotRestrictionGroup.groupName} requires at least ${
                        slotRestrictionGroup.minCommonSlots
                    } common slots`,
                } as SlotRestrictionRule;
                break;

            case "loadLimit":
                rule = {
                    id: uuidv4(),
                    type: "loadLimit",
                    parameters: {
                        workerGroup: loadLimit.workerGroup,
                        maxSlotsPerPhase: loadLimit.maxSlotsPerPhase,
                    },
                    description: `Worker group ${loadLimit.workerGroup} has a maximum of ${loadLimit.maxSlotsPerPhase} slots per phase`,
                } as LoadLimitRule;
                break;

            case "phaseWindow":
                // Parse the allowed phases from string to array
                let allowedPhases: number[] = [];
                if (phaseWindow.allowedPhases.includes("-")) {
                    const [start, end] = phaseWindow.allowedPhases.split("-").map(Number);
                    for (let i = start; i <= end; i++) {
                        allowedPhases.push(i);
                    }
                } else {
                    allowedPhases = phaseWindow.allowedPhases
                        .split(",")
                        .map((phase) => parseInt(phase.trim()))
                        .filter((phase) => !isNaN(phase));
                }

                rule = {
                    id: uuidv4(),
                    type: "phaseWindow",
                    parameters: {
                        taskId: phaseWindow.taskId,
                        allowedPhases,
                    },
                    description: `Task ${phaseWindow.taskId} can only run in phases ${phaseWindow.allowedPhases}`,
                } as PhaseWindowRule;
                break;

            case "patternMatch":
                rule = {
                    id: uuidv4(),
                    type: "patternMatch",
                    parameters: {
                        pattern: patternMatch.pattern,
                        template: patternMatch.template,
                        additionalParams: JSON.parse(patternMatch.additionalParams),
                    },
                    description: `Pattern match rule: ${patternMatch.pattern} with template ${patternMatch.template}`,
                } as PatternMatchRule;
                break;

            default:
                throw new Error(`Unknown rule type: ${ruleType}`);
        }

        onSubmit(rule);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {ruleType === "coRun" && (
                <div>
                    <label className="label">Select Tasks to Run Together:</label>
                    <select
                        multiple
                        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={coRunTasks}
                        onChange={(e) => {
                            const selected = Array.from(
                                e.target.selectedOptions,
                                (option) => option.value
                            );
                            setCoRunTasks(selected);
                        }}
                        required
                    >
                        {tasks.map((task) => (
                            <option key={task.TaskID} value={task.TaskID}>
                                {task.TaskID} - {task.TaskName}
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                        Hold Ctrl/Cmd to select multiple tasks
                    </p>
                </div>
            )}

            {ruleType === "slotRestriction" && (
                <>
                    <div>
                        <label className="label">Group Type:</label>
                        <select
                            className="input w-full"
                            value={slotRestrictionGroup.groupType}
                            onChange={(e) =>
                                setSlotRestrictionGroup({
                                    ...slotRestrictionGroup,
                                    groupType: e.target.value as "client" | "worker",
                                })
                            }
                            required
                        >
                            <option value="client">Client Group</option>
                            <option value="worker">Worker Group</option>
                        </select>
                    </div>

                    <div>
                        <label className="label">Group Name:</label>
                        <select
                            className="input w-full"
                            value={slotRestrictionGroup.groupName}
                            onChange={(e) =>
                                setSlotRestrictionGroup({
                                    ...slotRestrictionGroup,
                                    groupName: e.target.value,
                                })
                            }
                            required
                        >
                            <option value="">Select a group</option>
                            {slotRestrictionGroup.groupType === "client"
                                ? // Get unique client group tags
                                  Array.from(new Set(clients.map((client) => client.GroupTag)))
                                      .filter(Boolean)
                                      .map((groupTag) => (
                                          <option key={groupTag} value={groupTag}>
                                              {groupTag}
                                          </option>
                                      ))
                                : // Get unique worker groups
                                  Array.from(new Set(workers.map((worker) => worker.WorkerGroup)))
                                      .filter(Boolean)
                                      .map((groupName) => (
                                          <option key={groupName} value={groupName}>
                                              {groupName}
                                          </option>
                                      ))}
                        </select>
                    </div>

                    <div>
                        <label className="label">Minimum Common Slots:</label>
                        <input
                            type="number"
                            className="input w-full"
                            min="1"
                            value={slotRestrictionGroup.minCommonSlots}
                            onChange={(e) =>
                                setSlotRestrictionGroup({
                                    ...slotRestrictionGroup,
                                    minCommonSlots: parseInt(e.target.value),
                                })
                            }
                            required
                        />
                    </div>
                </>
            )}

            {ruleType === "loadLimit" && (
                <>
                    <div>
                        <label className="label">Worker Group:</label>
                        <select
                            className="input w-full"
                            value={loadLimit.workerGroup}
                            onChange={(e) =>
                                setLoadLimit({
                                    ...loadLimit,
                                    workerGroup: e.target.value,
                                })
                            }
                            required
                        >
                            <option value="">Select a worker group</option>
                            {Array.from(new Set(workers.map((worker) => worker.WorkerGroup)))
                                .filter(Boolean)
                                .map((groupName) => (
                                    <option key={groupName} value={groupName}>
                                        {groupName}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label className="label">Maximum Slots Per Phase:</label>
                        <input
                            type="number"
                            className="input w-full"
                            min="1"
                            value={loadLimit.maxSlotsPerPhase}
                            onChange={(e) =>
                                setLoadLimit({
                                    ...loadLimit,
                                    maxSlotsPerPhase: parseInt(e.target.value),
                                })
                            }
                            required
                        />
                    </div>
                </>
            )}

            {ruleType === "phaseWindow" && (
                <>
                    <div>
                        <label className="label">Task:</label>
                        <select
                            className="input w-full"
                            value={phaseWindow.taskId}
                            onChange={(e) =>
                                setPhaseWindow({
                                    ...phaseWindow,
                                    taskId: e.target.value,
                                })
                            }
                            required
                        >
                            <option value="">Select a task</option>
                            {tasks.map((task) => (
                                <option key={task.TaskID} value={task.TaskID}>
                                    {task.TaskID} - {task.TaskName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label">Allowed Phases:</label>
                        <input
                            type="text"
                            className="input w-full"
                            placeholder="e.g., 1,2,3 or 1-3"
                            value={phaseWindow.allowedPhases}
                            onChange={(e) =>
                                setPhaseWindow({
                                    ...phaseWindow,
                                    allowedPhases: e.target.value,
                                })
                            }
                            required
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Enter comma-separated phases (1,3,5) or a range (1-5)
                        </p>
                    </div>
                </>
            )}

            {ruleType === "patternMatch" && (
                <>
                    <div>
                        <label className="label">Pattern (RegEx):</label>
                        <input
                            type="text"
                            className="input w-full"
                            placeholder="e.g., ^T[0-9]{3}$"
                            value={patternMatch.pattern}
                            onChange={(e) =>
                                setPatternMatch({
                                    ...patternMatch,
                                    pattern: e.target.value,
                                })
                            }
                            required
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Regular expression to match task IDs, worker IDs, etc.
                        </p>
                    </div>

                    <div>
                        <label className="label">Rule Template:</label>
                        <select
                            className="input w-full"
                            value={patternMatch.template}
                            onChange={(e) =>
                                setPatternMatch({
                                    ...patternMatch,
                                    template: e.target.value,
                                })
                            }
                            required
                        >
                            <option value="">Select a template</option>
                            <option value="phaseConstraint">Phase Constraint</option>
                            <option value="skillRequirement">Skill Requirement</option>
                            <option value="priorityBoost">Priority Boost</option>
                            <option value="custom">Custom Rule</option>
                        </select>
                    </div>

                    <div>
                        <label className="label">Additional Parameters (JSON):</label>
                        <textarea
                            className="input w-full h-24"
                            placeholder='{"param1": "value1", "param2": 2}'
                            value={patternMatch.additionalParams}
                            onChange={(e) =>
                                setPatternMatch({
                                    ...patternMatch,
                                    additionalParams: e.target.value,
                                })
                            }
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            Additional parameters in JSON format
                        </p>
                    </div>
                </>
            )}

            <div className="flex justify-end space-x-3">
                <button type="button" className="btn btn-outline" onClick={onCancel}>
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={
                        (ruleType === "coRun" && coRunTasks.length < 2) ||
                        (ruleType === "slotRestriction" && !slotRestrictionGroup.groupName) ||
                        (ruleType === "loadLimit" && !loadLimit.workerGroup) ||
                        (ruleType === "phaseWindow" && !phaseWindow.taskId) ||
                        (ruleType === "patternMatch" &&
                            (!patternMatch.pattern || !patternMatch.template))
                    }
                >
                    Create Rule
                </button>
            </div>
        </form>
    );
}
