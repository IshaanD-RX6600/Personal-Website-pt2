"use client";
import { Suspense, useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

const _lookTarget = new THREE.Vector3();

function CameraController({ scrollProgress }: { scrollProgress: number }) {
  const { camera, clock } = useThree();
  const pRef = useRef(scrollProgress);
  pRef.current = scrollProgress;

  useFrame(() => {
    const p = pRef.current;

    // ── Position ──────────────────────────────────────────────
    // Start: overview from in front [0, 0.4, 6]
    // End:   elevated cockpit approach [0, 0.68, 0.28] — windshield height
    const targetX = 0;
    const targetY = THREE.MathUtils.lerp(0.4, 0.68, p);
    const targetZ = THREE.MathUtils.lerp(6, 0.28, p);

    // Subtle human sway that builds as camera closes in — feels physical
    const t = clock.getElapsedTime();
    const swayAmt = Math.max(0, p - 0.55) * 0.018;
    const swayX   = Math.sin(t * 1.7)  * swayAmt;
    const swayY   = Math.sin(t * 2.3)  * swayAmt * 0.5;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX + swayX, 0.06);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY + swayY, 0.06);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ,         0.06);

    // ── LookAt — tilts down into cockpit as we approach ───────
    // At p=0: looking at car centre (y=0.05)
    // At p=1: looking down at steering wheel area (y=−0.05)
    const lookY = THREE.MathUtils.lerp(0.05, -0.05, p);
    _lookTarget.set(0, lookY, 0);
    camera.lookAt(_lookTarget);

    // ── FOV — telephoto compression as camera dives ───────────
    // 38° → 14° gives the feel of a zoom-lens pulling you in
    const cam = camera as THREE.PerspectiveCamera;
    if (cam.isPerspectiveCamera) {
      const targetFov = THREE.MathUtils.lerp(38, 14, p);
      cam.fov = THREE.MathUtils.lerp(cam.fov, targetFov, 0.06);
      cam.updateProjectionMatrix();
    }
  });

  return null;
}

function CarMesh({ scrollProgress }: { scrollProgress: number }) {
  const { scene } = useGLTF('/2024_lbsilhouette_works_murcielago_gt_evo.glb');
  const groupRef = useRef<THREE.Group>(null);
  const pRef = useRef(scrollProgress);
  pRef.current = scrollProgress;

  const normalizedScene = useMemo(() => {
    const cloned = scene.clone(true);

    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) cloned.scale.setScalar(4 / maxDim);

    const box2 = new THREE.Box3().setFromObject(cloned);
    const center = box2.getCenter(new THREE.Vector3());
    cloned.position.sub(center);

    cloned.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((m) => {
          if (m instanceof THREE.MeshStandardMaterial) {
            m.emissive         = new THREE.Color('#000000');
            m.emissiveIntensity = 0;
            m.roughness        = 0.42;
            m.metalness        = 0.65;
            m.needsUpdate      = true;
          }
        });
      }
    });

    return cloned;
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Rotation eases fully to zero by p = 0.40 so the car locks steady for the close-up
    const speed = THREE.MathUtils.lerp(0.35, 0, Math.min(pRef.current / 0.40, 1));
    groupRef.current.rotation.y += delta * speed;
  });

  return (
    <group ref={groupRef}>
      <primitive object={normalizedScene} dispose={null} />
    </group>
  );
}

useGLTF.preload('/2024_lbsilhouette_works_murcielago_gt_evo.glb');

export default function CarModel({ scrollProgress = 0 }: { scrollProgress?: number }) {
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
          <ambientLight intensity={0.9}  color="#ffffff" />
          <spotLight position={[2,  7,  5]} angle={0.28} penumbra={0.9} intensity={4}   color="#ffffff" />
          <spotLight position={[-4, 4,  4]} angle={0.40} penumbra={0.9} intensity={2}   color="#fff5e0" />
          <spotLight position={[0,  5, -6]} angle={0.35} penumbra={0.8} intensity={2}   color="#ffffff" />
          <pointLight position={[0, -2,  0]} intensity={1.5} color="#ffffff" distance={10} decay={2} />
          <CameraController scrollProgress={scrollProgress} />
          <CarMesh         scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
