import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { statusAPI, facilityAPI } from '../services/api';
import {
  Radio,
  Building2,
  Clock,
  HeartPulse,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Filter,
  X,
  ShieldCheck,
  BedDouble,
  RefreshCw
} from 'lucide-react';

const StatusPage = () => {
  const { user, isAdmin, isManager, isStaff, showNotification } = useAuth();

  const [statuses, setStatuses] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    facility: '',
    status: 'Available',
    operatingHours: '24/7 All Units Operational',
    emergencyAvailable: true,
    currentWaitTimeMinutes: 15,
    icuCapacityAvailable: 8,
    notice: 'Normal operations active.'
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchStatuses();
  }, [statusFilter, cityFilter]);

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (cityFilter !== 'All') params.city = cityFilter;

      const [statusRes, facRes] = await Promise.all([
        statusAPI.getAll(params),
        facilityAPI.getAll()
      ]);

      if (statusRes.data.success) {
        setStatuses(statusRes.data.data);
      }
      if (facRes.data.success) {
        setFacilities(facRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load statuses:', err);
      showNotification('Error loading live statuses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (statusRecord = null) => {
    if (statusRecord) {
      setEditingStatus(statusRecord);
      setFormData({
        facility: statusRecord.facility?._id || statusRecord.facility,
        status: statusRecord.status || 'Available',
        operatingHours: statusRecord.operatingHours || '24/7',
        emergencyAvailable: statusRecord.emergencyAvailable !== undefined ? statusRecord.emergencyAvailable : true,
        currentWaitTimeMinutes: statusRecord.currentWaitTimeMinutes || 15,
        icuCapacityAvailable: statusRecord.icuCapacityAvailable || 5,
        notice: statusRecord.notice || ''
      });
    } else {
      setEditingStatus(null);
      setFormData({
        facility: facilities[0]?._id || '',
        status: 'Available',
        operatingHours: '24/7 All Units Operational',
        emergencyAvailable: true,
        currentWaitTimeMinutes: 15,
        icuCapacityAvailable: 8,
        notice: 'Normal operations active.'
      });
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.facility) {
      setFormErrors({ facility: 'Target facility is required' });
      return;
    }

    try {
      const res = await statusAPI.update(formData);
      if (res.data.success) {
        showNotification(`Facility operational status updated to ${formData.status}!`, 'success');
        setIsModalOpen(false);
        fetchStatuses();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status. Verify your permissions.';
      showNotification(msg, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await statusAPI.delete(id);
      if (res.data.success) {
        showNotification('Status record reset successfully', 'info');
        setDeleteConfirmId(null);
        fetchStatuses();
      }
    } catch (err) {
      showNotification('Failed to delete status record', 'error');
    }
  };

  const canEditStatus = (statusRecord) => {
    if (isAdmin) return true;
    if (isManager || isStaff) {
      const facId = statusRecord.facility?._id || statusRecord.facility;
      return (
        user?.assignedFacility === facId ||
        user?.assignedFacility?._id === facId
      );
    }
    return false;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 live-pulse-emerald"></span>
            Available — Open for Care
          </span>
        );
      case 'Busy':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Busy — Expect Delays
          </span>
        );
      case 'Unavailable':
        return (
          <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1.5 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Temporarily Unavailable
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300">
            Closed
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Radio className="w-3.5 h-3.5" />
              Module 3: Facility Status & Availability Management
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Real-Time Operational Availability
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live facility operational indicators, current triage wait times, ICU bed capacities, and department alerts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStatuses}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              title="Refresh Live Statuses"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {(isAdmin || isManager || isStaff) && (
              <button
                onClick={() => openUpdateModal()}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 transition"
              >
                <Edit2 className="w-4 h-4" />
                Update Operational Status
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-4 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Status:
          </span>

          {['All', 'Available', 'Busy', 'Unavailable', 'Closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}

          <span className="text-slate-400 font-bold uppercase tracking-wider ml-auto">City:</span>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Cities</option>
            <option value="Colombo">Colombo</option>
            <option value="Kandy">Kandy</option>
            <option value="Galle">Galle</option>
          </select>
        </div>

        {/* Status Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-bold text-slate-500">Checking live telemetry and hospital statuses...</p>
          </div>
        ) : statuses.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Radio className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No status records match this filter</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statuses.map((st) => (
              <div
                key={st._id}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    {getStatusBadge(st.status)}
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Updated {new Date(st.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">
                      {st.facility?.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {st.facility?.city} • {st.facility?.facilityType}
                    </p>
                  </div>

                  {/* Telemetry metrics bar */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold text-[11px]">Est. Triage Wait</span>
                      <span className="text-base font-black text-slate-900">
                        ~{st.currentWaitTimeMinutes} mins
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold text-[11px]">ICU Capacity</span>
                      <span className="text-base font-black text-brand-600">
                        {st.icuCapacityAvailable} Beds Open
                      </span>
                    </div>
                  </div>

                  {/* Operational Notice */}
                  {st.notice && (
                    <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>{st.notice}</span>
                    </div>
                  )}

                  {/* Operating Hours & Emergency Tag */}
                  <div className="text-xs text-slate-600 space-y-1 pt-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{st.operatingHours}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                      <span className={st.emergencyAvailable ? 'text-emerald-700 font-bold' : 'text-slate-500'}>
                        {st.emergencyAvailable ? 'Emergency Unit Open & Ready' : 'No Emergency Active'}
                      </span>
                    </div>
                  </div>

                  {/* Department Availability breakdown if present */}
                  {st.departmentAvailability && st.departmentAvailability.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Department Status:</div>
                      <div className="space-y-1">
                        {st.departmentAvailability.map((dept, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-slate-700 font-medium">{dept.department}</span>
                            <span className="text-[11px] font-semibold text-slate-500">~{dept.waitMinutes}m wait</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit Controls */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Staff Ref: {st.updatedBy?.name || 'Verified'}
                  </span>

                  {canEditStatus(st) && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openUpdateModal(st)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 text-xs font-bold flex items-center gap-1 transition"
                      >
                        <Edit2 className="w-3 h-3" /> Update
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => setDeleteConfirmId(st._id)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                          title="Reset Status"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* UPDATE STATUS MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-amber-500" />
                  <h3 className="text-xl font-bold text-slate-900">
                    Update Facility Operational Status
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
                {/* Facility Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Facility *
                  </label>
                  <select
                    value={formData.facility}
                    onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                    disabled={!!editingStatus}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:border-amber-500 disabled:bg-slate-100"
                  >
                    {facilities.map(fac => (
                      <option key={fac._id} value={fac._id}>{fac.name} ({fac.city})</option>
                    ))}
                  </select>
                </div>

                {/* Status Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Operational Status *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Available', 'Busy', 'Unavailable', 'Closed'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: s })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                          formData.status === s
                            ? s === 'Available'
                              ? 'bg-emerald-500 text-white border-emerald-600'
                              : s === 'Busy'
                              ? 'bg-amber-500 text-white border-amber-600'
                              : 'bg-rose-500 text-white border-rose-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wait Time & ICU */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Wait Time (Mins)
                    </label>
                    <input
                      type="number"
                      value={formData.currentWaitTimeMinutes}
                      onChange={(e) => setFormData({ ...formData, currentWaitTimeMinutes: Number(e.target.value) })}
                      min="0"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      ICU Beds Open
                    </label>
                    <input
                      type="number"
                      value={formData.icuCapacityAvailable}
                      onChange={(e) => setFormData({ ...formData, icuCapacityAvailable: Number(e.target.value) })}
                      min="0"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Operating Hours */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Operating Hours Notice
                  </label>
                  <input
                    type="text"
                    value={formData.operatingHours}
                    onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                    placeholder="24/7 or 08:00 - 20:00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Broadcast notice */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Operational Notice / Alert Banner
                  </label>
                  <textarea
                    value={formData.notice}
                    onChange={(e) => setFormData({ ...formData, notice: e.target.value })}
                    rows="2"
                    placeholder="e.g. Normal operations active or Emergency room busy..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                  ></textarea>
                </div>

                {/* Emergency Ready */}
                <div>
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.emergencyAvailable}
                      onChange={(e) => setFormData({ ...formData, emergencyAvailable: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-xs font-bold text-slate-900">Emergency Unit Currently Accepting Patients</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm shadow-md"
                  >
                    Save Operational Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Reset Status Record?</h3>
              <p className="text-xs text-slate-500">
                This will remove the current status monitor record and revert to default operational values.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
                >
                  Yes, Reset
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default StatusPage;
