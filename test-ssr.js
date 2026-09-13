const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  const activeEventId = "all";
  const isAllEvents = true;
  const categoriesRaw = await prisma.budgetCategory.findMany({
      include: {
        items: {
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
  
  const mapped = categoriesRaw.map(c => ({
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
          attachments: e.attachments.map((a) => ({
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

  console.log("Checking if JSON.stringify works...");
  try {
    JSON.stringify(mapped);
    console.log("JSON.stringify successful!");
  } catch(e) {
    console.error("JSON.stringify FAILED:", e);
  }
}
test().catch(console.error).finally(() => prisma.$disconnect());
