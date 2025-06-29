"use client";

import { useState, useMemo } from "react";
import { useTable, useSortBy, usePagination, Column, CellProps, Row } from "react-table";
import { FiChevronUp, FiChevronDown, FiAlertCircle, FiAlertTriangle, FiX } from "react-icons/fi";

// Define interfaces for data structures
interface Client {
    ClientID: string;
    ClientName: string;
    // Add other client fields as needed
}

interface Worker {
    WorkerID: string;
    // Add other worker fields as needed
}

interface Task {
    TaskID: string;
    // Add other task fields as needed
}

// Union type for data
type Entity = Client | Worker | Task;

interface ValidationError {
    entityId: string;
    field: string;
    message: string;
}

interface DataGridProps {
    data: Entity[];
    setData: React.Dispatch<React.SetStateAction<Entity[]>>;
    entityType: "client" | "worker" | "task";
    errors: ValidationError[];
    warnings: ValidationError[];
    filteredIds: string[];
    onResetFilters?: () => void; // Optional callback for resetting filters
}

// Utility to get ID field based on entity type
const getIdField = (entityType: DataGridProps["entityType"]): keyof Entity => {
    switch (entityType) {
        case "client":
            return "ClientID";
        case "worker":
            return "WorkerID";
        case "task":
            return "TaskID";
    }
};

