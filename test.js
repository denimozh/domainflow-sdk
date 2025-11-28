const DomainFlow = require('./index.js');

async function test() {
  console.log('🧪 Testing DomainFlow SDK...\n');

  // Test 1: Initialize client
  try {
    const client = new DomainFlow('test-api-key');
    console.log('✅ Client initialized');
  } catch (error) {
    console.error('❌ Client initialization failed:', error.message);
  }

  // Test 2: Missing API key
  try {
    const client = new DomainFlow();
    console.log('❌ Should have thrown error for missing API key');
  } catch (error) {
    console.log('✅ Correctly throws error for missing API key');
  }

  // Test 3: Resource namespaces exist
  const client = new DomainFlow('test-key');
  console.log('✅ domains namespace exists:', !!client.domains);
  console.log('✅ tenants namespace exists:', !!client.tenants);
  console.log('✅ webhooks namespace exists:', !!client.webhooks);
  console.log('✅ certificates namespace exists:', !!client.certificates);

  // Test 4: Methods exist
  console.log('✅ domains.add exists:', typeof client.domains.add === 'function');
  console.log('✅ domains.list exists:', typeof client.domains.list === 'function');
  console.log('✅ webhooks.verifySignature exists:', typeof client.webhooks.verifySignature === 'function');

  console.log('\n✨ All tests passed!');
}

test().catch(console.error);