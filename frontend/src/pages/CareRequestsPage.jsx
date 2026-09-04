import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { careRequestAPI } from '../services/api';
import {
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Stethoscope,
  Radio,
  PhoneCall,
  CheckCircle,
  AlertTriangle,
  X,
  Zap,
  TrendingUp,
  Award,
  ChevronRight,
  Filter
} from 'lucide-react';

const CareRequestsPage = () => {
  const { user, isAdmin, isStaff, isPatient, showNotification } = useAuth();

  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(false);

  // Filters
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    patientName: user?.name || '',
    patientContact: user?.email || user?.phone || '',
    serviceRequired: 'Urgent dental pain relief and root canal treatment',
    department: 'Dental',
    locationCity: 'Colombo',
    urgency: 'High',
    preferredFacilityType: 'Any',
    maxBudget: 25000,
    additionalNotes: 'Severe molar ache for 24 hours. Needs quick consultation.'
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchRequests();
  }, [urgencyFilter, statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (urgencyFilter !== 'All') params.urgency = urgencyFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await careRequestAPI.getAll(params);
      if (res.data.success) {
        setRequests(res.data.data);
        if (res.data.data.length > 0 && !selectedRequest) {
          loadRequestRecommendations(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load care requests:', err);
      showNotification('Error loading care requests from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadRequestRecommendations = async (reqItem) => {
    setSelectedRequest(reqItem);
    setRecsLoading(true);
    try {
      const res = await careRequestAPI.getById(reqItem._id);
      if (res.data.success) {
        setRecommendations(res.data.recommendations || []);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      showNotification('Error calculating ranked recommendations', 'error');
    } finally {
      setRecsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRequest(null);
    setFormData({
      patientName: user?.name || '',
      patientContact: user?.email || user?.phone || '',
      serviceRequired: '',
      department: 'General Consultation',
      locationCity: 'Colombo',
      urgency: 'Medium',
      preferredFacilityType: 'Any',
      maxBudget: 25000,
      additionalNotes: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (reqItem) => {
    setEditingRequest(reqItem);
    setFormData({
      patientName: reqItem.patientName || '',
      patientContact: reqItem.patientContact || '',
      serviceRequired: reqItem.serviceRequired || '',
      department: reqItem.department || 'General Consultation',
      locationCity: reqItem.locationCity || 'Colombo',
      urgency: reqItem.urgency || 'Medium',
      preferredFacilityType: reqItem.preferredFacilityType || 'Any',
      maxBudget: reqItem.maxBudget || 25000,
      additionalNotes: reqItem.additionalNotes || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.patientName || formData.patientName.trim().length === 0) {
      errs.patientName = 'Patient name is required';
    }
    if (!formData.patientContact || formData.patientContact.trim().length === 0) {
      errs.patientContact = 'Contact details are required';
    }
    if (!formData.serviceRequired || formData.serviceRequired.trim().length === 0) {
      errs.serviceRequired = 'Please describe the medical service needed';
    }
    if (!formData.locationCity || formData.locationCity.trim().length === 0) {
      errs.locationCity = 'Preferred city is required';
    }
    if (formData.maxBudget === undefined || formData.maxBudget === '' || Number(formData.maxBudget) < 0) {
      errs.maxBudget = 'Please specify a valid budget';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingRequest) {
        const res = await careRequestAPI.update(editingRequest._id, formData);
        if (res.data.success) {
          showNotification('Care request updated. Ranked recommendations recalculated!', 'success');
          setIsModalOpen(false);
          fetchRequests();
          if (selectedRequest?._id === editingRequest._id) {
            loadRequestRecommendations(res.data.data);
          }
        }
      } else {
        const res = await careRequestAPI.create(formData);
        if (res.data.success) {
          showNotification('Care request saved to database! Intelligent recommendations generated.', 'success');
          setIsModalOpen(false);
          fetchRequests();
          if (res.data.data) {
            loadRequestRecommendations(res.data.data);
          }
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      showNotification(msg, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await careRequestAPI.delete(id);
      if (res.data.success) {
        showNotification('Care request deleted successfully from MongoDB', 'info');
        setDeleteConfirmId(null);
        if (selectedRequest?._id === id) {
          setSelectedRequest(null);
          setRecommendations([]);
        }
        fetchRequests();
      }
    } catch (err) {
      showNotification('Failed to delete care request', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Module 4: Care Request & AI Recommendation Engine
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Smart Care Requests & Ranking Engine
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Submit your medical care needs and let our intelligent engine compare registered facilities, active services, and live availability to rank the optimal match.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-700 hover:to-brand-700 text-white font-bold text-sm shadow-lg shadow-purple-500/25 flex items-center gap-2 self-start transition"
          >
            <Plus className="w-4 h-4" />
            Submit Care Request
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-4 text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Urgency:
          </span>
          {['All', 'Emergency', 'High', 'Medium', 'Low'].map((urg) => (
            <button
              key={urg}
              onClick={() => setUrgencyFilter(urg)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                urgencyFilter === urg
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {urg}
            </button>
          ))}
        </div>

        {/* 2-COLUMN MAIN CONTENT: LEFT (REQUESTS LIST) / RIGHT (RECOMMENDATION ENGINE RESULTS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Care Requests List (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>{isAdmin ? 'All Care Requests (Admin)' : 'Your Care Requests'}</span>
              <span className="text-xs font-semibold text-slate-400">({requests.length})</span>
            </h3>

            {loading ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
                <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-slate-400">Loading requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
                <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No care requests yet</h4>
                <p className="text-xs text-slate-500 mt-1">Click "Submit Care Request" to test the ranking engine.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((reqItem) => {
                  const isSelected = selectedRequest?._id === reqItem._id;
                  return (
                    <div
                      key={reqItem._id}
                      onClick={() => loadRequestRecommendations(reqItem)}
                      className={`p-5 rounded-3xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-50/50 border-purple-300 shadow-md ring-2 ring-purple-500/20'
                          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            reqItem.urgency === 'Emergency'
                              ? 'bg-rose-100 text-rose-700'
                              : reqItem.urgency === 'High'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {reqItem.urgency} Urgency
                          </span>
                          <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                            LKR {Number(reqItem.maxBudget || 0).toLocaleString()} budget
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 leading-tight">
                          {reqItem.serviceRequired}
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            {reqItem.locationCity}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">{reqItem.department}</span>
                        </div>

                        {reqItem.additionalNotes && (
                          <p className="text-xs text-slate-500 line-clamp-2 italic">
                            "{reqItem.additionalNotes}"
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400">
                          Patient: {reqItem.patientName}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(reqItem);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600"
                            title="Edit Request"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(reqItem._id);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-rose-600"
                            title="Delete Request"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className="w-4 h-4 text-purple-500" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Intelligent Ranking Engine Explorer (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" />
                Intelligent Recommendation & Ranking Analysis
              </h3>
              {selectedRequest && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Live Availability Verified
                </span>
              )}
            </div>

            {!selectedRequest ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">Select a Care Request</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Choose any request on the left to evaluate how the ranking engine compares candidates based on service match, real-time status, distance, urgency, and budget.
                </p>
              </div>
            ) : recsLoading ? (
              <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs font-bold text-slate-600">Running Ranking Engine Scoring Model...</p>
                <p className="text-[11px] text-slate-400 mt-1">Querying facilities, checking live status, calculating composite scores</p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-slate-200">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No Suitable Matches Found</h4>
                <p className="text-xs text-slate-500 mt-1">
                  All facilities providing this department are either currently closed or exceed the criteria. Try updating the budget or location.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Ranking Context Summary Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-900 to-brand-900 text-white shadow-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">
                      Processed Care Request
                    </span>
                    <h4 className="text-lg font-bold text-white mt-0.5">{selectedRequest.serviceRequired}</h4>
                    <div className="text-xs text-purple-200 flex items-center gap-2 mt-1">
                      <span>{selectedRequest.locationCity}</span>
                      <span>•</span>
                      <span>{selectedRequest.urgency} Urgency</span>
                      <span>•</span>
                      <span>Max LKR {Number(selectedRequest.maxBudget || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400">{recommendations.length}</span>
                    <span className="block text-[10px] uppercase font-bold text-purple-300">Ranked Matches</span>
                  </div>
                </div>

                {/* Ranked Matches List */}
                <div className="space-y-4">
                  {recommendations.map((item) => (
                    <div
                      key={item.service._id}
                      className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all space-y-4"
                    >
                      {/* Header with Rank & Score */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center shadow-sm ${
                            item.rank === 1
                              ? 'bg-amber-400 text-slate-900'
                              : item.rank === 2
                              ? 'bg-slate-300 text-slate-800'
                              : 'bg-orange-200 text-slate-800'
                          }`}>
                            #{item.rank}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">
                              {item.matchQuality}
                            </span>
                            <h4 className="text-lg font-extrabold text-slate-900 leading-tight">
                              {item.facility.name}
                            </h4>
                          </div>
                        </div>

                        {/* Overall Score Badge */}
                        <div className="text-right">
                          <div className="text-2xl font-black text-emerald-600 leading-none">
                            {item.matchScore}%
                          </div>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Match Score</span>
                        </div>
                      </div>

                      {/* Location & Status Info */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          {item.facility.city}
                        </span>
                        <span className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 live-pulse-emerald"></span>
                          Status: {item.liveStatus.status} (~{item.liveStatus.currentWaitTimeMinutes}m wait)
                        </span>
                        {item.facility.emergency24x7 && (
                          <span className="font-bold text-rose-600 flex items-center gap-1">
                            <Radio className="w-3.5 h-3.5" /> 24/7 Emergency
                          </span>
                        )}
                      </div>

                      {/* Service Details Card */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Matched Medical Service:</div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-sm">{item.service.name}</span>
                          <span className="font-black text-brand-600 text-sm">LKR {Number(item.service?.fees || 0).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {item.service.description}
                        </p>
                      </div>

                      {/* Multi-Factor Score Breakdown Progress Bars */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                          <span>Algorithm Scoring Breakdown</span>
                          <span>Max 100 Pts</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-[10px] font-semibold text-slate-600">
                          <div>
                            <div className="flex justify-between mb-0.5">
                              <span>Service</span>
                              <span>{item.scoreBreakdown.serviceMatch}/30</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${(item.scoreBreakdown.serviceMatch / 30) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-0.5">
                              <span>Status</span>
                              <span>{item.scoreBreakdown.availability}/30</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${(item.scoreBreakdown.availability / 30) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-0.5">
                              <span>Proximity</span>
                              <span>{item.scoreBreakdown.location}/25</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${(item.scoreBreakdown.location / 25) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between mb-0.5">
                              <span>Urgency</span>
                              <span>{item.scoreBreakdown.urgency}/15</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full"
                                style={{ width: `${(item.scoreBreakdown.urgency / 15) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reasons / Why Recommended Highlights */}
                      <div className="space-y-1 pt-1">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Why Recommended:</div>
                        <ul className="space-y-1">
                          {item.highlights.map((h, i) => (
                            <li key={i} className="text-xs text-slate-700 flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <a
                          href={`tel:${item.facility.contactNumber}`}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          {item.facility.contactNumber}
                        </a>

                        <button
                          onClick={() => showNotification(`Booking referral created for ${item.facility.name}!`, 'success')}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition"
                        >
                          Select This Facility
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* CREATE / EDIT CARE REQUEST MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="text-xl font-bold text-slate-900">
                    {editingRequest ? 'Update Care Request' : 'Submit Care Request'}
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
                {/* Patient Name & Contact */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      placeholder="e.g. Elena Perera"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none transition ${
                        formErrors.patientName ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 focus:border-purple-500'
                      }`}
                    />
                    {formErrors.patientName && <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.patientName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Contact Phone / Email *
                    </label>
                    <input
                      type="text"
                      value={formData.patientContact}
                      onChange={(e) => setFormData({ ...formData, patientContact: e.target.value })}
                      placeholder="+94 77 123 4567"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none transition ${
                        formErrors.patientContact ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 focus:border-purple-500'
                      }`}
                    />
                    {formErrors.patientContact && <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.patientContact}</p>}
                  </div>
                </div>

                {/* Specific Medical Need */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Specific Service or Condition *
                  </label>
                  <input
                    type="text"
                    value={formData.serviceRequired}
                    onChange={(e) => setFormData({ ...formData, serviceRequired: e.target.value })}
                    placeholder="e.g. Urgent dental root canal or Sudden chest tightness"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none transition ${
                      formErrors.serviceRequired ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 focus:border-purple-500'
                    }`}
                  />
                  {formErrors.serviceRequired && <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.serviceRequired}</p>}
                </div>

                {/* Department & City */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Medical Specialty *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Dental">Dental</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="General Consultation">General Consultation</option>
                      <option value="Emergency Care">Emergency Care</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Radiology & Imaging">Radiology & Imaging</option>
                      <option value="Laboratory & Diagnostics">Laboratory & Diagnostics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Preferred City / Location *
                    </label>
                    <input
                      type="text"
                      value={formData.locationCity}
                      onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                      placeholder="Colombo, Kandy, Galle..."
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 focus:outline-none transition ${
                        formErrors.locationCity ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 focus:border-purple-500'
                      }`}
                    />
                    {formErrors.locationCity && <p className="mt-1 text-xs text-rose-600 font-medium">{formErrors.locationCity}</p>}
                  </div>
                </div>

                {/* Urgency & Budget */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Urgency Level *
                    </label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="Emergency">Emergency (Immediate)</option>
                      <option value="High">High Urgency</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low / Routine</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Max Budget (LKR - Rs.) *
                    </label>
                    <input
                      type="number"
                      value={formData.maxBudget}
                      onChange={(e) => setFormData({ ...formData, maxBudget: Number(e.target.value) })}
                      min="0"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                    Symptoms or Additional Notes
                  </label>
                  <textarea
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                    rows="2"
                    placeholder="Describe symptoms, duration, medical history, or specific clinic preference..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-purple-500"
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
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-brand-600 text-white font-bold text-sm shadow-md"
                  >
                    {editingRequest ? 'Update Request' : 'Run Ranking Analysis & Save'}
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
              <h3 className="text-lg font-bold text-slate-900">Cancel Care Request?</h3>
              <p className="text-xs text-slate-500">
                This will delete your care request and its ranked recommendations from the system.
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

export default CareRequestsPage;
