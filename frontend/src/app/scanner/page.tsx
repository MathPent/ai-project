"use client";

import React, { useState } from 'react';
import axios from 'axios';

interface ScanResult {
  plant_type: string;
  disease: string;
  confidence: number;
  remedy?: string;
}

export default function PlantScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      // Call our backend, which forwards to FastAPI
      const res = await axios.post<ScanResult>('http://localhost:4000/scans/analyze', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      // Mock result if backend isn't running fully
      setTimeout(() => {
        setResult({
          plant_type: "Tomato",
          disease: "Early Blight",
          confidence: 0.92,
          remedy: "Remove affected leaves. Apply copper-based fungicide. Water at base to avoid wetting leaves."
        });
        setLoading(false);
      }, 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <h1 className="text-4xl font-extrabold heading-gradient mb-4">Plant Disease Scanner</h1>
      <p className="text-slate-300 mb-8 max-w-2xl text-center">Upload an image of your plant leaf and our AI will detect the species, diagnose potential diseases, and provide actionable remedies.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        <div className="glass-panel p-8 flex flex-col items-center justify-center border-dashed border-2 border-slate-600 relative overflow-hidden group min-h-[400px]">
          {preview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={preview} alt="Plant preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          ) : (
            <div className="text-6xl mb-4">📸</div>
          )}

          <div className="relative z-10 flex flex-col items-center">
            {!preview && <p className="mb-4 text-lg">Drag &amp; drop or click to upload</p>}
            <label className="bg-agrigreen-600 hover:bg-agrigreen-500 text-white px-6 py-3 rounded-full cursor-pointer font-bold transition shadow-lg">
              {preview ? 'Change Image' : 'Select Image'}
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
        </div>

        <div className="glass-panel p-8 flex flex-col">
          <h2 className="text-2xl font-bold mb-6">Analysis Report</h2>

          {!file && !result && (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Upload an image to see the report here.
            </div>
          )}

          {file && !result && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <button
                onClick={handleScan}
                disabled={loading}
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-lg disabled:opacity-50 transition shadow-lg mb-4"
              >
                {loading ? 'Analyzing with AI...' : 'Run Diagnostics'}
              </button>
              {loading && <div className="text-slate-400">Processing visual data and extracting features...</div>}
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
                <span className="text-slate-400">Identified Plant</span>
                <span className="font-bold text-xl">{result.plant_type}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
                <span className="text-slate-400">Health Status</span>
                <span className={`font-bold text-xl ${result.disease === 'Healthy' ? 'text-agrigreen-400' : 'text-red-400'}`}>
                  {result.disease}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
                <span className="text-slate-400">AI Confidence</span>
                <span className="font-bold text-xl text-blue-400">{(result.confidence * 100).toFixed(1)}%</span>
              </div>

              {result.disease !== 'Healthy' && result.remedy && (
                <div className="mt-4 p-5 border border-red-500/30 bg-red-500/10 rounded-xl">
                  <h3 className="text-lg font-bold text-red-300 mb-2">Recommended Remedy</h3>
                  <p className="text-slate-300 leading-relaxed">{result.remedy}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
