/**
 * Particle field: the ring from the closing section of antigravity.google,
 * above the footer, built as a GPU particle sim in three.js.
 *
 * A Poisson-disk field of points lives in a float texture. Each frame a
 * fragment shader moves every point: simplex-noise drift everywhere, plus a
 * ring band that scales points up and drags them toward the ring centre.
 * A second pass draws each point as a small rounded bar turned to face the
 * ring, coloured by slow noise across a three-stop gradient. The two
 * position targets ping-pong between frames.
 *
 * Ported from a full-window page: here it sizes to `host` and reads the
 * pointer relative to it. Returns { destroy }.
 */

import * as THREE from 'three';

export type ParticleFieldTheme = 'dark' | 'light';

// ---- Tunables ----
const RING_WIDTH = 0.15;
const RING_WIDTH_2 = 0.05;
const RING_DISPLACEMENT = 0.23;
const DENSITY = 220;
const PARTICLES_SCALE = 0.65;
const SIZE = 256; // sim texture side; caps the point count at SIZE²

const NOISE_GLSL = /* glsl */ `
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  // Simplex 3D noise, Ian McEwan, Ashima Arts
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
`;

const remap = (v: number, a: number, b: number, c: number, d: number) => ((v - a) * (d - c)) / (b - a) + c;

/** 1D value noise; wanders the ring when the pointer is away. */
class Noise1D {
    private readonly r = Array.from({ length: 256 }, Math.random);
    get(x: number) {
        const n = Math.floor(x), f = x - n, s = f * f * (3 - 2 * f), a = n % 255, b = (a + 1) % 255;
        return this.r[a] * (1 - s) + this.r[b] * s;
    }
}

/** Bridson Poisson-disk sampling, candidates in the annulus [minD, maxD]. */
function poisson(w: number, h: number, minD: number, maxD: number, tries: number) {
    const cell = minD / Math.SQRT2, gw = Math.ceil(w / cell), gh = Math.ceil(h / cell);
    const grid = new Int32Array(gw * gh).fill(-1);
    const pts: [number, number][] = [], active: number[] = [];
    const add = (x: number, y: number) => {
        pts.push([x, y]);
        active.push(pts.length - 1);
        grid[Math.floor(y / cell) * gw + Math.floor(x / cell)] = pts.length - 1;
    };
    add(Math.random() * w, Math.random() * h);
    while (active.length) {
        const ai = Math.floor(Math.random() * active.length), p = pts[active[ai]];
        let found = false;
        for (let k = 0; k < tries; k++) {
            const a = Math.random() * Math.PI * 2, r = minD + Math.random() * (maxD - minD);
            const x = p[0] + Math.cos(a) * r, y = p[1] + Math.sin(a) * r;
            if (x < 0 || y < 0 || x >= w || y >= h) continue;
            const gx = Math.floor(x / cell), gy = Math.floor(y / cell);
            let ok = true;
            for (let yy = Math.max(0, gy - 2); yy <= Math.min(gh - 1, gy + 2) && ok; yy++) {
                for (let xx = Math.max(0, gx - 2); xx <= Math.min(gw - 1, gx + 2); xx++) {
                    const q = grid[yy * gw + xx];
                    if (q >= 0) {
                        const dx = pts[q][0] - x, dy = pts[q][1] - y;
                        if (dx * dx + dy * dy < minD * minD) { ok = false; break; }
                    }
                }
            }
            if (ok) { add(x, y); found = true; break; }
        }
        if (!found) active.splice(ai, 1);
    }
    return pts;
}

