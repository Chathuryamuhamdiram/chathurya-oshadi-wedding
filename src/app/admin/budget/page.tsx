import { prisma } from "@/lib/db";
import { BudgetContent } from "./BudgetContent";
import { getActiveEventId, buildEventFilter, ALL_EVENTS_VALUE } from "@/lib/event-context";
import { requirePermission } from "@/lib/auth";
import { PERMISSIONS } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AdminBudgetPage() {
  try {
    await requirePermission(PERMISSIONS.BUDGET_VIEW);
    const activeEventId = await getActiveEventId();
    const isAllEvents = activeEventId === ALL_EVENTS_VALUE;
    const itemsFilter = buildEventFilter(activeEventId);

    // Categories are global; items are event-filtered
    const categoriesRaw = await prisma.budgetCategory.findMany({
      include: {
        items: {
          where: isAllEvents ? {} : { eventId: activeEventId },
          include: { 
            vendor: true, 
            expenses: {
              include: { attachments: true }
            },
            event: { select: { id: true, name: true, eventType: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    const contributionsRaw = await prisma.contribution.findMany({
      where: isAllEvents ? {} : { eventId: activeEventId },
      orderBy: { contributionDate: 'desc' }
    });

    // Fetch active event info for display
    let activeEvent = null;
    if (!isAllEvents) {
      activeEvent = await prisma.ceremonyEvent.findUnique({
        where: { id: activeEventId },
        select: { id: true, name: true, eventType: true }
      });
    }

    // Explicitly serialize all fields to prevent Next.js RSC serialization errors (React Error 441)
    const categories = categoriesRaw.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      items: c.items.map(item => ({
        id: item.id,
        eventId: item.eventId,
        categoryId: item.categoryId,
        vendorId: item.vendorId,
        title: item.title,
        description: item.description,
        paymentStatus: item.paymentStatus,
        responsibleUserId: item.responsibleUserId,
        notes: item.notes,
        estimatedCost: Number(item.estimatedCost),
        actualCost: Number(item.actualCost),
        paidAmount: Number(item.paidAmount),
        paymentDueDate: item.paymentDueDate ? item.paymentDueDate.toISOString() : null,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        event: item.event ? {
          id: item.event.id,
          name: item.event.name,
          eventType: item.event.eventType
        } : null,
        expenses: item.expenses.map(e => ({
          id: e.id,
          budgetItemId: e.budgetItemId,
          expenseName: e.expenseName,
          expenseType: e.expenseType,
          paidByUserId: e.paidByUserId,
          paymentMethod: e.paymentMethod,
          notes: e.notes,
          amount: Number(e.amount),
          expenseDate: e.expenseDate.toISOString(),
          createdAt: e.createdAt.toISOString(),
          attachments: e.attachments.map((a: any) => ({
            id: a.id,
            fileName: a.fileName,
            originalFileName: a.originalFileName,
            mimeType: a.mimeType,
            fileSize: a.fileSize,
            storagePath: a.storagePath,
            uploadedBy: a.uploadedBy,
            uploadedAt: a.uploadedAt.toISOString()
          }))
        })),
        vendor: item.vendor ? {
          id: item.vendor.id,
          vendorName: item.vendor.vendorName,
          contactName: item.vendor.contactName,
          phone: item.vendor.phone,
          whatsappNumber: item.vendor.whatsappNumber,
          email: item.vendor.email,
          serviceCategory: item.vendor.serviceCategory,
          status: item.vendor.status,
          notes: item.vendor.notes,
          isArchived: item.vendor.isArchived,
          quotationAmount: Number(item.vendor.quotationAmount),
          finalAmount: Number(item.vendor.finalAmount),
          advancePaid: Number(item.vendor.advancePaid),
          nextPaymentDue: item.vendor.nextPaymentDue ? item.vendor.nextPaymentDue.toISOString() : null,
          createdAt: item.vendor.createdAt.toISOString(),
          updatedAt: item.vendor.updatedAt.toISOString()
        } : null
      }))
    }));

    const contributions = contributionsRaw.map(c => ({
      id: c.id,
      eventId: c.eventId,
      contributorName: c.contributorName,
      paymentMethod: c.paymentMethod,
      reference: c.reference,
      purpose: c.purpose,
      notes: c.notes,
      status: c.status,
      amount: Number(c.amount),
      contributionDate: c.contributionDate.toISOString(),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString()
    }));

    const vendorsRaw = await prisma.vendor.findMany({
      where: { isArchived: false, status: { not: "CANCELLED" } },
      orderBy: { vendorName: 'asc' }
    });

    const vendors = vendorsRaw.map(v => ({
      id: v.id,
      vendorName: v.vendorName,
      serviceCategory: v.serviceCategory,
      quotationAmount: Number(v.quotationAmount),
      finalAmount: Number(v.finalAmount),
      advancePaid: Number(v.advancePaid)
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

    const recordedNetFunds = totalContributions - totalExpenses;
    const remainingToPay = plannedBudget - totalExpenses;

    // Fetch fund snapshots
    const snapshotsRaw = await prisma.fundBalanceSnapshot.findMany({
      where: isAllEvents ? {} : { eventId: activeEventId },
      orderBy: { createdAt: 'desc' },
      include: { updatedBy: { select: { fullName: true } } }
    });

    const snapshots = snapshotsRaw.map(s => ({
      id: s.id,
      amount: Number(s.amount),
      effectiveDate: s.effectiveDate.toISOString(),
      note: s.note,
      updatedBy: s.updatedBy ? { fullName: s.updatedBy.fullName } : null,
      createdAt: s.createdAt.toISOString()
    }));

    const currentMoneyOnHand = snapshots.length > 0 ? snapshots[0].amount : 0;
    const lastUpdated = snapshots.length > 0 ? snapshots[0].effectiveDate : null;

    const cashVariance = currentMoneyOnHand - recordedNetFunds;
    const fundingShortfall = remainingToPay - currentMoneyOnHand;

    return (
      <BudgetContent 
        categories={categories}
        contributions={contributions}
        vendors={vendors}
        plannedBudget={plannedBudget}
        totalContributions={totalContributions}
        totalExpenses={totalExpenses}
        recordedNetFunds={recordedNetFunds}
        remainingToPay={remainingToPay}
        currentMoneyOnHand={currentMoneyOnHand}
        lastUpdated={lastUpdated}
        snapshots={snapshots}
        cashVariance={cashVariance}
        fundingShortfall={fundingShortfall}
        activeEventId={activeEventId}
        activeEventName={isAllEvents ? "All Events" : (activeEvent?.name ?? "")}
        isAllEvents={isAllEvents}
      />
    );
  } catch (error: any) {
    return (
      <div className="p-8 text-white w-full h-full min-h-screen bg-black">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error Rendering Budget Page</h1>
        <p className="font-mono text-sm bg-gray-900 text-red-300 p-4 rounded-xl whitespace-pre-wrap">{error.stack || error.message || String(error)}</p>
      </div>
    );
  }
}

