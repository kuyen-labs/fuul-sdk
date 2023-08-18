export interface SendEventMetadataRequest {
  referrer?: string
  project_id?: string
  tracking_id: string
  session_id: string
  user_address?: string
  source?: string
  category?: string
  title?: string
  tag?: string
}

export interface SendEventRequest {
  name: string
  event_args?: EventArgs
  metadata?: SendEventMetadataRequest
  user_address?: string
  signature?: string
  signatureMessage?: string
}

export interface EventMetadata {
  userAddress?: string
  signature?: string
  signatureMessage?: string
}

export interface UserMetadata {
  userAddress: string
  signature?: string
  signatureMessage?: string
}

export type EventArgs = {
  [key: string]: unknown
}

export type FuulSettings = {
  baseApiUrl?: string
  defaultQueryParams?: Record<string, string>
}

export interface IGenerateTrackingLink {
  address: string
  projectId: string
  baseUrl?: string
}
