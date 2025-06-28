"use client";

import { useState } from "react";
import { FiZap, FiLoader, FiAlertCircle, FiAlertTriangle } from "react-icons/fi";
import { Client, Worker, Task } from "@/types";
import { runAIValidation } from "@/lib/ai-helpers/geminiClient";
import toast from "react-hot-toast";

interface AIValidatorProps {
    clients: Client[];
    workers: Worker[];
    tasks: Task[];
}

export default function AIValidator({ clients, workers, tasks }: AIValidatorProps) {
    const [isValidating, setIsValidating] = useState(false);
    const [validationResults, setValidationResults] = useState<{
        validationIssues: {
            entityType: string;
            entityId: string;
            severity: string;
            message: string;
            recommendation: string;
        }[];
    } | null>(null);

    const runDeepValidation = async () => {
        if (clients.length === 0 || workers.length === 0 || tasks.length === 0) {
            toast.error("Please upload all data files before running AI validation");
            return;
        }

        setIsValidating(true);
        try {
            const results = await runAIValidation(clients, workers, tasks);
            setValidationResults(results);

            const errorCount = results.validationIssues.filter(
                (i) => i.severity === "error"
            ).length;
            const warningCount = results.validationIssues.filter(
                (i) => i.severity === "warning"
            ).length;

            if (errorCount === 0 && warningCount === 0) {
                toast.success("AI validation found no issues!");
            } else {
                toast.error(
                    `AI validation found ${errorCount} errors and ${warningCount} warnings`
                );
            }
        } catch (error) {
            console.error("Error running AI validation:", error);
            toast.error("Failed to run AI validation");
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <div className="mt-8 border-t pt-8">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">AI Deep Validation</h3>
                    <p className="text-sm text-gray-600">
                        Run AI-powered deep validation to check for complex issues like circular
                        dependencies and resource conflicts
                    </p>
                </div>
                <button
                    onClick={runDeepValidation}
                    disabled={isValidating}
                    className={`btn ${
                        isValidating
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "btn-secondary"
                    }`}
                >
                    {isValidating ? (
                        <>
                            <FiLoader className="inline-block mr-2 h-4 w-4 animate-spin" />
                            Running AI Validation...
                        </>
                    ) : (
                        <>
                            <FiZap className="mr-2 h-4 w-4" />
                            Run AI Validation
                        </>
                    )}
                </button>
            </div>

            {validationResults && (
                <div className="mt-4">
                    {validationResults.validationIssues.length === 0 ? (
                        <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                            <p className="font-medium">AI validation found no issues!</p>
                            <p className="text-sm mt-1">
                                Your data looks good and should work well for resource allocation.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-700 mb-3">
                                AI validation found {validationResults.validationIssues.length}{" "}
                                issues:
                            </p>
                            <ul className="space-y-3">
                                {validationResults.validationIssues.map((issue, index) => (
                                    <li
                                        key={index}
                                        className={`p-4 rounded-lg border ${
                                            issue.severity === "error"
                                                ? "bg-red-50 border-red-200"
                                                : "bg-yellow-50 border-yellow-200"
                                        }`}
                                    >
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {issue.severity === "error" ? (
                                                    <FiAlertCircle className="h-5 w-5 text-red-500" />
                                                ) : (
                                                    <FiAlertTriangle className="h-5 w-5 text-yellow-500" />
                                                )}
                                            </div>
                                            <div className="ml-3">
                                                <p
                                                    className={`text-sm font-medium ${
                                                        issue.severity === "error"
                                                            ? "text-red-800"
                                                            : "text-yellow-800"
                                                    }`}
                                                >
                                                    {issue.message}
                                                </p>
                                                <p className="text-xs mt-1 text-gray-600">
                                                    Entity:{" "}
                                                    <span className="font-medium capitalize">
                                                        {issue.entityType}
                                                    </span>
                                                    {issue.entityId !== "global" && (
                                                        <>
                                                            {" "}
                                                            | ID:{" "}
                                                            <span className="font-medium">
                                                                {issue.entityId}
                                                            </span>
                                                        </>
                                                    )}
                                                </p>
                                                {issue.recommendation && (
                                                    <p className="text-xs mt-2 font-medium text-gray-700">
                                                        Recommendation: {issue.recommendation}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
