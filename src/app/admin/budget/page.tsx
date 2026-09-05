import { prisma } from "@/lib/db";
import { BudgetContent } from "./BudgetContent";

export const dynamic = "force-dynamic";

export default async function AdminBudgetPage() {
  const categoriesRaw = await prisma.budgetCategory.findMany({
    include: {
      items: {
        include: { vendor: true, expenses: true },
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { name: 'asc' }
  });

  const contributionsRaw = await prisma.contribution.findMany({
    orderBy: { contributionDate: 'desc' }
  });

  // Serialize Decimals for Client Component
  const categories = categoriesRaw.map(c => ({
    ...c,
    items: c.items.map(item => ({
      ...item,
      estimatedCost: Number(item.estimatedCost),
      actualCost: Number(item.actualCost),
      paidAmount: Number(item.paidAmount),
      expenses: item.expenses.map(e => ({
        ...e,
        amount: Number(e.amount)
      })),
      vendor: item.vendor ? {
        ...item.vendor,
        quotationAmount: Number(item.vendor.quotationAmount),
        finalAmount: Number(item.vendor.finalAmount),
        advancePaid: Number(item.vendor.advancePaid)
      } : null
    }))
  }));

  const contributions = contributionsRaw.map(c => ({
    ...c,
    amount: Number(c.amount)
  }));

  const vendorsRaw = await prisma.vendor.findMany({
    where: { isArchived: false, status: { not: "CANCELLED" } },
    orderBy: { vendorName: 'asc' }
  });

  const vendors = vendorsRaw.map(v => ({
    id: v.id,
    vendorName: v.vendorName,
    quotationAmount: Number(v.quotationAmount),
    finalAmount: Number(v.finalAmount)
  }));

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
      vendors={vendors}
      plannedBudget={plannedBudget}
      totalContributions={totalContributions}
      totalExpenses={totalExpenses}
      availableBalance={availableBalance}
      fundingGap={fundingGap}
      fundingProgress={fundingProgress}
    />
  );
}
