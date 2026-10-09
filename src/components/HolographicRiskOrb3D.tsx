import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HolographicRiskOrb3DProps {
  score: number;
  level: 'SAFE' | 'SUSPICIOUS' | 'HIGH RISK' | 'CRITICAL';
}

export const HolographicRiskOrb3D: React.FC<HolographicRiskOrb3DProps> = ({ score, level }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = 160;
    const height = 160;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 3.6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // Color theme based on risk level
    let hexColor = 0x06b6d4; // Cyan
    let secondaryColor = 0x3b82f6;

    if (level === 'CRITICAL') {
      hexColor = 0xf43f5e; // Rose Red
      secondaryColor = 0xe11d48;
    } else if (level === 'HIGH RISK') {
      hexColor = 0xf97316; // Orange
      secondaryColor = 0xeab308;
    } else if (level === 'SUSPICIOUS') {
      hexColor = 0xf59e0b; // Amber
      secondaryColor = 0xd97706;
    } else if (level === 'SAFE') {
      hexColor = 0x10b981; // Emerald
      secondaryColor = 0x06b6d4;
    }

    // Outer Torus Ring
    const torusGeom = new THREE.TorusGeometry(1.2, 0.025, 4, 48);
    const torusMat = new THREE.MeshBasicMaterial({
      color: hexColor,
      transparent: true,
      opacity: 0.65
    });
    const ring1 = new THREE.Mesh(torusGeom, torusMat);
    ring1.rotation.x = Math.PI / 3;
    orbGroup.add(ring1);

    // Second Orthogonal Ring
    const torus2Geom = new THREE.TorusGeometry(1.35, 0.018, 4, 48);
    const torus2Mat = new THREE.MeshBasicMaterial({
      color: secondaryColor,
      transparent: true,
      opacity: 0.5
    });
    const ring2 = new THREE.Mesh(torus2Geom, torus2Mat);
    ring2.rotation.y = Math.PI / 4;
    orbGroup.add(ring2);

    // Central Wireframe Sphere
    const sphereGeom = new THREE.SphereGeometry(0.85, 14, 14);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: hexColor,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    orbGroup.add(sphere);

    // Glowing Particle Nucleus
    const pCount = 60;
    const pGeom = new THREE.BufferGeometry();
    const pPositions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const r = 0.5 + Math.random() * 0.4;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      pPositions[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pPositions[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pPositions[i * 3 + 2] = r * Math.cos(ph);
    }
    pGeom.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: hexColor,
      size: 0.05,
      transparent: true,
      opacity: 0.9
    });
    const points = new THREE.Points(pGeom, pMat);
    orbGroup.add(points);

    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      ring1.rotation.z += 0.015;
      ring2.rotation.x += 0.012;
      sphere.rotation.y += 0.008;
      points.rotation.y -= 0.010;

      // Pulse based on risk
      const pulseSpeed = level === 'CRITICAL' ? 5 : 2;
      const s = 1.0 + Math.sin(elapsed * pulseSpeed) * 0.06;
      sphere.scale.set(s, s, s);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
      torusGeom.dispose();
      torus2Geom.dispose();
      sphereGeom.dispose();
      pGeom.dispose();
    };
  }, [score, level]);

  return (
    <div className="relative inline-flex items-center justify-center w-32 h-32 sm:w-36 sm:h-36">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight drop-shadow-md">
          {score}
        </span>
        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
          / 100
        </span>
      </div>
    </div>
  );
};
