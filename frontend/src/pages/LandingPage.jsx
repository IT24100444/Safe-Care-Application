import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  Building2,
  Stethoscope,
  Radio,
  Sparkles,
  ShieldCheck,
  Search,
  MapPin,
  Clock,
  ArrowRight,
  PhoneCall,
  CheckCircle,
  AlertTriangle,
  Zap,
  TrendingUp,
  HeartPulse,
  Award,
  Users
} from 'lucide-react';
import { facilityAPI, careRequestAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Match Widget state
  const [searchDepartment, setSearchDepartment] = useState('Dental');
  const [searchCity, setSearchCity] = useState('Colombo');
  const [searchUrgency, setSearchUrgency] = useState('High');
  const [searchBudget, setSearchBudget] = useState(25000);
  const [previewMatches, setPreviewMatches] = useState(null);
  const [matchingLoading, setMatchingLoading] = useState(false);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const res = await facilityAPI.getAll();
      if (res.data.success) {
        setFacilities(res.data.data.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to load facilities preview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantMatch = async (e) => {
    e.preventDefault();
    setMatchingLoading(true);
    try {
      const res = await careRequestAPI.previewRecommendations({
        department: searchDepartment,
        serviceRequired: `${searchDepartment} medical care`,
        locationCity: searchCity,
        urgency: searchUrgency,
        maxBudget: Number(searchBudget)
      });
      if (res.data.success) {
        setPreviewMatches(res.data.recommendations.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to run match preview:', err);
    } finally {
      setMatchingLoading(false);
    }
  };

  return (
    <div className="bg-medical-mesh min-h-screen">
      {/* Top Telemetry Alert Strip */}
      <div className="bg-slate-900 text-slate-300 py-2.5 px-4 text-xs font-semibold border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-white font-bold">Safe Care Network Online:</span>
            <span>Real-time availability monitoring active across registered healthcare facilities.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hidden sm:inline">Emergency Dispatch Hotline:</span>
            <a href="tel:1990" className="text-rose-400 font-bold hover:underline flex items-center gap-1">
              <PhoneCall className="w-3 h-3" /> 1990
            </a>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold tracking-wide shadow-sm">
                <Sparkles className="w-4 h-4 text-brand-600 animate-spin" />
                <span>Next-Gen Healthcare Management & Smart Match Engine</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Your Health, Connected. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-sky-500 to-emerald-500">
                  Real-Time Care, Ranked.
                </span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                Safe Care unifies <strong>Hospital & Clinic Management</strong>, <strong>Medical Services Linkage</strong>, <strong>Live Availability Status</strong>, and an intelligent <strong>Care Request Ranking Engine</strong> that instantly scores the best medical facility for your exact condition and location.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold text-base shadow-xl shadow-brand-500/25 flex items-center gap-2 transition transform hover:-translate-y-0.5"
                    >
                      <Sparkles className="w-5 h-5" />
                      Open Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/facilities"
                      className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-base border border-slate-200 shadow-md shadow-slate-200/50 flex items-center gap-2 transition"
                    >
                      <Building2 className="w-5 h-5 text-brand-600" />
                      Explore Facilities
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-bold text-base shadow-xl shadow-brand-500/25 flex items-center gap-2 transition transform hover:-translate-y-0.5"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      Get Started — Register
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/login"
                      className="px-7 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-base border border-slate-200 shadow-md shadow-slate-200/50 flex items-center gap-2 transition"
                    >
                      <Building2 className="w-5 h-5 text-brand-600" />
                      Sign In to Explore All
                    </Link>
                  </>
                )}
              </div>

              {/* Metric Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-xl">
                <div className="p-3 rounded-xl bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm">
                  <div className="text-2xl font-black text-brand-600">6+</div>
                  <div className="text-xs font-semibold text-slate-500">Certified Hospitals</div>
                </div>
                <div className="p-3 rounded-xl bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm">
                  <div className="text-2xl font-black text-emerald-600">18+</div>
                  <div className="text-xs font-semibold text-slate-500">Medical Services</div>
                </div>
                <div className="p-3 rounded-xl bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-sm">
                  <div className="text-2xl font-black text-purple-600">100%</div>
                  <div className="text-xs font-semibold text-slate-500">Real-Time Status</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual with Generated High-Tech Medical Image & Floating Telemetry */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 group">
                <img
                  src="/images/hero-banner.jpg"
                  alt="Safe Care Medical Hospital Telemetry"
                  className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating Telemetry Glass Card 1: Live Pulse */}
                <div className="absolute top-4 left-4 p-3 rounded-2xl glass-card-dark text-white shadow-xl animate-float">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 live-pulse-emerald"></span>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">Live Status</span>
                  </div>
                  <div className="text-sm font-bold mt-1 text-slate-100">Apex Central Emergency</div>
                  <div className="text-[11px] text-slate-300">Triage Wait: ~10 mins</div>
                </div>

                {/* Floating Telemetry Glass Card 2: AI Matching */}
                <div className="absolute bottom-4 right-4 p-3 rounded-2xl glass-card-dark text-white shadow-xl">
                  <div className="flex items-center gap-2 text-brand-300 text-xs font-bold">
                    <Zap className="w-3.5 h-3.5 text-brand-400" />
                    <span>Ranking Engine</span>
                  </div>
                  <div className="text-sm font-extrabold text-white mt-0.5">Top Match: 100% Score</div>
                  <div className="text-[10px] text-slate-300">Verified Service + Proximity + Budget</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* INTERACTIVE INSTANT MATCH WIDGET */}
      <section className="py-12 bg-white border-y border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white shadow-2xl relative overflow-hidden">
            {/* Background glow circle */}
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Interactive Test-Drive
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Try the Smart Recommendation Engine Live
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Select your health requirement to instantly rank matching facilities by live availability, proximity, and budget.
                  </p>
                </div>
                <Link
                  to={isAuthenticated ? "/care-requests" : "/login"}
                  className="self-start md:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/10 transition"
                >
                  {isAuthenticated ? "Open Full Care Request CRUD →" : "Sign In to Submit Care Request →"}
                </Link>
              </div>

              {/* Form Controls */}
              <form onSubmit={handleInstantMatch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Medical Specialty</label>
                  <select
                    value={searchDepartment}
                    onChange={(e) => setSearchDepartment(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-400"
                  >
                    <option value="Dental">Dental Care</option>
                    <option value="Cardiology">Cardiology & Heart</option>
                    <option value="General Consultation">General Medicine</option>
                    <option value="Emergency Care">Emergency Care</option>
                    <option value="Pediatrics">Pediatrics (Children)</option>
                    <option value="Orthopedics">Orthopedics & Joints</option>
                    <option value="Radiology & Imaging">Radiology (MRI/CT)</option>
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Your Location / City</label>
                  <select
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-400"
                  >
                    <option value="Colombo">Colombo</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Galle">Galle</option>
                  </select>
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Urgency Level</label>
                  <select
                    value={searchUrgency}
                    onChange={(e) => setSearchUrgency(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-400"
                  >
                    <option value="Emergency">Emergency (Immediate)</option>
                    <option value="High">High Urgency</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Routine / Low</option>
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Max Budget (LKR - Rs.)</label>
                  <input
                    type="number"
                    value={searchBudget}
                    onChange={(e) => setSearchBudget(Number(e.target.value))}
                    min="500"
                    step="500"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-400"
                  />
                </div>

                {/* Submit button */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={matchingLoading}
                    className="w-full bg-gradient-to-r from-brand-500 to-emerald-500 hover:from-brand-600 hover:to-emerald-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {matchingLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Run Ranking Match
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Instant Ranked Match Output */}
              {previewMatches && previewMatches.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-700/80">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Found {previewMatches.length} Scored Recommendations (Ranked by Engine):
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {previewMatches.map((item) => (
                      <div
                        key={item.service._id}
                        className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-xl flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-1 rounded-md bg-brand-500/20 text-brand-300 font-extrabold text-xs">
                              Rank #{item.rank}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-emerald-400 font-black text-sm">{item.matchScore}%</span>
                              <span className="text-[10px] text-slate-400">Match</span>
                            </div>
                          </div>

                          <h4 className="text-base font-bold text-white leading-tight">
                            {item.facility.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                            <span>{item.facility.city}</span>
                            <span className="mx-1">•</span>
                            <span className="text-emerald-300 font-medium">{item.liveStatus.status}</span>
                          </div>

                          <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Recommended Service:</span>
                            <span className="text-white font-semibold">{item.service.name}</span>
                            <div className="flex justify-between items-center mt-1 text-slate-300">
                              <span>Fee: LKR {Number(item.service?.fees || 0).toLocaleString()}</span>
                              <span className="text-slate-400">Wait: ~{item.liveStatus.currentWaitTimeMinutes}m</span>
                            </div>
                          </div>

                          <ul className="mt-3 space-y-1">
                            {item.highlights.slice(0, 2).map((h, i) => (
                              <li key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                                <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                          <a
                            href={`tel:${item.facility.contactNumber}`}
                            className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                          >
                            <PhoneCall className="w-3.5 h-3.5" /> Call Facility
                          </a>
                          <Link
                            to="/care-requests"
                            className="text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 px-3 py-1.5 rounded-lg transition"
                          >
                            Book Care
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* THE 4 PILLARS OF SAFE CARE */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-600 mb-2">
              System Architecture & Core Modules
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              4 Comprehensive CRUD Modules Engineered for Modern Healthcare
            </h3>
            <p className="text-slate-600 mt-3 text-base">
              Safe Care solves the fragmentation in traditional healthcare by linking facilities, services, operational availability, and patient requests into one unified database.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Module 1 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Module 1</div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">
                  Healthcare Facility Management
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Hospital & Clinic CRUD. Manage accredited institutions with address, city, phone, 24/7 emergency readiness, and total bed capacities.
                </p>
              </div>
              <Link
                to={isAuthenticated ? "/facilities" : "/login"}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                {isAuthenticated ? "Manage Facilities →" : "Sign In to Access Module 1 →"}
              </Link>
            </div>

            {/* Module 2 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5 group-hover:scale-110 transition-transform">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Module 2</div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">
                  Healthcare Service Management
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Medical Service CRUD. Connects specialized procedures (Cardiology, Dental, Diagnostics, Surgery) directly to registered facilities with standard fee schedules.
                </p>
              </div>
              <Link
                to={isAuthenticated ? "/services" : "/login"}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
              >
                {isAuthenticated ? "Manage Services →" : "Sign In to Access Module 2 →"}
              </Link>
            </div>

            {/* Module 3 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-5 group-hover:scale-110 transition-transform">
                  <Radio className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">Module 3</div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">
                  Facility Status & Availability
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Availability CRUD. Live operational monitoring (Available, Busy, Closed), wait times, and emergency department statuses preventing false referrals.
                </p>
              </div>
              <Link
                to={isAuthenticated ? "/status" : "/login"}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700"
              >
                {isAuthenticated ? "View Live Status →" : "Sign In to Access Module 3 →"}
              </Link>
            </div>

            {/* Module 4 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-5 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">Module 4</div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">
                  Care Requests & AI Ranking
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Care Request CRUD + Multi-Factor Ranking Engine. Scored against specialty, real-time status, proximity, urgency, and budget constraints.
                </p>
              </div>
              <Link
                to={isAuthenticated ? "/care-requests" : "/login"}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700"
              >
                {isAuthenticated ? "Care Requests & AI →" : "Sign In to Access Module 4 →"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED REGISTERED FACILITIES PREVIEW */}
      <section className="py-20 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-600 mb-2">
                Verified Medical Centers
              </h2>
              <h3 className="text-3xl font-extrabold text-slate-900">
                Top Healthcare Facilities Near You
              </h3>
            </div>
            <Link
              to="/facilities"
              className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 self-start"
            >
              View All Facilities ({facilities.length}+) &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {facilities.map((fac) => (
              <div
                key={fac._id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-200">
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
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        {fac.liveStatus || 'Available'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {fac.city}
                      </span>
                      <span className="font-bold text-amber-500">★ {fac.rating || 4.8}</span>
                    </div>

                    <h4 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                      {fac.name}
                    </h4>

                    <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed mb-4">
                      {fac.description}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-brand-500" />
                        {fac.operatingHours}
                      </span>
                      {fac.emergency24x7 && (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <HeartPulse className="w-3.5 h-3.5" /> 24/7 Emergency
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    to={isAuthenticated ? "/facilities" : "/login"}
                    className="w-full block text-center py-2.5 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-700 text-xs font-bold transition"
                  >
                    {isAuthenticated ? "View Facility Details" : "Sign In to View Full Details"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 lg:p-14 rounded-3xl bg-gradient-to-r from-brand-600 via-sky-600 to-emerald-600 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white font-bold text-xs uppercase tracking-wider">
                Get Connected Today
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
                Ready for Smart, Reliable Healthcare Management?
              </h2>
              <p className="text-brand-50 text-sm leading-relaxed">
                Sign in with our instant demo roles or create a personal account to manage hospital facilities, register medical services, update operational status, or request ranked care.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-8 py-4 rounded-2xl bg-white text-brand-700 font-extrabold text-sm shadow-xl hover:bg-slate-50 transition transform hover:-translate-y-0.5"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 rounded-2xl bg-brand-800/60 hover:bg-brand-800 text-white font-extrabold text-sm border border-white/20 transition"
              >
                Demo Role Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
