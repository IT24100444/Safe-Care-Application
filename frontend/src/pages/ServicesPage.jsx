import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { serviceAPI, facilityAPI } from '../services/api';
import {
  Stethoscope,
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Clock,
  User,
  Filter,
  X,
  CheckCircle,
  Tag,
  AlertCircle
} from 'lucide-react';

const ServicesPage = () => {
  const { user, isAdmin, isManager, showNotification } = useAuth();

  const [services, setServices] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [facilityFilter, setFacilityFilter] = useState('All');
  const [maxFeeFilter, setMaxFeeFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    department: 'General Consultation',
    facility: '',
    fees: 3500,
    serviceType: 'Outpatient',
    estimatedDuration: '30 mins',
    doctorInCharge: '',
    description: '',
    isAvailable: true
  });
  const [formErrors, setFormErrors] = useState({});

  const departmentsList = [
    'All',
    'Cardiology',
    'Dental',
    'General Consultation',
    'Emergency Care',
    'Pediatrics',
    'Orthopedics',
    'Laboratory & Diagnostics',
    'Radiology & Imaging',
    'Neurology',
    'Dermatology',
    'Oncology'
  ];

  useEffect(() => {
    fetchData();
  }, [departmentFilter, facilityFilter, maxFeeFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (departmentFilter !== 'All') params.department = departmentFilter;
      if (facilityFilter !== 'All') params.facility = facilityFilter;
      if (maxFeeFilter) params.maxFee = maxFeeFilter;
      if (searchTerm) params.search = searchTerm;

      const [servicesRes, facilitiesRes] = await Promise.all([
        serviceAPI.getAll(params),
        facilityAPI.getAll()
      ]);

      if (servicesRes.data.success) {
        setServices(servicesRes.data.data);
      }
      if (facilitiesRes.data.success) {
        setFacilities(facilitiesRes.data.data);
        if (!formData.facility && facilitiesRes.data.data.length > 0) {
          setFormData(prev => ({ ...prev, facility: facilitiesRes.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load services:', err);
      showNotification('Error loading medical services from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      department: 'General Consultation',
      facility: facilities[0]?._id || '',
      fees: 3500,
      serviceType: 'Outpatient',
      estimatedDuration: '30 mins',
      doctorInCharge: '',
      description: '',
      isAvailable: true
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      department: service.department || 'General Consultation',
      facility: service.facility?._id || service.facility || '',
      fees: service.fees || 0,
      serviceType: service.serviceType || 'Outpatient',
      estimatedDuration: service.estimatedDuration || '30 mins',
      doctorInCharge: service.doctorInCharge || '',
      description: service.description || '',
      isAvailable: service.isAvailable !== undefined ? service.isAvailable : true
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errs.name = 'Service name must be at least 2 characters';
    }
    if (!formData.facility) {
      errs.facility = 'Associated healthcare facility is required';
    }
    if (formData.fees === undefined || formData.fees === '' || isNaN(formData.fees) || Number(formData.fees) < 0) {
      errs.fees = 'Please enter a valid non-negative fee amount';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingService) {
        const res = await serviceAPI.update(editingService._id, formData);
        if (res.data.success) {
          showNotification('Medical service updated successfully in database!', 'success');
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        const res = await serviceAPI.create(formData);
        if (res.data.success) {
          showNotification('New medical service linked to facility and saved!', 'success');
          setIsModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed. Please verify permissions.';
      showNotification(msg, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await serviceAPI.delete(id);
      if (res.data.success) {
        showNotification('Medical service removed from database', 'info');
        setDeleteConfirmId(null);
        fetchData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete medical service';
      showNotification(msg, 'error');
    }
  };

  const canManageService = (service) => {
    if (isAdmin) return true;
    if (isManager) {
      const facId = service.facility?._id || service.facility;
      return (
        user?.assignedFacility === facId ||
        user?.assignedFacility?._id === facId
      );
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Stethoscope className="w-3.5 h-3.5" />
              Module 2: Healthcare Service Management
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Medical Services Directory
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Connects diagnostic, surgical, and therapeutic medical services directly to certified healthcare facilities.
            </p>
          </div>

          {(isAdmin || isManager) && (
            <button
              onClick={openCreateModal}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 self-start transition"
            >
              <Plus className="w-4 h-4" />
              Add Medical Service
            </button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search services (e.g. Root Canal, Echo, ECG, MRI, Consultation)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition"
            >
              Filter Services
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Department:
            </span>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none"
            >
              {departmentsList.map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>

            <span className="text-slate-400 font-bold uppercase tracking-wider ml-2">Facility:</span>
            <select
              value={facilityFilter}
              onChange={(e) => setFacilityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none max-w-xs truncate"
            >
              <option value="All">All Associated Facilities</option>
              {facilities.map(fac => (
                <option key={fac._id} value={fac._id}>{fac.name} ({fac.city})</option>
              ))}
            </select>

            <span className="text-slate-400 font-bold uppercase tracking-wider ml-2">Max Fee (LKR):</span>
            <input
              type="number"
              value={maxFeeFilter}
              onChange={(e) => setMaxFeeFilter(e.target.value)}
              placeholder="e.g. 5000"
              className="w-28 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-bold text-slate-500">Retrieving linked medical services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No medical services match your query</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting the department or price filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => (
              <div
                key={svc._id}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                      {svc.department}
                    </span>
                    <span className="text-base font-black text-brand-600">
                      LKR {Number(svc.fees || 0).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    {svc.name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {svc.description}
                  </p>

                  {/* Connected Facility Info */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Associated Facility:</div>
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                      <span className="truncate">{svc.facility?.name || 'Assigned Hospital'}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {svc.facility?.city} • {svc.facility?.contactNumber}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      ~{svc.estimatedDuration || '30 mins'}
                    </span>
                    {svc.doctorInCharge && (
                      <span className="flex items-center gap-1 text-slate-600 font-semibold truncate">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {svc.doctorInCharge}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Ready for Booking
                  </span>

                  {canManageService(svc) && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(svc)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition"
                        title="Edit Service"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(svc._id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                        title="Delete Service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CREATE / EDIT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-xl font-bold text-slate-900">
                    {editingService ? 'Update Medical Service' : 'Add Medical Service'}
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
                {/* Service Name */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Comprehensive Echocardiogram or Dental Scaling"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none transition ${
                      formErrors.name ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.name && <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.name}</p>}
                </div>

                {/* Department */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Department *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                    >
                      {departmentsList.filter(d => d !== 'All').map(dep => (
                        <option key={dep} value={dep}>{dep}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Service Type
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Outpatient">Outpatient</option>
                      <option value="Inpatient">Inpatient</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Diagnostic">Diagnostic</option>
                      <option value="Consultation">Consultation</option>
                      <option value="Surgical">Surgical</option>
                    </select>
                  </div>
                </div>

                {/* Associated Facility */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Associated Healthcare Facility *
                  </label>
                  <select
                    value={formData.facility}
                    onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 bg-white focus:outline-none transition ${
                      formErrors.facility ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  >
                    <option value="">Select Facility...</option>
                    {facilities.map(fac => (
                      <option key={fac._id} value={fac._id}>{fac.name} — {fac.city}</option>
                    ))}
                  </select>
                  {formErrors.facility && <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.facility}</p>}
                </div>

                {/* Fees & Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Fee Amount (LKR - Rs.) *
                    </label>
                    <input
                      type="number"
                      value={formData.fees}
                      onChange={(e) => setFormData({ ...formData, fees: Number(e.target.value) })}
                      min="0"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none transition ${
                        formErrors.fees ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500'
                      }`}
                    />
                    {formErrors.fees && <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.fees}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Est. Duration
                    </label>
                    <input
                      type="text"
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                      placeholder="e.g. 45 mins"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Doctor in Charge */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Specialist / Doctor in Charge
                  </label>
                  <input
                    type="text"
                    value={formData.doctorInCharge}
                    onChange={(e) => setFormData({ ...formData, doctorInCharge: e.target.value })}
                    placeholder="e.g. Dr. Samantha Dias"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Service Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    placeholder="Detailed explanation of the procedure, preparation guidelines, and deliverables..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  ></textarea>
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
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-sm shadow-md"
                  >
                    {editingService ? 'Save Changes' : 'Save Service to Database'}
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
              <h3 className="text-lg font-bold text-slate-900">Delete Medical Service?</h3>
              <p className="text-xs text-slate-500">
                This medical service will be permanently deleted from the associated facility.
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
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ServicesPage;
