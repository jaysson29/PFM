"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { categoryColors } from "@/data/categories";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/use-fetch";
import { bulkDeleteTransactions } from "@/actions/accounts";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";

const ITEMS_PER_PAGE = 15;

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const TransactionTable = ({ transactions }: any) => {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  // Memoized filtered and sorted transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Apply search filter

    if (searchTerm) {
      const searchLower = searchTerm.toLocaleLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply recurring filter

    if (recurringFilter) {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") return transaction.isRecurring;
        return !transaction.isRecurring;
      });
    }

    // Apply type filter
    if (typeFilter) {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    // Aplly sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  // pagination calculations

  const totalPages = Math.ceil(
    filteredAndSortedTransactions.length / ITEMS_PER_PAGE
  );

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedTransactions, currentPage]);

  const handleSort = (field: any) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field == field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id: any) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item != id)
        : [...current, id]
    );
  };

  const handleSelectAll = (id: any) => {
    setSelectedIds((current) =>
      current.length === filteredAndSortedTransactions.length
        ? []
        : filteredAndSortedTransactions.map((t: any) => t.id)
    );
  };

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(bulkDeleteTransactions);

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`
      )
    )
      return;

    deleteFn(selectedIds);
    console.log(selectedIds);
    setSelectedIds([]);
  };

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.error("Transactions Deleted Succesfully");
    }
  }, [deleted, deleteLoading]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIds([]);
  };

  const handlePageChange = (newPage: any) => {
    setCurrentPage(newPage);
    setSelectedIds([]);
  };

  const pageNumbers = [];
  const offsetNumbers = 2;

  for (
    let i = currentPage - offsetNumbers;
    i <= currentPage + offsetNumbers;
    i++
  ) {
    if (i >= 1 && i <= totalPages) {
      pageNumbers.push(i);
    }
  }

  return (
    <div className="space-y-4">
      {deleteLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="INCOME"
                className="cursor-pointer hover:bg-gray-200!"
              >
                Income
              </SelectItem>
              <SelectItem
                value="EXPENSE"
                className="cursor-pointer hover:bg-gray-200!"
              >
                Expense
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={recurringFilter}
            onValueChange={(value) => {
              setRecurringFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="recurring"
                className="cursor-pointer hover:bg-gray-200!"
              >
                Recurring Only
              </SelectItem>
              <SelectItem
                value="non-recurring"
                className="cursor-pointer hover:bg-gray-200!"
              >
                Non-Recurring Only
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Bulk Actions */}

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedIds.length})
              </Button>
            </div>
          )}

          {(searchTerm || typeFilter || recurringFilter) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              title="Clear Filters"
              className="hover:bg-black hover:text-white"
            >
              <X className="h-4 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  onCheckedChange={handleSelectAll}
                  checked={
                    selectedIds.length === paginatedTransactions.length &&
                    paginatedTransactions.length > 0
                  }
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  Date
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center justify-center">
                  Category
                  {sortConfig.field === "category" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  Amount
                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTransactions?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No Transactions Found!
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions?.map((transaction: any) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox
                      onCheckedChange={() => handleSelect(transaction.id)}
                      checked={selectedIds.includes(transaction.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.date), "PP")}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell className="capitalize text-center">
                    <span
                      style={{
                        background: (categoryColors as Record<string, string>)[
                          transaction.category as string
                        ],
                      }}
                      className="px-2 py-1 rounded text-white text-sm"
                    >
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell
                    className="text-right font-medium"
                    style={{
                      color: transaction.type === "EXPENSE" ? "red" : "green",
                    }}
                  >
                    {transaction.type === "EXPENSE" ? "-" : "+"}£
                    {transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {transaction.isRecurring ? (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge
                            variant="outline"
                            className="gap-1 bg-green-100 text-green-700 hover:bg-green-200"
                          >
                            <RefreshCw className="h-3 w-3" />
                            {
                              RECURRING_INTERVALS[
                                transaction.recurringInterval as keyof typeof RECURRING_INTERVALS
                              ]
                            }
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <div className="font-medium">Next Date:</div>
                            <div>
                              {format(
                                new Date(transaction.nextRecurringDate),
                                "PP"
                              )}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        One-Time
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() =>
                            router.push(
                              `/transaction/create?edit=${transaction.id}`
                            )
                          }
                        >
                          EDIT
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer"
                          onClick={() => deleteFn([transaction.id])}
                        >
                          DELETE
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row">
          <Pagination>
            <PaginationContent className="rounded-md border">
              <PaginationItem>
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(1)}
                >
                  <ChevronFirst className="h-4 w-4" />
                  <span>First Page</span>
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  disabled={currentPage <= 5}
                  onClick={() => handlePageChange(currentPage - 5)}
                >
                  <ChevronsLeft className="h-4 w-4" />
                  <span>Previous x5</span>
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
              </PaginationItem>
              {pageNumbers.map((pageNumber, index) => (
                <PaginationItem key={index}>
                  <Button
                    variant={pageNumber === currentPage ? "default" : "outline"}
                    disabled={isNaN(pageNumber)}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                </PaginationItem>
              ))}
              <PaginationItem>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PaginationEllipsis />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {Math.max(0, totalPages - currentPage - offsetNumbers)}{" "}
                      other pages
                    </p>
                  </TooltipContent>
                </Tooltip>
              </PaginationItem>

              <PaginationItem>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  disabled={currentPage >= totalPages - 5}
                  onClick={() => handlePageChange(currentPage + 5)}
                >
                  <span>Next x5</span>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </PaginationItem>
              <PaginationItem>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(totalPages)}
                >
                  <span>Last Page</span>
                  <ChevronLast className="h-4 w-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
