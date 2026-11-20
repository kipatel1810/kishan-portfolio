import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { SceneColors } from './utils';

export interface Place {
  name: string;
  lat: number;
  lon: number;
}

interface Props {
  colors: SceneColors;
  dark: boolean;
  from: Place;
  to: Place;
  animate: boolean;
  mobile: boolean;
}

const R = 1;

function latLonToVec(lat: number, lon: number, r = R) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

/** Latitude/longitude grid as line segments. */
function useGraticule() {
  return useMemo(() => {
    const pts: number[] = [];
    const push = (a: THREE.Vector3, b: THREE.Vector3) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    for (let lat = -60; lat <= 60; lat += 30)
      for (let lon = -180; lon < 180; lon += 6) push(latLonToVec(lat, lon), latLonToVec(lat, lon + 6));
    for (let lon = -180; lon < 180; lon += 30)
      for (let lat = -84; lat < 84; lat += 6) push(latLonToVec(lat, lon), latLonToVec(lat + 6, lon));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
}

/** Evenly spaced surface dots. */
function useDots(count: number) {
  return useMemo(() => {
    const arr = new Float32Array(count * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      arr.set([Math.cos(golden * i) * r * 1.002, y * 1.002, Math.sin(golden * i) * r * 1.002], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return g;
  }, [count]);
}

function Marker({ position, color, phase }: { position: THREE.Vector3; color: string; phase: number }) {
  const ring = useRef<THREE.Mesh>(null);
  const normal = useMemo(() => position.clone().normalize(), [position]);
  const quaternion = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal), [normal]);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const t = (clock.elapsedTime * 0.8 + phase) % 1;
    ring.current.scale.setScalar(1 + t * 2.5);
    (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - t);
  });
  return (
    <group position={position} quaternion={quaternion}>
      <mesh>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={ring} position={[0, 0, 0.002]}>
        <ringGeometry args={[0.035, 0.05, 32]} />
        <meshBasicMaterial color={color} transparent side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Arc between two places, with a light that travels along it. */
function Arc({ a, b, color }: { a: THREE.Vector3; b: THREE.Vector3; color: string }) {
  const traveler = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => {
    // Follow the great circle between the two places, lifted off the surface toward the middle.
    // (A plain Bezier between far-apart points would cut through the globe.)
    const ua = a.clone().normalize();
    const ub = b.clone().normalize();
    const angle = ua.angleTo(ub);
    const axis = new THREE.Vector3().crossVectors(ua, ub).normalize();
    const pts = Array.from({ length: 65 }, (_, i) => {
      const t = i / 64;
      const height = 1.005 + Math.sin(Math.PI * t) * 0.18 * angle;
      return ua.clone().applyAxisAngle(axis, angle * t).multiplyScalar(height);
    });
    return new THREE.CatmullRomCurve3(pts);
  }, [a, b]);
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 96, 0.006, 6, false), [curve]);
  useFrame(({ clock }) => {
    if (traveler.current) traveler.current.position.copy(curve.getPoint((clock.elapsedTime * 0.25) % 1));
  });
  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={color} transparent opacity={0.85} />
      </mesh>
      <mesh ref={traveler}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function Globe({ colors, dark, from, to, animate, mobile }: Props) {
  const group = useRef<THREE.Group>(null);
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const graticule = useGraticule();
  const dots = useDots(mobile ? 700 : 1400);
  const a = useMemo(() => latLonToVec(from.lat, from.lon, R * 1.005), [from]);
  const b = useMemo(() => latLonToVec(to.lat, to.lon, R * 1.005), [to]);

  // Start with the arc's midpoint facing the camera (+z). The route runs over the Arctic, so this
  // needs both a Y turn and an X tilt: Ry brings the point into the y-z plane, then Rx levels it.
  const home = useMemo(() => {
    const m = a.clone().add(b).normalize();
    const y = Math.atan2(-m.x, m.z);
    const x = Math.atan2(m.y, Math.hypot(m.x, m.z)) * 0.8; // slightly less tilt keeps both places in view
    return { x, y };
  }, [a, b]);
  const rot = useRef({ x: home.x, y: home.y, vx: 0, vy: 0, dragging: false, touched: false, lx: 0, ly: 0 });

  // Drag to rotate (on the canvas element). touch-action on the wrapper keeps page scrolling.
  useEffect(() => {
    const el = gl.domElement;
    const r = rot.current;
    const down = (e: PointerEvent) => {
      r.dragging = true;
      r.touched = true;
      r.lx = e.clientX;
      r.ly = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!r.dragging) return;
      r.vy = (e.clientX - r.lx) * 0.008;
      r.vx = (e.clientY - r.ly) * 0.008;
      r.lx = e.clientX;
      r.ly = e.clientY;
      invalidate();
    };
    const up = () => (r.dragging = false);
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [gl, invalidate]);

  useFrame(({ clock }) => {
    const r = rot.current;
    if (!r.touched) {
      // Until the visitor drags it, sway gently around the view that shows the whole route.
      const sway = animate ? Math.sin(clock.elapsedTime * 0.35) * 0.45 : 0;
      r.y = home.y + sway;
      r.x = home.x;
    } else {
      if (!r.dragging) {
        r.vy *= 0.95;
        r.vx *= 0.92;
      }
      r.y += r.vy;
      r.x = THREE.MathUtils.clamp(r.x + r.vx, -1.4, 1.4);
    }
    if (group.current) group.current.rotation.set(r.x, r.y, 0);
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[R * 0.995, 48, 48]} />
        <meshBasicMaterial color={colors.accent} transparent opacity={dark ? 0.06 : 0.08} />
      </mesh>
      <lineSegments geometry={graticule}>
        <lineBasicMaterial color={colors.muted} transparent opacity={dark ? 0.25 : 0.35} />
      </lineSegments>
      <points geometry={dots}>
        <pointsMaterial color={colors.muted} size={mobile ? 0.012 : 0.009} transparent opacity={dark ? 0.55 : 0.65} />
      </points>
      <Arc a={a} b={b} color={colors.accent} />
      <Marker position={a} color={colors.accent} phase={0} />
      <Marker position={b} color={colors.accent} phase={0.5} />
    </group>
  );
}

export default function GlobeScene(props: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  return (
    <div ref={wrap} className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing">
      <Canvas
        frameloop={props.animate ? 'always' : 'demand'}
        dpr={props.mobile ? [1, 1.5] : [1, 2]}
        camera={{ position: [0, 0, 3.6], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        aria-hidden="true"
      >
        <Globe {...props} />
      </Canvas>
    </div>
  );
}
