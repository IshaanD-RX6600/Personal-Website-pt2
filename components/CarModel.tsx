"use client";
import { Suspense, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

function CarMesh() {
  const { scene } = useGLTF('/2024_lbsilhouette_works_murcielago_gt_evo.glb');
  const groupRef = useRef<THREE.Group>(null);

  const normalizedScene = useMemo(() => {
    const cloned = scene.clone(true);

    // Normalize to 4 units in the longest dimension
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) cloned.scale.setScalar(4 / maxDim);

    // Center at origin
    const box2 = new THREE.Box3().setFromObject(cloned);
    const center = box2.getCenter(new THREE.Vector3());
    cloned.position.sub(center);

    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          if (m instanceof THREE.MeshStandardMaterial) {
            m.emissive = new THREE.Color('#000000');
            m.emissiveIntensity = 0;
            m.roughness = 0.45;
            m.metalness = 0.6;
            m.needsUpdate = true;
          }
        });
      }
    });

    return cloned;
  }, [scene]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.35;
  });

  return (
    <group ref={groupRef}>
      <primitive object={normalizedScene} dispose={null} />
    </group>
  );
}

useGLTF.preload('/2024_lbsilhouette_works_murcielago_gt_evo.glb');

export default function CarModel() {
  const [ready, setReady] = useState(false);

  return (
    <div style={{ width: '100%', height: '100%', opacity: ready ? 1 : 0, transition: 'opacity 1.2s ease' }}>
      <Canvas
        camera={{ position: [0, 0.4, 6], fov: 38 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        onCreated={() => setReady(true)}
      >
        <Suspense fallback={null}>
          <Environment preset="warehouse" background={false} />
          <ambientLight intensity={0.9} color="#ffffff" />
          <spotLight position={[2, 7, 5]} angle={0.28} penumbra={0.9} intensity={4} color="#ffffff" />
          <spotLight position={[-4, 4, 4]} angle={0.4} penumbra={0.9} intensity={2} color="#fff5e0" />
          <spotLight position={[0, 5, -6]} angle={0.35} penumbra={0.8} intensity={2} color="#ffffff" />
          <pointLight position={[0, -2, 0]} intensity={1.5} color="#ffffff" distance={10} decay={2} />
          <CarMesh />
        </Suspense>
      </Canvas>
    </div>
  );
}
