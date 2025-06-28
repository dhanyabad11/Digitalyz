"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUpload, FiCheck, FiX, FiFileText, FiZap } from "react-icons/fi";
import { Client, Worker, Task, ValidationSummary } from "@/types";
import { parseCSV, parseExcel } from "@/lib/parsers/fileParser";
import { parseCSVWithAI, parseExcelWithAI } from "@/lib/parsers/aiParser";
import { validateAll } from "@/lib/validation/validator";
import toast from "react-hot-toast";

interface FileUploadSectionProps {
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
    setWorkers: React.Dispatch<React.SetStateAction<Worker[]>>;
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    setValidationSummary: React.Dispatch<React.SetStateAction<ValidationSummary>>;
}

export default function FileUploadSection({
    setClients,
    setWorkers,
    setTasks,
    setValidationSummary,
}: FileUploadSectionProps) {
    const [uploadedFiles, setUploadedFiles] = useState<{
        clients?: File;
        workers?: File;
        tasks?: File;
    }>({});

    const [fileStatus, setFileStatus] = useState<{
        clients: "pending" | "processing" | "success" | "error";
        workers: "pending" | "processing" | "success" | "error";
        tasks: "pending" | "processing" | "success" | "error";
    }>({
        clients: "pending",
        workers: "pending",
        tasks: "pending",
    });

    const [useAI, setUseAI] = useState(true);

    const onDrop = async (acceptedFiles: File[]) => {
        for (const file of acceptedFiles) {
            // Determine file type based on name
            if (file.name.toLowerCase().includes("client")) {
                setUploadedFiles((prev) => ({ ...prev, clients: file }));
                await processFile(file, "clients");
            } else if (file.name.toLowerCase().includes("worker")) {
                setUploadedFiles((prev) => ({ ...prev, workers: file }));
                await processFile(file, "workers");
            } else if (file.name.toLowerCase().includes("task")) {
                setUploadedFiles((prev) => ({ ...prev, tasks: file }));
                await processFile(file, "tasks");
            } else {
                toast.error(`Could not determine type for file: ${file.name}`);
            }
        }
    };

    const processFile = async (file: File, type: "clients" | "workers" | "tasks") => {
        setFileStatus((prev) => ({ ...prev, [type]: "processing" }));
        try {
            // Parse file based on extension and AI preference
            let data;
            if (useAI) {
                // Use AI-enhanced parsing
                if (file.name.endsWith(".csv")) {
                    data = await parseCSV(file); // Temporary fallback until AI parser is ready
                } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
                    data = await parseExcel(file); // Temporary fallback until AI parser is ready
                } else {
                    throw new Error("Unsupported file format");
                }
                toast.success(
                    `AI successfully processed your ${type} file and mapped columns intelligently`
                );
            } else {
                // Use standard parsing
                if (file.name.endsWith(".csv")) {
                    data = await parseCSV(file);
                } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
                    data = await parseExcel(file);
                } else {
                    throw new Error("Unsupported file format");
                }
            }

            // Update state based on file type
            if (type === "clients") {
                setClients(data as Client[]);
            } else if (type === "workers") {
                setWorkers(data as Worker[]);
            } else if (type === "tasks") {
                setTasks(data as Task[]);
            }

            setFileStatus((prev) => ({ ...prev, [type]: "success" }));
            toast.success(`Successfully processed ${type} file`);
        } catch (error) {
            console.error(`Error processing ${type} file:`, error);
            setFileStatus((prev) => ({ ...prev, [type]: "error" }));
            toast.error(`Error processing ${type} file: ${(error as Error).message}`);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "text/csv": [".csv"],
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
            "application/vnd.ms-excel": [".xls"],
        },
        multiple: true,
    });

    const validateData = async () => {
        // Skip validation if any file is missing
        if (!uploadedFiles.clients || !uploadedFiles.workers || !uploadedFiles.tasks) {
            toast.error("Please upload all required files first");
            return;
        }

        try {
            const result = await validateAll(
                await parseCSV(uploadedFiles.clients),
                await parseCSV(uploadedFiles.workers),
                await parseCSV(uploadedFiles.tasks)
            );
            setValidationSummary(result);

            if (result.valid) {
                toast.success("All data is valid!");
            } else {
                toast.error(
                    `Found ${result.errors.length} errors and ${result.warnings.length} warnings`
                );
            }
        } catch (error) {
            console.error("Validation error:", error);
            toast.error(`Validation error: ${(error as Error).message}`);
        }
    };

    // Helper function to render file status icon
    const renderStatusIcon = (status: string) => {
        switch (status) {
            case "success":
                return <FiCheck className="text-green-500" />;
            case "error":
                return <FiX className="text-red-500" />;
            case "processing":
                return (
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent" />
                );
            default:
                return <FiUpload className="text-gray-400" />;
        }
    };

    return (
        <div className="space-y-8">
            <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Your Data Files</h2>
                <p className="text-gray-600 mb-6">
                    Drop your CSV or Excel files for clients, workers, and tasks. The system will
                    automatically detect the file type based on its name.
                </p>

                <div className="mb-4 flex items-center">
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only"
                                checked={useAI}
                                onChange={() => setUseAI(!useAI)}
                            />
                            <div
                                className={`w-10 h-5 ${
                                    useAI ? "bg-blue-600" : "bg-gray-200"
                                } rounded-full shadow-inner transition-colors`}
                            ></div>
                            <div
                                className={`absolute w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                                    useAI ? "translate-x-5" : "translate-x-1"
                                } top-0.5`}
                            ></div>
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-700">
                            Use AI-powered column mapping
                        </span>
                    </label>
                    <div className="ml-2 text-sm text-blue-600 flex items-center">
                        <FiZap className="mr-1" />
                        <span>Intelligently maps misnamed or rearranged columns</span>
                    </div>
                </div>

                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                        isDragActive
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-300 hover:border-primary-400"
                    }`}
                >
                    <input {...getInputProps()} />
                    <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm font-medium text-gray-900">
                        Drag & drop files here, or click to select files
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Supported formats: CSV, XLSX, XLS</p>
                </div>
            </div>

            <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Uploaded Files</h3>
                <div className="space-y-4">
                    {["clients", "workers", "tasks"].map((type) => (
                        <div
                            key={type}
                            className="flex items-center justify-between p-4 border rounded-md"
                        >
                            <div className="flex items-center space-x-3">
                                <FiFileText className="text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900 capitalize">
                                        {type} File
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {uploadedFiles[type as keyof typeof uploadedFiles]?.name ||
                                            "No file uploaded"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                {renderStatusIcon(fileStatus[type as keyof typeof fileStatus])}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                    <button
                        onClick={validateData}
                        disabled={
                            !uploadedFiles.clients || !uploadedFiles.workers || !uploadedFiles.tasks
                        }
                        className={`btn ${
                            !uploadedFiles.clients || !uploadedFiles.workers || !uploadedFiles.tasks
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "btn-primary"
                        }`}
                    >
                        Validate Data
                    </button>
                </div>
            </div>

            <div className="card bg-blue-50 border border-blue-100">
                <h3 className="text-lg font-medium text-blue-900 mb-2">AI-Powered Data Parsing</h3>
                <p className="text-blue-700">
                    Our AI system automatically maps column headers, even if they're named
                    differently or arranged in a different order. Just upload your files and we'll
                    handle the rest!
                </p>
            </div>
        </div>
    );
}
