"use client";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountSchema } from "@/app/lib/schema";
import { Input } from "./ui/input";
import { createAccount } from "@/actions/dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import useFetch from "@/hooks/use-fetch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const CreateAccountDrawer = ({ children }: { children?: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    data: newAccount,
    fn: createAccountFn,
    error,
    loading: createAccountLoading,
  } = useFetch(createAccount);

  const onsubmit = async (data: any) => {
    await createAccountFn(data);
  };

  React.useEffect(() => {
    if (newAccount && !createAccountLoading) {
      toast.success("Account created successfully!");
      reset();
      setOpen(false);
    }
  }, [createAccountLoading, newAccount]);

  React.useEffect(() => {
    if (error) {
      toast.error(`Failed To Create Account: ${error}`);
    }
  }, [error]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Account</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4 container mx-auto">
          <form className="space-y-4" onSubmit={handleSubmit(onsubmit)}>
            {/* Form fields for account creation */}

            {/* Account Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Account Name
              </label>
              <Input
                id="name"
                placeholder="e.g., Main Checking"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Account Type Select */}
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">
                Account Type
              </label>
              <Select
                onValueChange={(value) =>
                  setValue("type", value as "CURRENT" | "SAVINGS")
                }
                defaultValue={watch("type")}
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            {/* Account Balance Input */}
            <div className="space-y-2">
              <label htmlFor="balance" className="text-sm font-medium">
                Initial Balance
              </label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("balance")}
              />
              {errors.balance && (
                <p className="text-sm text-red-500">{errors.balance.message}</p>
              )}
            </div>

            {/* Account Default Input */}
            <div className="flex items-center justify-between rounded-lg">
              <div className="space-y-0.5">
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium cursor-pointer"
                >
                  Set as Default Account
                </label>
                <p className="text-sm text-muted-foreground">
                  This Account Will Be Selected By Default For Transactions
                </p>
              </div>

              <Switch
                id="isDefault"
                onCheckedChange={(checked) => setValue("isDefault", checked)}
                checked={watch("isDefault")}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 hover:bg-red-600 hover:text-white"
                >
                  Cancel
                </Button>
              </DrawerClose>

              <Button
                type="submit"
                variant="default"
                className="flex-1 shadow hover:bg-green-600"
                disabled={createAccountLoading}
              >
                {createAccountLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateAccountDrawer;
