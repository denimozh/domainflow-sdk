/**
 * DomainFlow SDK for Node.js
 * Official client library for the DomainFlow API
 * 
 * @example
 * const DomainFlow = require('@domainflow/sdk');
 * const client = new DomainFlow('your-api-key');
 * 
 * const domain = await client.domains.add({
 *   domain: 'app.customer.com',
 *   upstreamUrl: 'https://yourapp.com'
 * });
 */

class DomainFlow {
  constructor(apiKey, options = {}) {
    if (!apiKey) {
      throw new Error('DomainFlow API key is required')
    }

    this.apiKey = apiKey
    this.baseUrl = options.baseUrl || 'https://api.domainflow.com'
    this.timeout = options.timeout || 30000

    // Resource namespaces
    this.domains = new DomainsResource(this)
    this.tenants = new TenantsResource(this)
    this.webhooks = new WebhooksResource(this)
    this.certificates = new CertificatesResource(this)
  }

  /**
   * Make authenticated API request
   * @private
   */
  async _request(method, path, data = null) {
    const url = `${this.baseUrl}${path}`
    const headers = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json'
    }

    const options = {
      method,
      headers
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(url, options)
      const json = await response.json()

      if (!response.ok) {
        throw new DomainFlowError(
          json.error || 'API request failed',
          response.status,
          json
        )
      }

      return json
    } catch (error) {
      if (error instanceof DomainFlowError) {
        throw error
      }
      throw new DomainFlowError(error.message, null, null)
    }
  }
}

/**
 * Domains Resource
 */
class DomainsResource {
  constructor(client) {
    this.client = client
  }

  /**
   * Add a new domain
   * @param {Object} params
   * @param {string} params.domain - Domain name (e.g., 'app.customer.com')
   * @param {string} params.upstreamUrl - URL to proxy traffic to
   * @param {string} [params.tenantId] - Optional tenant ID
   * @returns {Promise<Object>} Domain object
   */
  async add({ domain, upstreamUrl, tenantId }) {
    return this.client._request('POST', '/api/domain/add', {
      domain,
      upstream_url: upstreamUrl,
      tenant_id: tenantId
    })
  }

  /**
   * Get domain by ID
   * @param {string} domainId
   * @returns {Promise<Object>} Domain object
   */
  async get(domainId) {
    return this.client._request('GET', `/api/domain/${domainId}`)
  }

  /**
   * List all domains
   * @param {Object} [params]
   * @param {string} [params.tenantId] - Filter by tenant
   * @param {string} [params.status] - Filter by status (pending, verified, failed)
   * @returns {Promise<Object>} List of domains
   */
  async list(params = {}) {
    const queryParams = new URLSearchParams()
    if (params.tenantId) queryParams.append('tenant_id', params.tenantId)
    if (params.status) queryParams.append('status', params.status)
    
    const query = queryParams.toString() ? `?${queryParams}` : ''
    return this.client._request('GET', `/api/domain${query}`)
  }

  /**
   * Verify a domain's DNS configuration
   * @param {string} domainId
   * @returns {Promise<Object>} Verification result
   */
  async verify(domainId) {
    return this.client._request('POST', `/api/domain/${domainId}/verify`)
  }

  /**
   * Delete a domain
   * @param {string} domainId
   * @returns {Promise<Object>} Deletion result
   */
  async delete(domainId) {
    return this.client._request('DELETE', `/api/domain/${domainId}`)
  }

  /**
   * Get DNS instructions for a domain
   * @param {string} domainId
   * @returns {Promise<Object>} DNS instructions
   */
  async getDnsInstructions(domainId) {
    return this.client._request('GET', `/api/domain/${domainId}/dns-instructions`)
  }
}

/**
 * Tenants Resource
 */
class TenantsResource {
  constructor(client) {
    this.client = client
  }

  /**
   * Create a new tenant
   * @param {Object} params
   * @param {string} params.name - Tenant name
   * @param {string} params.upstreamUrl - Default upstream URL
   * @returns {Promise<Object>} Tenant object
   */
  async create({ name, upstreamUrl }) {
    return this.client._request('POST', '/api/tenant/create', {
      name,
      upstream_url: upstreamUrl
    })
  }

  /**
   * Get tenant by ID
   * @param {string} tenantId
   * @returns {Promise<Object>} Tenant object
   */
  async get(tenantId) {
    return this.client._request('GET', `/api/tenant/${tenantId}`)
  }

  /**
   * List all tenants
   * @returns {Promise<Object>} List of tenants
   */
  async list() {
    return this.client._request('GET', '/api/tenant')
  }

  /**
   * Update a tenant
   * @param {string} tenantId
   * @param {Object} updates
   * @returns {Promise<Object>} Updated tenant
   */
  async update(tenantId, updates) {
    return this.client._request('PATCH', `/api/tenant/${tenantId}`, updates)
  }

  /**
   * Delete a tenant
   * @param {string} tenantId
   * @returns {Promise<Object>} Deletion result
   */
  async delete(tenantId) {
    return this.client._request('DELETE', `/api/tenant/${tenantId}`)
  }
}

/**
 * Webhooks Resource
 */
class WebhooksResource {
  constructor(client) {
    this.client = client
  }

  /**
   * Create a webhook
   * @param {Object} params
   * @param {string} params.url - Webhook endpoint URL
   * @param {string[]} params.events - Events to subscribe to
   * @param {string} [params.tenantId] - Optional tenant ID
   * @returns {Promise<Object>} Webhook object
   */
  async create({ url, events, tenantId }) {
    return this.client._request('POST', '/api/webhook', {
      url,
      events,
      tenant_id: tenantId
    })
  }

  /**
   * List all webhooks
   * @returns {Promise<Object>} List of webhooks
   */
  async list() {
    return this.client._request('GET', '/api/webhook')
  }

  /**
   * Delete a webhook
   * @param {string} webhookId
   * @returns {Promise<Object>} Deletion result
   */
  async delete(webhookId) {
    return this.client._request('DELETE', `/api/webhook/${webhookId}`)
  }

  /**
   * Verify webhook signature
   * @param {string} payload - Raw request body
   * @param {string} signature - X-Webhook-Signature header
   * @param {string} secret - Webhook secret
   * @returns {boolean} True if signature is valid
   */
  verifySignature(payload, signature, secret) {
    const crypto = require('crypto')
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(payload)
    const computed = hmac.digest('hex')
    return computed === signature
  }
}

/**
 * Certificates Resource
 */
class CertificatesResource {
  constructor(client) {
    this.client = client
  }

  /**
   * Get certificate for a domain
   * @param {string} domainId
   * @returns {Promise<Object>} Certificate details
   */
  async get(domainId) {
    return this.client._request('GET', `/api/certificates/${domainId}`)
  }

  /**
   * Force certificate renewal
   * @param {string} domainId
   * @returns {Promise<Object>} Renewal result
   */
  async renew(domainId) {
    return this.client._request('POST', `/api/certificates/${domainId}/renew`)
  }
}

/**
 * Custom error class for DomainFlow API errors
 */
class DomainFlowError extends Error {
  constructor(message, statusCode, response) {
    super(message)
    this.name = 'DomainFlowError'
    this.statusCode = statusCode
    this.response = response
  }
}

// Export
module.exports = DomainFlow
module.exports.DomainFlow = DomainFlow
module.exports.DomainFlowError = DomainFlowError