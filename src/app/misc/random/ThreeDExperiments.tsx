"use client"

import React, {useEffect, useRef, useState} from "react";
import type {DemoModule} from "@/app/misc/random/registry";


function Preview3D() {
    return <></>
}


const Page: React.FC = () => <NeonDriveScene/>;
const preview = <Preview3D/>;

export const title = "Experimental three.js element";
export const description = "inspired by https://bruno-simon.com/";

const mod: DemoModule = {title, description, preview, Page};
export default mod;


import {Canvas, useFrame} from "@react-three/fiber";
import {OrbitControls, Instances, Instance} from "@react-three/drei";
import * as THREE from "three";
import {Physics, RigidBody, RapierRigidBody, CuboidCollider} from "@react-three/rapier";

/* ---------------- KEYBOARD ---------------- */

type Keys = {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
};

function useKeyboard(): Keys {
    const [keys, setKeys] = useState<Keys>({
        forward: false,
        backward: false,
        left: false,
        right: false,
    });

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    setKeys((k) => ({...k, forward: true}));
                    break;
                case "KeyS":
                case "ArrowDown":
                    setKeys((k) => ({...k, backward: true}));
                    break;
                case "KeyA":
                case "ArrowLeft":
                    setKeys((k) => ({...k, left: true}));
                    break;
                case "KeyD":
                case "ArrowRight":
                    setKeys((k) => ({...k, right: true}));
                    break;
            }
        };
        const up = (e: KeyboardEvent) => {
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    setKeys((k) => ({...k, forward: false}));
                    break;
                case "KeyS":
                case "ArrowDown":
                    setKeys((k) => ({...k, backward: false}));
                    break;
                case "KeyA":
                case "ArrowLeft":
                    setKeys((k) => ({...k, left: false}));
                    break;
                case "KeyD":
                case "ArrowRight":
                    setKeys((k) => ({...k, right: false}));
                    break;
            }
        };

        window.addEventListener("keydown", down);
        window.addEventListener("keyup", up);
        return () => {
            window.removeEventListener("keydown", down);
            window.removeEventListener("keyup", up);
        };
    }, []);

    return keys;
}

/* ---------------- GROUND + RAMP ---------------- */

function Ground() {
    return (
        <>{/* ground */}
            <RigidBody type="fixed" restitution={0.1} friction={1}>
                <mesh rotation-x={-Math.PI / 2}>
                    <planeGeometry args={[400, 400]}/>
                    <meshStandardMaterial color="#02030a"/>
                </mesh>
            </RigidBody>

            <gridHelper
                args={[400, 100, new THREE.Color("#00f6ff"), new THREE.Color("#00f6ff")]}
                position={[0, 0.01, 0]}
            />

            {/* ramp */}
            <RigidBody type="fixed" friction={0.2} restitution={0.0}>
                <mesh
                    rotation={[-Math.PI / 6, 0, 0]}
                    position={[0, 1.5, 20]}
                    castShadow
                    receiveShadow
                >
                    <boxGeometry args={[8, 1, 12]}/>
                    <meshStandardMaterial color="#111" emissive="#00f6ff" emissiveIntensity={0.3}/>
                </mesh>
            </RigidBody>
        </>
    );
}

/* ---------------- TREES ---------------- */

function Trees() {
    return (
        <Instances limit={100} castShadow receiveShadow>
            <cylinderGeometry args={[0, 1.5, 5, 8]}/>
            <meshStandardMaterial
                color="#112"
                emissive="#00f6ff"
                emissiveIntensity={0.3}
            />

            {Array.from({length: 40}).map((_, i) => (
                <Instance
                    key={i}
                    position={[
                        (Math.random() - 0.5) * 200,
                        2.5,
                        (Math.random() - 0.5) * 200,
                    ]}
                    rotation={[0, Math.random() * Math.PI, 0]}
                    scale={1 + Math.random()}
                />
            ))}
        </Instances>
    );
}

/* ---------------- CAR ---------------- */

