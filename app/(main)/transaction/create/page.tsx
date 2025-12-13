import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import AddTransactionForm from "./_components/transaction-form";
import { getTransaction } from "@/actions/transaction";

const AddTransactionPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{ edit: string }>;
}) => {
  const accounts = await getUserAccounts();

  const editId = (await searchParams)?.edit;

  let initialData = null;
  if (editId) {
    // Fetch transaction data for editing
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
    <div className="max-w-3xl mx-auto px-5 pt-[8vw]">
      <h1 className="text-5xl gradient-title mb-8">
        {editId ? "Edit Transaction" : "Add Transaction"}
      </h1>

      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        initialData={initialData}
        editMode={!!editId}
      />
    </div>
  );
};

export default AddTransactionPage;
