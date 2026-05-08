import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import {
  ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  AreaChart, Area, LineChart, Line, Tooltip
} from 'recharts';
import { TrendingUp, Menu, Calendar, DollarSign } from 'lucide-react';

const Analytics = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  // --- FAKE DATA FOR DEMO ---

  // 1. Daily Tests Tracked (NEW GRAPH)
  const dailyTestsData = [
    { day: 'Mon', tests: 15 },
    { day: 'Tue', tests: 22 },
    { day: 'Wed', tests: 18 },
    { day: 'Thu', tests: 30 },
    { day: 'Fri', tests: 25 },
    { day: 'Sat', tests: 45 }, // Peak day
    { day: 'Sun', tests: 12 },
  ];

  // 2. Monthly Revenue Growth
  const revenueData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 11000 },
    { month: 'Apr', revenue: 22000 },
    { month: 'May', revenue: 28000 },
    { month: 'Jun', revenue: 35000 },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 transform ${showSidebar ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30`}>
        <Sidebar />
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6">
           <button onClick={() => setShowSidebar(!showSidebar)}>
             <Menu className="text-gray-700" />
           </button>
           <h1 className="font-bold text-lg">Analytics</h1>
        </div>

        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-blue-600" /> Business Intelligence (BI)
          </h1>
          <p className="text-gray-500 mt-1">
            Track daily operations, lab performance, and revenue growth.
          </p>
        </div>

        {/* --- ROW 1: DAILY TESTS & REVENUE --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* CHART 1: DAILY TESTS (NEW) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Calendar className="text-indigo-500 w-5 h-5"/> Daily Test Volume
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Tracking the number of tests conducted every day this week.
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <LineChart data={dailyTestsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} />
                  <Line type="monotone" dataKey="tests" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 bg-indigo-50 p-3 rounded text-xs text-indigo-700 font-semibold border border-indigo-100">
              📊 Insight: Peak lab activity happens on Saturdays (45 tests). Consider assigning extra staff for weekends.
            </div>
          </div>

          {/* CHART 2: REVENUE TREND */}
          <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition">
            <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <DollarSign className="text-green-500 w-5 h-5"/> Monthly Revenue
            </h3>
            <p className="text-xs text-gray-500 mb-6">
              Financial growth over the last 6 months.
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 bg-green-50 p-3 rounded text-xs text-green-700 font-semibold border border-green-100">
              💰 Insight: Revenue is up 190% since March due to the new automated booking system.
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Analytics;