'use client';
/* eslint-disable react-hooks/immutability -- Three.js objects and shared control refs are intentionally mutated in effects/frame callbacks, never during React rendering. */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type RefObject,
} from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export interface ClusterControls {
  x: number;
  y: number;
  pointerX: number;
  pointerY: number;
  dragging: boolean;
  paused: boolean;
  invalidate?: () => void;
}
interface Props {
  controls: RefObject<ClusterControls>;
  mobile: boolean;
  reduced: boolean;
  active: boolean;
  paused: boolean;
  onReady: () => void;
  onFailure: () => void;
}
function Geometry({
  controls,
  mobile,
  reduced,
  active,
  paused,
  onReady,
  onFailure,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const atoms = useRef<THREE.InstancedMesh>(null);
  const bonds = useRef<THREE.InstancedMesh>(null);
  const tracers = useRef<THREE.Group>(null);
  const rendered = useRef(false);
  const phase = useRef(0);
  const { gl, scene, invalidate } = useThree();
  const model = useMemo(() => {
    const core = new THREE.IcosahedronGeometry(0.98, 0);
    const shell = new THREE.IcosahedronGeometry(1.95, 1);
    const points: THREE.Vector3[] = [new THREE.Vector3()];
    for (const geometry of [core, shell]) {
      const p = geometry.getAttribute('position');
      for (let i = 0; i < p.count; i++) {
        const v = new THREE.Vector3().fromBufferAttribute(p, i);
        if (!points.some((existing) => existing.distanceTo(v) < 0.001))
          points.push(v);
      }
      geometry.dispose();
    }
    const edges: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < points.length; i++)
      for (let j = i + 1; j < points.length; j++)
        if (points[i].distanceTo(points[j]) < 1.17)
          edges.push([points[i], points[j]]);
    return { points, edges };
  }, []);
  const lattice = useMemo(() => {
    const vertices: number[] = [];
    for (let layer = 0; layer < (mobile ? 1 : 2); layer++)
      for (let i = -4; i <= 4; i++) {
        const z = -3.5 - layer * 0.6;
        vertices.push(
          i * 0.8,
          -3.4,
          z,
          i * 0.8,
          3.4,
          z,
          -3.4,
          i * 0.8,
          z,
          3.4,
          i * 0.8,
          z,
        );
      }
    return new Float32Array(vertices);
  }, [mobile]);
  const orbit = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];
    for (let i = 0; i < 96; i++) {
      const t = (i / 96) * Math.PI * 2;
      positions.push(
        Math.cos(t) * 2.65,
        Math.sin(t) * 1.05,
        Math.sin(t) * 0.75,
      );
    }
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    );
    return new THREE.LineLoop(
      geometry,
      new THREE.LineBasicMaterial({
        color: '#4cc9f0',
        transparent: true,
        opacity: 0.18,
      }),
    );
  }, []);
  useEffect(
    () => () => {
      orbit.geometry.dispose();
      (orbit.material as THREE.Material).dispose();
    },
    [orbit],
  );
  useLayoutEffect(() => {
    if (!atoms.current || !bonds.current) return;
    const dummy = new THREE.Object3D();
    model.points.forEach((point, i) => {
      dummy.position.copy(point);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(i === 0 ? 0.24 : 0.18);
      dummy.updateMatrix();
      atoms.current!.setMatrixAt(i, dummy.matrix);
    });
    const up = new THREE.Vector3(0, 1, 0);
    model.edges.forEach(([a, b], i) => {
      dummy.position.copy(a).add(b).multiplyScalar(0.5);
      dummy.quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize());
      dummy.scale.set(0.012, a.distanceTo(b), 0.012);
      dummy.updateMatrix();
      bonds.current!.setMatrixAt(i, dummy.matrix);
    });
    atoms.current.instanceMatrix.needsUpdate = true;
    bonds.current.instanceMatrix.needsUpdate = true;
    invalidate();
  }, [model, invalidate]);
  useEffect(() => {
    const control = controls.current;
    control.invalidate = invalidate;
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    gl.domElement.addEventListener('webglcontextlost', lost);
    let environment: THREE.WebGLRenderTarget | undefined;
    if (!mobile) {
      const room = new RoomEnvironment();
      const generator = new THREE.PMREMGenerator(gl);
      environment = generator.fromScene(room, 0.04);
      scene.environment = environment.texture;
      room.dispose();
      generator.dispose();
    }
    return () => {
      gl.domElement.removeEventListener('webglcontextlost', lost);
      scene.environment = null;
      environment?.dispose();
      control.invalidate = undefined;
    };
  }, [controls, gl, scene, mobile, invalidate, onFailure]);
  useEffect(() => {
    invalidate();
    if (!active || paused) return;
    const timer = window.setInterval(
      invalidate,
      1000 / (reduced ? 20 : mobile ? 24 : 40),
    );
    return () => window.clearInterval(timer);
  }, [active, paused, reduced, mobile, invalidate]);
  useFrame((_, delta) => {
    if (!group.current) return;
    const control = controls.current;
    if (active && !paused && !control.dragging) {
      control.y += Math.min(delta, 0.05) * (reduced ? 0.008 : 0.09);
      if (!reduced) phase.current += Math.min(delta, 0.05) * 0.2;
    }
    group.current.rotation.set(
      control.x + (reduced || mobile ? 0 : control.pointerY * 0.08),
      control.y + (reduced || mobile ? 0 : control.pointerX * 0.12),
      0.04,
    );
    if (tracers.current)
      tracers.current.children.forEach((particle, i) => {
        const t =
          phase.current + (i / tracers.current!.children.length) * Math.PI * 2;
        particle.position.set(
          Math.cos(t) * 2.65,
          Math.sin(t) * 1.05,
          Math.sin(t) * 0.75,
        );
      });
    if (!rendered.current) {
      rendered.current = true;
      window.requestAnimationFrame(onReady);
    }
  });
  return (
    <>
      <ambientLight intensity={mobile ? 0.8 : 0.45} />
      <hemisphereLight args={['#f5e8ce', '#07111f', 1.1]} />
      <directionalLight position={[-3, 5, 4]} intensity={3.2} color="#fff0d0" />
      <directionalLight position={[4, 1, -3]} intensity={1.2} color="#71cbe8" />
      <directionalLight position={[2, -3, 3]} intensity={1.2} color="#e8b86c" />
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lattice, 3]} />
        </bufferGeometry>
        <shaderMaterial
          transparent
          depthWrite={false}
          vertexShader="varying vec2 gridPosition; void main() { gridPosition = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }"
          fragmentShader="varying vec2 gridPosition; void main() { float fade = 1.0 - smoothstep(1.0, 3.4, length(gridPosition)); gl_FragColor = vec4(0.32, 0.45, 0.55, 0.12 * fade); }"
        />
      </lineSegments>
      <group ref={group}>
        <instancedMesh
          ref={bonds}
          args={[undefined, undefined, model.edges.length]}
        >
          <cylinderGeometry args={[1, 1, 1, mobile ? 5 : 8]} />
          <meshStandardMaterial
            color="#776445"
            metalness={0.25}
            roughness={0.7}
          />
        </instancedMesh>
        <instancedMesh
          ref={atoms}
          args={[undefined, undefined, model.points.length]}
        >
          <sphereGeometry args={[1, mobile ? 16 : 28, mobile ? 12 : 20]} />
          <meshStandardMaterial
            color="#d9ad53"
            metalness={mobile ? 0.65 : 0.8}
            roughness={mobile ? 0.46 : 0.42}
            envMapIntensity={0.65}
          />
        </instancedMesh>
      </group>
      <group rotation={[0.25, 0, -0.25]}>
        <primitive object={orbit} />
        <group ref={tracers}>
          {Array.from({ length: mobile ? 3 : 6 }, (_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.028, 8, 6]} />
              <meshBasicMaterial color="#76d2e9" />
            </mesh>
          ))}
        </group>
      </group>
    </>
  );
}
export default function ClusterScene(props: Props) {
  return (
    <div className="cluster-canvas" aria-hidden="true">
      <Canvas
        frameloop="demand"
        dpr={props.mobile ? 1 : [1, 1.5]}
        camera={{ position: [0, 0, 8.3], fov: 38 }}
        gl={{
          antialias: !props.mobile,
          alpha: true,
          powerPreference: 'low-power',
        }}
        onCreated={({ gl, scene }) => {
          scene.background = null;
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Geometry {...props} />
      </Canvas>
    </div>
  );
}
