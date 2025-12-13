import { inngest } from "./client";
import { db } from "@/lib/prisma";
import { sendEmail } from "@/actions/send-email";
import EmailTemplate from "@/emails/template";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const checkBudgetAlert = inngest.createFunction(
  { id: "check-budget-alert", name: "Check Budget Alert" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const Budgets = await step.run("Fetch-budget", async () => {
      // Logic to check budgets and send alerts
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });
    });

    for (const budget of Budgets) {
      // Here you would add logic to check if the budget limit is exceeded
      // and send an alert to the user if necessary.
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue; // Skip if no default account

      await step.run(`Check-budget-${budget.id}`, async () => {
        const currentDate = new Date();
        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );

        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id,
            type: "EXPENSE",
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          _sum: {
            amount: true,
          },
        });

        // Here you can compare expenses._sum.amount with budget.limit
        // and send an alert if necessary.

        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount = budget.amount;
        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        if (
          percentageUsed >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()))
        ) {
          // Send alert to user (e.g., email, notification)

          await sendEmail({
            to: ["j.bishop29@hotmail.com"], // Replace with budget.user.email in production
            subject: `Budget Alert for Account ${defaultAccount.name}`,
            react: EmailTemplate({
              userName: budget.user.name,
              type: "budget-alert",
              data1: {
                percentageUsed,
                budgetAmount: Number(Number(budgetAmount).toFixed(1)),
                totalExpenses: Number(totalExpenses.toFixed(1)),
                accountName: defaultAccount.name,
              },
            }),
          }); // Implement your email sending logic here

          // Update lastAlertSent
          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          });
        }
      });
    }
  }
);

function isNewMonth(lastAlertDate: Date, currentDate: Date) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions",
    name: "Trigger Recurring Transactions",
  },
  { cron: "0 0 * * *" },
  async ({ step }) => {
    // 1 Fetch recurring transactions due today
    const recurringTransactions = await step.run(
      "Fetch-recurring-transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null }, // Never processed
              { nextRecurringDate: { lte: new Date() } }, // Due date passed
            ],
          },
        });
      }
    );

    // 2 Process each recurring transaction
    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction: any) => ({
        name: "transaction.recurring.proccess",
        data: { transactionId: transaction.id, userId: transaction.userId },
      }));

      // 3 send events for processing
      await inngest.send(events);
    }

    return { trigged: recurringTransactions.length };
  }
);

export const proccessRecurringTransactions = inngest.createFunction(
  {
    id: "proccess-recurring-transaction",
    throttle: {
      limit: 10, // only process 10 transactions
      period: "1m", // per minute
      key: "event.data.userId", // throttle per user
    },
  },
  { event: "transaction.recurring.proccess" },
  async ({ event, step }) => {
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.error("Invalid event data: ", event);
      return { error: "Missing required event data" };
    }

    await step.run("Process-recurring-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: { id: event.data.transactionId, userId: event.data.userId },
        include: { account: true },
      });

      if (!transaction || !isTransactionDue(transaction)) return;
      // Update last processed and next recurring date
      await db.$transaction(async (tx: any) => {
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        });

        const balaceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balaceChange } },
        });

        // update last processed and next recurring date
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        });
      });
    });
  }
);

function isTransactionDue(transaction: any) {
  // if no last processed date, it's due
  if (!transaction.lastProcessed) return true; // Never processed

  const today = new Date();
  const nextDate = new Date(transaction.nextRecurringDate);

  // comparte with next due date
  return nextDate <= today;
}

function calculateNextRecurringDate(startDate: Date, interval: string) {
  const date = new Date(startDate);
  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date;
}

export const genetateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" }, // = At 00:00 on day 1 of the month
  async ({ step }) => {
    // Logic to generate monthly reports for users
    const users = await step.run("Fetch-users", async () => {
      return await db.user.findMany({
        include: {
          accounts: true,
        },
      });
    });

    for (const user of users) {
      await step.run(`Generate-report-user-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const stats = await getMonthlyStats(user.id, lastMonth);
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });

        // Here you would generate and send the report to the user
        const insights = await generateFinancialInsights(stats, monthName);

        await sendEmail({
          to: ["j.bishop29@hotmail.com"], // Replace with user.email in production
          subject: `Your Monthly Financial Report for - ${monthName}`,
          react: EmailTemplate({
            userName: user.name,
            type: "monthly-report",
            data2: {
              stats,
              month: monthName,
              insights,
            },
          }),
        }); // Implement your email sending logic here
      });
    }

    return { processed: users.length };
  }
);

async function generateFinancialInsights(stats: any, month: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: £${stats.totalIncome}
    - Total Expenses: £${stats.totalExpenses}
    - Net Income: £${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(
        ([category, amount]) => `${category}: £${(amount as number).toFixed(2)}`
      )
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `;
  //FIX DECIMAL ISSUES WITH AMOUNTS

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ];
  }
}

const getMonthlyStats = async (userId: string, date: Date) => {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return transactions.reduce(
    (stats: any, t: any) => {
      const amount = t.amount.toNumber();
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );
};
