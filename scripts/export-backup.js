// Wedding Platform - Data Export Script
// Exports all production data to JSON files for backup

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportData() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const backupDir = path.join(__dirname, `wedding_backup_${timestamp}`);
  
  fs.mkdirSync(backupDir, { recursive: true });
  console.log(`\n📁 Creating backup in: ${backupDir}\n`);

  const tables = [
    { name: 'guests',          fn: () => prisma.guest.findMany() },
    { name: 'seatingTables',   fn: () => prisma.seatingTable.findMany() },
    { name: 'guestLogistics',  fn: () => prisma.guestLogistics.findMany() },
    { name: 'budgetCategories',fn: () => prisma.budgetCategory.findMany() },
    { name: 'budgetItems',     fn: () => prisma.budgetItem.findMany() },
    { name: 'expenses',        fn: () => prisma.expense.findMany() },
    { name: 'contributions',   fn: () => prisma.contribution.findMany() },
    { name: 'vendors',         fn: () => prisma.vendor.findMany() },
    { name: 'tasks',           fn: () => prisma.task.findMany() },
    { name: 'taskComments',    fn: () => prisma.taskComment.findMany() },
    { name: 'taskAttachments', fn: () => prisma.taskAttachment.findMany() },
    { name: 'taskReminders',   fn: () => prisma.taskReminder.findMany() },
    { name: 'taskDependencies',fn: () => prisma.taskDependency.findMany() },
    { name: 'weddingEvents',   fn: () => prisma.weddingEvent.findMany() },
    { name: 'eventItems',      fn: () => prisma.eventItem.findMany() },
    { name: 'venues',          fn: () => prisma.venue.findMany() },
    { name: 'users',           fn: () => prisma.user.findMany({ select: { id: true, fullName: true, email: true, role: true, isActive: true, createdAt: true } }) },
    { name: 'notifications',   fn: () => prisma.notification.findMany() },
    { name: 'announcements',   fn: () => prisma.announcement.findMany() },
    { name: 'guestbookEntries',fn: () => prisma.guestbookEntry.findMany() },
    { name: 'auditLogs',       fn: () => prisma.auditLog.findMany() },
    { name: 'galleryImages',   fn: () => prisma.galleryImage.findMany() },
    { name: 'siteAssets',      fn: () => prisma.siteAsset.findMany() },
  ];

  const summary = {};

  for (const table of tables) {
    try {
      const data = await table.fn();
      const filePath = path.join(backupDir, `${table.name}.json`);
      
      // Serialize Decimal to string for JSON
      const serialized = JSON.parse(
        JSON.stringify(data, (key, value) =>
          typeof value === 'object' && value !== null && value.constructor?.name === 'Decimal'
            ? value.toString()
            : value
        )
      );
      
      fs.writeFileSync(filePath, JSON.stringify(serialized, null, 2), 'utf8');
      summary[table.name] = data.length;
      console.log(`  ✅ ${table.name}: ${data.length} records`);
    } catch (err) {
      console.warn(`  ⚠️  ${table.name}: skipped (${err.message})`);
      summary[table.name] = 'ERROR';
    }
  }

  // Write summary manifest
  const manifest = {
    exportedAt: new Date().toISOString(),
    tables: summary,
    totalRecords: Object.values(summary).filter(v => typeof v === 'number').reduce((a, b) => a + b, 0),
  };
  fs.writeFileSync(path.join(backupDir, '_manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`\n🎉 Backup complete!`);
  console.log(`   📦 Location: ${backupDir}`);
  console.log(`   📊 Total records: ${manifest.totalRecords}`);
  console.log(`\nTo restore this backup, contact your developer with the folder contents.\n`);
}

exportData()
  .catch(e => { console.error('❌ Export failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
