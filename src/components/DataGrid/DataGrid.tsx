"use client";

import { useState, useMemo } from "react";
import { useTable, useSortBy, usePagination } from "react-table";
import {
    FiChevronUp,
    FiChevronDown,
    FiEdit2,
    FiCheck,
    FiX,
    FiAlertCircle,
    FiAlertTriangle,
} from "react-icons/fi";
import { ValidationError } from "@/types";
import EditableCell from "./EditableCell";

interface DataGridProps {
    data: any[];
    setData: React.Dispatch<React.SetStateAction<any[]>>;
    entityType: "client" | "worker" | "task";
    errors: ValidationError[];
    warnings: ValidationError[];
    filteredIds: string[];
}

export default function DataGrid({
    data,
    setData,
    entityType,
    errors,
    warnings,
    filteredIds,
}: DataGridProps) {
    const [editingCell, setEditingCell] = useState<{ rowIndex: number; columnId: string } | null>(
        null
    );

    // Filter data based on filtered IDs if provided
    const filteredData = useMemo(() => {
        if (filteredIds.length === 0) return data;

        const idField =
            entityType === "client" ? "ClientID" : entityType === "worker" ? "WorkerID" : "TaskID";

        return data.filter((item) => filteredIds.includes(item[idField]));
    }, [data, filteredIds, entityType]);

    // Get columns based on entity type
    const columns = useMemo(() => {
        // Common column settings
        const getColumnCellProps = (info: any) => {
            const rowId =
                info.row.original[`${entityType.charAt(0).toUpperCase() + entityType.slice(1)}ID`];
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

        // Return appropriate columns based on entity type
        if (entityType === "client") {
            return [
                {
                    Header: "Client ID",
                    accessor: "ClientID",
                    Cell: ({ row, value, column }: any) => (
                        <EditableCell
                            value={value}
                            row={row}
                            column={column}
                            updateData={(rowIndex, columnId, value) => {
                                const newData = [...data];
                                newData[rowIndex].ClientID = value;
                                setData(newData);
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
                // Other client columns would go here
                {
                    Header: "Client Name",
                    accessor: "ClientName",
                    Cell: ({ row, value, column }: any) => (
                        <EditableCell
                            value={value}
                            row={row}
                            column={column}
                            updateData={(rowIndex, columnId, value) => {
                                const newData = [...data];
                                newData[rowIndex].ClientName = value;
                                setData(newData);
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
                // More client columns...
            ];
        } else if (entityType === "worker") {
            return [
                {
                    Header: "Worker ID",
                    accessor: "WorkerID",
                    Cell: ({ row, value, column }: any) => (
                        <EditableCell
                            value={value}
                            row={row}
                            column={column}
                            updateData={(rowIndex, columnId, value) => {
                                const newData = [...data];
                                newData[rowIndex].WorkerID = value;
                                setData(newData);
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
                // Other worker columns would go here
            ];
        } else {
            // task
            return [
                {
                    Header: "Task ID",
                    accessor: "TaskID",
                    Cell: ({ row, value, column }: any) => (
                        <EditableCell
                            value={value}
                            row={row}
                            column={column}
                            updateData={(rowIndex, columnId, value) => {
                                const newData = [...data];
                                newData[rowIndex].TaskID = value;
                                setData(newData);
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
                // Other task columns would go here
            ];
        }
    }, [entityType, data, setData, editingCell, errors, warnings]);

    // Use react-table hooks
    const tableInstance = useTable<any>(
        {
            columns,
            data: filteredData,
            initialState: { pageIndex: 0, pageSize: 10 },
        },
        useSortBy,
        usePagination
    ) as any;

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
    } = tableInstance;

    return (
        <div>
            {filteredIds.length > 0 && (
                <div className="mb-4 p-2 bg-blue-50 rounded-md text-sm text-blue-700 flex items-center">
                    <FiAlertCircle className="mr-2 h-4 w-4" />
                    Showing {filteredData.length} filtered results
                    <button
                        onClick={() => {
                            // This would be linked to the parent component's reset function
                            // which we'll handle through the filtered IDs being empty
                        }}
                        className="ml-auto text-blue-600 hover:text-blue-800"
                    >
                        <FiX className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="overflow-x-auto border rounded-lg">
                <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        {headerGroups.map((headerGroup) => (
                            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                                {headerGroup.headers.map((column) => (
                                    <th
                                        {...column.getHeaderProps(column.getSortByToggleProps())}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                                                ) : (
                                                    ""
                                                )}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
                        {page.map((row, i) => {
                            prepareRow(row);
                            const rowId =
                                row.original[
                                    `${entityType.charAt(0).toUpperCase() + entityType.slice(1)}ID`
                                ];
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
                                    {row.cells.map((cell) => {
                                        return (
                                            <td
                                                {...cell.getCellProps(cell.column.cellProps(cell))}
                                                key={cell.column.id}
                                            >
                                                {cell.render("Cell")}
                                            </td>
                                        );
                                    })}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center space-x-2">
                                            {rowErrors.length > 0 && (
                                                <FiAlertCircle
                                                    className="h-5 w-5 text-red-500"
                                                    title={rowErrors
                                                        .map((e) => e.message)
                                                        .join("\n")}
                                                />
                                            )}
                                            {rowWarnings.length > 0 && (
                                                <FiAlertTriangle
                                                    className="h-5 w-5 text-yellow-500"
                                                    title={rowWarnings
                                                        .map((w) => w.message)
                                                        .join("\n")}
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

            {/* No results message */}
            {filteredData.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No results found</p>
                </div>
            )}

            {/* Pagination */}
            {filteredData.length > 0 && (
                <div className="py-3 flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => previousPage()}
                            disabled={!canPreviousPage}
                            className={`btn ${
                                !canPreviousPage
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "btn-outline"
                            }`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => nextPage()}
                            disabled={!canNextPage}
                            className={`btn ${
                                !canNextPage
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "btn-outline"
                            }`}
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div className="flex gap-x-2 items-center">
                            <span className="text-sm text-gray-700">
                                Page <span className="font-medium">{pageIndex + 1}</span> of{" "}
                                <span className="font-medium">{pageOptions.length}</span>
                            </span>
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                }}
                                className="text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            >
                                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                                    <option key={pageSize} value={pageSize}>
                                        Show {pageSize}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <nav
                                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                aria-label="Pagination"
                            >
                                <button
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                        !canPreviousPage
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                    onClick={() => gotoPage(0)}
                                    disabled={!canPreviousPage}
                                >
                                    <span className="sr-only">First</span>
                                    <span className="h-5 w-5" aria-hidden="true">
                                        «
                                    </span>
                                </button>
                                <button
                                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                        !canPreviousPage
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                    onClick={() => previousPage()}
                                    disabled={!canPreviousPage}
                                >
                                    <span className="sr-only">Previous</span>
                                    <span className="h-5 w-5" aria-hidden="true">
                                        ‹
                                    </span>
                                </button>
                                <button
                                    className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                        !canNextPage
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                    onClick={() => nextPage()}
                                    disabled={!canNextPage}
                                >
                                    <span className="sr-only">Next</span>
                                    <span className="h-5 w-5" aria-hidden="true">
                                        ›
                                    </span>
                                </button>
                                <button
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                        !canNextPage
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-gray-500 hover:bg-gray-50"
                                    }`}
                                    onClick={() => gotoPage(pageCount - 1)}
                                    disabled={!canNextPage}
                                >
                                    <span className="sr-only">Last</span>
                                    <span className="h-5 w-5" aria-hidden="true">
                                        »
                                    </span>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
