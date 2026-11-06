import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
} from 'three';

const COLORS = {
  fill: new Color('#18222F'),
  detail: new Color('#202C3B'),
  edge: new Color('#6F8BA8'),
  scan: new Color('#A78BFA'),
};

const PLATE_W = 5;
const PLATE_D = 3.4;
const GAP = 1.45;
const ENTRY_SECONDS = 1.4;
const SWEEP_SECONDS = 3;
const REST_SECONDS = 3.5;

const easeOutCubic = (t) => 1 - (1 - t) ** 3;

// Exploded axonometric view of an application stack, swept by a security scan.
// Returns a dispose function. Throws if WebGL is unavailable.
export function createStackScene({ container, labelFor, onReady }) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.prepend(renderer.domElement);

  const scene = new Scene();
  const camera = new OrthographicCamera();
  camera.position.set(10, 8.16, 10); // true isometric elevation
  camera.lookAt(0, 0, 0);

  const root = new Group();
  scene.add(root);

  const fillMaterial = new MeshBasicMaterial({
    color: COLORS.fill,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const detailMaterial = new MeshBasicMaterial({
    color: COLORS.detail,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });

  const addSolid = (parent, geometry, edgeMaterial, x, y, z, material = detailMaterial) => {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, z);
    const edges = new LineSegments(new EdgesGeometry(geometry, 30), edgeMaterial);
    edges.position.copy(mesh.position);
    parent.add(mesh, edges);
  };

  const box = (w, h, d) => new BoxGeometry(w, h, d);

  const details = {
    client(group, edge) {
      addSolid(group, box(1, 0.06, 2), edge, -1.5, 0.08, 0);
      addSolid(group, box(0.7, 0.06, 0.3), edge, -1.5, 0.14, -0.5);
      addSolid(group, box(0.7, 0.06, 0.7), edge, -1.5, 0.14, 0.2);
      addSolid(group, box(2.6, 0.06, 2), edge, 0.6, 0.08, 0);
      addSolid(group, box(2.2, 0.06, 0.35), edge, 0.6, 0.14, -0.65);
      addSolid(group, box(1, 0.06, 0.9), edge, 0.05, 0.14, 0.2);
      addSolid(group, box(1, 0.06, 0.9), edge, 1.15, 0.14, 0.2);
    },
    api(group, edge) {
      [-1.05, -0.35, 0.35, 1.05].forEach((z, i) => {
        addSolid(group, box(3.2 - i * 0.4, 0.05, 0.08), edge, -0.2 + i * 0.2, 0.08, z);
        addSolid(group, box(0.3, 0.2, 0.3), edge, -2 + i * 0.2 + i * 0.2, 0.15, z);
        addSolid(group, box(0.3, 0.2, 0.3), edge, 1.7, 0.15, z);
      });
    },
    services(group, edge) {
      [-1.45, 0, 1.45].forEach((x) => {
        [-0.7, 0.7].forEach((z) => addSolid(group, box(1, 0.45, 1), edge, x, 0.28, z));
      });
    },
    data(group, edge) {
      [-1.45, 0, 1.45].forEach((x) => {
        addSolid(group, new CylinderGeometry(0.62, 0.62, 0.3, 28), edge, x, 0.2, 0);
        addSolid(group, new CylinderGeometry(0.62, 0.62, 0.3, 28), edge, x, 0.52, 0);
      });
    },
  };

  const layers = Object.keys(details).map((name, index) => {
    const edgeMaterial = new LineBasicMaterial({ color: COLORS.edge.clone() });
    const group = new Group();
    addSolid(group, box(PLATE_W, 0.1, PLATE_D), edgeMaterial, 0, 0, 0, fillMaterial);
    details[name](group, edgeMaterial);
    root.add(group);
    return {
      name,
      group,
      edgeMaterial,
      targetY: (1.5 - index) * GAP,
      heat: 0,
      label: labelFor(name),
    };
  });

  const scanMaterial = new MeshBasicMaterial({
    color: COLORS.scan,
    transparent: true,
    opacity: 0,
    side: DoubleSide,
    depthWrite: false,
  });
  const scanEdgeMaterial = new LineBasicMaterial({ color: COLORS.scan, transparent: true, opacity: 0 });
  const scanGeometry = new PlaneGeometry(PLATE_W + 1, PLATE_D + 1);
  const scan = new Group();
  const scanPlane = new Mesh(scanGeometry, scanMaterial);
  scanPlane.rotation.x = -Math.PI / 2;
  const scanEdges = new LineSegments(new EdgesGeometry(scanGeometry), scanEdgeMaterial);
  scanEdges.rotation.x = -Math.PI / 2;
  scan.add(scanPlane, scanEdges);
  root.add(scan);
  const scanLabel = labelFor('scan');

  let width = 0;
  let height = 0;
  const resize = () => {
    width = container.clientWidth;
    height = container.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height);
    const aspect = width / height;
    let frustumH = 10.5;
    let frustumW = frustumH * aspect;
    const minW = 11.5;
    if (frustumW < minW) {
      frustumW = minW;
      frustumH = frustumW / aspect;
    }
    // The model sits left of centre, leaving room for its labels on the right.
    camera.left = -frustumW * 0.42;
    camera.right = frustumW * 0.58;
    camera.top = frustumH / 2;
    camera.bottom = -frustumH / 2;
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

  const placeLabel = (element, localPoint) => {
    if (!element) return;
    const point = root.localToWorld(localPoint).project(camera);
    const x = (point.x * 0.5 + 0.5) * width;
    const y = (-point.y * 0.5 + 0.5) * height;
    element.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translateY(-50%)`;
  };

  const anchor = new Vector3();
  let rotationX = 0;
  let rotationY = 0;
  let frameId = 0;
  let last = 0;
  let elapsed = 0;
  let notifiedReady = false;

  const render = (dt) => {
    elapsed += dt;

    // Load sequence: plates start stacked and pull apart.
    layers.forEach((layer, index) => {
      const t = Math.min(Math.max((elapsed - index * 0.08) / ENTRY_SECONDS, 0), 1);
      const eased = easeOutCubic(t);
      layer.group.position.y = layer.targetY * (0.06 + 0.94 * eased);
    });

    // Scan: sweeps top to bottom, lights each plate it crosses, then rests.
    const cycle = (Math.max(elapsed - ENTRY_SECONDS, 0)) % (SWEEP_SECONDS + REST_SECONDS);
    const sweeping = elapsed > ENTRY_SECONDS && cycle < SWEEP_SECONDS;
    const progress = sweeping ? cycle / SWEEP_SECONDS : 0;
    const top = 1.5 * GAP + 0.9;
    const scanY = top - progress * 2 * top;
    scan.position.y = scanY;
    const fade = sweeping ? Math.min(progress * 8, (1 - progress) * 8, 1) : 0;
    scanMaterial.opacity = 0.14 * fade;
    scanEdgeMaterial.opacity = fade;

    layers.forEach((layer) => {
      const crossing = sweeping && Math.abs(layer.group.position.y - scanY) < 0.4;
      layer.heat = crossing ? 1 : Math.max(layer.heat - dt * 0.7, 0);
      layer.edgeMaterial.color.lerpColors(COLORS.edge, COLORS.scan, layer.heat);
      if (layer.label) layer.label.dataset.lit = layer.heat > 0.15 ? 'true' : 'false';
    });

    // Follows the pointer gently, with a slow idle drift.
    const targetY = pointer.x * 0.22 + Math.sin(elapsed * 0.35) * 0.08;
    const targetX = pointer.y * 0.06;
    rotationY += (targetY - rotationY) * Math.min(dt * 3, 1);
    rotationX += (targetX - rotationX) * Math.min(dt * 3, 1);
    root.rotation.y = rotationY;
    root.rotation.x = rotationX;
    root.updateMatrixWorld();

    layers.forEach((layer) => {
      placeLabel(layer.label, anchor.set(PLATE_W / 2, layer.group.position.y, -PLATE_D / 2));
    });
    if (scanLabel) {
      scanLabel.style.opacity = fade;
      placeLabel(scanLabel, anchor.set(-PLATE_W / 2 - 0.5, scanY, PLATE_D / 2 + 0.5));
    }

    renderer.render(scene, camera);

    if (!notifiedReady) {
      notifiedReady = true;
      onReady?.();
    }
  };

  const loop = (now) => {
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;
    render(dt);
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

  // No GPU work while the hero is off screen; browsers pause rAF in hidden tabs.
  const visibility = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) start();
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
