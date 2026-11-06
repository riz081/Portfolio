// Decides whether the 3D hero should run at all, and loads it once.
// Everything else falls back to the static SVG poster.
export const canRunScene = () => {
  const { connection, deviceMemory, hardwareConcurrency } = navigator;
  if (connection?.saveData) return false;
  if (deviceMemory && deviceMemory <= 2) return false;
  if (hardwareConcurrency && hardwareConcurrency <= 2) return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

export const loadOrbitScene = () => import('./orbitScene');
