#!/usr/bin/env node
const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const inFile = path.join(repoRoot, 'assets', 'aiflow-ref.mov');
const outDir = path.join(repoRoot, 'assets', 'aiflow-frames');

if (!fs.existsSync(inFile)) {
  console.error('Input file not found:', inFile);
  process.exit(2);
}
fs.mkdirSync(outDir, { recursive: true });

const args = ['-y', '-i', inFile, '-vf', 'fps=6', path.join(outDir, 'frame_%04d.png')];

console.log('Running ffmpeg:', ffmpegPath, args.join(' '));
const ff = spawn(ffmpegPath, args, { stdio: 'inherit' });
ff.on('error', (err) => {
  console.error('Failed to run ffmpeg:', err);
  process.exit(1);
});
ff.on('close', (code) => {
  if (code === 0) console.log('Frames extracted to', outDir);
  else console.error('ffmpeg exited with code', code);
  process.exit(code);
});
