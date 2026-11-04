// One-off: convert frontend/src/data/constants.jsx (pure JS, no imports)
// into JSON consumed by the Go seed command.
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const srcPath = process.argv[2] || 'frontend/src/data/constants.jsx';
const outPath = process.argv[3] || 'backend/seed/data.json';

const src = fs.readFileSync(srcPath, 'utf8');

const cleaned = src
  .replace(/export\s+const\s+/g, 'const ')
  .replace(/export\s+/g, '');

const sandbox = { require };
vm.createContext(sandbox);
vm.runInContext(
  cleaned + '\n;this.__out = { Bio, skills, experiences, education, projects };',
  sandbox
);

const data = sandbox.__out;
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
console.log(`wrote ${outPath} (${JSON.stringify(data).length} bytes)`);
console.log(`  bio: 1, skill groups: ${data.skills.length}, experiences: ${data.experiences.length}, education: ${data.education.length}, projects: ${data.projects.length}`);