const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const dumpFile = path.join(repoRoot, 'database', 'traccar_backup.sql');
const runner = path.join(repoRoot, 'scripts', 'run-import.js');

let timer = null;
const debounceMs = 2000;

function runImport() {
  console.log(new Date().toISOString(), 'Detected change — running import');
  const child = spawn(process.execPath, [runner, dumpFile], { stdio: 'inherit' });
  child.on('close', (code) => {
    if (code === 0) console.log('Import finished successfully');
    else console.error('Import exited with code', code);
  });
}

if (!fs.existsSync(dumpFile)) {
  console.error('Dump file does not exist:', dumpFile);
  process.exit(1);
}

console.log('Watching', dumpFile);
fs.watch(dumpFile, (eventType) => {
  if (eventType === 'change' || eventType === 'rename') {
    if (timer) clearTimeout(timer);
    timer = setTimeout(runImport, debounceMs);
  }
});
