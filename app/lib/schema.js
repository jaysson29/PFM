import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Name Is Required!"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.string().min(1, "Initial Balance Is Required!"),
  isDefault: z.boolean().default(false),
});

export const transactionSchema = z
  .object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.string().min(1, "Amount Is Required!"),
    date: z.date({ required_error: "Date Is Required!" }),
    description: z.string().optional(),
    accountId: z.string().min(1, "Account ID Is Required!"),
    category: z.string().min(1, "Category Is Required!"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: "custom",
        message: "Recurring interval is required when transaction is recurring",
        path: ["recurringInterval"],
      });
    }
  });
