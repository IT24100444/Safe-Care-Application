import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Stethoscope,
  Radio,
  Sparkles,
  PlusCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  TrendingUp,
  Activity
} from 'lucide-react';
import { facilityAPI, serviceAPI, statusAPI, careRequestAPI } from '../services/api';

const Dashboard = () => {
  const { user, isAdmin, isManager, isStaff, isPatient } = useAuth();

  const [stats, setStats] = useState({
    totalFacilities: 0,
    totalServices: 0,
    availableFacilities: 0,
    totalRequests: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentStatuses, setRecentStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [facRes, srvRes, stRes, reqRes] = await Promise.all([
        facilityAPI.getAll(),
        serviceAPI.getAll(),
        statusAPI.getAll(),
        careRequestAPI.getAll().catch(() => ({ data: { data: [] } }))
      ]);

      const facilities = facRes.data.data || [];
      const services = srvRes.data.data || [];
      const statuses = stRes.data.data || [];
      const requests = reqRes.data.data || [];

      const availableCount = statuses.filter(s => s.status === 'Available').length;

      setStats({
        totalFacilities: facilities.length,
        totalServices: services.length,
        availableFacilities: availableCount,
        totalRequests: requests.length
      });

      setRecentRequests(requests.slice(0, 5));
      setRecentStatuses(statuses.slice(0, 5));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const roleTitles = {
    admin: 'System Administrator (Full CRUD Access)',
    manager: 'Healthcare Facility Manager',
    staff: 'Healthcare Triage Staff',
    patient: 'Patient & Community Member'
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Role: {user?.role?.toUpperCase()}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.name || 'Healthcare Professional'}
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              {roleTitles[user?.role] || 'Safe Care Platform Member'}. Manage facilities, services, operational availability, and intelligent care recommendations.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {(isAdmin || isManager) && (
              <Link
                to="/facilities"
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-brand-500/25 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Add Healthcare Facility
              </Link>
            )}
            <Link
              to="/care-requests"
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition"
            >
              <Sparkles className="w-4 h-4" />
              New Care Request
            </Link>
          </div>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Facilities</div>
              <div className="text-3xl font-black text-slate-900 mt-1">{stats.totalFacilities}</div>
              <div className="text-xs text-brand-600 font-semibold mt-1">Hospitals & Clinics</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Medical Services</div>
              <div className="text-3xl font-black text-slate-900 mt-1">{stats.totalServices}</div>
              <div className="text-xs text-emerald-600 font-semibold mt-1">Active Specialties</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Facilities</div>
              <div className="text-3xl font-black text-slate-900 mt-1">{stats.availableFacilities}</div>
              <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Open for Intake
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Radio className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Care Requests</div>
              <div className="text-3xl font-black text-slate-900 mt-1">{stats.totalRequests}</div>
              <div className="text-xs text-purple-600 font-semibold mt-1">AI Scored Matches</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* QUICK CRUD ACTION TILES */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Healthcare Operations Hub</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Action 1 */}
            <Link
              to="/facilities"
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-brand-300 transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Healthcare Facilities</h3>
                <p className="text-xs text-slate-500">
                  {isAdmin
                    ? 'Create, edit, or remove hospitals & clinics.'
                    : isManager
                    ? 'Update your facility profile and contact details.'
                    : 'Search certified medical centers.'}
                </p>
              </div>
              <div className="mt-4 text-xs font-bold text-brand-600 flex items-center gap-1">
                Open Module 1 &rarr;
              </div>
            </Link>

            {/* Action 2 */}
            <Link
              to="/services"
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Medical Services</h3>
                <p className="text-xs text-slate-500">
                  {isAdmin || isManager
                    ? 'Add, update pricing, or delete hospital medical services.'
                    : 'Browse specialties, fees, and departments.'}
                </p>
              </div>
              <div className="mt-4 text-xs font-bold text-emerald-600 flex items-center gap-1">
                Open Module 2 &rarr;
              </div>
            </Link>

            {/* Action 3 */}
            <Link
              to="/status"
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-amber-300 transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Radio className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Facility Availability</h3>
                <p className="text-xs text-slate-500">
                  {isAdmin || isManager || isStaff
                    ? 'Update status (Available, Busy, Closed) & wait times.'
                    : 'View real-time operational status.'}
                </p>
              </div>
              <div className="mt-4 text-xs font-bold text-amber-600 flex items-center gap-1">
                Open Module 3 &rarr;
              </div>
            </Link>

            {/* Action 4 */}
            <Link
              to="/care-requests"
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-300 transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Care Requests & AI</h3>
                <p className="text-xs text-slate-500">
                  Submit care requests and evaluate smart ranked recommendations.
                </p>
              </div>
              <div className="mt-4 text-xs font-bold text-purple-600 flex items-center gap-1">
                Open Module 4 &rarr;
              </div>
            </Link>
          </div>
        </div>

        {/* TWO-COLUMN DETAILS: RECENT STATUSES & CARE REQUESTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Statuses */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-500" />
                Real-Time Operational Availability
              </h3>
              <Link to="/status" className="text-xs font-bold text-brand-600 hover:underline">
                View All &rarr;
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentStatuses.map((st) => (
                <div key={st._id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-sm text-slate-800">{st.facility?.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{st.facility?.city}</span>
                      <span>•</span>
                      <span>Wait: ~{st.currentWaitTimeMinutes}m</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    st.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-700'
                      : st.status === 'Busy'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {st.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Care Requests */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Recent Care Requests & AI Matches
              </h3>
              <Link to="/care-requests" className="text-xs font-bold text-brand-600 hover:underline">
                View All &rarr;
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentRequests.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No care requests submitted yet. Click "New Care Request" to submit one.
                </div>
              ) : (
                recentRequests.map((req) => (
                  <div key={req._id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-sm text-slate-800">{req.serviceRequired}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>Patient: {req.patientName}</span>
                        <span>•</span>
                        <span>{req.locationCity}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                        req.urgency === 'Emergency'
                          ? 'bg-rose-100 text-rose-700'
                          : req.urgency === 'High'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {req.urgency}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        LKR {Number(req.maxBudget || 0).toLocaleString()} budget
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
