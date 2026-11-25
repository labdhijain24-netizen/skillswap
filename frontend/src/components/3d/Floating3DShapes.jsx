import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Floating3DShapes
 * 
 * Ambient Three.js canvas featuring floating whimsical 3D polyhedra
 * (Torus knot, Octahedron, Dodecahedron) floating in the background
 * with soft pastel materials matching SkillSwap's exact color palette.
 */
export default function Floating3DShapes({ className = '', count = 4 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 300;
    let height = container.clientHeight || 300;

    let scene, camera, renderer, animationId;
    let torusGeo, torusMat, octaGeo, octaMat, dodecaGeo, dodecaMat, icoGeo, icoMat;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.z = 10;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      container.appendChild(renderer.domElement);

      // Soft whimsical lighting
      const ambientLight = new THREE.AmbientLight(0xfaf7f0, 1.8);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xc8b6f6, 1.6);
      dirLight.position.set(4, 5, 4);
      scene.add(dirLight);

      const shapes = [];

      // 1. Butter Yellow Torus Knot
      torusGeo = new THREE.TorusKnotGeometry(0.8, 0.22, 64, 16, 2, 3);
      torusMat = new THREE.MeshStandardMaterial({
        color: 0xf5de91,
        roughness: 0.35,
        metalness: 0.1,
      });
      const torus = new THREE.Mesh(torusGeo, torusMat);
      torus.position.set(-3.2, 1.8, -1);
      scene.add(torus);
      shapes.push({ mesh: torus, rotSpeed: { x: 0.008, y: 0.012 }, floatSpeed: 1.2, floatAmp: 0.3, initialY: 1.8 });

      // 2. Lavender Octahedron
      octaGeo = new THREE.OctahedronGeometry(1.0, 0);
      octaMat = new THREE.MeshStandardMaterial({
        color: 0xc8b6f6,
        roughness: 0.25,
        metalness: 0.15,
      });
      const octa = new THREE.Mesh(octaGeo, octaMat);
      octa.position.set(3.4, 1.2, -0.5);
      scene.add(octa);
      shapes.push({ mesh: octa, rotSpeed: { x: 0.01, y: 0.007 }, floatSpeed: 0.9, floatAmp: 0.4, initialY: 1.2 });

      // 3. Sage Green Dodecahedron
      dodecaGeo = new THREE.DodecahedronGeometry(0.85, 0);
      dodecaMat = new THREE.MeshStandardMaterial({
        color: 0xb9cbb3,
        roughness: 0.4,
        metalness: 0.05,
      });
      const dodeca = new THREE.Mesh(dodecaGeo, dodecaMat);
      dodeca.position.set(-2.8, -2.0, -1.5);
      scene.add(dodeca);
      shapes.push({ mesh: dodeca, rotSpeed: { x: 0.006, y: 0.009 }, floatSpeed: 1.1, floatAmp: 0.25, initialY: -2.0 });

      // 4. Dusty Purple Icosahedron Wireframe
      icoGeo = new THREE.IcosahedronGeometry(0.9, 0);
      icoMat = new THREE.MeshStandardMaterial({
        color: 0x8270b5,
        wireframe: true,
        roughness: 0.2,
      });
      const ico = new THREE.Mesh(icoGeo, icoMat);
      ico.position.set(3.0, -1.8, -1.0);
      scene.add(ico);
      shapes.push({ mesh: ico, rotSpeed: { x: 0.012, y: 0.005 }, floatSpeed: 0.8, floatAmp: 0.35, initialY: -1.8 });

      const startTime = performance.now();

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        const elapsedTime = (performance.now() - startTime) * 0.001;

        shapes.forEach((item) => {
          item.mesh.rotation.x += item.rotSpeed.x;
          item.mesh.rotation.y += item.rotSpeed.y;
          item.mesh.position.y = item.initialY + Math.sin(elapsedTime * item.floatSpeed) * item.floatAmp;
        });

        renderer.render(scene, camera);
      };

      animate();

      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        width = container.clientWidth;
        height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener('resize', handleResize);

      return () => {
        if (animationId) cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        torusGeo?.dispose();
        torusMat?.dispose();
        octaGeo?.dispose();
        octaMat?.dispose();
        dodecaGeo?.dispose();
        dodecaMat?.dispose();
        icoGeo?.dispose();
        icoMat?.dispose();
        renderer?.dispose();
        if (renderer?.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    } catch (err) {
      console.warn('Floating3DShapes WebGL initialisation skipped:', err);
      return () => {};
    }
  }, []);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden select-none opacity-80 ${className}`}
    />
  );
}