export function startParticleField(host: HTMLElement, theme: ParticleFieldTheme): { destroy(): void } {
    THREE.ColorManagement.enabled = false;

    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, fine ? 2 : 1.5);
    const dark = theme === 'dark';

    const renderer = new THREE.WebGLRenderer({ antialias: fine, alpha: true, powerPreference: 'high-performance', stencil: false, precision: 'highp' });
    renderer.extensions.get('EXT_color_buffer_float');
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.style.cssText = 'position:absolute;inset:0;display:block';
    host.appendChild(renderer.domElement);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(host.clientWidth, host.clientHeight);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(dark ? 0x000000 : 0xffffff);
    const camera = new THREE.PerspectiveCamera(40, host.clientWidth / host.clientHeight, 0.1, 1000);
    camera.position.z = 3.1;

    const colors = {
        c1: dark ? '#7189ff' : '#2c64ed',
        c2: dark ? '#3074f9' : '#f84242',
        c3: dark ? '#000000' : '#ffcf03',
    };

    // ---- points ----
    const pts = poisson(500, 500, remap(DENSITY, 0, 300, 10, 2), remap(DENSITY, 0, 300, 11, 3), 20);
    const count = Math.min(pts.length, SIZE * SIZE);

    const posData = new Float32Array(SIZE * SIZE * 4);
    for (let i = 0; i < count; i++) {
        posData[i * 4] = (pts[i][0] - 250) / 250;
        posData[i * 4 + 1] = (pts[i][1] - 250) / 250;
    }
    const posTex = new THREE.DataTexture(posData, SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType);
    posTex.needsUpdate = true;

    const makeRT = () => new THREE.WebGLRenderTarget(SIZE, SIZE, {
        wrapS: THREE.ClampToEdgeWrapping, wrapT: THREE.ClampToEdgeWrapping,
        minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat, type: THREE.FloatType, depthBuffer: false, stencilBuffer: false,
    });
    let rt1 = makeRT(), rt2 = makeRT();

    // ---- simulation pass ----
    const simScene = new THREE.Scene();
    const simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const simGeo = new THREE.PlaneGeometry(2, 2);
    const simMat = new THREE.ShaderMaterial({
        uniforms: {
            uPosition: { value: posTex }, uPosRefs: { value: posTex },
            uRingPos: { value: new THREE.Vector2() }, uRingRadius: { value: 0.2 },
            uDeltaTime: { value: 0 }, uRingWidth: { value: RING_WIDTH }, uRingWidth2: { value: RING_WIDTH_2 },
            uRingDisplacement: { value: RING_DISPLACEMENT }, uTime: { value: 0 },
        },
        vertexShader: /* glsl */ `void main(){ gl_Position = vec4(position, 1.0); }`,
        fragmentShader: /* glsl */ `
            precision highp float;
            uniform sampler2D uPosition; uniform sampler2D uPosRefs;
            uniform vec2 uRingPos; uniform float uTime; uniform float uDeltaTime; uniform float uRingRadius;
            uniform float uRingWidth; uniform float uRingWidth2; uniform float uRingDisplacement;
            ${NOISE_GLSL}
            void main(){
              vec2 st = gl_FragCoord.xy / vec2(${SIZE.toFixed(1)});
              vec4 pFrame = texture2D(uPosition, st);
              float scale = pFrame.z;
              float velocity = pFrame.w;
              vec2 refPos = texture2D(uPosRefs, st).xy;
              float time = uTime * .5;
              vec2 cur = refPos;
              vec2 pos = pFrame.xy * .8;

              float dist = distance(cur, uRingPos);
              float noise0 = snoise(vec3(cur * .2 + vec2(18.4924, 72.9744), time * 0.5));
              float dist1 = distance(cur + noise0 * .005, uRingPos);

              float t  = smoothstep(uRingRadius - uRingWidth * 2., uRingRadius, dist) - smoothstep(uRingRadius, uRingRadius + uRingWidth, dist1);
              float t2 = smoothstep(uRingRadius - uRingWidth2 * 2., uRingRadius, dist) - smoothstep(uRingRadius, uRingRadius + uRingWidth2, dist1);
              float t3 = smoothstep(uRingRadius + uRingWidth2, uRingRadius, dist);
              t = pow(t, 2.);
              t2 = pow(t2, 3.);
              t += t2 * 3.;
              t += t3 * .4;
              t += snoise(vec3(cur * 30. + vec2(11.4924, 12.9744), time * 0.5)) * t3 * .5;
              float nS = snoise(vec3(cur * 2. + vec2(18.4924, 72.9744), time * 0.5));
              t += pow((nS + 1.5) * .5, 2.) * .6;

              float n1 = snoise(vec3(cur * 4. + vec2(88.494, 32.4397), time * 0.35));
              float n2 = snoise(vec3(cur * 4. + vec2(50.904, 120.947), time * 0.35));
              float n3 = snoise(vec3(cur * 20. + vec2(18.4924, 72.9744), time * .5));
              float n4 = snoise(vec3(cur * 20. + vec2(50.904, 120.947), time * .5));
              vec2 disp = vec2(n1, n2) * .03 + vec2(n3, n4) * .005;
              disp.x += sin(refPos.x * 20. + time * 4.) * .02 * clamp(dist, 0., 1.);
              disp.y += cos(refPos.y * 20. + time * 3.) * .02 * clamp(dist, 0., 1.);

              pos -= (uRingPos - (cur + disp)) * pow(t2, .75) * uRingDisplacement;

              scale += (t - scale) * .2;
              vec2 finalPos = cur + disp + pos * .25;
              velocity = velocity * .5 + scale * .25;
              gl_FragColor = vec4(finalPos, scale, velocity);
            }`,
    });
    simScene.add(new THREE.Mesh(simGeo, simMat));

    // ---- render pass ----
    const geo = new THREE.BufferGeometry();
    const uvs = new Float32Array(count * 2), seeds = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
        uvs[i * 2] = ((i % SIZE) + 0.5) / SIZE;
        uvs[i * 2 + 1] = (Math.floor(i / SIZE) + 0.5) / SIZE;
        for (let k = 0; k < 4; k++) seeds[i * 4 + k] = Math.random();
    }
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setAttribute('seeds', new THREE.BufferAttribute(seeds, 4));

    const particleScale = () => (renderer.domElement.width / pixelRatio / 2000) * PARTICLES_SCALE;

    const renderMat = new THREE.ShaderMaterial({
        uniforms: {
            uPosition: { value: posTex }, uTime: { value: 0 },
            uColor1: { value: new THREE.Color(colors.c1) }, uColor2: { value: new THREE.Color(colors.c2) }, uColor3: { value: new THREE.Color(colors.c3) },
            uAlpha: { value: 1 }, uRingPos: { value: new THREE.Vector2() },
            uRez: { value: new THREE.Vector2(renderer.domElement.width, renderer.domElement.height) },
            uParticleScale: { value: particleScale() }, uPixelRatio: { value: pixelRatio },
            uColorScheme: { value: dark ? 0 : 1 },
        },
        vertexShader: /* glsl */ `
            precision highp float;
            attribute vec4 seeds;
            uniform sampler2D uPosition; uniform float uTime; uniform float uParticleScale; uniform float uPixelRatio;
            varying vec4 vSeeds; varying float vVelocity; varying vec2 vLocalPos; varying vec2 vScreenPos; varying float vScale;
            void main(){
              vec4 pos = texture2D(uPosition, uv);
              vSeeds = seeds; vVelocity = pos.w; vScale = pos.z; vLocalPos = pos.xy;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xy, 0., 1.);
              vScreenPos = gl_Position.xy;
              gl_PointSize = vScale * 7. * (uPixelRatio * 0.5) * uParticleScale;
            }`,
        fragmentShader: /* glsl */ `
            precision highp float;
            varying vec4 vSeeds; varying vec2 vScreenPos; varying vec2 vLocalPos; varying float vScale; varying float vVelocity;
            uniform vec3 uColor1; uniform vec3 uColor2; uniform vec3 uColor3;
            uniform vec2 uRingPos; uniform vec2 uRez; uniform float uAlpha; uniform float uTime; uniform int uColorScheme;
            ${NOISE_GLSL}
            float sdRoundBox(in vec2 p, in vec2 b, in vec4 r){
              r.xy = (p.x > 0.0) ? r.xy : r.zw; r.x = (p.y > 0.0) ? r.x : r.y;
              vec2 q = abs(p) - b + r.x;
              return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
            }
            vec2 rotate(vec2 v, float a){ float s = sin(a), c = cos(a); return mat2(c, s, -s, c) * v; }
            void main(){
              float noiseAngle = snoise(vec3(vLocalPos * 10. + vec2(18.4924, 72.9744), uTime * .85));
              float noiseColor = (snoise(vec3(vLocalPos * 2. + vec2(74.664, 91.556), uTime * .5)) + 1.) * .5;
              float angle = atan(vLocalPos.y - uRingPos.y, vLocalPos.x - uRingPos.x);
              vec2 uv = gl_PointCoord.xy - 0.5;
              uv.y *= -1.;
              uv = rotate(uv, -angle + noiseAngle * .5);

              float h = 0.8;
              float progress = smoothstep(0., .75, pow(noiseColor, 2.));
              vec3 color = mix(mix(uColor1, uColor2, progress / h), mix(uColor2, uColor3, (progress - h) / (1.0 - h)), step(h, progress));

              float rounded = smoothstep(.1, 0., sdRoundBox(uv, vec2(0.5, 0.2), vec4(.25)));
              float a = uAlpha * rounded * smoothstep(0.1, 0.2, vScale);
              if (a < 0.01) discard;

              color = clamp(color, 0., 1.);
              color = mix(color, color * clamp(vVelocity, 0., 1.), float(uColorScheme));
              gl_FragColor = vec4(color, clamp(a, 0., 1.));
              #ifdef SRGB_TRANSFER
                gl_FragColor = sRGBTransferOETF(gl_FragColor);
              #endif
            }`,
        transparent: true, depthTest: false, depthWrite: false,
    });
    const points = new THREE.Points(geo, renderMat);
    points.frustumCulled = false;
    points.scale.set(5, 5, 5);
    scene.add(points);

    // ---- interaction ----
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const hit = new THREE.Vector3();
    const planeGeo = new THREE.PlaneGeometry(12.5, 12.5);
    const planeMat = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    scene.add(plane);

    let pointer: { x: number; y: number } | null = null;
    const onPointerMove = (e: PointerEvent) => { pointer = { x: e.clientX, y: e.clientY }; };
    const onPointerLeave = () => { pointer = null; };
    host.addEventListener('pointermove', onPointerMove, { passive: true });
    host.addEventListener('pointerleave', onPointerLeave);

    const resize = () => {
        const w = host.clientWidth, h = host.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderMat.uniforms.uRez.value.set(renderer.domElement.width, renderer.domElement.height);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const noise = new Noise1D();
    const ringPos = new THREE.Vector2(), cursorPos = new THREE.Vector2();
    const timer = new THREE.Timer();
    let time = 0, everRendered = false;

    renderer.setAnimationLoop((now) => {
        timer.update(now);
        const dt = timer.getDelta();
        const el = timer.getElapsed();
        time += dt;

        // raycast the pointer onto the plane
        let isIntersecting = false;
        if (pointer) {
            const r = renderer.domElement.getBoundingClientRect();
            mouse.set(((pointer.x - r.left) / r.width) * 2 - 1, -((pointer.y - r.top) / r.height) * 2 + 1);
            if (Math.abs(mouse.x) <= 1 && Math.abs(mouse.y) <= 1) {
                raycaster.setFromCamera(mouse, camera);
                const ints = raycaster.intersectObject(plane);
                if (ints.length) { hit.copy(ints[0].point); isIntersecting = true; }
            }
        }

        const nx = (noise.get(time * 0.66 + 94.234) - 0.5) * 2;
        const ny = (noise.get(time * 0.75 + 21.028) - 0.5) * 2;
        if (isIntersecting) {
            cursorPos.set(hit.x * 0.175 + nx * 0.1, hit.y * 0.175 + ny * 0.1);
            ringPos.x += (cursorPos.x - ringPos.x) * 0.02;
            ringPos.y += (cursorPos.y - ringPos.y) * 0.02;
        } else {
            cursorPos.set(nx * 0.2, ny * 0.1);
            ringPos.x += (cursorPos.x - ringPos.x) * 0.01;
            ringPos.y += (cursorPos.y - ringPos.y) * 0.01;
        }

        const su = simMat.uniforms;
        su.uPosition.value = everRendered ? rt1.texture : posTex;
        su.uTime.value = el;
        su.uDeltaTime.value = dt;
        su.uRingRadius.value = 0.175 + Math.sin(time) * 0.03 + Math.cos(time * 3) * 0.02;
        su.uRingPos.value.copy(ringPos);
        renderer.setRenderTarget(rt2);
        renderer.render(simScene, simCamera);
        renderer.setRenderTarget(null);

        const ru = renderMat.uniforms;
        ru.uPosition.value = everRendered ? rt2.texture : posTex;
        ru.uTime.value = el;
        ru.uRingPos.value.copy(ringPos);
        ru.uParticleScale.value = particleScale();

        renderer.render(scene, camera);
        [rt1, rt2] = [rt2, rt1];
        everRendered = true;
    });

    return {
        destroy() {
            renderer.setAnimationLoop(null);
            ro.disconnect();
            host.removeEventListener('pointermove', onPointerMove);
            host.removeEventListener('pointerleave', onPointerLeave);
            [posTex, rt1, rt2, simGeo, simMat, geo, renderMat, planeGeo, planeMat].forEach((r) => r.dispose());
            renderer.dispose();
            renderer.forceContextLoss();
            renderer.domElement.remove();
        },
    };
}
