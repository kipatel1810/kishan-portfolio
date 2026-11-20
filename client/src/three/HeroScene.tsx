import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import type { SceneColors } from './utils';


interface Props {
  colors: SceneColors;
  dark: boolean;
  mobile: boolean;
  /** Below 1024px the scene sits behind the text, so it is centred and dimmed. */
  compact: boolean;
  animate: boolean;
}

/** Pointer in normalised device coords (-1..1), updated from window events so the canvas can stay pointer-events:none. */
type PointerRef = MutableRefObject<{ x: number; y: number; active: boolean }>;
type ScrollRef = MutableRefObject<number>;

const rand = (seed: number) => {
  // Deterministic PRNG so the layout is stable across renders.
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
};

function Core({ colors, dark, scroll, animate }: { colors: SceneColors; dark: boolean; scroll: ScrollRef; animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.LineSegments>(null);
  const rings = useRef<THREE.Group>(null);
  const shellGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.75, 1)), []);

  useFrame((state, delta) => {
    if (!group.current || !core.current || !shell.current || !rings.current) return;
    const p = scroll.current; // 0 at top, ~1 after one viewport of scrolling
    const t = state.clock.elapsedTime;
    // Scroll drives position, scale and extra rotation of the whole core assembly.
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, p * 1.6 + Math.sin(t * 0.8) * 0.08, 0.1);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, p * 0.9, 0.1);
    const s = THREE.MathUtils.lerp(group.current.scale.x, 1 - p * 0.25, 0.1);
    group.current.scale.setScalar(s);
    core.current.rotation.x += delta * 0.25;
    core.current.rotation.y += delta * (0.35 + p * 1.5);
    shell.current.rotation.y -= delta * 0.12;
    shell.current.rotation.x += delta * 0.05;
    rings.current.children.forEach((r, i) => (r.rotation.z += delta * (0.1 + i * 0.07) * (i % 2 ? -1 : 1)));
  });

  // Render one static frame when animation is off.
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!animate) invalidate();
  }, [animate, invalidate, colors]);

  return (
    <group ref={group}>
      <mesh ref={core}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={colors.accent}
          emissive={colors.accent}
          emissiveIntensity={dark ? 0.25 : 0.12}
          flatShading
          roughness={0.45}
          metalness={0.2}
        />
      </mesh>
      {/* Soft glow halo */}
      <mesh scale={1.35}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color={colors.accent} transparent opacity={dark ? 0.08 : 0.06} depthWrite={false} />
      </mesh>
      <lineSegments ref={shell} geometry={shellGeo}>
        <lineBasicMaterial color={colors.accent} transparent opacity={dark ? 0.45 : 0.55} />
      </lineSegments>
      <group ref={rings}>
        {[2.4, 2.9, 3.4].map((r, i) => (
          <mesh key={r} rotation={[Math.PI / 2 + i * 0.45, i * 0.6, 0]}>
            <torusGeometry args={[r, 0.008, 8, 160]} />
            <meshBasicMaterial color={i === 1 ? colors.muted : colors.accent} transparent opacity={0.5 - i * 0.1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Shards({ count, color, opacity, pointer }: { count: number; color: string; opacity: number; pointer: PointerRef }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const viewport = useThree((s) => s.viewport);
  const data = useMemo(() => {
    const r = rand(42);
    return Array.from({ length: count }, () => {
      // Distribute on a loose shell around the core.
      const theta = r() * Math.PI * 2;
      const phi = Math.acos(2 * r() - 1);
      const radius = 2.6 + r() * 2.4;
      const base = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta) * 0.75,
        radius * Math.cos(phi) * 0.6,
      );
      return { base, offset: new THREE.Vector3(), rot: new THREE.Euler(r() * 6, r() * 6, r() * 6), spin: 0.2 + r() * 0.6, scale: 0.06 + r() * 0.12 };
    });
  }, [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const cursor = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    cursor.set((pointer.current.x * viewport.width) / 2, (pointer.current.y * viewport.height) / 2, 0);
    data.forEach((d, i) => {
      target.set(0, 0, 0);
      if (pointer.current.active) {
        // Push shards away from the cursor (in the z=0 plane) with a smooth falloff.
        const dx = d.base.x - cursor.x;
        const dy = d.base.y - cursor.y;
        const dist = Math.hypot(dx, dy);
        const radius = 1.8;
        if (dist < radius && dist > 0.0001) {
          const force = (1 - dist / radius) ** 2 * 1.4;
          target.set((dx / dist) * force, (dy / dist) * force, force * 0.5);
        }
      }
      d.offset.lerp(target, Math.min(1, delta * 6));
      dummy.position.copy(d.base).add(d.offset);
      dummy.position.y += Math.sin(t * d.spin + i) * 0.1;
      dummy.rotation.set(d.rot.x + t * d.spin, d.rot.y + t * d.spin * 0.7, d.rot.z);
      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <tetrahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} flatShading transparent opacity={opacity} />
    </instancedMesh>
  );
}

function Particles({ count, color, opacity }: { count: number; color: string; opacity: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const r = rand(7);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (r() - 0.5) * 22;
      arr[i * 3 + 1] = (r() - 0.5) * 14;
      arr[i * 3 + 2] = (r() - 0.5) * 10 - 2;
    }
    return arr;
  }, [count]);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.015;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.035} sizeAttenuation transparent opacity={opacity} depthWrite={false} />
    </points>
  );
}

/** Camera eases toward the pointer for a subtle parallax. */
function CameraRig({ pointer, mobile }: { pointer: PointerRef; mobile: boolean }) {
  useFrame(({ camera }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.current.x * 0.8, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.current.y * 0.5, 0.04);
    camera.position.z = mobile ? 9 : 7;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/** Positions the scene to the right of the hero text on wide screens, centred behind it on small ones. */
function Layout({ children }: { children: React.ReactNode }) {
  const width = useThree((s) => s.viewport.width);
  const px = useThree((s) => s.size.width);
  const x = px >= 1024 ? width * 0.3 : 0;
  const scale = px >= 768 ? 0.85 : 0.8;
  return (
    <group position={[x, 0, 0]} scale={scale}>
      {children}
    </group>
  );
}

export default function HeroScene({ colors, dark, mobile, compact, animate }: Props) {
  const pointer = useRef({ x: 0, y: 0, active: false });
  const scroll = useRef(0);
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointer.current.active = e.pointerType === 'mouse';
    };
    const onLeave = () => (pointer.current.active = false);
    const onScroll = () => (scroll.current = Math.min(window.scrollY / window.innerHeight, 1.5));
    onScroll();
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Stop rendering entirely while the hero is off-screen.
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const shardOpacity = mobile ? 0.45 : 0.8;

  return (
    <div ref={container} className="absolute inset-0" style={{ opacity: compact ? 0.35 : 1 }}>
      <Canvas
        frameloop={!visible ? 'never' : animate ? 'always' : 'demand'}
        dpr={mobile ? [1, 1.5] : [1, 1.75]}
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ antialias: !mobile, alpha: true, powerPreference: 'low-power' }}
        aria-hidden="true"
      >
        <ambientLight intensity={dark ? 0.4 : 0.9} />
        <pointLight position={[4, 4, 5]} intensity={dark ? 40 : 25} color={colors.accent} />
        <directionalLight position={[-3, 2, 4]} intensity={dark ? 0.8 : 1.2} />
        <Layout>
          <Core colors={colors} dark={dark} scroll={scroll} animate={animate} />
          <Shards count={mobile ? 10 : 26} color={colors.accent} opacity={shardOpacity} pointer={pointer} />
        </Layout>
        <Particles count={mobile ? 250 : 800} color={colors.muted} opacity={mobile ? 0.35 : 0.6} />
        {animate && <CameraRig pointer={pointer} mobile={mobile} />}
      </Canvas>
    </div>
  );
}
