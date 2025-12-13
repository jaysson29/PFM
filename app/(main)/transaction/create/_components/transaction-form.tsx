"use client";
import { transactionSchema } from "@/app/lib/schema";
import useFetch from "@/hooks/use-fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { createTransaction, updateTransaction } from "@/actions/transaction";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, RefreshCw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ReceiptScanner from "./recipt-scanner";

type Account = {
  id: string;
  name: string;
  balance: string;
  isDefault?: boolean;
  // add other account fields if needed
};

type Category = {
  type: string;
  id: string;
  name: string;
  // add other category fields if needed
};

interface AddTransactionFormProps {
  accounts: Account[];
  categories: Category[];
  editMode?: boolean;
  initialData?: any;
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            category: initialData.category,
            accountId: initialData.accountId,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            category: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
          },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");
  const category = watch("category");

  const onSubmit = async (data: any) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    if (editMode) {
      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }
  };

  useEffect(() => {
    if ((transactionResult as any)?.success && !transactionLoading) {
      toast.success(
        editMode
          ? "Transaction updated successfully!"
          : "Transaction created successfully!"
      );
      reset();
      router.push(`/account/${(transactionResult as any).data.accountId}`);
    }
  }, [transactionResult, transactionLoading, editMode]);

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  const handleScanComplete = (scannedData: any) => {
    // Assuming scannedData contains amount, date, description

    console.log("Scanned Data:", scannedData);
    if (scannedData) {
      if (scannedData.amount) {
        setValue("amount", scannedData.amount.toString(), {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
      if (scannedData.date) {
        setValue("date", new Date(scannedData.date), {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
      if (scannedData.description) {
        setValue("description", scannedData.description, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
      if (scannedData.category) {
        setValue("category", scannedData.category, {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {/* AI Recipt Scanner */}

      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      {/* Transaction Form */}

      <div className="space-y-2">
        <label className="text-sm font-medium">Type</label>
        <Select
          onValueChange={(value) =>
            setValue("type", value as "EXPENSE" | "INCOME")
          }
          defaultValue={type}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>

        {errors.type && (
          <p className="text-sm text-red-500">
            {typeof errors.type === "string"
              ? errors.type
              : ((errors.type as any)?.message ?? String(errors.type))}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full"
            {...register("amount")}
          />

          {errors.amount && (
            <p className="text-sm text-red-500">
              {typeof errors.amount === "string"
                ? errors.amount
                : ((errors.amount as any)?.message ?? String(errors.amount))}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Account</label>
          <Select
            onValueChange={(value) => setValue("accountId", value as string)}
            defaultValue={getValues("accountId")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} (£{parseFloat(account.balance).toFixed(2)})
                </SelectItem>
              ))}

              <CreateAccountDrawer>
                <Button
                  variant="ghost"
                  className="w-full select-none items-center text-sm outline-none"
                >
                  Create New Account
                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>

          {errors.accountId && (
            <p className="text-sm text-red-500">
              {typeof errors.accountId === "string"
                ? errors.accountId
                : ((errors.accountId as any)?.message ??
                  String(errors.accountId))}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          onValueChange={(value) => setValue("category", value)}
          value={getValues("category")}
        >
          <SelectTrigger className="w-full">
            <SelectValue
              aria-label={getValues("category")}
              placeholder="Select Category"
            />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {errors.category && (
          <p className="text-sm text-red-500">
            {typeof errors.category === "string"
              ? errors.category
              : ((errors.category as any)?.message ?? String(errors.category))}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Date</label>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full pl-3 text-left font-normal"
            >
              {date ? format(date, "PPP") : "Select Date"}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => date && setValue("date", date)}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              autoFocus
            />
          </PopoverContent>
        </Popover>

        {errors.date && (
          <p className="text-sm text-red-500">
            {typeof errors.date === "string"
              ? errors.date
              : ((errors.date as any)?.message ?? String(errors.date))}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input
          placeholder="Description"
          className="w-full"
          {...register("description")}
        />

        {errors.description && (
          <p className="text-sm text-red-500">
            {typeof errors.description === "string"
              ? errors.description
              : ((errors.description as any)?.message ??
                String(errors.description))}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg">
        <div className="space-y-0.5">
          <label className="text-sm font-medium cursor-pointer">
            Recurring Transaction
          </label>
          <p className="text-sm text-muted-foreground">
            Set Up A Recurring Transaction
          </p>
        </div>

        <Switch
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
          checked={isRecurring}
        />
      </div>

      {isRecurring && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Recurring Interval</label>
          <Select
            onValueChange={(value) =>
              setValue(
                "recurringInterval",
                value as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
              )
            }
            defaultValue={getValues("recurringInterval")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>

          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {typeof errors.recurringInterval === "string"
                ? errors.recurringInterval
                : ((errors.recurringInterval as any)?.message ??
                  String(errors.recurringInterval))}
            </p>
          )}
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
        <div className="flex-1">
          <Button
            type="submit"
            variant="default"
            className="w-full"
            disabled={transactionLoading}
          >
            {transactionLoading ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                {editMode ? (
                  <span>Updating Transaction...</span>
                ) : (
                  <span>Creating Transaction...</span>
                )}
              </>
            ) : (
              <>
                {editMode ? (
                  <RefreshCw className="mr-2" />
                ) : (
                  <Plus className="mr-2" />
                )}
                {editMode ? (
                  <span>Update Transaction</span>
                ) : (
                  <span>Create Transaction</span>
                )}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AddTransactionForm;
