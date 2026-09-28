"use client";

import { useState, useMemo } from "react";
import { LayoutGrid, Store, List as ListIcon, CheckCircle2, Circle, ArrowLeft, Search, ClipboardPaste, Trash2, Download } from "lucide-react";
import Link from "next/link";
import { addItem, toggleItemBought, addCategory, addShop, bulkAddItems, deleteItem } from "../actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { hasPermission, PERMISSIONS, type PermissionCode } from "@/lib/permissions";

type ShoppingItemType = { id: string; name: string; quantity: string | null; note: string | null; categoryId: string | null; shopId: string | null; isBought: boolean };
type ShoppingCategoryType = { id: string; name: string };
type ShoppingShopType = { id: string; name: string };

type ShoppingListDetailType = {
  id: string;
  name: string;
  event: { name: string } | null;
  items: ShoppingItemType[];
  categories: ShoppingCategoryType[];
  shops: ShoppingShopType[];
};

export default function ShoppingListDetailClient({ list, role, permissions }: { list: ShoppingListDetailType, role: string, permissions: string[] }) {
  const [view, setView] = useState<"FLAT" | "CATEGORY" | "SHOP">("CATEGORY");
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "BOUGHT">("ALL");
  const [search, setSearch] = useState("");
  
  const [quickItem, setQuickItem] = useState({ name: "", quantity: "", categoryId: "", shopId: "" });
  const [isAddingItem, setIsAddingItem] = useState(false);

  const [bulkPasteText, setBulkPasteText] = useState("");
  const [isBulkPasteOpen, setIsBulkPasteOpen] = useState(false);
  const [bulkCategoryId, setBulkCategoryId] = useState("");
  const [bulkShopId, setBulkShopId] = useState("");
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
  
  const canEdit = hasPermission(role, permissions, PERMISSIONS.SHOPPING_ITEM_EDIT as PermissionCode);

  const total = list.items.length;
  const bought = list.items.filter((i) => i.isBought).length;
  const progress = total === 0 ? 0 : Math.round((bought / total) * 100);

  // Quick Add handlers
  const handleQuickAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!quickItem.name.trim()) return;
    setIsAddingItem(true);
    try {
      await addItem(list.id, quickItem);
      setQuickItem({ ...quickItem, name: "", quantity: "" }); // keep category and shop selected
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleToggleBought = async (itemId: string, current: boolean) => {
    // Optimistic UI would be ideal here, but server action revalidates path.
    // In a real app we'd use useTransition or optimistic state.
    await toggleItemBought(itemId, !current, list.id);
  };
  
  const handleDeleteItem = async (itemId: string) => {
    if(confirm("Delete this item?")) {
      await deleteItem(itemId, list.id);
    }
  }

  const handleAddCategory = async () => {
    const name = prompt("Enter new category name:");
    if (name?.trim()) await addCategory(list.id, name.trim());
  };

  const handleAddShop = async () => {
    const name = prompt("Enter new shop name:");
    if (name?.trim()) await addShop(list.id, name.trim());
  };

  // Bulk Paste handlers
  const handleParseBulk = () => {
    const lines = bulkPasteText.split('\n').filter(l => l.trim().length > 0);
    const parsed = lines.map(line => {
      // Basic cleanup for "1.", "•", "-", etc.
      const cleanLine = line.replace(/^[\d\.\-\•\*\s]+/, '').trim();
      
      // Attempt to split by "-" or "—" or "–"
      let name = cleanLine;
      let quantity = "";
      const separatorMatch = cleanLine.match(/\s+[-—–]\s+/);
      if (separatorMatch) {
        const parts = cleanLine.split(separatorMatch[0]);
        name = parts[0].trim();
        quantity = parts.slice(1).join(" ").trim();
      } else {
        // sometimes "Coconut Oil 2 bottles" -> fallback or just leave as name
      }
      
      const existing = list.items.find((i) => i.name.toLowerCase().trim() === name.toLowerCase());
      
      return {
        name,
        quantity,
        isDuplicate: !!existing,
        selected: !existing // default skip duplicates
      };
    });
    setBulkPreview(parsed);
  };

  const handleBulkSubmit = async () => {
    const toAdd = bulkPreview.filter(p => p.selected).map(p => ({
      name: p.name,
      quantity: p.quantity,
      categoryId: bulkCategoryId || null,
      shopId: bulkShopId || null
    }));
    
    if (toAdd.length === 0) return;
    setIsBulkSubmitting(true);
    try {
      await bulkAddItems(list.id, toAdd);
      setIsBulkPasteOpen(false);
      setBulkPasteText("");
      setBulkPreview([]);
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  // Filtered Items
  const displayItems = useMemo(() => {
    let items = [...list.items];
    if (filter === "PENDING") items = items.filter(i => !i.isBought);
    if (filter === "BOUGHT") items = items.filter(i => i.isBought);
    
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i => 
        i.name.toLowerCase().includes(q) || 
        list.categories.find((c) => c.id === i.categoryId)?.name.toLowerCase().includes(q) ||
        list.shops.find((s) => s.id === i.shopId)?.name.toLowerCase().includes(q)
      );
    }
    return items;
  }, [list.items, filter, search, list.categories, list.shops]);

  const handleDownload = () => {
    let content = `Shopping List: ${list.name}\n`;
    if (list.event) content += `Event: ${list.event.name}\n`;
    content += `Progress: ${bought} / ${total} Bought (${progress}%)\n\n`;
    content += `--- Items ---\n\n`;
    
    displayItems.forEach((item, idx) => {
      const checkbox = item.isBought ? "[x]" : "[ ]";
      const cat = list.categories.find(c => c.id === item.categoryId)?.name || "Uncategorized";
      const shop = list.shops.find(s => s.id === item.shopId)?.name || "Anywhere";
      
      let line = `${idx + 1}. ${checkbox} ${item.name}`;
      if (item.quantity) line += ` (Qty: ${item.quantity})`;
      if (item.note) line += ` - Note: ${item.note}`;
      line += `\n   Shop: ${shop} | Category: ${cat}\n\n`;
      content += line;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${list.name.replace(/\s+/g, '_')}_Shopping_List.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const ItemRow = ({ item }: { item: ShoppingItemType }) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl border border-white/5 transition-colors group ${item.isBought ? 'bg-white/5 opacity-60' : 'bg-[#1e2333] hover:border-white/10'}`}>
      <button 
        onClick={() => handleToggleBought(item.id, item.isBought)}
        className="shrink-0 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        {item.isBought ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        ) : (
          <Circle className="w-6 h-6 text-white/30 group-hover:text-white/50" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${item.isBought ? 'line-through text-white/50' : 'text-white'}`}>
          {item.name}
        </p>
        {(item.quantity || item.note) && (
          <p className="text-xs text-white/50 truncate mt-0.5">
            {item.quantity} {item.note && `• ${item.note}`}
          </p>
        )}
      </div>
      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        {canEdit && (
          <button onClick={() => handleDeleteItem(item.id)} className="p-1.5 text-white/40 hover:text-red-400 hover:bg-white/5 rounded-lg">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-32">
      <Link href="/admin/shopping" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Lists
      </Link>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            {list.name}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-white/60">
            {list.event && <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md">{list.event.name}</span>}
            <span>{bought} / {total} Bought ({progress}%)</span>
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownload}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg font-medium transition-colors border border-emerald-500/20"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={() => setIsBulkPasteOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-white/5"
          >
            <ClipboardPaste className="w-4 h-4" />
            Bulk Paste
          </button>
        </div>
      </div>
      
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-white/40" />
          <input 
            type="text" 
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1e2333] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as "ALL" | "PENDING" | "BOUGHT")}
            className="bg-[#1e2333] border border-white/5 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none min-w-[120px]"
          >
            <option value="ALL" className="bg-[#1e2333]">All Items</option>
            <option value="PENDING" className="bg-[#1e2333]">Pending</option>
            <option value="BOUGHT" className="bg-[#1e2333]">Bought</option>
          </select>
          <div className="flex bg-[#1e2333] border border-white/5 rounded-xl p-1">
            <button 
              onClick={() => setView("CATEGORY")}
              className={`p-1.5 rounded-lg transition-colors ${view === "CATEGORY" ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
              title="Category View"
            ><LayoutGrid className="w-4 h-4" /></button>
            <button 
              onClick={() => setView("SHOP")}
              className={`p-1.5 rounded-lg transition-colors ${view === "SHOP" ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
              title="Shop View"
            ><Store className="w-4 h-4" /></button>
            <button 
              onClick={() => setView("FLAT")}
              className={`p-1.5 rounded-lg transition-colors ${view === "FLAT" ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}
              title="List View"
            ><ListIcon className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Render Items based on View */}
      <div className="space-y-6">
        {displayItems.length === 0 ? (
           <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
           <p className="text-white/60">No items match your filters.</p>
         </div>
        ) : (
          <>
            {view === "FLAT" && (
              <div className="space-y-2">
                {displayItems.map(item => <ItemRow key={item.id} item={item} />)}
              </div>
            )}
            
            {view === "CATEGORY" && (
              <div className="space-y-8">
                {/* Uncategorized */}
                {displayItems.filter(i => !i.categoryId).length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 px-1">Uncategorized</h2>
                    <div className="space-y-2">
                      {displayItems.filter(i => !i.categoryId).map(item => <ItemRow key={item.id} item={item} />)}
                    </div>
                  </div>
                )}
                {list.categories.map((cat) => {
                  const catItems = displayItems.filter(i => i.categoryId === cat.id);
                  if (catItems.length === 0) return null;
                  return (
                    <div key={cat.id}>
                      <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 px-1 flex items-center justify-between">
                        {cat.name}
                        <span className="text-xs text-white/40 font-normal bg-white/5 px-2 py-0.5 rounded-md">
                          {catItems.filter(i => i.isBought).length} / {catItems.length}
                        </span>
                      </h2>
                      <div className="space-y-2">
                        {catItems.map(item => <ItemRow key={item.id} item={item} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {view === "SHOP" && (
              <div className="space-y-8">
                {/* Unassigned Shop */}
                {displayItems.filter(i => !i.shopId).length > 0 && (
                  <div>
                    <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
                      <Store className="w-4 h-4" /> Anywhere
                    </h2>
                    <div className="space-y-2">
                      {displayItems.filter(i => !i.shopId).map(item => <ItemRow key={item.id} item={item} />)}
                    </div>
                  </div>
                )}
                {list.shops.map((shop) => {
                  const shopItems = displayItems.filter(i => i.shopId === shop.id);
                  if (shopItems.length === 0) return null;
                  return (
                    <div key={shop.id}>
                      <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3 px-1 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4" />
                          {shop.name}
                        </div>
                        <span className="text-xs text-white/40 font-normal bg-white/5 px-2 py-0.5 rounded-md">
                          {shopItems.filter(i => i.isBought).length} / {shopItems.length}
                        </span>
                      </h2>
                      <div className="space-y-2">
                        {shopItems.map(item => <ItemRow key={item.id} item={item} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Add Sticky Bottom */}
      {canEdit && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-[#11141d]/90 backdrop-blur-xl border-t border-white/5 p-4 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
            <input 
              type="text"
              placeholder="Item name (e.g. Coconut Oil)"
              value={quickItem.name}
              onChange={e => setQuickItem({...quickItem, name: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && handleQuickAdd()}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <input 
              type="text"
              placeholder="Qty"
              value={quickItem.quantity}
              onChange={e => setQuickItem({...quickItem, quantity: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && handleQuickAdd()}
              className="w-full sm:w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <div className="flex gap-2 sm:gap-3">
              <div className="flex gap-1 w-1/2 sm:w-auto">
                <select 
                  value={quickItem.categoryId}
                  onChange={e => setQuickItem({...quickItem, categoryId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="" className="bg-[#1e2333]">Category</option>
                  {list.categories.map((c) => <option key={c.id} value={c.id} className="bg-[#1e2333]">{c.name}</option>)}
                </select>
                <button 
                  type="button" 
                  onClick={handleAddCategory}
                  className="px-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-emerald-400 font-bold transition-colors"
                  title="Add Category"
                >
                  +
                </button>
              </div>
              <div className="flex gap-1 w-1/2 sm:w-auto">
                <select 
                  value={quickItem.shopId}
                  onChange={e => setQuickItem({...quickItem, shopId: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="" className="bg-[#1e2333]">Shop</option>
                  {list.shops.map((s) => <option key={s.id} value={s.id} className="bg-[#1e2333]">{s.name}</option>)}
                </select>
                <button 
                  type="button" 
                  onClick={handleAddShop}
                  className="px-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 text-emerald-400 font-bold transition-colors"
                  title="Add Shop"
                >
                  +
                </button>
              </div>
              <button 
                onClick={() => handleQuickAdd()}
                disabled={isAddingItem || !quickItem.name.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Paste Modal */}
      <Dialog open={isBulkPasteOpen} onOpenChange={setIsBulkPasteOpen}>
        <DialogContent className="bg-[#1e2333] border-white/10 text-white p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Paste Items</DialogTitle>
          </DialogHeader>
          
          {bulkPreview.length === 0 ? (
            <div className="space-y-4 mt-4">
              <p className="text-sm text-white/60">Paste a list of items from WhatsApp, Notes, or Excel. Use a dash to separate quantities (e.g., &quot;Coconut Oil - 2 bottles&quot;).</p>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase">Default Category</label>
                  <select 
                    value={bulkCategoryId}
                    onChange={e => setBulkCategoryId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="" className="bg-[#1e2333]">None</option>
                    {list.categories.map((c) => <option key={c.id} value={c.id} className="bg-[#1e2333]">{c.name}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase">Default Shop</label>
                  <select 
                    value={bulkShopId}
                    onChange={e => setBulkShopId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="" className="bg-[#1e2333]">None</option>
                    {list.shops.map((s) => <option key={s.id} value={s.id} className="bg-[#1e2333]">{s.name}</option>)}
                  </select>
                </div>
              </div>

              <textarea 
                value={bulkPasteText}
                onChange={e => setBulkPasteText(e.target.value)}
                className="w-full bg-[#11141d] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[200px] font-mono leading-relaxed"
                placeholder="1. Coconut Oil - 2 bottles&#10;2. Sugar - 2 kg&#10;3. Water - 3 cases"
              />
              <div className="flex justify-end pt-2">
                <button 
                  onClick={handleParseBulk}
                  disabled={!bulkPasteText.trim()}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Preview Items
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-sm font-medium text-white">Import Preview</h3>
                  <p className="text-xs text-white/50 mt-1">
                    {bulkPreview.length} found • {bulkPreview.filter(p => p.isDuplicate).length} duplicates skipped by default
                  </p>
                </div>
                <button 
                  onClick={() => setBulkPreview([])}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Edit Text
                </button>
              </div>
              
              <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {bulkPreview.map((item, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${item.isDuplicate ? 'bg-orange-500/10 border-orange-500/20' : 'bg-white/5 border-white/5'}`}>
                    <input 
                      type="checkbox" 
                      checked={item.selected}
                      onChange={e => {
                        const newPreview = [...bulkPreview];
                        newPreview[idx].selected = e.target.checked;
                        setBulkPreview(newPreview);
                      }}
                      className="rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500/50 w-4 h-4 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2">
                      <input 
                        type="text" 
                        value={item.name}
                        onChange={e => {
                          const newPreview = [...bulkPreview];
                          newPreview[idx].name = e.target.value;
                          setBulkPreview(newPreview);
                        }}
                        className="flex-1 bg-transparent border-none text-sm text-white focus:ring-0 p-0"
                      />
                      <input 
                        type="text" 
                        value={item.quantity}
                        onChange={e => {
                          const newPreview = [...bulkPreview];
                          newPreview[idx].quantity = e.target.value;
                          setBulkPreview(newPreview);
                        }}
                        className="w-24 bg-transparent border-none text-xs text-white/60 focus:ring-0 p-0 text-left sm:text-right"
                        placeholder="No Qty"
                      />
                    </div>
                    {item.isDuplicate && (
                      <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider bg-orange-500/10 px-2 py-1 rounded">Duplicate</span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setIsBulkPasteOpen(false)}
                  className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBulkSubmit}
                  disabled={isBulkSubmitting || bulkPreview.filter(p => p.selected).length === 0}
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                >
                  {isBulkSubmitting ? "Importing..." : `Import ${bulkPreview.filter(p => p.selected).length} Items`}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
