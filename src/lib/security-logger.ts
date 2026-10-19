/**
 * FLASHY Security Event Logger
 * Compliance: OWASP Top 10 - A09:2021 (Security Logging and Monitoring Failures)
 * Logs security anomalies (IDOR, Price Tampering, Auth Failures, Rate Limiting)
 * to both structured console output and PostgreSQL `security_audit_logs` table.
 */

import { createAdminClient } from '@/lib/supabase/admin'

export type SecurityEventType =
  | 'IDOR_ATTEMPT'
  | 'PRICE_TAMPERING'
  | 'AUTH_FAILURE'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNAUTHORIZED_ACCESS'
  | 'RETOUCH_QUOTA_EXCEEDED'
  | 'INVALID_WEBHOOK_SIGNATURE'
  | 'PRIVILEGE_ESCALATION_ATTEMPT'

export type SecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface SecurityLogPayload {
  eventType: SecurityEventType
  severity: SecuritySeverity
  userId?: string | null
  email?: string | null
  role?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  endpoint?: string
  action?: string
  details?: Record<string, any>
  message: string
}

/**
 * Persists and outputs structured security audit logs
 */
export async function logSecurityEvent(payload: SecurityLogPayload): Promise<void> {
  const timestamp = new Date().toISOString()
  const logPrefix = `[SECURITY AUDIT] [${payload.severity}] [${payload.eventType}]`

  // 1. Structured Console Logging (Instantly visible in container/server logs & SIEM agents)
  const consolePayload = {
    timestamp,
    ...payload,
  }

  if (payload.severity === 'CRITICAL' || payload.severity === 'HIGH') {
    console.error(`🚨 ${logPrefix}: ${payload.message}`, consolePayload)
  } else if (payload.severity === 'MEDIUM') {
    console.warn(`⚠️ ${logPrefix}: ${payload.message}`, consolePayload)
  } else {
    console.info(`ℹ️ ${logPrefix}: ${payload.message}`, consolePayload)
  }

  // 2. Asynchronous Database Logging to `security_audit_logs`
  try {
    const supabase = await createAdminClient()
    await supabase.from('security_audit_logs').insert({
      event_type: payload.eventType,
      severity: payload.severity,
      user_id: payload.userId || null,
      email: payload.email || null,
      role: payload.role || null,
      ip_address: payload.ipAddress || null,
      user_agent: payload.userAgent || null,
      endpoint: payload.endpoint || null,
      action: payload.action || null,
      details: payload.details || {},
      message: payload.message,
      created_at: timestamp,
    })
  } catch (err) {
    // Non-blocking: Logging failure should never crash the main application thread
    console.warn('[SECURITY LOGGER] Fallback: Database write skipped or unconfigured.', err)
  }
}

/**
 * Convenience Helper: Logs an IDOR (Insecure Direct Object Reference) access attempt
 */
export async function logIdorAttempt(params: {
  userId?: string | null
  userEmail?: string | null
  userRole?: string | null
  targetBookingId: string
  ownerId?: string | null
  endpoint?: string
  ipAddress?: string | null
}): Promise<void> {
  await logSecurityEvent({
    eventType: 'IDOR_ATTEMPT',
    severity: 'HIGH',
    userId: params.userId,
    email: params.userEmail,
    role: params.userRole,
    endpoint: params.endpoint || '/api/bookings/[id]',
    action: 'READ_OR_MODIFY_BOOKING',
    ipAddress: params.ipAddress,
    details: {
      targetBookingId: params.targetBookingId,
      expectedOwnerId: params.ownerId,
      attemptedBy: params.userId || 'ANONYMOUS',
    },
    message: `Người dùng '${params.userId || 'Chưa định danh'}' cố gắng truy cập trái phép đơn hàng '${params.targetBookingId}' của người khác.`,
  })
}

/**
 * Convenience Helper: Logs a client-side price tampering attempt
 */
export async function logPriceTampering(params: {
  userId?: string | null
  submittedTotal: number
  calculatedTotal: number
  bookingId?: string | null
  packageId?: string | null
  ipAddress?: string | null
}): Promise<void> {
  await logSecurityEvent({
    eventType: 'PRICE_TAMPERING',
    severity: 'CRITICAL',
    userId: params.userId,
    endpoint: '/api/booking/checkout',
    action: 'PAYMENT_AMOUNT_VERIFICATION',
    ipAddress: params.ipAddress,
    details: {
      submittedTotal: params.submittedTotal,
      calculatedServerTotal: params.calculatedTotal,
      difference: params.calculatedTotal - params.submittedTotal,
      bookingId: params.bookingId,
      packageId: params.packageId,
    },
    message: `Phát hiện giả mạo giá tiền: Client gửi ${params.submittedTotal.toLocaleString('vi-VN')}đ nhưng Server tính toán là ${params.calculatedTotal.toLocaleString('vi-VN')}đ.`,
  })
}

/**
 * Convenience Helper: Logs an authentication failure or unauthorized privilege escalation
 */
export async function logAuthFailure(params: {
  attemptedEmail?: string | null
  reason: string
  ipAddress?: string | null
  userAgent?: string | null
  endpoint?: string
}): Promise<void> {
  await logSecurityEvent({
    eventType: 'AUTH_FAILURE',
    severity: 'MEDIUM',
    email: params.attemptedEmail,
    endpoint: params.endpoint || '/login',
    action: 'USER_LOGIN_ATTEMPT',
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    details: { reason: params.reason },
    message: `Xác thực thất bại cho tài khoản '${params.attemptedEmail || 'Không rõ'}': ${params.reason}`,
  })
}

/**
 * Convenience Helper: Logs Rate Limiting triggers
 */
export async function logRateLimitExceeded(params: {
  ipAddress: string
  routeType: 'auth' | 'api'
  path: string
}): Promise<void> {
  await logSecurityEvent({
    eventType: 'RATE_LIMIT_EXCEEDED',
    severity: params.routeType === 'auth' ? 'HIGH' : 'MEDIUM',
    ipAddress: params.ipAddress,
    endpoint: params.path,
    action: 'RATE_LIMIT_BLOCK',
    details: { routeType: params.routeType },
    message: `Địa chỉ IP ${params.ipAddress} đã vượt quá tần suất cho phép trên route '${params.path}'.`,
  })
}
