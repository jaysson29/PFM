"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import CellPie from "./pie";

const colors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
];

interface DashboardOverviewProps {
  accounts: any;
  transactions: any;
}

const DashboardOverview = ({
  accounts,
  transactions,
}: DashboardOverviewProps) => {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a: any) => a.isDefault) || accounts[0]?.id
  );

  const accountTransactions = transactions.filter(
    (t: any) => t.accountId === selectedAccountId
  );

  const recentTransactions = accountTransactions
    .sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    .slice(0, 5);

  // Data for Pie Chart
  const currentDate = new Date();
  const currentMonthExpenses = accountTransactions.filter((t: any) => {
    const transactionDate = new Date(t.date);
    return (
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear() &&
      t.type === "EXPENSE"
    );
  });

  const expenseByCategory = currentMonthExpenses.reduce(
    (acc: any, transaction: any) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    },
    {}
  );

  const pieChartData = Object.entries(expenseByCategory).map(
    ([category, amount]) => ({ name: category, value: amount })
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-normal">
            Recent Transactions
          </CardTitle>
          <Select
            value={selectedAccountId}
            onValueChange={(value) => setSelectedAccountId(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account: any) => (
                <SelectItem
                  key={account.id}
                  value={account.id}
                  onClick={() => setSelectedAccountId(account.id)}
                >
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent transactions.
              </p>
            ) : (
              recentTransactions.map((transaction: any) => {
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {transaction.description || "Unititled Transaction"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), "PP")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex items-center",
                          transaction.type === "EXPENSE"
                            ? "text-red-500"
                            : "text-green-500"
                        )}
                      >
                        {transaction.type === "EXPENSE" ? (
                          <ArrowDownRight className="mr-1 h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="mr-1 h-4 w-4" />
                        )}
                        £{transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal">
            Monthly Expense Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-5">
          {pieChartData.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">
              No expenses for this month.
            </p>
          ) : (
            <div className="h-[300px] flex justify-center">
              <CellPie data={pieChartData} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;
