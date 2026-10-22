/**
 * MedInVedic Firebase Hosting Auto-Deployer v2
 * Uses Firebase Hosting REST API + gcloud auth token
 * Files are gzip-compressed before upload (required by Firebase)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const zlib = require('zlib');
const { execSync } = require('child_process');

const PROJECT_ID = 'medinvedic';
const PUBLIC_DIR = path.resolve('public');

// Files forbidden on Firebase Spark plan
const FORBIDDEN_EXTS = new Set(['.apk', '.zip', '.exe', '.dll', '.bat', '.cmd', '.sh', '.bin', '.msi', '.ipa']);

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.map': 'application/json',
};

function getMime(file) {
  return MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
}

// Gzip a buffer
function gzipBuffer(buf) {
  return new Promise((resolve, reject) => {
    zlib.gzip(buf, { level: 9 }, (err, result) => err ? reject(err) : resolve(result));
  });
}

// SHA256 of the GZIPPED content (Firebase requires hash of gzipped bytes)
async function sha256Gzipped(filePath) {
  const raw = fs.readFileSync(filePath);
  const compressed = await gzipBuffer(raw);
  return {
    hash: crypto.createHash('sha256').update(compressed).digest('hex'),
    compressed
  };
}

function getAllFiles(dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllFiles(full));
    } else if (!FORBIDDEN_EXTS.has(path.extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

function apiRequest(options, body) {
  return new Promise((resolve, reject) => {
    const reqBody = body != null ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const opts = {
      ...options,
      headers: {
        ...options.headers,
        ...(reqBody ? { 'Content-Length': Buffer.byteLength(reqBody) } : {}),
      }
    };
    const req = https.request(opts, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString();
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw), headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: raw, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (reqBody) req.write(reqBody);
    req.end();
  });
}

function uploadCompressed(uploadBaseUrl, hash, compressedData, token) {
  return new Promise((resolve, reject) => {
    const fullUrl = `${uploadBaseUrl}/${hash}`;
    const hostname = fullUrl.replace('https://', '').split('/')[0];
    const urlPath = fullUrl.replace(`https://${hostname}`, '');

    const req = https.request({
      hostname,
      path: urlPath,
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/octet-stream',
        'Content-Length': compressedData.length,
      }
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    req.write(compressedData);
    req.end();
  });
}

async function deploy() {
  console.log('\n🔐 Getting fresh auth token from gcloud...');
  const token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();
  console.log('✅ Got token (length:', token.length + ')');

  const authHeaders = {
    'Authorization': 'Bearer ' + token,
    'x-goog-user-project': PROJECT_ID,
    'Content-Type': 'application/json',
  };

  // Step 1: Create version
  console.log('\n📁 Creating new Firebase Hosting version...');
  const vRes = await apiRequest({
    hostname: 'firebasehosting.googleapis.com',
    path: `/v1beta1/sites/${PROJECT_ID}/versions`,
    method: 'POST',
    headers: authHeaders,
  }, {
    config: {
      headers: [
        { glob: '**', headers: { 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY' } }
      ],
      redirects: [
        { glob: '/pages/landing.html', statusCode: 302, location: '/landing.html' },
        { glob: '/pages/index.html', statusCode: 302, location: '/index.html' },
      ],
      rewrites: [
        { glob: '/founder', path: '/pages/founder.html' },
        { glob: '/landing', path: '/landing.html' },
        { glob: '/login', path: '/login.html' },
        { glob: '/login.html', path: '/login.html' },
        { glob: '/healthcare', path: '/pages/healthcare.html' },
        { glob: '/health-hub', path: '/pages/health-hub.html' },
        { glob: '/workspace', path: '/pages/workspace.html' },
        { glob: '/simulation-lab', path: '/pages/simulation-lab.html' },
      ]
    }
  });
  if (vRes.status !== 200) {
    console.error('❌ Version creation failed:', JSON.stringify(vRes.data));
    process.exit(1);
  }
  const versionName = vRes.data.name;
  console.log('✅ Version created:', versionName);

  // Step 2: Scan + gzip + hash all files
  console.log('\n📂 Scanning & compressing public/ files...');
  const allFiles = getAllFiles(PUBLIC_DIR);
  console.log(`   Found ${allFiles.length} files (excluding forbidden types)`);

  const fileMap = {};     // webPath -> { hash, compressed, fullPath }
  const hashToWeb = {};   // hash -> webPath
  const filesManifest = {}; // webPath -> hash  (for populateFiles)

  let i = 0;
  for (const fullPath of allFiles) {
    const webPath = '/' + path.relative(PUBLIC_DIR, fullPath).replace(/\\/g, '/');
    const { hash, compressed } = await sha256Gzipped(fullPath);
    fileMap[webPath] = { hash, compressed, fullPath };
    hashToWeb[hash] = webPath;
    filesManifest[webPath] = hash;
    i++;
    if (i % 20 === 0) process.stdout.write(`   Compressed ${i}/${allFiles.length}...\n`);
  }
  console.log(`✅ All ${allFiles.length} files compressed and hashed.`);

  // Step 3: populateFiles
  console.log('\n📋 Sending file manifest to Firebase...');
  const popRes = await apiRequest({
    hostname: 'firebasehosting.googleapis.com',
    path: `/v1beta1/${versionName}:populateFiles`,
    method: 'POST',
    headers: authHeaders,
  }, { files: filesManifest });

  if (popRes.status !== 200) {
    console.error('❌ populateFiles failed:', JSON.stringify(popRes.data).substring(0, 600));
    process.exit(1);
  }

  const uploadUrl = popRes.data.uploadUrl;
  const requiredHashes = popRes.data.uploadRequiredHashes || [];
  console.log(`✅ Manifest accepted. Uploading ${requiredHashes.length} new/changed files...`);

  // Step 4: Upload required gzipped files
  let uploaded = 0;
  let failed = 0;
  for (const hash of requiredHashes) {
    const webPath = hashToWeb[hash];
    if (!webPath || !fileMap[webPath]) {
      console.warn(`  ⚠️  Unknown hash: ${hash}`);
      continue;
    }
    const { compressed } = fileMap[webPath];
    const upRes = await uploadCompressed(uploadUrl, hash, compressed, token);
    if (upRes.status === 200) {
      uploaded++;
      process.stdout.write(`  ✅ [${uploaded}/${requiredHashes.length}] ${webPath}\n`);
    } else {
      failed++;
      process.stdout.write(`  ❌ FAILED ${webPath} → HTTP ${upRes.status}: ${upRes.body.substring(0, 100)}\n`);
    }
  }
  console.log(`\n📊 Upload complete: ${uploaded} ok, ${failed} failed.`);

  if (failed > 0 && uploaded === 0) {
    console.error('❌ All uploads failed. Aborting.');
    process.exit(1);
  }

  // Step 5: Finalize
  console.log('\n🔒 Finalizing version...');
  const finRes = await apiRequest({
    hostname: 'firebasehosting.googleapis.com',
    path: `/v1beta1/${versionName}?update_mask=status`,
    method: 'PATCH',
    headers: authHeaders,
  }, { status: 'FINALIZED' });

  if (finRes.status !== 200) {
    console.error('❌ Finalize failed:', JSON.stringify(finRes.data).substring(0, 400));
    process.exit(1);
  }
  console.log('✅ Version finalized.');

  // Step 6: Release
  console.log('\n🚀 Releasing to production...');
  const relRes = await apiRequest({
    hostname: 'firebasehosting.googleapis.com',
    path: `/v1beta1/sites/${PROJECT_ID}/releases?versionName=${versionName}`,
    method: 'POST',
    headers: authHeaders,
  }, {});

  if (relRes.status !== 200) {
    console.error('❌ Release failed:', JSON.stringify(relRes.data).substring(0, 400));
    process.exit(1);
  }

  console.log('\n🌿 ===================================================');
  console.log('   ✅ MedInVedic LIVE with ALL UPDATES!');
  console.log('   🌐 https://medinvedic.web.app');
  console.log('   🌐 https://medinvedic.web.app/landing.html');
  console.log('   🌐 https://medinvedic.web.app/pages/founder.html');
  console.log('   🌐 https://medinvedic.web.app/pages/login.html');
  console.log('   🌐 https://medinvedic.web.app/index.html');
  console.log('=====================================================\n');
}

deploy().catch(err => {
  console.error('💥 Deploy script crashed:', err.message || err);
  process.exit(1);
});
