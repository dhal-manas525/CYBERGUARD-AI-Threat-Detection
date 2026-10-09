import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { ThreatLevel } from '../../types';

interface CyberSecurityCoreProps {
  threatLevel?: ThreatLevel | 'IDLE';
  className?: string;
  interactive?: boolean;
}

export const CyberSecurityCore: React.FC<CyberSecurityCoreProps> = ({
  threatLevel = 'IDLE',
  className = 'h-96 w-full',
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Determine colors based on threat state
    let coreColorHex = 0x00f2fe; // Cyan
    let ringColorHex = 0x38bdf8; // Sky
    let particleColorHex = 0x818cf8; // Indigo
    let rotationSpeedMultiplier = 1.0;

    if (threatLevel === 'SAFE') {
      coreColorHex = 0x10b981; // Emerald
      ringColorHex = 0x34d399;
      particleColorHex = 0x059669;
      rotationSpeedMultiplier = 0.8;
    } else if (threatLevel === 'SUSPICIOUS') {
      coreColorHex = 0xf59e0b; // Amber
      ringColorHex = 0xfbbf24;
      particleColorHex = 0xd97706;
      rotationSpeedMultiplier = 1.3;
    } else if (threatLevel === 'HIGH RISK' || threatLevel === 'CRITICAL') {
      coreColorHex = 0xef4444; // Neon Red / Crimson
      ringColorHex = 0xf87171;
      particleColorHex = 0xdc2626;
      rotationSpeedMultiplier = 1.8;
    }

    // 1. Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 7;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL not supported, falling back gracefully', e);
      return;
    }

    // 2. Objects
    const group = new THREE.Group();
    scene.add(group);

    // Central Security Core (Icosahedron + Wireframe)
    const coreGeometry = new THREE.IcosahedronGeometry(1.2, 1);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: coreColorHex,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(coreMesh);

    // Inner Solid Glow Sphere
    const innerGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: coreColorHex,
      transparent: true,
      opacity: 0.35,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerMesh);

    // Security Gimbal Rings
    const ringGeo1 = new THREE.TorusGeometry(2.0, 0.02, 16, 64);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: ringColorHex, transparent: true, opacity: 0.6 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    group.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.4, 0.015, 16, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: ringColorHex, transparent: true, opacity: 0.4 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    group.add(ring2);

    // Floating Network Nodes (Point Cloud)
    const nodeCount = 90;
    const nodeGeo = new THREE.BufferGeometry();
    const nodePositions = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount * 3; i += 3) {
      const radius = 2.5 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      nodePositions[i] = radius * Math.sin(phi) * Math.cos(theta);
      nodePositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      nodePositions[i + 2] = radius * Math.cos(phi);
    }
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    const nodeMat = new THREE.PointsMaterial({
      color: particleColorHex,
      size: 0.06,
      transparent: true,
      opacity: 0.75,
    });
    const nodePoints = new THREE.Points(nodeGeo, nodeMat);
    group.add(nodePoints);

    // Mouse tracking for parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 1.2;
      targetY = y * 1.2;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth mouse damping
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      group.rotation.y = elapsed * 0.25 * rotationSpeedMultiplier + mouseX;
      group.rotation.x = mouseY * 0.6;

      coreMesh.rotation.x = elapsed * 0.3 * rotationSpeedMultiplier;
      coreMesh.rotation.y = elapsed * 0.4 * rotationSpeedMultiplier;

      ring1.rotation.z = elapsed * 0.2 * rotationSpeedMultiplier;
      ring2.rotation.x = elapsed * 0.15 * rotationSpeedMultiplier;

      // Subtle breath scaling
      const breath = 1.0 + Math.sin(elapsed * 2.5) * 0.04;
      innerMesh.scale.set(breath, breath, breath);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      resizeObserver.disconnect();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, [threatLevel, interactive]);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {/* Three.js canvas container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
      
      {/* Decorative cyber grid backdrop */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent opacity-60" />
    </div>
  );
};
