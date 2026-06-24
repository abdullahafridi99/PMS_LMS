import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Loader2, Plus, Bus, MapPin, Phone, Shield } from 'lucide-react';

export default function AdminTransport() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [opLoading, setOpLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    routeName: '',
    driverName: '',
    driverPhone: '',
    vehicleNumber: '',
    points: ''
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const data = await api.transport.list();
      setRoutes(data);
    } catch (err) {
      setError(err.message || 'Failed to load transport routes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setOpLoading(true);
    setError('');
    setMessage('');

    const pickupPoints = form.points ? form.points.split(',').map(p => p.trim()) : [];

    try {
      await api.transport.create({
        routeName: form.routeName,
        driverName: form.driverName,
        driverPhone: form.driverPhone,
        vehicleNumber: form.vehicleNumber,
        pickupPoints
      });
      setMessage('🚌 Transport route successfully registered!');
      setForm({ routeName: '', driverName: '', driverPhone: '', vehicleNumber: '', points: '' });
      fetchRoutes();
    } catch (err) {
      setError(err.message || 'Failed to create transport route');
    } finally {
      setOpLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left pane: Add transport route */}
        <div className="lg:col-span-4 bg-white dark:bg-slateCustom-900 border border-slate-200/60 dark:border-slateCustom-800 rounded-[32px] p-6 shadow-sm">
          <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Bus className="w-5 h-5 text-brand-600" />
            Add Route Details
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left space-y-2">
              <label className="text-xs font-semibold text-slate-500">Route Name</label>
              <input 
                type="text" 
                required
                value={form.routeName}
                onChange={(e) => setForm(prev => ({ ...prev, routeName: e.target.value }))}
                placeholder="e.g. Peshawar Cantt to Zangali"
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
            
            <div className="text-left space-y-2">
              <label className="text-xs font-semibold text-slate-500">Driver Name</label>
              <input 
                type="text" 
                required
                value={form.driverName}
                onChange={(e) => setForm(prev => ({ ...prev, driverName: e.target.value }))}
                placeholder="e.g. Khan Zaman"
                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-left space-y-2">
                <label className="text-xs font-semibold text-slate-500">Driver Phone</label>
                <input 
                  type="text" 
                  required
                  value={form.driverPhone}
                  onChange={(e) => setForm(prev => ({ ...prev, driverPhone: e.target.value }))}
                  placeholder="e.g. 03339123456"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <div className="text-left space-y-2">
                <label className="text-xs font-semibold text-slate-500">Vehicle Number</label>
                <input 
                  type="text" 
                  required
                  value={form.vehicleNumber}
                  onChange={(e) => setForm(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                  placeholder="e.g. AJK-1234"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-xs outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="text-left space-y-2">
              <label className="text-xs font-semibold text-slate-500">Pickup Stops (comma separated)</label>
              <textarea 
                value={form.points}
                onChange={(e) => setForm(prev => ({ ...prev, points: e.target.value }))}
                placeholder="Peshawar, Kohat Road, Zangali stops..."
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slateCustom-800 bg-slate-50 dark:bg-slateCustom-950 text-slate-800 dark:text-white text-sm outline-none focus:ring-1 focus:ring-brand-500 transition-all h-20 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={opLoading}
              className="w-full h-11 bg-gradient-brand text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-wider pt-0.5"
            >
              {opLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4.5 h-4.5" />}
              Save Route Details
            </button>
          </form>
        </div>

        {/* Right pane: list routes */}
        <div className="lg:col-span-8 bg-white dark:bg-slateCustom-900 border border-slate-200/60 dark:border-slateCustom-800 rounded-[32px] p-6 shadow-sm">
          <h3 className="font-outfit font-bold text-lg text-slate-800 dark:text-white mb-4">Registered Transport Routes</h3>
          
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-brand-600 animate-spin" /></div>
          ) : routes.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm italic">No bus routes configured yet. Add routes to make them trackable.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {routes.map((r) => (
                <div key={r._id || r.id} className="p-5 border border-slate-100 dark:border-slateCustom-850 rounded-[28px] bg-slate-50/30 dark:bg-slateCustom-950/20 space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center shrink-0">
                      <Bus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                      <h4 className="font-outfit font-bold text-sm text-slate-800 dark:text-white">{r.routeName}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.vehicleNumber}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-550 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-brand-500" />
                      <span>Driver: <strong>{r.driverName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-teal-500" />
                      <span>Phone: <strong>{r.driverPhone}</strong></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Stops: <strong className="text-slate-650 dark:text-slate-300">{(r.pickupPoints || []).join(' → ')}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
