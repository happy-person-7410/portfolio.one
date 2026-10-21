import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Check, 
  Search, 
  Heart, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  Sparkles,
  Filter
} from 'lucide-react';
import { Project } from '../types';

interface InteractivePreviewProps {
  project: Project;
}

export const InteractiveProjectPreview: React.FC<InteractivePreviewProps> = ({ project }) => {
  // 1. Dental Clinic State
  const [dentalDate, setDentalDate] = useState('Tomorrow, 10:30 AM');
  const [dentalDoctor, setDentalDoctor] = useState('Dr. Sarah Chen (Orthodontics)');
  const [dentalService, setDentalService] = useState('Dental Cleaning & Exam');
  const [dentalConfirmed, setDentalConfirmed] = useState(false);

  // 2. Restaurant State
  const [diningGuests, setDiningGuests] = useState('2 Guests');
  const [diningTime, setDiningTime] = useState('7:30 PM');
  const [activeMenuTab, setActiveMenuTab] = useState<'mains' | 'wine'>('mains');
  const [tableReserved, setTableReserved] = useState(false);

  // 3. Real Estate State
  const [realEstateBedrooms, setRealEstateBedrooms] = useState('3 Beds');
  const [priceMax, setPriceMax] = useState('৳1.2 Crore');
  const [savedProperty, setSavedProperty] = useState<string | null>(null);

  // 4. TaskFlow Dashboard State
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<Record<string, boolean>>({
    'Design System Audit': true,
    'Stripe Checkout Flow': false,
    'PostgreSQL Schema Sync': true,
  });

  // 5. StyleHub Store State
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Graphite');
  const [cartCount, setCartCount] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // 6. CleanPro Calculator
  const [cleanRooms, setCleanRooms] = useState(2);
  const [cleanBathrooms, setCleanBathrooms] = useState(2);

  // 7. FitLife Gym
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Render specific interactive module based on project id
  if (project.id === 'brightsmile-dental') {
    return (
      <div className="bg-neutral-900 text-white p-6 rounded-2xl border border-neutral-800 space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Live Booking Engine Prototype</span>
          </div>
          <span className="text-xs text-neutral-400">BrightSmile Portal v2.4</span>
        </div>

        {dentalConfirmed ? (
          <div className="p-6 bg-emerald-950/40 border border-emerald-800/80 rounded-xl text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Appointment Confirmed!</h4>
            <p className="text-xs text-emerald-200">
              Scheduled with <strong>{dentalDoctor}</strong> for <strong>{dentalService}</strong> on <strong>{dentalDate}</strong>.
            </p>
            <button
              onClick={() => setDentalConfirmed(false)}
              className="mt-2 text-xs text-neutral-300 hover:text-white underline cursor-pointer"
            >
              Book another test slot
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Select Practitioner</label>
                <select
                  value={dentalDoctor}
                  onChange={(e) => setDentalDoctor(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-neutral-200 focus:outline-none focus:border-blue-500"
                >
                  <option>Dr. Sarah Chen (Orthodontics)</option>
                  <option>Dr. Michael Vance (General Dentistry)</option>
                  <option>Dr. Lisa Rodriguez (Cosmetic)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Service Type</label>
                <select
                  value={dentalService}
                  onChange={(e) => setDentalService(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-neutral-200 focus:outline-none focus:border-blue-500"
                >
                  <option>Dental Cleaning & Exam</option>
                  <option>Invisalign Consultation</option>
                  <option>Teeth Whitening Express</option>
                  <option>Emergency Tooth Repair</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1.5">Available Time Slots</label>
              <div className="grid grid-cols-3 gap-2">
                {['Tomorrow, 9:00 AM', 'Tomorrow, 10:30 AM', 'Tomorrow, 2:15 PM'].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setDentalDate(slot)}
                    className={`py-2 px-3 text-xs rounded-lg border text-center transition-all cursor-pointer ${
                      dentalDate === slot
                        ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                        : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'
                    }`}
                  >
                    {slot.replace('Tomorrow, ', '')}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setDentalConfirmed(true)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              Confirm Simulated Appointment
            </button>
          </div>
        )}
      </div>
    );
  }

  if (project.id === 'urbaneats-restaurant') {
    return (
      <div className="bg-neutral-900 text-white p-6 rounded-2xl border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">UrbanEats Reservation & Menu Engine</span>
          <span className="text-xs text-neutral-400">Live Prototype</span>
        </div>

        {tableReserved ? (
          <div className="p-5 bg-amber-950/40 border border-amber-800/80 rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-amber-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Table Reserved for Tonight!</h4>
            <p className="text-xs text-amber-200">Party of {diningGuests} at {diningTime}. SMS confirmation sent.</p>
            <button onClick={() => setTableReserved(false)} className="text-xs text-neutral-400 underline cursor-pointer mt-1">
              Reset Reservation Demo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Guests</label>
                <select
                  value={diningGuests}
                  onChange={(e) => setDiningGuests(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-neutral-200"
                >
                  <option>2 Guests</option>
                  <option>4 Guests</option>
                  <option>6 Guests</option>
                </select>
              </div>
              <div>
                <label className="block text-neutral-400 mb-1">Time</label>
                <select
                  value={diningTime}
                  onChange={(e) => setDiningTime(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-neutral-200"
                >
                  <option>6:30 PM</option>
                  <option>7:30 PM</option>
                  <option>8:45 PM</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setTableReserved(true)}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Test Reserve Table
            </button>
          </div>
        )}
      </div>
    );
  }

  if (project.id === 'taskflow-dashboard') {
    return (
      <div className="bg-neutral-900 text-white p-6 rounded-2xl border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Interactive SaaS Control Bar</span>
          <div className="flex gap-1 bg-neutral-800 p-1 rounded-lg text-xs">
            {(['7d', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  period === p ? 'bg-blue-600 text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 bg-neutral-800/70 rounded-xl border border-neutral-700/60">
            <span className="text-xs text-neutral-400 block">MRR Growth</span>
            <span className="text-base font-bold text-white font-mono">{period === '7d' ? '+৳34,000' : period === '30d' ? '+৳1,48,000' : '+৳4,82,000'}</span>
          </div>
          <div className="p-3 bg-neutral-800/70 rounded-xl border border-neutral-700/60">
            <span className="text-xs text-neutral-400 block">Active Users</span>
            <span className="text-base font-bold text-white font-mono">{period === '7d' ? '4,120' : period === '30d' ? '18,450' : '48,200'}</span>
          </div>
          <div className="p-3 bg-neutral-800/70 rounded-xl border border-neutral-700/60">
            <span className="text-xs text-neutral-400 block">Conversion</span>
            <span className="text-base font-bold text-emerald-400 font-mono">3.8%</span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <span className="text-neutral-400 font-semibold block">Live Pipeline Tasks (Click to toggle)</span>
          {Object.entries(selectedTaskStatus).map(([task, done]) => (
            <div
              key={task}
              onClick={() => setSelectedTaskStatus({ ...selectedTaskStatus, [task]: !done })}
              className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 cursor-pointer border border-neutral-700/60"
            >
              <span className={`text-neutral-200 ${done ? 'line-through text-neutral-500' : ''}`}>{task}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${done ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'}`}>
                {done ? 'Completed' : 'In Progress'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (project.id === 'stylehub-store') {
    return (
      <div className="bg-neutral-900 text-white p-6 rounded-2xl border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Interactive E-Commerce Product Swatch</span>
          <div className="flex items-center gap-1.5 text-xs text-neutral-300 bg-neutral-800 px-2.5 py-1 rounded-lg">
            <ShoppingBag className="w-3.5 h-3.5 text-rose-400" />
            <span>Bag: {cartCount} items</span>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Minimalist Wool Overshirt</h4>
            <p className="text-xs text-neutral-400">৳4,500 · Express Shipping</p>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 bg-neutral-800 text-emerald-400 rounded">In Stock</span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-neutral-400 block mb-1.5">Color: {selectedColor}</span>
            <div className="flex gap-2">
              {['Graphite', 'Oatmeal', 'Navy'].map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer ${
                    selectedColor === color ? 'bg-white text-black font-semibold' : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-neutral-400 block mb-1.5">Size</span>
            <div className="flex gap-2">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center text-xs cursor-pointer ${
                    selectedSize === size ? 'bg-rose-600 border-rose-500 text-white font-bold' : 'bg-neutral-800 border-neutral-700 text-neutral-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setCartCount(cartCount + 1);
            setAddedAnimation(true);
            setTimeout(() => setAddedAnimation(false), 1200);
          }}
          className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{addedAnimation ? 'Added to Bag ✓' : `Add ${selectedColor} (${selectedSize}) to Bag`}</span>
        </button>
      </div>
    );
  }

  // Default interactive calculator for other projects
  return (
    <div className="bg-neutral-900 text-white p-6 rounded-2xl border border-neutral-800 space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Interactive Project Features Demo</span>
        <span className="text-xs text-neutral-400">Frontend Prototype</span>
      </div>
      <p className="text-xs text-neutral-300 leading-relaxed">
        This custom interface was built with reusable React modular components, strict TypeScript data contracts, and tailwind styling for sub-second page performance.
      </p>
      <div className="p-4 bg-neutral-800/80 rounded-xl flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold block text-white">Client Handover Ready</span>
          <span className="text-neutral-400">Clean source code & documentation included</span>
        </div>
        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-semibold rounded-md">Verified</span>
      </div>
    </div>
  );
};
