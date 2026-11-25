import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Rotate3D, Pause, Play, Compass } from 'lucide-react';

/**
 * SkillConstellation3D
 * 
 * Interactive WebGL 3D Skill Constellation powered by Three.js.
 * Renders an aesthetic wireframe icosahedron core with orbiting 3D skill satellites,
 * glowing exchange trade lines, and real-time projected HTML skill pill overlays.
 * Features mouse-tracking parallax, 360° touch/drag rotation, and smooth inertia.
 */

const SKILL_NODES = [
  { id: 'react', name: 'React & UI Animation', icon: '💻', color: 0xc8b6f6, hex: '#C8B6F6', radius: 3.8, speed: 0.6, phase: 0, tilt: 0.2 },
  { id: 'guitar', name: 'Acoustic Guitar', icon: '🎸', color: 0xf5de91, hex: '#F5DE91', radius: 4.4, speed: 0.45, phase: 1.1, tilt: -0.3 },
  { id: 'pottery', name: 'Ceramics & Pottery', icon: '🏺', color: 0xb9cbb3, hex: '#B9CBB3', radius: 4.8, speed: 0.55, phase: 2.3, tilt: 0.4 },
  { id: 'baking', name: 'Wild Sourdough', icon: '🍞', color: 0xf5de91, hex: '#F5DE91', radius: 3.9, speed: 0.7, phase: 3.4, tilt: -0.2 },
  { id: 'spanish', name: 'Conversational Spanish', icon: '🗣️', color: 0x8270b5, hex: '#8270B5', radius: 4.6, speed: 0.4, phase: 4.5, tilt: 0.35 },
  { id: 'figma', name: 'Figma Design', icon: '🎨', color: 0xc8b6f6, hex: '#C8B6F6', radius: 5.2, speed: 0.5, phase: 5.5, tilt: -0.15 },
];

