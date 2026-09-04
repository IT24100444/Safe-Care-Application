import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { facilityAPI } from '../services/api';
import {
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Clock,
  HeartPulse,
  Filter,
  X,
  CheckCircle,
  AlertCircle,
  Eye,
  ExternalLink,
  Bed
} from 'lucide-react';

const FacilitiesPage = () => {
  const { user, isAdmin, isManager, showNotification } = useAuth();

  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [viewFacility, setViewFacility] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    facilityType: 'Hospital',
    address: '',
    city: 'Colombo',
    contactNumber: '',
    email: '',
    operatingHours: '24/7 All Departments',
    emergency24x7: true,
    totalBeds: 100,
    description: '',
    imageUrl: '',
    website: ''
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchFacilities();
  }, [typeFilter, cityFilter, emergencyOnly]);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (typeFilter !== 'All') params.type = typeFilter;
      if (cityFilter !== 'All') params.city = cityFilter;
      if (emergencyOnly) params.emergency = 'true';
      if (searchTerm) params.search = searchTerm;

      const res = await facilityAPI.getAll(params);
      if (res.data.success) {
        setFacilities(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch facilities:', err);
      showNotification('Failed to load healthcare facilities', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFacilities();
  };

  const openCreateModal = () => {
    setEditingFacility(null);
    setFormData({
      name: '',
      facilityType: 'Hospital',
      address: '',
      city: 'Colombo',
      contactNumber: '',
      email: '',
      operatingHours: '24/7 All Departments',
      emergency24x7: true,
      totalBeds: 100,
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800&auto=format&fit=crop',
      website: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (facility) => {
    setEditingFacility(facility);
    setFormData({
      name: facility.name || '',
      facilityType: facility.facilityType || 'Hospital',
      address: facility.address || '',
      city: facility.city || 'Colombo',
      contactNumber: facility.contactNumber || '',
      email: facility.email || '',
      operatingHours: facility.operatingHours || '24/7',
      emergency24x7: facility.emergency24x7 || false,
      totalBeds: facility.totalBeds || 50,
      description: facility.description || '',
      imageUrl: facility.imageUrl || '',
      website: facility.website || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (!formData.name || formData.name.trim().length < 3) {
      errs.name = 'Facility name must be at least 3 characters';
    }
    if (!formData.address || formData.address.trim().length === 0) {
      errs.address = 'Street address is required';
    }
    if (!formData.city || formData.city.trim().length === 0) {
      errs.city = 'City/Location is required';
    }
    if (!formData.contactNumber || formData.contactNumber.trim().length === 0) {
      errs.contactNumber = 'Contact phone number is required';
    }
    if (!formData.email || !emailRegex.test(formData.email)) {
      errs.email = 'Valid official email address is required';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingFacility) {
        // Update existing facility
        const res = await facilityAPI.update(editingFacility._id, formData);
        if (res.data.success) {
          showNotification('Healthcare facility details updated successfully in database!', 'success');
          setIsModalOpen(false);
          fetchFacilities();
        }
      } else {
        // Create new facility
        const res = await facilityAPI.create(formData);
        if (res.data.success) {
          showNotification('New healthcare facility registered and saved to MongoDB!', 'success');
          setIsModalOpen(false);
          fetchFacilities();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed. Please verify permissions.';
      showNotification(msg, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await facilityAPI.delete(id);
      if (res.data.success) {
        showNotification('Facility and connected services removed from database', 'info');
        setDeleteConfirmId(null);
        fetchFacilities();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Delete operation failed';
      showNotification(msg, 'error');
    }
  };

  // Check if current user can edit this specific facility
  const canEditFacility = (facility) => {
    if (isAdmin) return true;
    if (isManager) {
      return (
        facility.manager?._id === user?._id ||
        facility.manager === user?._id ||
        user?.assignedFacility === facility._id ||
        user?.assignedFacility?._id === facility._id
      );
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5" />
              Module 1: Healthcare Facility Management
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Hospital & Clinic Directory
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Registered healthcare institutions, live operational status, emergency readiness, and contact channels.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={openCreateModal}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center gap-2 self-start transition"
            >
              <Plus className="w-4 h-4" />
              Register New Facility
            </button>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by facility name, address, or medical specialties..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filters:
            </span>

            {/* Type selector */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Facility Types</option>
              <option value="Hospital">Hospitals</option>
              <option value="Clinic">Clinics</option>
              <option value="Medical Center">Medical Centers</option>
              <option value="Specialized Care">Specialized Care</option>
              <option value="Diagnostic Center">Diagnostic Centers</option>
            </select>

            {/* City selector */}
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

            {/* 24/7 Emergency checkbox */}
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 select-none ml-2">
              <input
                type="checkbox"
                checked={emergencyOnly}
                onChange={(e) => setEmergencyOnly(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <span className="text-rose-600 flex items-center gap-1">
                <HeartPulse className="w-3.5 h-3.5" /> 24/7 Emergency Only
              </span>
            </label>
          </div>
        </div>

        {/* Facilities Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-bold text-slate-500">Loading registered facilities from MongoDB...</p>
          </div>
        ) : facilities.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No healthcare facilities found</h3>
            <p className="text-xs text-slate-500 mt-1">Try broadening your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((fac) => (
              <div
                key={fac._id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={fac.imageUrl || '/images/hero-banner.jpg'}
                      alt={fac.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-bold text-xs">
                        {fac.facilityType}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-md ${
                        fac.liveStatus === 'Available'
                          ? 'bg-emerald-500 text-white'
                          : fac.liveStatus === 'Busy'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        {fac.liveStatus || 'Available'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {fac.city}
                      </span>
                      <span className="font-bold text-amber-500">★ {fac.rating || 4.8}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                      {fac.name}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {fac.description}
                    </p>

                    <div className="space-y-1.5 pt-2 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{fac.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <a href={`tel:${fac.contactNumber}`} className="hover:text-brand-600 font-semibold">
                          {fac.contactNumber}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{fac.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Bed className="w-3.5 h-3.5 text-brand-500" />
                        {fac.totalBeds} Beds
                      </span>
                      {fac.emergency24x7 ? (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <HeartPulse className="w-3.5 h-3.5" /> 24/7 Emergency
                        </span>
                      ) : (
                        <span className="text-slate-400">{fac.operatingHours}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setViewFacility(fac)}
                    className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>

                  {/* Edit action */}
                  {canEditFacility(fac) && (
                    <button
                      onClick={() => openEditModal(fac)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition"
                      title="Update facility details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Delete action (Admin only) */}
                  {isAdmin && (
                    <button
                      onClick={() => setDeleteConfirmId(fac._id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                      title="Delete facility from database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CREATE / EDIT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-600" />
                  <h3 className="text-xl font-bold text-slate-900">
                    {editingFacility ? 'Update Healthcare Facility' : 'Register New Facility'}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Facility Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Metro General Hospital"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none transition ${
                        formErrors.name ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 focus:border-brand-500'
                      }`}
                    />
                    {formErrors.name && <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.name}</p>}
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Facility Type *
                    </label>
                    <select
                      value={formData.facilityType}
                      onChange={(e) => setFormData({ ...formData, facilityType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="Hospital">Hospital</option>
                      <option value="Clinic">Clinic</option>
                      <option value="Medical Center">Medical Center</option>
                      <option value="Specialized Care">Specialized Care</option>
                      <option value="Diagnostic Center">Diagnostic Center</option>
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      City / Location *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Colombo, Kandy, Galle..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none transition ${
                        formErrors.city ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 focus:border-brand-500'
                      }`}
                    />
                    {formErrors.city && <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.city}</p>}
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Full Street Address *
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="124 Healthcare Boulevard, Ward Place"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none transition ${
                        formErrors.address ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 focus:border-brand-500'
                      }`}
                    />
                    {formErrors.address && <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.address}</p>}
                  </div>

                  {/* Contact Number */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="text"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      placeholder="+94 11 269 1111"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none transition ${
                        formErrors.contactNumber ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 focus:border-brand-500'
                      }`}
                    />
                    {formErrors.contactNumber && <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.contactNumber}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="info@hospital.com"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none transition ${
                        formErrors.email ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 focus:border-brand-500'
                      }`}
                    />
                    {formErrors.email && <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.email}</p>}
                  </div>

                  {/* Operating Hours & Beds */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Operating Hours
                    </label>
                    <input
                      type="text"
                      value={formData.operatingHours}
                      onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                      placeholder="24/7 or 08:00 AM - 08:00 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Total Bed Capacity
                    </label>
                    <input
                      type="number"
                      value={formData.totalBeds}
                      onChange={(e) => setFormData({ ...formData, totalBeds: Number(e.target.value) })}
                      min="1"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  {/* Image URL */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Description & Medical Capabilities
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows="3"
                      placeholder="Brief overview of the healthcare facility and medical services offered..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-brand-500"
                    ></textarea>
                  </div>

                  {/* Emergency 24/7 checkbox */}
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.emergency24x7}
                        onChange={(e) => setFormData({ ...formData, emergency24x7: e.target.checked })}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">24/7 Emergency Unit Equipped</span>
                        <span className="text-[11px] text-slate-500">Enables high-priority emergency triage dispatch recommendations</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-sm shadow-md transition"
                  >
                    {editingFacility ? 'Save Changes' : 'Save Facility to Database'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FACILITY DETAIL VIEW MODAL */}
        {viewFacility && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="relative h-56 w-full">
                <img
                  src={viewFacility.imageUrl || '/images/hero-banner.jpg'}
                  alt={viewFacility.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setViewFacility(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-slate-900/90 text-white text-xs font-bold">
                    {viewFacility.facilityType}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">{viewFacility.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    {viewFacility.address}, {viewFacility.city}
                  </p>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {viewFacility.description}
                </p>

                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold">Contact Phone</span>
                    <span className="font-bold text-slate-800">{viewFacility.contactNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">Operating Hours</span>
                    <span className="font-bold text-slate-800">{viewFacility.operatingHours}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">Total Inpatient Beds</span>
                    <span className="font-bold text-slate-800">{viewFacility.totalBeds}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">Emergency 24x7</span>
                    <span className={`font-bold ${viewFacility.emergency24x7 ? 'text-emerald-600' : 'text-slate-600'}`}>
                      {viewFacility.emergency24x7 ? 'Yes — Active' : 'Standard'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setViewFacility(null)}
                    className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Delete Healthcare Facility?</h3>
              <p className="text-xs text-slate-500">
                This will permanently delete this facility and cascade delete all its linked medical services and operational status records from MongoDB.
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

export default FacilitiesPage;
