"use client";
import { Suspense, useRef, useMemo } from 'react';
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

    // Force all materials to be visible — strong cyan emissive so the car
    // glows even in areas with no direct light hit
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          if (m instanceof THREE.MeshStandardMaterial) {
            m.emissive = new THREE.Color('#002233');
            m.emissiveIntensity = 1.8;
            m.roughness = 0.55;
            m.metalness = 0.3;
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
  return (
    <Canvas
      camera={{ position: [0, 0.4, 6], fov: 38 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        {/* Environment map — essential for metallic car surfaces */}
        <Environment preset="warehouse" background={false} />

        <ambientLight intensity={0.6} color="#003d5c" />

        {/* Main key light */}
        <spotLight position={[2, 7, 5]} angle={0.28} penumbra={0.9} intensity={3} color="#00d4f5" />

        {/* Fill light */}
        <spotLight position={[-4, 4, 4]} angle={0.4} penumbra={0.9} intensity={1.5} color="#0099cc" />

        {/* Rim light from behind */}
        <spotLight position={[0, 5, -6]} angle={0.35} penumbra={0.8} intensity={1.5} color="#00aadd" />

        {/* Under-glow */}
        <pointLight position={[0, -2, 0]} intensity={2} color="#00d4f5" distance={10} decay={2} />

        <CarMesh />
      </Suspense>
    </Canvas>
  );
}
