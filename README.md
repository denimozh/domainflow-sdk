# DomainFlow SDK for Node.js

> Official Node.js client library for [DomainFlow](https://domainflow.com) - Add custom domains to your SaaS in minutes.

[![npm version](https://img.shields.io/npm/v/@domainflow/sdk.svg)](https://www.npmjs.com/package/@domainflow/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- ✅ Simple, intuitive API
- ✅ Full TypeScript support
- ✅ Promise-based (async/await)
- ✅ Automatic authentication
- ✅ Webhook signature verification
- ✅ Comprehensive error handling

## Installation
```bash
npm install @domainflow/sdk
```

## Quick Start
```javascript
const DomainFlow = require('@domainflow/sdk');

const client = new DomainFlow('your-api-key');

// Add a custom domain
const domain = await client.domains.add({
  domain: 'app.customer.com',
  upstreamUrl: 'https://yourapp.com'
});

console.log(domain);
// {
//   id: 'dom_123...',
//   domain: 'app.customer.com',
//   status: 'pending',
//   ...
// }
```

## API Reference

### Initialize Client
```javascript
const DomainFlow = require('@domainflow/sdk');

const client = new DomainFlow('your-api-key', {
  baseUrl: 'https://api.domainflow.com', // optional
  timeout: 30000 // optional, in milliseconds
});
```

### Domains

#### Add a Domain
```javascript
const domain = await client.domains.add({
  domain: 'app.customer.com',
  upstreamUrl: 'https://yourapp.com',
  tenantId: 'tenant_123' // optional
});
```

#### Get Domain
```javascript
const domain = await client.domains.get('dom_123');
```

#### List Domains
```javascript
// List all domains
const { domains } = await client.domains.list();

// Filter by tenant
const { domains } = await client.domains.list({ 
  tenantId: 'tenant_123' 
});

// Filter by status
const { domains } = await client.domains.list({ 
  status: 'verified' 
});
```

#### Verify Domain
```javascript
const result = await client.domains.verify('dom_123');
console.log(result.verified); // true or false
```

#### Delete Domain
```javascript
await client.domains.delete('dom_123');
```

#### Get DNS Instructions
```javascript
const instructions = await client.domains.getDnsInstructions('dom_123');
console.log(instructions);
```

### Tenants

#### Create Tenant
```javascript
const tenant = await client.tenants.create({
  name: 'Customer Name',
  upstreamUrl: 'https://customer.yourapp.com'
});
```

#### Get Tenant
```javascript
const tenant = await client.tenants.get('tenant_123');
```

#### List Tenants
```javascript
const { tenants } = await client.tenants.list();
```

#### Update Tenant
```javascript
const tenant = await client.tenants.update('tenant_123', {
  name: 'New Name',
  upstream_url: 'https://new-url.com'
});
```

#### Delete Tenant
```javascript
await client.tenants.delete('tenant_123');
```

### Webhooks

#### Create Webhook
```javascript
const webhook = await client.webhooks.create({
  url: 'https://yourapp.com/webhooks/domainflow',
  events: ['domain.verified', 'certificate.issued'],
  tenantId: 'tenant_123' // optional
});

// Save the webhook secret for signature verification
console.log(webhook.secret);
```

#### List Webhooks
```javascript
const { webhooks } = await client.webhooks.list();
```

#### Delete Webhook
```javascript
await client.webhooks.delete('webhook_123');
```

#### Verify Webhook Signature
```javascript
// In your webhook endpoint
app.post('/webhooks/domainflow', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = JSON.stringify(req.body);
  const secret = 'your-webhook-secret';

  const isValid = client.webhooks.verifySignature(
    payload,
    signature,
    secret
  );

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook...
  res.status(200).send('OK');
});
```

### Certificates

#### Get Certificate
```javascript
const cert = await client.certificates.get('dom_123');
console.log(cert.expires_at);
```

#### Renew Certificate
```javascript
await client.certificates.renew('dom_123');
```

## Error Handling
```javascript
const { DomainFlowError } = require('@domainflow/sdk');

try {
  await client.domains.add({ 
    domain: 'invalid domain' 
  });
} catch (error) {
  if (error instanceof DomainFlowError) {
    console.error('Status:', error.statusCode);
    console.error('Message:', error.message);
    console.error('Response:', error.response);
  }
}
```

## TypeScript Support
```typescript
import DomainFlow, { Domain, Tenant } from '@domainflow/sdk';

const client = new DomainFlow('your-api-key');

const domain: Domain = await client.domains.add({
  domain: 'app.customer.com',
  upstreamUrl: 'https://yourapp.com'
});
```

## Examples

### Complete Integration
```javascript
const DomainFlow = require('@domainflow/sdk');
const client = new DomainFlow(process.env.DOMAINFLOW_API_KEY);

async function setupCustomDomain(customerName, customDomain) {
  try {
    // 1. Create tenant for customer
    const tenant = await client.tenants.create({
      name: customerName,
      upstreamUrl: `https://${customerName}.yourapp.com`
    });

    // 2. Add their custom domain
    const domain = await client.domains.add({
      domain: customDomain,
      upstreamUrl: tenant.upstream_url,
      tenantId: tenant.id
    });

    // 3. Get DNS instructions
    const instructions = await client.domains.getDnsInstructions(domain.id);

    // 4. Return instructions to customer
    return {
      success: true,
      domain: domain,
      instructions: instructions
    };

  } catch (error) {
    console.error('Setup failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Usage
setupCustomDomain('acme-corp', 'app.acme.com')
  .then(result => console.log(result));
```

## Support

- 📧 Email: denimozh@gmail.com
- 📚 Docs: https://docs.domainflow.com
- 🐛 Issues: https://github.com/domainflow/sdk-node/issues

## License

MIT © DomainFlow