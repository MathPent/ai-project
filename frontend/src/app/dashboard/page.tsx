"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [userName] = useState("Farmer");

  // Chart data for environmental setup
  const climateData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: [28, 29, 31, 30, 28, 27, 29],
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const cropData = {
    labels: ['Wheat', 'Corn', 'Tomato', 'Potato'],
    datasets: [
      {
        label: 'Healthy Area (Hectares)',
        data: [12, 19, 3, 5],
        backgroundColor: '#22c55e',
      },
      {
        label: 'Infected Area (Hectares)',
        data: [2, 3, 1.5, 0.5],
        backgroundColor: '#ef4444',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#f8fafc' } },
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } },
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-10 flex flex-col gap-8">
      <header className="flex justify-between items-center bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-agrigreen-400 to-blue-400">Welcome Back, {userName}</h1>
          <p className="text-slate-400">Here is your farm&apos;s overview for today.</p>
        </div>
        <div className="flex gap-4 border-l border-slate-700 pl-6 border-l-2">
           <Link href="/scanner" className="bg-agrigreen-600 hover:bg-agrigreen-500 px-6 py-2 rounded-lg font-bold transition">Scan Crop</Link>
           <Link href="/areas" className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-bold transition">Map Analysis</Link>
           <Link href="/community" className="bg-purple-600 hover:bg-purple-500 px-6 py-2 rounded-lg font-bold transition">Community</Link>
        </div>
      </header>

      {/* Widgets row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-6 border-l-4 border-l-agrigreen-500 flex flex-col justify-center">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Avg Soil Moisture</h3>
          <p className="text-4xl font-extrabold">42%</p>
          <span className="text-agrigreen-400 text-sm mt-1">Optimal Range</span>
        </div>
        <div className="glass-panel p-6 border-l-4 border-l-orange-500 flex flex-col justify-center">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Last Scan</h3>
          <p className="text-2xl font-bold">Tomato</p>
          <span className="text-red-400 text-sm mt-1">Early Blight Detected (2d ago)</span>
        </div>
        <div className="glass-panel p-6 border-l-4 border-l-blue-500 flex flex-col justify-center">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Rainfall Forecast</h3>
          <p className="text-4xl font-extrabold">24mm</p>
          <span className="text-blue-400 text-sm mt-1">Heavy showers expected Wed</span>
        </div>
        <div className="glass-panel p-6 border-l-4 border-l-purple-500 flex flex-col justify-center">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Community Hits</h3>
          <p className="text-4xl font-extrabold">12</p>
          <span className="text-purple-400 text-sm mt-1">New comments on your post</span>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        <div className="glass-panel p-6 flex flex-col">
          <h3 className="text-lg font-bold mb-4">Weekly Climate Trend</h3>
          <div className="flex-1 relative">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Line data={climateData} options={chartOptions as any} />
          </div>
        </div>
        <div className="glass-panel p-6 flex flex-col">
          <h3 className="text-lg font-bold mb-4">Crop Health Distribution</h3>
          <div className="flex-1 relative">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Bar data={cropData} options={chartOptions as any} />
          </div>
        </div>
      </div>
    </div>
  );
}
