import { prisma } from "@/lib/db";
import { BudgetContent } from "./BudgetContent";

export const dynamic = "force-dynamic";

export default async function AdminBudgetPage() {
  const categories = await prisma.budgetCategory.findMany({
    include: {
      items: {
        include: { vendor: true, expenses: true },
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  const contributions = await prisma.contribution.findMany({
    orderBy: { contributionDate: 'desc' }
  });

  // Calculate totals
  let plannedBudget = 0;
  let totalExpenses = 0;
  
  categories.forEach(cat => {
    cat.items.forEach(item => {
      plannedBudget += item.estimatedCost;
      totalExpenses += item.paidAmount;
    });
  });

  const totalContributions = contributions
    .filter(c => c.status === "RECEIVED")
    .reduce((sum, c) => sum + c.amount, 0);

  const availableBalance = totalContributions - totalExpenses;
  const fundingGap = plannedBudget - totalContributions;
  const fundingProgress = plannedBudget > 0 ? Math.min(100, Math.max(0, (totalContributions / plannedBudget) * 100)) : 0;

  return (
    <BudgetContent 
      categories={categories}
      contributions={contributions}
      plannedBudget={plannedBudget}
      totalContributions={totalContributions}
      totalExpenses={totalExpenses}
      availableBalance={availableBalance}
      fundingGap={fundingGap}
      fundingProgress={fundingProgress}
    />
  );
}
