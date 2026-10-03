import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(here, '..', 'src', 'generated-config.ts');
const raw = process.env.CIVICSOLVE_API || 'http://127.0.0.1:8000/api';
const api = raw.replace(/\/$/, '') + (raw.endsWith('/api') ? '' : '/api');

fs.writeFileSync(output, `// Generated at build/run time; do not edit manually.\nexport const API_BASE = ${JSON.stringify(api)};\n`);
console.log(`CIVICSOLVE API → ${api}`);
