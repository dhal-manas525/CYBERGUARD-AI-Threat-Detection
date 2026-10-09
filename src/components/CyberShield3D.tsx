import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, RotateCcw, Shield, Sparkles, Activity, AlertOctagon } from 'lucide-react';

interface CyberShield3DProps {
  status?: 'IDLE' | 'SCANNING' | 'SAFE' | 'SUSPICIOUS' | 'HIGH RISK' | 'CRITICAL';
  score?: number;
  interactive?: boolean;
  compact?: boolean;
}

export const CyberShield3D: React.FC<CyberShield3DProps> = ({
  status = 'IDLE',
  score = 0,
  interactive = true,
  compact = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [camMode, setCamMode] = useState<'AUTO' | 'FREE'>('AUTO');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || (compact ? 320 : 600);
    const height = compact ? 260 : 380;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = compact ? 5.2 : 4.6;

    // 2. WebGL Renderer with Alpha
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group to hold all 3D cyber objects
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Colors mapping based on security state
    let primaryHex = 0x06b6d4; // Cyan
    let secondaryHex = 0x6366f1; // Indigo
    let glowHex = 0x38bdf8;

    if (status === 'SCANNING') {
      primaryHex = 0x818cf8; // Violet
      secondaryHex = 0x38bdf8; // Sky
      glowHex = 0xc084fc;
    } else if (status === 'CRITICAL') {
      primaryHex = 0xf43f5e; // Crimson Rose
      secondaryHex = 0xe11d48; // Deep Red
      glowHex = 0xfb7185;
    } else if (status === 'HIGH RISK') {
      primaryHex = 0xf97316; // Orange
      secondaryHex = 0xeab308; // Yellow
      glowHex = 0xfbbf24;
    } else if (status === 'SUSPICIOUS') {
      primaryHex = 0xf59e0b; // Amber
      secondaryHex = 0xd97706;
      glowHex = 0xfcd34d;
    } else if (status === 'SAFE') {
      primaryHex = 0x10b981; // Emerald
      secondaryHex = 0x06b6d4; // Cyan
      glowHex = 0x34d399;
    }

    // 3. Central Holographic Core (Wireframe Icosahedron)
    const coreGeometry = new THREE.IcosahedronGeometry(1.25, 2);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: primaryHex,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    coreGroup.add(coreMesh);

    // 4. Inner Nucleus Sphere with pulsating opacity
    const innerGeom = new THREE.SphereGeometry(0.75, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: glowHex,
      transparent: true,
      opacity: 0.15,
      wireframe: true
    });
    const innerSphere = new THREE.Mesh(innerGeom, innerMat);
    coreGroup.add(innerSphere);

    // 5. Geodesic Vertex Point Cloud
    const vertexPositions: number[] = [];
    const corePosAttr = coreGeometry.attributes.position;
    for (let i = 0; i < corePosAttr.count; i++) {
      vertexPositions.push(corePosAttr.getX(i), corePosAttr.getY(i), corePosAttr.getZ(i));
    }
    const pointsGeom = new THREE.BufferGeometry();
    pointsGeom.setAttribute('position', new THREE.Float32BufferAttribute(vertexPositions, 3));
    const pointsMat = new THREE.PointsMaterial({
      color: glowHex,
      size: compact ? 0.045 : 0.055,
      transparent: true,
      opacity: 0.85
    });
    const pointCloud = new THREE.Points(pointsGeom, pointsMat);
    coreGroup.add(pointCloud);

    // 6. Cyber Orbital Rings
    const createRing = (radius: number, tube: number, rotX: number, rotY: number, color: number) => {
      const ringGeom = new THREE.TorusGeometry(radius, tube, 3, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.55
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = rotX;
      ring.rotation.y = rotY;
      return ring;
    };

    const ring1 = createRing(1.85, 0.012, Math.PI / 3, 0, primaryHex);
    const ring2 = createRing(2.15, 0.010, -Math.PI / 4, Math.PI / 6, secondaryHex);
    const ring3 = createRing(2.4, 0.008, Math.PI / 2.2, -Math.PI / 4, glowHex);

    coreGroup.add(ring1);
    coreGroup.add(ring2);
    coreGroup.add(ring3);

    // 7. Swirling Particle Defense Field (Satellite packets)
    const particleCount = compact ? 120 : 250;
    const particleGeom = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleSpeeds: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.4 + Math.random() * 1.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePos[i * 3 + 2] = radius * Math.cos(phi);

      particleSpeeds.push((Math.random() - 0.5) * 0.02);
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: glowHex,
      size: compact ? 0.03 : 0.038,
      transparent: true,
      opacity: 0.75
    });
    const defenseParticles = new THREE.Points(particleGeom, particleMat);
    coreGroup.add(defenseParticles);

    // 8. Simulated Active Threat Vectors / Target Beacons
    const beaconCount = status === 'CRITICAL' ? 5 : (status === 'SAFE' ? 2 : 3);
    const beaconGroup = new THREE.Group();
    coreGroup.add(beaconGroup);

    for (let b = 0; b < beaconCount; b++) {
      const bGeom = new THREE.SphereGeometry(0.08, 12, 12);
      const bMat = new THREE.MeshBasicMaterial({
        color: status === 'CRITICAL' ? 0xff2244 : (status === 'SAFE' ? 0x10b981 : 0x38bdf8)
      });
      const bMesh = new THREE.Mesh(bGeom, bMat);

      const angle = (b / beaconCount) * Math.PI * 2;
      bMesh.position.set(Math.cos(angle) * 1.28, Math.sin(angle * 2) * 0.5, Math.sin(angle) * 1.28);
      beaconGroup.add(bMesh);

      // Connecting radar line from center to beacon
      const lineMat = new THREE.LineBasicMaterial({
        color: status === 'CRITICAL' ? 0xff4466 : 0x06b6d4,
        transparent: true,
        opacity: 0.4
      });
      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        bMesh.position
      ]);
      const line = new THREE.Line(lineGeom, lineMat);
      beaconGroup.add(line);
    }

    // Interactive Drag Rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      setCamMode('FREE');
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        targetRotY += deltaX * 0.006;
        targetRotX += deltaY * 0.006;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    if (interactive) {
      domElement.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const speedMultiplier = status === 'SCANNING' ? 2.8 : 1.0;

      // Base Core rotations
      if (camMode === 'AUTO') {
        coreGroup.rotation.y += 0.005 * speedMultiplier;
        coreGroup.rotation.x = Math.sin(elapsed * 0.5) * 0.15;
      } else {
        coreGroup.rotation.y += (targetRotY - coreGroup.rotation.y) * 0.1;
        coreGroup.rotation.x += (targetRotX - coreGroup.rotation.x) * 0.1;
      }

      // Independent ring rotations
      ring1.rotation.z += 0.012 * speedMultiplier;
      ring2.rotation.z -= 0.009 * speedMultiplier;
      ring3.rotation.z += 0.015 * speedMultiplier;

      // Pulsate inner core
      const pulse = 1.0 + Math.sin(elapsed * (status === 'SCANNING' ? 6 : 2.5)) * 0.08;
      innerSphere.scale.set(pulse, pulse, pulse);

      // Rotate particle defense field
      defenseParticles.rotation.y += 0.002 * speedMultiplier;

      // Flare beacons
      beaconGroup.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          const s = 1.0 + Math.sin(elapsed * 5 + index) * 0.25;
          child.scale.set(s, s, s);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = compact ? 260 : 380;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        domElement.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }
      renderer.dispose();
      coreGeometry.dispose();
      innerGeom.dispose();
      particleGeom.dispose();
    };
  }, [status, score, compact, interactive, camMode]);

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 shadow-2xl flex flex-col items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Canvas Mounting Point */}
      <div
        ref={containerRef}
        className={`w-full ${compact ? 'h-[260px]' : 'h-[360px] sm:h-[380px]'} cursor-grab active:cursor-grabbing flex items-center justify-center`}
      />

      {/* Cyber HUD Overlay Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700/80 backdrop-blur text-[11px] font-mono font-bold text-slate-200">
          <Activity className="h-3 w-3 text-cyan-400 animate-pulse" />
          <span>CYBER-CORE 3D</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
            status === 'CRITICAL'
              ? 'bg-rose-950/80 text-rose-300 border-rose-800'
              : status === 'SAFE'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
              : status === 'SCANNING'
              ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
              : 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
          }`}
        >
          {status}
        </span>
      </div>

      {/* Interactive Controls Overlay */}
      {interactive && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1 rounded-lg backdrop-blur text-[10px] text-slate-400">
          <button
            onClick={() => setCamMode('AUTO')}
            className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
              camMode === 'AUTO' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800' : 'hover:text-white'
            }`}
            title="Auto Orbit Rotation"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Orbit</span>
          </button>
          <span className="text-slate-600">|</span>
          <span className="px-1.5 hidden sm:inline text-slate-400">
            Drag mouse to rotate 3D mesh
          </span>
        </div>
      )}

      {/* Holographic Radar Coordinates & Status Footer */}
      <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400 pointer-events-none hidden sm:block">
        SYS.GRID: [32.4°N, 114.8°E] • PACKETS: 14.8K/S • SHIELD INTEGRITY: 99.4%
      </div>
    </div>
  );
};
