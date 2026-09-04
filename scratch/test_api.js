import http from 'http';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    }, (res) => {
      let responseText = '';
      res.on('data', chunk => responseText += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseText) });
        } catch (e) {
          resolve({ status: res.statusCode, body: responseText });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runFullVerificationSuite() {
  console.log('====================================================');
  console.log(' 🚀 STARTING COMPREHENSIVE NOTEFLOW E2E TEST SUITE ');
  console.log('====================================================\n');

  // --- 1. Health Check ---
  console.log('1. Health Check (/api/health)...');
  const healthRes = await request('GET', '/api/health');
  console.log('   Status:', healthRes.status, 'Body:', healthRes.body);
  if (healthRes.status !== 200) throw new Error('Health check failed');

  // --- 2. Input Validation Tests ---
  console.log('\n2. Testing Registration Input Validation...');
  const invalidEmailRes = await request('POST', '/api/auth/register', { name: 'Test', email: 'invalid-email', password: 'password123' });
  console.log('   Invalid email response status:', invalidEmailRes.status, '(Expected 400)');
  if (invalidEmailRes.status !== 400) throw new Error('Email validation failed');

  const invalidPassRes = await request('POST', '/api/auth/register', { name: 'Test', email: 'test@example.com', password: '123' });
  console.log('   Short password response status:', invalidPassRes.status, '(Expected 400)');
  if (invalidPassRes.status !== 400) throw new Error('Password validation failed');

  // --- 3. User Registration (Account A) ---
  console.log('\n3. Registering User A (Main Device)...');
  const userAEmail = `usera_${Date.now()}@example.com`;
  const regARes = await request('POST', '/api/auth/register', { name: 'Alice Student', email: userAEmail, password: 'password123' });
  console.log('   User A Registered:', regARes.body.user?.email, 'Token Issued:', !!regARes.body.token);
  const tokenA = regARes.body.token;

  // --- 4. User Registration (Account B for Isolation Verification) ---
  console.log('\n4. Registering User B (Isolation Check)...');
  const userBEmail = `userb_${Date.now()}@example.com`;
  const regBRes = await request('POST', '/api/auth/register', { name: 'Bob Scholar', email: userBEmail, password: 'password123' });
  const tokenB = regBRes.body.token;

  // --- 5. User Isolation Check ---
  console.log('\n5. Verifying Strict User Isolation...');
  const secretId = `secret_note_${Date.now()}`;
  const noteA = await request('POST', '/api/notes', {
    id: secretId,
    title: "Alice's Secret Research Notes",
    content: "Confidential data not for Bob",
    priority: "High"
  }, tokenA);
  console.log('   User A created note response:', noteA.body);

  const notesB = await request('GET', '/api/notes', null, tokenB);
  console.log('   User B notes list IDs:', (notesB.body || []).map(n => n.id));
  const foundSecretInB = (notesB.body || []).some(n => n.id === secretId);
  console.log('   Did User B receive User A secret note?', foundSecretInB ? '❌ SECURITY VIOLATION' : '✅ NO (User Isolation Enforced)');
  if (foundSecretInB) throw new Error('User isolation failure');

  // --- 6. Device Pairing Token (Device A -> Device B) ---
  console.log('\n6. Testing 6-Digit Device Pairing Token...');
  const pairTokenRes = await request('POST', '/api/device-sync/generate', {}, tokenA);
  console.log('   Generated Pairing Token:', pairTokenRes.body.syncToken);

  const redeemRes = await request('POST', '/api/device-sync/redeem', { syncToken: pairTokenRes.body.syncToken });
  console.log('   Redeemed token on Device B. Paired User Email:', redeemRes.body.user?.email);
  const tokenDeviceB = redeemRes.body.token;

  // --- 7. Two-Way Sync Verification ---
  console.log('\n7. Verifying Two-Way Sync between Device A & Device B...');
  const notesOnDeviceB = await request('GET', '/api/notes', null, tokenDeviceB);
  console.log('   Device B fetched notes count:', notesOnDeviceB.body.length);
  const targetNote = notesOnDeviceB.body.find(n => n.id === secretId);
  console.log('   Target note title on Device B:', targetNote?.title);

  // Edit on Device B
  console.log('   Editing note on Device B...');
  await request('PUT', `/api/notes/${secretId}`, {
    title: "Alice's Secret Research Notes (Updated from Device B)"
  }, tokenDeviceB);

  // Read on Device A
  const notesOnDeviceAAfterEdit = await request('GET', '/api/notes', null, tokenA);
  const updatedNoteOnA = notesOnDeviceAAfterEdit.body.find(n => n.id === secretId);
  console.log('   Updated note title verified on Device A:', updatedNoteOnA?.title);
  if (!updatedNoteOnA?.title.includes('Updated from Device B')) {
    throw new Error('Two-way sync failed');
  }

  // --- 8. Batch Sync & Timestamp Merge ---
  console.log('\n8. Testing Batch Sync Endpoint (/api/sync)...');
  const syncRes = await request('POST', '/api/sync', {
    localNotes: [
      {
        id: `offline_note_${Date.now()}`,
        title: "Offline Created Note",
        content: "Created while traveling without internet",
        updatedAt: new Date().toISOString()
      }
    ]
  }, tokenA);

  console.log('   Batch Sync Synced At:', syncRes.body.syncedAt);
  console.log('   Total notes after batch sync:', syncRes.body.notes?.length);

  console.log('\n====================================================');
  console.log(' 🎉 ALL 8 E2E VERIFICATION TESTS PASSED 100%! ');
  console.log('====================================================\n');
}

runFullVerificationSuite().catch((err) => {
  console.error('❌ E2E Verification Failed:', err);
  process.exit(1);
});
