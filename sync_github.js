const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const REPO_OWNER = 'dhanesya98';
const REPO_NAME = 'everdeeper';
const BRANCH = 'main';
const ROOT_DIR = __dirname;

function getToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  const candidates = [
    path.join(ROOT_DIR, '.github_token'),
    path.join(process.env.USERPROFILE || 'C:\\Users\\Moses', '.gemini', 'everdeeper_github_token.txt')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      const val = fs.readFileSync(c, 'utf8').trim();
      if (val) return val;
    }
  }
  return null;
}

const TOKEN = getToken();
if (!TOKEN) {
  console.error('[GAGAL] Token GitHub tidak ditemukan. Simpan token ke file .github_token');
  process.exit(1);
}

function request(apiPath, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'api.github.com',
      path: apiPath,
      method: method,
      headers: {
        'User-Agent': 'EverDeeper-SyncTool',
        'Authorization': 'token ' + TOKEN,
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    if (postData) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`API Error [${res.statusCode} ${res.statusMessage}] at ${apiPath}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function getGitBlobSha(buffer) {
  const header = Buffer.from('blob ' + buffer.length + '\0');
  const store = Buffer.concat([header, buffer]);
  return crypto.createHash('sha1').update(store).digest('hex');
}

function scanFiles(dir, baseDir = dir) {
  const result = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const lower = item.toLowerCase();
    if (
      lower === '.git' ||
      lower === 'node_modules' ||
      lower === '.gemini' ||
      lower === 'desktop.ini' ||
      lower.includes('token')
    ) {
      continue;
    }
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      result.push(...scanFiles(fullPath, baseDir));
    } else {
      const relPath = path.relative(baseDir, fullPath).split(path.sep).join('/');
      result.push({ fullPath, relPath });
    }
  }
  return result;
}

async function sync() {
  console.log('====================================================');
  console.log('   EVER DEEPER II - AUTOMATIC GITHUB SYNC          ');
  console.log('   Repository: ' + REPO_OWNER + '/' + REPO_NAME);
  console.log('====================================================\n');

  console.log('[1/5] Menghubungi GitHub API...');
  const ref = await request(`/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/${BRANCH}`);
  const latestCommitSha = ref.object.sha;
  console.log('      Commit terakhir di GitHub: ' + latestCommitSha.slice(0, 7));

  console.log('[2/5] Mengambil struktur file saat ini...');
  const latestCommit = await request(`/repos/${REPO_OWNER}/${REPO_NAME}/git/commits/${latestCommitSha}`);
  const baseTreeSha = latestCommit.tree.sha;
  const treeData = await request(`/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${baseTreeSha}?recursive=1`);

  const remoteMap = new Map();
  for (const item of treeData.tree) {
    if (item.type === 'blob') {
      remoteMap.set(item.path, item.sha);
    }
  }

  console.log('[3/5] Memeriksa perubahan file lokal...');
  const localFiles = scanFiles(ROOT_DIR);
  const changedFiles = [];

  for (const f of localFiles) {
    const buffer = fs.readFileSync(f.fullPath);
    const localSha = getGitBlobSha(buffer);
    const remoteSha = remoteMap.get(f.relPath);

    if (remoteSha !== localSha) {
      changedFiles.push({ ...f, buffer, isNew: !remoteSha });
    }
  }

  if (changedFiles.length === 0) {
    console.log('\n[SELESAI] Semua file sudah 100% sinkron dengan GitHub! Tidak ada perubahan baru.');
    return;
  }

  console.log(`      Ditemukan ${changedFiles.length} file yang perlu diunggah:\n`);
  for (const f of changedFiles) {
    console.log(`      - [${f.isNew ? 'BARU' : 'EDIT'}] ${f.relPath}`);
  }

  console.log('\n[4/5] Mengunggah file ke GitHub...');
  const treeEntries = [];
  for (let i = 0; i < changedFiles.length; i++) {
    const f = changedFiles[i];
    process.stdout.write(`      Mengunggah (${i + 1}/${changedFiles.length}): ${f.relPath}... `);
    
    // Upload blob
    const blob = await request(`/repos/${REPO_OWNER}/${REPO_NAME}/git/blobs`, 'POST', {
      content: f.buffer.toString('base64'),
      encoding: 'base64'
    });

    treeEntries.push({
      path: f.relPath,
      mode: '100644',
      type: 'blob',
      sha: blob.sha
    });
    console.log('OK');
  }

  console.log('\n[5/5] Membuat commit baru dan memperbarui branch main...');
  const newTree = await request(`/repos/${REPO_OWNER}/${REPO_NAME}/git/trees`, 'POST', {
    base_tree: baseTreeSha,
    tree: treeEntries
  });

  const commitMsg = process.argv[2] || `Auto-sync: update ${changedFiles.length} files (${new Date().toLocaleString('id-ID')})`;
  const newCommit = await request(`/repos/${REPO_OWNER}/${REPO_NAME}/git/commits`, 'POST', {
    message: commitMsg,
    tree: newTree.sha,
    parents: [latestCommitSha]
  });

  await request(`/repos/${REPO_OWNER}/${REPO_NAME}/git/refs/heads/${BRANCH}`, 'PATCH', {
    sha: newCommit.sha,
    force: false
  });

  console.log('\n====================================================');
  console.log('   BERHASIL! Commit baru telah dipush ke GitHub:');
  console.log('   SHA:     ' + newCommit.sha);
  console.log('   Link:    https://github.com/' + REPO_OWNER + '/' + REPO_NAME + '/commit/' + newCommit.sha);
  console.log('====================================================\n');
}

sync().catch(err => {
  console.error('\n[GAGAL] Terjadi kesalahan saat sinkronisasi:\n', err.message);
  process.exit(1);
});