export default function SkillConstellation3D({ className = '', onSkillClick }) {
  const mountRef = useRef(null);
  const [activeSkill, setActiveSkill] = useState(null);
  const [isRotating, setIsRotating] = useState(true);
  const [projectedLabels, setProjectedLabels] = useState([]);
  const [webGlSupported, setWebGlSupported] = useState(true);

  // References to keep animation loop clean
  const isRotatingRef = useRef(isRotating);
  isRotatingRef.current = isRotating;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability and create renderer safely
    let renderer;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      console.warn('WebGL context unavailable in SkillConstellation3D:', e);
      setWebGlSupported(false);
      return;
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 11.5);

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xfaf7f0, 1.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xc8b6f6, 1.8);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf5de91, 1.4);
    dirLight2.position.set(-5, -6, -3);
    scene.add(dirLight2);

    // 3. Central Constellation Core
    const constellationGroup = new THREE.Group();
    scene.add(constellationGroup);

    // Inner glowing sphere
    const innerCoreGeo = new THREE.SphereGeometry(1.3, 32, 32);
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0xf5de91,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    constellationGroup.add(innerCore);

    // Outer wireframe icosahedron
    const outerCoreGeo = new THREE.IcosahedronGeometry(2.3, 1);
    const outerCoreMat = new THREE.MeshStandardMaterial({
      color: 0x8270b5,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
      roughness: 0.2,
    });
    const outerCore = new THREE.Mesh(outerCoreGeo, outerCoreMat);
    constellationGroup.add(outerCore);

    // Dodecahedron cage
    const cageGeo = new THREE.DodecahedronGeometry(2.6, 0);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0xc8b6f6,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const cage = new THREE.Mesh(cageGeo, cageMat);
    constellationGroup.add(cage);

    // 4. Orbiting Skill Satellites
    const satellites = SKILL_NODES.map((node) => {
      // Orbit Ring
      const ringGeo = new THREE.TorusGeometry(node.radius, 0.015, 8, 72);
      const ringMat = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.25,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2 + node.tilt;
      ring.rotation.y = node.tilt * 0.5;
      constellationGroup.add(ring);

      // Node Sphere
      const sphereGeo = new THREE.SphereGeometry(0.36, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: node.color,
        roughness: 0.2,
        metalness: 0.15,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      constellationGroup.add(sphere);

      return {
        ...node,
        mesh: sphere,
        ring,
        currentAngle: node.phase,
      };
    });

    // 5. Connecting Trade Curves (Exchanges between skills)
    const curveLines = [];
    const tradePairs = [
      [0, 1], // React <-> Guitar
      [1, 2], // Guitar <-> Pottery
      [2, 3], // Pottery <-> Baking
      [3, 4], // Baking <-> Spanish
      [4, 5], // Spanish <-> Figma
      [5, 0], // Figma <-> React
    ];

    tradePairs.forEach(() => {
      const lineGeo = new THREE.BufferGeometry();
      const lineMat = new THREE.LineDashedMaterial({
        color: 0x8270b5,
        dashSize: 0.15,
        gapSize: 0.08,
        transparent: true,
        opacity: 0.45,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      constellationGroup.add(line);
      curveLines.push(line);
    });

    // 6. Ambient Floating Particle Stars
    const particleCount = 120;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 22;
      particlePositions[i + 1] = (Math.random() - 0.5) * 16;
      particlePositions[i + 2] = (Math.random() - 0.5) * 16;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xc8b6f6,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Interactive Drag & Mouse Tracking
    let isDragging = false;
    let previousPointer = { x: 0, y: 0 };
    let targetRotation = { x: 0.2, y: 0 };
    let currentRotation = { x: 0.2, y: 0 };
    let mouseParallax = { x: 0, y: 0 };

    const handlePointerDown = (e) => {
      isDragging = true;
      previousPointer = { x: e.clientX || (e.touches && e.touches[0].clientX) || 0, y: e.clientY || (e.touches && e.touches[0].clientY) || 0 };
    };

    const handlePointerMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY) || 0;

      // Mouse parallax when hovering
      const rect = container.getBoundingClientRect();
      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = ((clientY - rect.top) / rect.height) * 2 - 1;
      mouseParallax = { x: normX * 0.4, y: normY * 0.3 };

      if (!isDragging) return;
      const deltaX = clientX - previousPointer.x;
      const deltaY = clientY - previousPointer.y;

      targetRotation.y += deltaX * 0.008;
      targetRotation.x += deltaY * 0.008;

      previousPointer = { x: clientX, y: clientY };
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    domElem.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // 8. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth rotation with inertia
      if (isRotatingRef.current && !isDragging) {
        targetRotation.y += delta * 0.22;
      }

      currentRotation.x += (targetRotation.x + mouseParallax.y - currentRotation.x) * 0.06;
      currentRotation.y += (targetRotation.y + mouseParallax.x - currentRotation.y) * 0.06;

      constellationGroup.rotation.x = currentRotation.x;
      constellationGroup.rotation.y = currentRotation.y;

      // Pulse and spin inner geometries
      innerCore.rotation.y -= delta * 0.4;
      innerCore.rotation.x += delta * 0.2;
      outerCore.rotation.y += delta * 0.3;
      outerCore.rotation.z += delta * 0.15;
      cage.rotation.x += delta * 0.1;

      // Pulsate inner core scale gently
      const pulse = 1 + Math.sin(elapsedTime * 2) * 0.04;
      innerCore.scale.set(pulse, pulse, pulse);

      // Animate Satellites along orbital planes
      const updatedPositions = [];
      satellites.forEach((sat) => {
        sat.currentAngle += delta * sat.speed * (isRotatingRef.current ? 1 : 0.2);
        const x = Math.cos(sat.currentAngle) * sat.radius;
        const z = Math.sin(sat.currentAngle) * sat.radius;
        const y = Math.sin(sat.currentAngle + sat.tilt * 2) * 0.8;

        sat.mesh.position.set(x, y, z);
        sat.mesh.rotation.y += delta * 1.5;

        // Project 3D coordinate to 2D screen coordinate for HTML label overlay
        const worldPos = new THREE.Vector3();
        sat.mesh.getWorldPosition(worldPos);

        // Copy vector to project
        const screenPos = worldPos.clone().project(camera);
        const isFacingCamera = screenPos.z < 1.0;

        const screenX = ((screenPos.x + 1) / 2) * width;
        const screenY = ((-screenPos.y + 1) / 2) * height;

        updatedPositions.push({
          id: sat.id,
          name: sat.name,
          icon: sat.icon,
          hex: sat.hex,
          x: screenX,
          y: screenY,
          visible: isFacingCamera && screenX > 20 && screenX < width - 20 && screenY > 20 && screenY < height - 20,
          scale: Math.max(0.7, 1 - (worldPos.z / 12)),
        });
      });

      // Update Connecting Trade Arcs
      tradePairs.forEach((pair, idx) => {
        const satA = satellites[pair[0]];
        const satB = satellites[pair[1]];
        if (satA && satB && curveLines[idx]) {
          const midPoint = new THREE.Vector3()
            .addVectors(satA.mesh.position, satB.mesh.position)
            .multiplyScalar(0.5);
          // Pull arc outward slightly
          midPoint.multiplyScalar(1.25);

          const curve = new THREE.QuadraticBezierCurve3(
            satA.mesh.position,
            midPoint,
            satB.mesh.position
          );

          const points = curve.getPoints(24);
          curveLines[idx].geometry.dispose();
          curveLines[idx].geometry = new THREE.BufferGeometry().setFromPoints(points);
          curveLines[idx].computeLineDistances();
        }
      });

      // Twinkle particle stars
      particles.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
      setProjectedLabels(updatedPositions);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      domElem.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);

      // Dispose Three.js resources
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      outerCoreGeo.dispose();
      outerCoreMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      satellites.forEach((s) => {
        s.mesh.geometry.dispose();
        s.mesh.material.dispose();
        s.ring.geometry.dispose();
        s.ring.material.dispose();
      });
      curveLines.forEach((l) => {
        l.geometry.dispose();
        l.material.dispose();
      });
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (!webGlSupported) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-white/70 backdrop-blur rounded-3xl border-2 border-charcoal/15 ${className}`}>
        <Sparkles className="w-10 h-10 text-dusty animate-pulse mb-3" />
        <h4 className="font-serif font-bold text-lg text-charcoal">Visual Skill Constellation</h4>
        <p className="text-xs text-charcoal-muted mt-1 text-center max-w-sm">
          A dynamic interactive 3D model connecting skills across languages, arts, tech, and craft.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative w-full overflow-hidden select-none ${className}`}>
      {/* Three.js Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-[420px] sm:h-[480px] lg:h-[520px] cursor-grab active:cursor-grabbing"
      />

      {/* Floating 3D HTML Skill Labels (Projected in Real-Time 3D Space) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {projectedLabels.map((lbl) => {
          if (!lbl.visible) return null;
          const isSelected = activeSkill === lbl.id;

          return (
            <div
              key={lbl.id}
              style={{
                position: 'absolute',
                left: `${lbl.x}px`,
                top: `${lbl.y - 28}px`,
                transform: `translate(-50%, -50%) scale(${lbl.scale})`,
                transition: 'transform 0.15s ease-out',
                zIndex: isSelected ? 30 : 10,
              }}
              className="pointer-events-auto"
            >
              <button
                onClick={() => {
                  setActiveSkill(lbl.id);
                  if (onSkillClick) onSkillClick(lbl);
                }}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold
                  transition-all duration-200 border-2 shadow-pop-sm
                  ${
                    isSelected
                      ? 'bg-charcoal text-white border-charcoal scale-110 shadow-pop'
                      : 'bg-white/95 text-charcoal border-charcoal/80 hover:scale-105 hover:bg-white'
                  }
                `}
                style={{
                  boxShadow: isSelected ? '3px 3px 0px #34313B' : '2px 2px 0px rgba(52, 49, 59, 0.25)',
                }}
              >
                <span>{lbl.icon}</span>
                <span className="truncate max-w-[120px]">{lbl.name}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: lbl.hex }}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Sleek Floating Control Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-charcoal/20 shadow-pop-sm text-xs font-semibold text-charcoal z-20">
        <button
          onClick={() => setIsRotating(!isRotating)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:bg-lavender/30 transition-colors"
          title={isRotating ? 'Pause auto-rotation' : 'Resume auto-rotation'}
        >
          {isRotating ? <Pause className="w-3.5 h-3.5 text-dusty" /> : <Play className="w-3.5 h-3.5 text-dusty" />}
          <span>{isRotating ? 'Pause 3D' : 'Play 3D'}</span>
        </button>

        <span className="w-px h-3.5 bg-charcoal/20" />

        <div className="flex items-center gap-1.5 px-2 text-charcoal-muted text-[11px]">
          <Rotate3D className="w-3.5 h-3.5 text-charcoal-subtle" />
          <span className="hidden sm:inline">Drag to rotate 360&deg;</span>
          <span className="sm:hidden">Drag 3D</span>
        </div>
      </div>
    </div>
  );
}
