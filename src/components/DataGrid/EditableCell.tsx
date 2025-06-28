"use client";

import { useState, useEffect } from "react";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";

interface EditableCellProps {
    value: any;
    row: any;
    column: any;
    updateData: (rowIndex: number, columnId: string, value: any) => void;
    isEditing: boolean;
    setIsEditing: (value: { rowIndex: number; columnId: string } | null) => void;
}

export default function EditableCell({
    value: initialValue,
    row: { index },
    column: { id },
    updateData,
    isEditing,
    setIsEditing,
}: EditableCellProps) {
    const [value, setValue] = useState(initialValue);

    // When the input is blurred, we update the state of the input
    // and trigger the updateData callback
    const onBlur = () => {
        updateData(index, id, value);
        setIsEditing(null);
    };

    const onCancel = () => {
        setValue(initialValue);
        setIsEditing(null);
    };

    const onSave = () => {
        updateData(index, id, value);
        setIsEditing(null);
    };

    // If the initialValue is changed external, sync it up with our state
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    if (isEditing) {
        return (
            <div className="flex items-center">
                <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={onBlur}
                    className="input w-full"
                    autoFocus
                />
                <div className="flex ml-2">
                    <button
                        className="text-green-500 hover:text-green-700 mr-1"
                        onClick={onSave}
                        title="Save"
                    >
                        <FiCheck className="h-4 w-4" />
                    </button>
                    <button
                        className="text-red-500 hover:text-red-700"
                        onClick={onCancel}
                        title="Cancel"
                    >
                        <FiX className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center group">
            <div className="truncate max-w-xs">{value}</div>
            <button
                className="ml-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsEditing({ rowIndex: index, columnId: id })}
                title="Edit"
            >
                <FiEdit2 className="h-4 w-4" />
            </button>
        </div>
    );
}
