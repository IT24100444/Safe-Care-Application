import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, PhoneCall, Mail, MapPin, ShieldCheck, HeartPulse } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Safe<span className="text-emerald-400">Care</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Safe Care is an intelligent online healthcare management system bridging patients with registered hospitals, verified medical services, real-time availability, and smart ranked recommendations.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                24/7 Live Triage Network Active
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">System Modules</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/facilities" className="hover:text-white transition">Facility Management</Link></li>
              <li><Link to="/services" className="hover:text-white transition">Medical Services Directory</Link></li>
              <li><Link to="/status" className="hover:text-white transition">Real-Time Facility Status</Link></li>
              <li><Link to="/care-requests" className="hover:text-white transition">Care Requests & AI Ranking</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition">Operational Dashboard</Link></li>
            </ul>
          </div>

          {/* Supported Roles */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Access & Roles</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                System Administrator
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                Healthcare Facility Manager
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Hospital Staff / Triage
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Patient / General Public
              </li>
            </ul>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Emergency Hotline</h4>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-extrabold text-base">
                <PhoneCall className="w-4 h-4 animate-bounce" />
                1990 / +94 11 269 1111
              </div>
              <p className="text-xs text-slate-400">
                National Medical Ambulance & 24/7 Emergency Dispatch
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Mail className="w-3.5 h-3.5 text-brand-400" />
              support@safecare.health
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Safe Care Online Healthcare Management System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Encrypted MongoDB Security (bcrypt + JWT)
            </span>
            <span>Healthcare Data Integrity Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
