"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

function AnimatedGlobe() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sphereRef = useRef<any>(null);
  useFrame(() => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.005;
      sphereRef.current.rotation.x += 0.002;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1.5, 64, 64]} scale={1.5}>
      <MeshDistortMaterial
        color="#22c55e"
        envMapIntensity={0.5}
        clearcoat={0.8}
        clearcoatRoughness={0}
        metalness={0.2}
        roughness={0.3}
        distort={0.4}
        speed={1.5}
      />
    </Sphere>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <AnimatedGlobe />
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* Navbar */}
      <nav className="glass-panel mx-6 mt-6 px-8 py-4 flex justify-between items-center relative z-10">
        <div className="text-2xl font-bold tracking-tighter heading-gradient">AgroTech AI</div>
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2 rounded-full font-medium text-slate-300 hover:text-white transition">Login</Link>
          <Link href="/signup" className="px-5 py-2 rounded-full font-medium bg-agrigreen-600 hover:bg-agrigreen-500 text-white transition">Get Started</Link>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 mt-12">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 max-w-4xl leading-tight">
          Pioneering <span className="heading-gradient">Agricultural Intelligence</span> for the Future
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
          Monitor plant health via AI diagnostics, explore environment indices using Google Earth Engine, and connect with a global community.
        </p>
        
        <div className="flex flex-wrap gap-6 justify-center">
          <Link href="/dashboard" className="px-8 py-4 rounded-full font-bold bg-gradient-to-r from-agrigreen-600 to-blue-600 hover:scale-105 transition-transform shadow-lg shadow-agrigreen-500/20">
            Explore Dashboard
          </Link>
          <Link href="/areas" className="px-8 py-4 rounded-full font-bold glass-panel hover:bg-slate-800 transition-colors">
            Analyze Land
          </Link>
        </div>
      </main>

      {/* Features Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 px-8 py-20 max-w-7xl mx-auto">
        <div className="glass-panel p-8 hover:-translate-y-2 transition-transform">
          <div className="w-12 h-12 bg-agrigreen-500/20 rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl">🌍</span>
          </div>
          <h3 className="text-xl font-bold mb-3">Satellite Analytics</h3>
          <p className="text-slate-400">Compute NDVI, NDWI and gather crucial climatic data directly powered by Google Earth Engine.</p>
        </div>
        <div className="glass-panel p-8 hover:-translate-y-2 transition-transform">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl">🌱</span>
          </div>
          <h3 className="text-xl font-bold mb-3">AI Disease Detection</h3>
          <p className="text-slate-400">Scan any plant to identify its species and discover potential diseases along with verified organic remedies.</p>
        </div>
        <div className="glass-panel p-8 hover:-translate-y-2 transition-transform">
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl">🧑‍🌾</span>
          </div>
          <h3 className="text-xl font-bold mb-3">Farmer Community</h3>
          <p className="text-slate-400">Share your experiences, learn from experts, and discuss real-time farming solutions in our social feed.</p>
        </div>
      </div>
    </div>
  );
}
