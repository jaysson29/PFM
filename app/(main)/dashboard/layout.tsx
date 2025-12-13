import { MoveRight } from "lucide-react";
import DashboardPage from "./page";
import React, { Suspense } from "react";
import { BarLoader } from "react-spinners";
import Link from "next/link";

function DashboardLayout() {
  return (
    <div className="px-5">
      <div className="flex flex-row gap-4">
        <MoveRight className="h-6 w-6 text-muted-foreground rotate-180" />
        <Link href="/">
          <p className="font-bold text-muted-foreground">Back</p>
        </Link>
      </div>

      <h1 className="text-6xl font-bold gradient-title mb-5">Dashboard</h1>

      {/* Dashboard Page */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <DashboardPage />
      </Suspense>
    </div>
  );
}

export default DashboardLayout;
