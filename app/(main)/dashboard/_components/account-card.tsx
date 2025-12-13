"use client";
import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import useFetch from "@/hooks/use-fetch";
import { updateDefaultAccount } from "@/actions/accounts";
import { toast } from "sonner";

interface Account {
  id: string | number;
  name: string;
  type: string;
  balance: string;
  isDefault?: boolean;
}

type AccountCardProps = {
  account: Account;
};

const AccountCard = ({ account }: AccountCardProps) => {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event: any) => {
    event.preventDefault();

    if (isDefault) {
      toast.warning("You Need Atleast 1 Default Account!");
      return; // dont allow toggling of the default account
    }

    await updateDefaultFn(id);
  };

  useEffect(() => {
    if ((updatedAccount as any)?.success) {
      toast.success("Default Account Updated Successfully!");
    }
  }, [updatedAccount, updateDefaultLoading]);

  useEffect(() => {
    if (error) {
      toast.error(error || "Failed To Update Default Account");
    }
  }, [error]);

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <Link href={`/account/${id}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-md font-medium capitalize">
            {name}
          </CardTitle>
          <Switch
            checked={isDefault}
            onClick={handleDefaultChange}
            disabled={updateDefaultLoading}
            className="disabled:cursor-wait!"
          />
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-2xl font-bold">
            £ {parseFloat(balance).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
            Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default AccountCard;
