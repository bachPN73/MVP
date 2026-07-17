import fetch from 'node-fetch'; // wait, node-fetch might not be installed, but we can use global fetch if node is v18+ (it's v24.13.1, which has global fetch).

async function test(label, headers, body) {
    try {
        console.log(`\n--- Test: ${label} ---`);
        const res = await fetch('http://localhost:3099/api/ai-search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify(body)
        });
        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

async function run() {
    // Wait for server to be fully ready
    await new Promise(r => setTimeout(r, 2000));

    // Test 1: Guest (no x-user-id header)
    await test('Guest (no headers)', {}, { query: 'tế bào' });

    // Test 2: Invalid x-user-id string (e.g. "undefined")
    await test('x-user-id is "undefined"', { 'x-user-id': 'undefined' }, { query: 'tế bào' });

    // Test 3: Invalid x-user-id ObjectId format (e.g. "invalid_id")
    await test('x-user-id is "invalid_id"', { 'x-user-id': 'invalid_id' }, { query: 'tế bào' });

    // Test 4: Valid ObjectId format but non-existent user
    await test('x-user-id is valid but non-existent', { 'x-user-id': '60d5ecb5b5c9c92d60f58dc5' }, { query: 'tế bào' });
}

run();
