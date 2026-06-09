"use client";
import { Suspense, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

function Optimus() {
  const { scene } = useGLTF('/optimus_prime.glb');

  const normalizedScene = useMemo(() => {
    const cloned = scene.clone(true);

    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) cloned.scale.setScalar(7 / maxDim);

    const box2 = new THREE.Box3().setFromObject(cloned);
    const center = box2.getCenter(new THREE.Vector3());
    cloned.position.sub(center);

    // Lift dark materials so they catch the blueprint lighting
    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          if (m instanceof THREE.MeshStandardMaterial) {
            const hsl = { h: 0, s: 0, l: 0 };
            m.color.getHSL(hsl);
            if (hsl.l < 0.2) m.color.setHSL(hsl.h, hsl.s * 0.6, 0.2);
            m.emissive = new THREE.Color('#001e30');
            m.emissiveIntensity = 0.6;
            m.roughness = 0.55;
            m.metalness = 0.3;
            m.needsUpdate = true;
          }
        });
      }
    });

    return cloned;
  }, [scene]);

  // Stationary — no useFrame rotation
  return <primitive object={normalizedScene} dispose={null} />;
}

useGLTF.preload('/optimus_prime.glb');

export default function OptimusModel() {
  const [ready, setReady] = useState(false);

  return (
    <div style={{ width: '100%', height: '100%', opacity: ready ? 1 : 0, transition: 'opacity 1.4s ease' }}>
      <Canvas
        camera={{ position: [0, 0.5, 4], fov: 55 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        onCreated={() => setReady(true)}
      >
        <Suspense fallback={null}>
          <Environment preset="warehouse" background={false} />
          <ambientLight intensity={0.5} color="#003d5c" />
          <spotLight position={[2, 8, 5]} angle={0.28} penumbra={0.9} intensity={3} color="#00d4f5" />
          <spotLight position={[-4, 5, 4]} angle={0.4} penumbra={0.9} intensity={1.5} color="#0099cc" />
          <spotLight position={[0, 6, -6]} angle={0.35} penumbra={0.8} intensity={1.5} color="#00aadd" />
          <pointLight position={[0, -2.5, 0]} intensity={2} color="#00d4f5" distance={12} decay={2} />
          <Optimus />
        </Suspense>
      </Canvas>
    </div>
  );
}
