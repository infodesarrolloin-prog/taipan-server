const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const repoRoot = path.resolve(__dirname, '..');
const defaultDump = path.join(repoRoot, 'database', 'traccar_backup.sql');

const dumpPath = process.argv[2] || defaultDump;

if (!fs.existsSync(dumpPath)) {
  console.error(`Dump not found: ${dumpPath}`);
  process.exit(1);
}

function runCommand(cmd, args, opts = {}) {
  const child = spawn(cmd, args, Object.assign({ stdio: 'inherit' }, opts));
  child.on('close', (code) => {
    if (code !== 0) process.exit(code);
  });
}

if (process.platform === 'win32') {
  // Use PowerShell script on Windows
  const script = path.join(repoRoot, 'scripts', 'import-db.ps1');
  runCommand('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, '-DumpPath', dumpPath]);
} else {
  // POSIX: use shell script
  const script = path.join(repoRoot, 'scripts', 'import-db.sh');
  runCommand(script, [dumpPath], { shell: true });
}
