import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Loader2, Plus, Sliders, Box, Layers, RefreshCw } from 'lucide-react';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    quantity: 10,
    category: 'computer'
  });

  const [selectedItemId, setSelectedItemId] = useState('');
  const [adjustQty, setAdjustQty] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await api.inventory.list();
      setItems(data);
    } catch (err) {
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setOpLoading(true);
    setError('');
    setMessage('');

    try {
      await api.inventory.create({
        name: form.name,
        quantity: Number(form.quantity),
        category: form.category
      });
      setMessage('📦 Item successfully cataloged inside stock records!');
      setForm({ name: '', quantity: 10, category: 'computer' });
      fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to create inventory item');
    } finally {
      setOpLoading(false);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!selectedItemId || !adjustQty) return;
    setOpLoading(true);
    setError('');
    setMessage('');

    try {
      await api.inventory.update(selectedItemId, Number(adjustQty));
      setMessage('🔄 Item stock levels successfully synchronized!');
      setAdjustQty('');
      setSelectedItemId('');
      fetchItems();
    } catch (err) {
      setError(err.message || 'Failed to update stock level');
    } finally {
      setOpLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column: Create & Modify Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/60 dark:border-slateCustom-800 rounded-[32px] p-6 shadow-sm">
            <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Box className="w-5 h-5 text-brand-600" />
              Register New Stock
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="text-left space-y-2">
                <label className="text-xs font-semibold text-slate-500">Asset Item Name</label>
                <input 
                  type="text" 
                  required
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Dell Core i5 Laptop"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-left space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Quantity</label>
                  <input 
                    type="number" 
                    required
                    value={form.quantity}
                    onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div className="text-left space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Category</label>
                  <select 
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="computer">Computers & Tech</option>
                    <option value="furniture">Furniture</option>
                    <option value="books">Library Books</option>
                    <option value="lab">Lab Equipment</option>
                    <option value="other">Other Supplies</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={opLoading}
                className="w-full h-11 bg-gradient-brand text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-wider pt-0.5"
              >
                {opLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4.5 h-4.5" />}
                Add Asset Item
              </button>
            </form>
          </div>

          {selectedItemId && (
            <div className="bg-white dark:bg-slateCustom-900 border border-slate-200/60 dark:border-slateCustom-800 rounded-[32px] p-6 shadow-sm animate-fadeIn">
              <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-teal-600" />
                Adjust Stock Levels
              </h3>

              <form onSubmit={handleUpdateStock} className="space-y-4">
                <div className="text-left space-y-2">
                  <label className="text-xs font-semibold text-slate-500">New Quantity Count</label>
                  <input 
                    type="number" 
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    placeholder="e.g. 15"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setSelectedItemId('')}
                    className="flex-1 h-10 border border-slate-200 dark:border-slateCustom-800 rounded-xl text-slate-500 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={opLoading}
                    className="flex-1 h-10 bg-teal-650 hover:bg-teal-600 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    {opLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm Update
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Inventory Table */}
        <div className="lg:col-span-8 bg-white dark:bg-slateCustom-900 border border-slate-200/60 dark:border-slateCustom-800 rounded-[32px] p-6 shadow-sm">
          <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white mb-4">Stock Inventories Registry</h3>
          
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm italic">No items currently cataloged. Use form to register items.</div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 dark:border-slateCustom-800 rounded-2xl">
              <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-slateCustom-950 text-slate-700 dark:text-slate-350">
                  <tr>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Last Sync</th>
                    <th className="px-6 py-4 w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slateCustom-850">
                  {items.map((i) => {
                    const itemId = i._id || i.id;
                    return (
                      <tr key={itemId} className="hover:bg-slate-50/50 dark:hover:bg-slateCustom-850/40">
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{i.name}</td>
                        <td className="px-6 py-4 capitalize font-semibold text-slate-550 dark:text-slate-400">{i.category}</td>
                        <td className="px-6 py-4 font-bold text-slate-750 dark:text-slate-300">{i.quantity}</td>
                        <td className="px-6 py-4 text-xs text-slate-400">{new Date(i.lastUpdated).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setSelectedItemId(itemId);
                              setAdjustQty(i.quantity);
                            }}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slateCustom-850 rounded-lg text-teal-600 dark:text-teal-400 transition-colors"
                            title="Adjust quantity"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