function Car() {
    const keys = useKeyboard();
    const ref = useRef<RapierRigidBody>(null);
    const steering = useRef(0);

    useFrame((_, delta) => {
        if (!ref.current) return;

        const body = ref.current;

        // ----- READ VELOCITY -----
        const lv = body.linvel();
        const speed = Math.hypot(lv.x, lv.y, lv.z);

        // ----- ORIENTATION -----
        const forward = new THREE.Vector3(0, 0, -1)
            .applyQuaternion(body.rotation())
            .normalize();

        const right = new THREE.Vector3(1, 0, 0)
            .applyQuaternion(body.rotation())
            .normalize();

        // =====================================================================
        // 1. **LATERAL FRICTION** — main drift killer
        // =====================================================================
        // Project velocity onto sideways vector
        const lateral = right.x * lv.x + right.z * lv.z;

        // Impulse to cancel sideways motion
        const lateralKill = -lateral * 3.5;             // adjust 6–12 for grip
        body.applyImpulse(
            {x: right.x * lateralKill, y: 0, z: right.z * lateralKill},
            true
        );

        // =====================================================================
        // 2. **LONGITUDINAL ACCELERATION**
        // =====================================================================
        const ACCEL = 200;      // was 200 → slower top speed
        const BRAKE = 250;      // keep braking strong
        const TURN = -0.9;       // was 1.2 → weaker steering input rate

        if (keys.backward) {
            body.applyImpulse(
                {
                    x: forward.x * ACCEL * delta,
                    y: 0,
                    z: forward.z * ACCEL * delta
                },
                true
            );
        }
        if (keys.forward) {
            body.applyImpulse(
                {
                    x: -forward.x * BRAKE * delta,
                    y: 0,
                    z: -forward.z * BRAKE * delta
                },
                true
            );
        }

        // =====================================================================
// 3. STEERING WITH REVERSE LOGIC + FASTER TURNING
// =====================================================================

// steering input
        if (keys.left) steering.current += TURN * 1.2 * delta;   // faster turn
        if (keys.right) steering.current -= TURN * 1.2 * delta;

        const maxSteer = 0.55;   // increased from 0.4
        steering.current = THREE.MathUtils.clamp(
            steering.current,
            -maxSteer,
            maxSteer
        );

// Determine forward or backward
// proj = forward ⋅ velocity  (scalar)
        const proj =
            forward.x * lv.x +
            forward.z * lv.z;

// If proj < 0, car is moving backwards → invert turn direction
        const reverseFactor = proj < 0 ? -1 : 1;

// Normalize steering strength by speed
        const speedFactor = Math.min(speed / 8, 1); // stronger turning

        body.setAngvel(
            {
                x: 0,
                y: steering.current * speedFactor * 5.5 * reverseFactor,
                z: 0
            },
            true
        );

// Auto-centering
        if (!keys.left && !keys.right) {
            steering.current *= 0.90;
        }

    });


    return (
        <RigidBody
            ref={ref}
            colliders={false}
            mass={80}
            restitution={0.05}
            friction={0.5}
            linearDamping={0.05}
            angularDamping={0.15}
            position={[0, 2, 0]}
        >
            {/* ===================== COLLIDERS ===================== */}

            {/* Main chassis */}
            <CuboidCollider args={[1.0, 0.25, 1.6]} position={[0, 0.15, 0]} />

            {/* Wheel contact pads (4-point support) */}
            <CuboidCollider args={[0.45, 0.18, 0.25]} position={[ 0.75, -0.05,  1.25]} />
            <CuboidCollider args={[0.45, 0.18, 0.25]} position={[-0.75, -0.05,  1.25]} />
            <CuboidCollider args={[0.45, 0.18, 0.25]} position={[ 0.75, -0.05, -1.25]} />
            <CuboidCollider args={[0.45, 0.18, 0.25]} position={[-0.75, -0.05, -1.25]} />

            {/* ===================== VISUALS ===================== */}
            <group>
                {/* Body shell */}
                <mesh castShadow position={[0, 0.65, 0]}>
                    <boxGeometry args={[2.2, 0.7, 3.4]} />
                    <meshStandardMaterial
                        color="#0e0f14"
                        metalness={0.65}
                        roughness={0.35}
                        emissive="#00f6ff"
                        emissiveIntensity={0.9}
                    />
                </mesh>

                {/* Cabin */}
                <mesh castShadow position={[0, 1.2, -0.4]}>
                    <boxGeometry args={[1.4, 0.7, 1.7]} />
                    <meshStandardMaterial
                        color="#06080b"
                        metalness={0.9}
                        roughness={0.15}
                        emissive="#4080ff"
                        emissiveIntensity={0.6}
                    />
                </mesh>

                {/* Underglow plate */}
                <mesh castShadow position={[0, 0.25, 0]}>
                    <boxGeometry args={[2.4, 0.08, 3.6]} />
                    <meshStandardMaterial
                        emissive="#00f6ff"
                        emissiveIntensity={3.0}
                        metalness={0}
                        roughness={1}
                        color="#000"
                    />
                </mesh>

                {/* Headlights */}
                <mesh position={[0.6, 0.75, 1.7]}>
                    <boxGeometry args={[0.3, 0.2, 0.1]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh position={[-0.6, 0.75, 1.7]}>
                    <boxGeometry args={[0.3, 0.2, 0.1]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>

                {/* Tail Lights */}
                <mesh position={[0.6, 0.75, -1.7]}>
                    <boxGeometry args={[0.3, 0.2, 0.1]} />
                    <meshBasicMaterial color="#ff0044" />
                </mesh>
                <mesh position={[-0.6, 0.75, -1.7]}>
                    <boxGeometry args={[0.3, 0.2, 0.1]} />
                    <meshBasicMaterial color="#ff0044" />
                </mesh>
            </group>
        </RigidBody>

    );
}

/* ---------------- SCENE ---------------- */

export function NeonDriveScene() {
    return (
        <div
            tabIndex={0}
            autoFocus
            className="w-full h-[700px] bg-black rounded-2xl overflow-hidden border border-slate-800 mt-24"
        >
            <Canvas
                shadows
                camera={{position: [12, 12, 12], fov: 55}}
                onCreated={({gl, scene}) => {
                    gl.setClearColor("#020617");
                    scene.fog = new THREE.Fog("#020617", 20, 150);
                }}
            >
                <ambientLight intensity={0.2}/>
                <directionalLight
                    castShadow
                    intensity={1.2}
                    position={[15, 20, 5]}
                    color="#ffffff"
                />

                <Physics gravity={[0, -30, 0]}>
                    <Ground/>
                    <Trees/>
                    <Car/>
                </Physics>

                <OrbitControls
                    enablePan={false}
                    maxPolarAngle={Math.PI / 2.15}
                    minDistance={6}
                    maxDistance={80}
                />
            </Canvas>
        </div>
    );
}
