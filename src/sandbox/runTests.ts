import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

interface TestResult {
  passed: boolean;
  output: string;
}

function runCommand(command: string, args: string[], cwd: string): Promise<{ code: number, output: string }> {
  return new Promise((resolve) => {
    let output = '';
    const child = spawn(command, args, { cwd, shell: true });
    child.stdout.on('data', (data: Buffer) => output += data.toString());
    child.stderr.on('data', (data: Buffer) => output += data.toString());
    child.on('close', (code: number | null) => resolve({ code: code ?? 1, output }));
  });
}

function detectPackageManager(localPath: string): string {
  if (fs.existsSync(path.join(localPath, 'pnpm-lock.yaml'))) return 'pnpm'
  if (fs.existsSync(path.join(localPath, 'yarn.lock'))) return 'yarn'
  return 'npm'
}

export async function installDeps(localPath: string): Promise<void> {
  console.log('📦 Installing dependencies...');
  const pm = detectPackageManager(localPath)
  await runCommand(pm, ['install'], localPath)
}

export async function runTests(localPath: string): Promise<TestResult> {
  console.log('🧪 Running tests...');
  const pm = detectPackageManager(localPath)
  const result = await runCommand(pm, ['test'], localPath)
  return {
    passed: result.code === 0,
    output: result.output
  }
}