export default function DataGrid({
    data,
    setData,
    entityType,
    errors,
    warnings,
    filteredIds,
    onResetFilters,
}: DataGridProps) {
    const [editingCell, setEditingCell] = useState<{
        rowIndex: number;
        columnId: string;
    } | null>(null);

    // Filter data based on filtered IDs
    const filteredData = useMemo(() => {
        if (filteredIds.length === 0) return data;
        const idField = getIdField(entityType);
        return data.filter((item) => filteredIds.includes(item[idField] as string));
    }, [data, filteredIds, entityType]);

    // Define columns with proper typing
    const columns = useMemo<Column<Entity>[]>(() => {
        const getColumnCellProps = (info: CellProps<Entity, string>) => {
            const rowId = info.row.original[getIdField(entityType)] as string;
            const cellErrors = errors.filter(
                (e) => e.entityId === rowId && e.field === info.column.id
            );
            const cellWarnings = warnings.filter(
                (w) => w.entityId === rowId && w.field === info.column.id
            );

            return {
                className: `px-6 py-4 whitespace-nowrap text-sm ${
                    cellErrors.length > 0
                        ? "bg-red-50 text-red-900"
                        : cellWarnings.length > 0
                        ? "bg-yellow-50 text-yellow-900"
                        : "text-gray-500"
                }`,
                title:
                    [...cellErrors, ...cellWarnings].map((issue) => issue.message).join("\n") ||
                    undefined,
            };
        };

        const baseColumns: Column<Entity>[] = [
            {
                Header: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} ID`,
                accessor: getIdField(entityType),
                Cell: ({ row, value, column }: CellProps<Entity, string>) => (
                    <EditableCell
                        value={value}
                        row={row}
                        column={column}
                        updateData={(rowIndex: number, columnId: string, value: string) => {
                            setData((prev) => {
                                const newData = [...prev];
                                newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };
                                return newData;
                            });
                        }}
                        isEditing={
                            editingCell?.rowIndex === row.index &&
                            editingCell?.columnId === column.id
                        }
                        setIsEditing={setEditingCell}
                    />
                ),
                cellProps: getColumnCellProps,
            },
        ];

        if (entityType === "client") {
            return [
                ...baseColumns,
                {
                    Header: "Client Name",
                    accessor: "ClientName",
                    Cell: ({ row, value, column }: CellProps<Client, string>) => (
                        <EditableCell
                            value={value}
                            row={row as Row<Client>} // Cast to specific type
                            column={column as Column<Client>}
                            updateData={(rowIndex: number, columnId: string, value: string) => {
                                setData((prev) => {
                                    const newData = [...prev];
                                    newData[rowIndex] = { ...newData[rowIndex], [columnId]: value };
                                    return newData;
                                });
                            }}
                            isEditing={
                                editingCell?.rowIndex === row.index &&
                                editingCell?.columnId === column.id
                            }
                            setIsEditing={setEditingCell}
                        />
                    ),
                    cellProps: getColumnCellProps,
                },
            ];
        }

        return baseColumns; // Worker and Task only have ID column for now
    }, [entityType, errors, warnings, editingCell, setData]);

    // Use react-table hooks with strict typing
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = useTable<Entity>(
        {
            columns,
            data: filteredData,
            initialState: { pageIndex: 0, pageSize: 10 },
        },
        useSortBy,
        usePagination
    );

    return (
        <div className="space-y-4">
            {filteredIds.length > 0 && (
                <div className="flex items-center rounded-md bg-blue-50 p-2 text-sm text-blue-700">
                    <FiAlertCircle className="mr-2 h-4 w-4" />
                    Showing {filteredData.length} filtered results
                    {onResetFilters && (
                        <button
                            onClick={onResetFilters}
                            className="ml-auto text-blue-600 hover:text-blue-800"
                            aria-label="Clear filters"
                        >
                            <FiX className="h-4 w-4" />
                        </button>
                    )}
                </div>
            )}

            <div className="overflow-x-auto rounded-lg border">
                <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {headerGroups.map((headerGroup) => (
                            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                                {headerGroup.headers.map((column) => (
                                    <th
                                        {...column.getHeaderProps(column.getSortByToggleProps())}
                                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                        key={column.id}
                                    >
                                        <div className="flex items-center">
                                            {column.render("Header")}
                                            <span className="ml-1">
                                                {column.isSorted ? (
                                                    column.isSortedDesc ? (
                                                        <FiChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <FiChevronUp className="h-4 w-4" />
                                                    )
                                                ) : null}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Actions
                                </th>
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()} className="divide-y divide-gray-200 bg-white">
                        {page.map((row) => {
                            prepareRow(row);
                            const rowId = row.original[getIdField(entityType)] as string;
                            const rowErrors = errors.filter((e) => e.entityId === rowId);
                            const rowWarnings = warnings.filter((w) => w.entityId === rowId);

                            return (
                                <tr
                                    {...row.getRowProps()}
                                    key={row.id}
                                    className={
                                        rowErrors.length > 0
                                            ? "bg-red-50"
                                            : rowWarnings.length > 0
                                            ? "bg-yellow-50"
                                            : ""
                                    }
                                >
                                    {row.cells.map((cell) => (
                                        <td
                                            {...cell.getCellProps(
                                                cell.column.cellProps?.(
                                                    cell as CellProps<Entity, string>
                                                )
                                            )}
                                            key={cell.column.id}
                                        >
                                            {cell.render("Cell")}
                                        </td>
                                    ))}
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <div className="flex items-center space-x-2">
                                            {rowErrors.length > 0 && (
                                                <FiAlertCircle
                                                    className="h-5 w-5 text-red-500"
                                                    title={rowErrors
                                                        .map((e) => e.message)
                                                        .join("\n")}
                                                    aria-label="Row errors"
                                                />
                                            )}
                                            {rowWarnings.length > 0 && (
                                                <FiAlertTriangle
                                                    className="h-5 w-5 text-yellow-500"
                                                    title={rowWarnings
                                                        .map((w) => w.message)
                                                        .join("\n")}
                                                    aria-label="Row warnings"
                                                />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filteredData.length === 0 && (
                <div className="py-8 text-center">
                    <p className="text-gray-500">No results found</p>
                </div>
            )}

            {filteredData.length > 0 && (
                <div className="flex items-center justify-between py-3">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => previousPage()}
                            disabled={!canPreviousPage}
                            className={`rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
                                canPreviousPage
                                    ? "bg-white text-gray-500 hover:bg-gray-50"
                                    : "cursor-not-allowed bg-gray-200 text-gray-400"
                            }`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => nextPage()}
                            disabled={!canNextPage}
                            className={`rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${
                                canNextPage
                                    ? "bg-white text-gray-500 hover:bg-gray-50"
                                    : "cursor-not-allowed bg-gray-200 text-gray-400"
                            }`}
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div className="flex items-center gap-x-2">
                            <span className="text-sm text-gray-700">
                                Page <span className="font-medium">{pageIndex + 1}</span> of{" "}
                                <span className="font-medium">{pageOptions.length}</span>
                            </span>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                aria-label="Rows per page"
                            >
                                {[5, 10, 20, 30, 40, 50].map((size) => (
                                    <option key={size} value={size}>
                                        Show {size}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <nav
                            className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
                            aria-label="Pagination"
                        >
                            <button
                                onClick={() => gotoPage(0)}
                                disabled={!canPreviousPage}
                                className={`relative inline-flex items-center rounded-l-md border border-gray-300 px-2 py-2 text-sm font-medium ${
                                    canPreviousPage
                                        ? "bg-white text-gray-500 hover:bg-gray-50"
                                        : "cursor-not-allowed bg-gray-200 text-gray-400"
                                }`}
                                aria-label="First page"
                            >
                                <span className="sr-only">First</span>
                                <span aria-hidden="true">«</span>
                            </button>
                            <button
                                onClick={() => previousPage()}
                                disabled={!canPreviousPage}
                                className={`relative inline-flex items-center border border-gray-300 px-2 py-2 text-sm font-medium ${
                                    canPreviousPage
                                        ? "bg-white text-gray-500 hover:bg-gray-50"
                                        : "cursor-not-allowed bg-gray-200 text-gray-400"
                                }`}
                                aria-label="Previous page"
                            >
                                <span className="sr-only">Previous</span>
                                <span aria-hidden="true">‹</span>
                            </button>
                            <button
                                onClick={() => nextPage()}
                                disabled={!canNextPage}
                                className={`relative inline-flex items-center border border-gray-300 px-2 py-2 text-sm font-medium ${
                                    canNextPage
                                        ? "bg-white text-gray-500 hover:bg-gray-50"
                                        : "cursor-not-allowed bg-gray-200 text-gray-400"
                                }`}
                                aria-label="Next page"
                            >
                                <span className="sr-only">Next</span>
                                <span aria-hidden="true">›</span>
                            </button>
                            <button
                                onClick={() => gotoPage(pageCount - 1)}
                                disabled={!canNextPage}
                                className={`relative inline-flex items-center rounded-r-md border border-gray-300 px-2 py-2 text-sm font-medium ${
                                    canNextPage
                                        ? "bg-white text-gray-500 hover:bg-gray-50"
                                        : "cursor-not-allowed bg-gray-200 text-gray-400"
                                }`}
                                aria-label="Last page"
                            >
                                <span className="sr-only">Last</span>
                                <span aria-hidden="true">»</span>
                            </button>
                        </nav>
                    </div>
                </div>
            )}
        </div>
    );
}

// EditableCell.tsx (Stub with proper typing)
interface EditableCellProps<T extends object> {
    value: string;
    row: Row<T>;
    column: Column<T>;
    updateData: (rowIndex: number, columnId: string, value: string) => void;
    isEditing: boolean;
    setIsEditing: React.Dispatch<
        React.SetStateAction<{ rowIndex: number; columnId: string } | null>
    >;
}

export function EditableCell<T extends object>({
    value,
    row,
    column,
    updateData,
    isEditing,
    setIsEditing,
}: EditableCellProps<T>) {
    const [inputValue, setInputValue] = useState(value);

    if (!isEditing) {
        return (
            <div
                onClick={() => setIsEditing({ rowIndex: row.index, columnId: column.id })}
                className="cursor-pointer"
            >
                {value}
            </div>
        );
    }

    return (
        <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => {
                updateData(row.index, column.id, inputValue);
                setIsEditing(null);
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    updateData(row.index, column.id, inputValue);
                    setIsEditing(null);
                } else if (e.key === "Escape") {
                    setIsEditing(null);
                }
            }}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
            autoFocus
        />
    );
}
