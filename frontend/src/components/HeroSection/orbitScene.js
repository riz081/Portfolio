import {
  AdditiveBlending,
  Group,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

// Display-referred colors. The shader writes them straight to the screen.
const hex = (value) => {
  const n = parseInt(value.slice(1), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

const COLORS = {
  deep: hex('#1B1A4B'),
  primary: hex('#854CE6'),
  light: hex('#C4B1FF'),
  warm: hex('#FF9FD0'),
};

// The four layers of the stack, outermost first. Each ends at its own tilt,
// so the flat stack opens into a gyroscope.
const RINGS = [
  { radius: 2.72, width: 0.78, thickness: 0.1, tilt: [1.05, 0, 0.42], spin: 0.1, phase: 0 },
  { radius: 2.2, width: 0.62, thickness: 0.09, tilt: [-0.62, 0.3, -0.72], spin: -0.16, phase: 1.7 },
  { radius: 1.72, width: 0.5, thickness: 0.08, tilt: [0.34, -0.2, 1.18], spin: 0.22, phase: 3.1 },
  { radius: 1.27, width: 0.4, thickness: 0.07, tilt: [1.42, 0.42, -0.28], spin: -0.3, phase: 4.6 },
];

const ENTRY_SECONDS = 2.2;

// Adaptive quality. 36ms leaves room for browsers that cap at 30fps to save power.
const SAMPLE_FRAMES = 45;
const SLOW_FRAME_MS = 36;
const TOO_SLOW_FRAME_MS = 60;
const MIN_PIXEL_RATIO = 0.75;

const easeOutCubic = (t) => 1 - (1 - t) ** 3;

const vertexShader = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vLocal;
  varying float vRadial;

  void main() {
    vLocal = position;
    vec2 outward = normalize(position.xz + 1e-5);
    vRadial = dot(vec3(outward.x, 0.0, outward.y), normal);
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vN = normalMatrix * normal;
    vV = -view.xyz;
    gl_Position = projectionMatrix * view;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uDeep;
  uniform vec3 uPrimary;
  uniform vec3 uLight;
  uniform vec3 uWarm;
  uniform float uPhase;

  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vLocal;
  varying float vRadial;

  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(vV);
    vec3 L = normalize(vec3(0.45, 0.8, 0.6));

    float facing = max(dot(N, V), 0.0);
    float fresnel = pow(1.0 - facing, 3.0);
    float diffuse = max(dot(N, L), 0.0);
    float band = 0.5 + 0.5 * sin(atan(vLocal.z, vLocal.x) + vLocal.y * 1.6 + uPhase);

    // Outer face: deep glossy violet.
    vec3 color = mix(uDeep, uPrimary, smoothstep(0.0, 0.75, diffuse + band * 0.3));
    color = mix(color, uLight, smoothstep(0.6, 1.0, diffuse) * 0.5);

    // Inner face: lit from within.
    float inward = smoothstep(0.1, 0.9, -vRadial);
    vec3 glow = mix(uLight, uWarm, band);
    color = mix(color, glow, inward * (0.5 + 0.5 * facing));

    vec3 R = reflect(-L, N);
    color += pow(max(dot(R, V), 0.0), 70.0) * 0.85;
    color += fresnel * mix(uLight, vec3(1.0), 0.35) * 0.8;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// A band curved like a slice of a sphere, with rounded edges.
const buildRingGeometry = ({ radius, width, thickness }, segments) => {
  const steps = 36;
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const y = (width / 2) * Math.sign(s) * Math.abs(s) ** 0.45;
    const bulge = -(y * y) / (radius * 2.2);
    const x = radius + bulge + thickness * Math.sign(c) * Math.abs(c) ** 0.45;
    points.push(new Vector2(x, y));
  }
  const geometry = new LatheGeometry(points, segments);
  geometry.computeVertexNormals();
  return geometry;
};

// Renders the orbit into container. Returns a dispose function.
// Throws if WebGL is unavailable.
export function createOrbitScene({ container, onReady, onTooSlow }) {
  const small = window.innerWidth < 768;
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  let pixelRatio = Math.min(window.devicePixelRatio, small ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.prepend(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 60);
  const root = new Group();
  root.position.y = 0.3; // sits slightly high, so the headline only meets its lower edge
  scene.add(root);

  const rings = RINGS.map((config) => {
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uDeep: { value: COLORS.deep },
        uPrimary: { value: COLORS.primary },
        uLight: { value: COLORS.light },
        uWarm: { value: COLORS.warm },
        uPhase: { value: config.phase },
      },
    });
    const mesh = new Mesh(buildRingGeometry(config, small ? 72 : 128), material);
    const pivot = new Group();
    pivot.add(mesh);
    root.add(pivot);
    return { ...config, mesh, pivot };
  });

  // Thin orbit lines with small nodes travelling along them.
  const lineMaterial = new MeshBasicMaterial({
    color: 0xc4b1ff,
    transparent: true,
    opacity: 0.32,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const nodeMaterial = new MeshBasicMaterial({ color: 0xf1e9ff });
  const orbits = [
    { radius: 3.3, tilt: [1.2, 0.1, -0.5], speed: 0.34, phase: 0.6 },
    { radius: 3.62, tilt: [0.9, -0.4, 0.75], speed: -0.22, phase: 3.4 },
  ].map((config) => {
    const pivot = new Group();
    pivot.rotation.set(...config.tilt);
    const line = new Mesh(new TorusGeometry(config.radius, 0.007, 8, small ? 96 : 180), lineMaterial);
    const node = new Mesh(new SphereGeometry(0.055, 16, 16), nodeMaterial);
    pivot.add(line, node);
    root.add(pivot);
    return { ...config, node };
  });

  const resize = () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    // Keep the whole object in frame on narrow and short stages alike.
    const fitHeight = 7.9;
    const fitWidth = 8.4;
    const tanHalf = Math.tan((camera.fov * Math.PI) / 360);
    camera.position.z = Math.max(fitHeight / (2 * tanHalf), fitWidth / (2 * tanHalf * camera.aspect));
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  const pointer = { x: 0, y: 0 };
  const onPointerMove = (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  let frameId = 0;
  let last = 0;
  let elapsed = 0;
  let rotationX = 0;
  let rotationY = 0;
  let notifiedReady = false;

  const render = (dt) => {
    elapsed += dt;
    const entry = easeOutCubic(Math.min(elapsed / ENTRY_SECONDS, 1));

    // Starts as a flat stack, then each layer swings out to its own tilt.
    rings.forEach((ring, index) => {
      const offset = (index - 1.5) * 0.5 * (1 - entry);
      ring.pivot.position.y = offset;
      ring.pivot.rotation.set(ring.tilt[0] * entry, ring.tilt[1] * entry, ring.tilt[2] * entry);
      ring.mesh.rotation.y = elapsed * ring.spin;
    });
    root.scale.setScalar(0.82 + 0.18 * entry);

    orbits.forEach((orbit) => {
      const a = elapsed * orbit.speed + orbit.phase;
      orbit.node.position.set(Math.cos(a) * orbit.radius, Math.sin(a) * orbit.radius, 0);
    });

    // Slow drift, a gentle response to the pointer, and a turn as the page scrolls.
    const scrollTurn = Math.min(window.scrollY / window.innerHeight, 1.5) * 0.9;
    const targetY = pointer.x * 0.28 + Math.sin(elapsed * 0.3) * 0.12 + scrollTurn;
    const targetX = pointer.y * 0.16 + Math.cos(elapsed * 0.23) * 0.05;
    const ease = Math.min(dt * 2.5, 1);
    rotationY += (targetY - rotationY) * ease;
    rotationX += (targetX - rotationX) * ease;
    root.rotation.set(rotationX, rotationY, 0);

    renderer.render(scene, camera);

    if (!notifiedReady) {
      notifiedReady = true;
      onReady?.();
    }
  };

  let sampleTotal = 0;
  let sampleCount = 0;

  // Lowers resolution when frames run long. Returns false if even the lowest
  // setting is too slow, so the hero can switch to its static poster.
  const adaptQuality = (frameMs) => {
    if (frameMs > 250) return true; // a tab switch or a pause, not a slow frame
    sampleTotal += frameMs;
    sampleCount += 1;
    if (sampleCount < SAMPLE_FRAMES) return true;
    const average = sampleTotal / sampleCount;
    sampleTotal = 0;
    sampleCount = 0;
    if (average <= SLOW_FRAME_MS) return true;
    if (pixelRatio > MIN_PIXEL_RATIO) {
      pixelRatio = Math.max(pixelRatio - 0.25, MIN_PIXEL_RATIO);
      renderer.setPixelRatio(pixelRatio);
      resize();
      return true;
    }
    return average <= TOO_SLOW_FRAME_MS;
  };

  const loop = (now) => {
    const frameMs = last ? now - last : 0;
    const dt = last ? Math.min(frameMs / 1000, 0.05) : 0.016;
    last = now;
    render(dt);
    if (frameMs && !adaptQuality(frameMs)) {
      frameId = 0;
      onTooSlow?.();
      return;
    }
    frameId = requestAnimationFrame(loop);
  };
  const start = () => {
    if (frameId) return;
    last = 0;
    frameId = requestAnimationFrame(loop);
  };
  const stop = () => {
    cancelAnimationFrame(frameId);
    frameId = 0;
  };

  // No GPU work while the hero is off screen.
  const visibility = new IntersectionObserver(([entryState]) => {
    if (entryState.isIntersecting) start();
    else stop();
  });
  visibility.observe(container);

  return () => {
    stop();
    visibility.disconnect();
    resizeObserver.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
    scene.traverse((object) => {
      object.geometry?.dispose();
      object.material?.dispose();
    });
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  };
}
