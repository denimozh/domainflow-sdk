declare module '@domainflow/sdk' {
  export interface DomainFlowOptions {
    baseUrl?: string
    timeout?: number
  }

  export interface Domain {
    id: string
    domain: string
    status: 'pending' | 'verified' | 'failed'
    tenant_id: string
    created_at: string
    verified_at?: string
    dns_provider?: string
  }

  export interface Tenant {
    id: string
    name: string
    upstream_url: string
    created_at: string
  }

  export interface Webhook {
    id: string
    url: string
    events: string[]
    tenant_id?: string
    secret: string
    created_at: string
  }

  export interface Certificate {
    domain_id: string
    issued_at: string
    expires_at: string
    status: 'active' | 'expired' | 'pending'
  }

  export class DomainFlowError extends Error {
    statusCode: number | null
    response: any
  }

  export class DomainFlow {
    constructor(apiKey: string, options?: DomainFlowOptions)

    domains: {
      add(params: { domain: string; upstreamUrl: string; tenantId?: string }): Promise<Domain>
      get(domainId: string): Promise<Domain>
      list(params?: { tenantId?: string; status?: string }): Promise<{ domains: Domain[] }>
      verify(domainId: string): Promise<{ verified: boolean }>
      delete(domainId: string): Promise<{ success: boolean }>
      getDnsInstructions(domainId: string): Promise<any>
    }

    tenants: {
      create(params: { name: string; upstreamUrl: string }): Promise<Tenant>
      get(tenantId: string): Promise<Tenant>
      list(): Promise<{ tenants: Tenant[] }>
      update(tenantId: string, updates: Partial<Tenant>): Promise<Tenant>
      delete(tenantId: string): Promise<{ success: boolean }>
    }

    webhooks: {
      create(params: { url: string; events: string[]; tenantId?: string }): Promise<Webhook>
      list(): Promise<{ webhooks: Webhook[] }>
      delete(webhookId: string): Promise<{ success: boolean }>
      verifySignature(payload: string, signature: string, secret: string): boolean
    }

    certificates: {
      get(domainId: string): Promise<Certificate>
      renew(domainId: string): Promise<{ success: boolean }>
    }
  }

  export default DomainFlow
}