/**
 * 🔐 AUTHENTICATION EVENT CONTRACTS
 * Type-safe event payloads for authentication system
 */

import type { BaseEvent } from './EventContracts.js';

// Login & Session Events
export interface LoginAttemptedEvent extends BaseEvent {
  email: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface LoginSuccessEvent extends BaseEvent {
  userId: string;
  email: string;
  sessionToken: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginFailedEvent extends BaseEvent {
  email: string;
  reason: 'invalid_credentials' | 'account_locked' | 'account_inactive' | 'server_error';
  attemptCount?: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface LogoutInitiatedEvent extends BaseEvent {
  userId: string;
  sessionToken: string;
  reason: 'user_initiated' | 'session_expired' | 'security_logout';
}

export interface LogoutSuccessEvent extends BaseEvent {
  userId: string;
  sessionToken: string;
  logoutTime: Date;
}

export interface SessionExpiredEvent extends BaseEvent {
  userId: string;
  sessionToken: string;
  expiredAt: Date;
}

export interface SessionValidatedEvent extends BaseEvent {
  userId: string;
  sessionToken: string;
  validatedAt: Date;
}

export interface SessionInvalidEvent extends BaseEvent {
  sessionToken: string;
  reason: 'expired' | 'not_found' | 'malformed';
}

// Registration Events
export interface RegistrationAttemptedEvent extends BaseEvent {
  email: string;
  firstName: string;
  lastName: string;
  workshopId?: string;
  ipAddress?: string;
}

export interface RegistrationSuccessEvent extends BaseEvent {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  workshopId?: string;
  requiresEmailVerification: boolean;
}

export interface RegistrationFailedEvent extends BaseEvent {
  email: string;
  reason: 'email_exists' | 'invalid_email' | 'weak_password' | 'server_error';
  validationErrors?: string[];
}

export interface EmailVerificationSentEvent extends BaseEvent {
  userId: string;
  email: string;
  verificationToken: string;
  expiresAt: Date;
}

export interface EmailVerifiedEvent extends BaseEvent {
  userId: string;
  email: string;
  verifiedAt: Date;
}

// Password Reset Events
export interface PasswordResetRequestedEvent extends BaseEvent {
  email: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PasswordResetEmailSentEvent extends BaseEvent {
  userId: string;
  email: string;
  resetToken: string;
  expiresAt: Date;
}

export interface PasswordResetTokenValidatedEvent extends BaseEvent {
  userId: string;
  email: string;
  resetToken: string;
  validatedAt: Date;
}

export interface PasswordResetSuccessEvent extends BaseEvent {
  userId: string;
  email: string;
  resetAt: Date;
}

export interface PasswordResetFailedEvent extends BaseEvent {
  email?: string;
  resetToken?: string;
  reason: 'invalid_token' | 'token_expired' | 'user_not_found' | 'weak_password';
}

// Security Events
export interface SuspiciousLoginAttemptEvent extends BaseEvent {
  email: string;
  ipAddress: string;
  userAgent?: string;
  reason: 'unusual_location' | 'too_many_attempts' | 'unusual_time';
  riskScore: number;
}

export interface MultipleFailedAttemptsEvent extends BaseEvent {
  email: string;
  attemptCount: number;
  timeWindow: string;
  ipAddress?: string;
  shouldLockAccount: boolean;
}

export interface AccountLockedEvent extends BaseEvent {
  userId: string;
  email: string;
  lockReason: 'multiple_failed_attempts' | 'suspicious_activity' | 'admin_action';
  lockedUntil?: Date;
}

export interface AccountUnlockedEvent extends BaseEvent {
  userId: string;
  email: string;
  unlockedBy: 'admin' | 'time_expired' | 'password_reset';
  unlockedAt: Date;
}

// Portal Access Events
export interface PortalAccessGrantedEvent extends BaseEvent {
  userId: string;
  email: string;
  workshopId?: string;
  accessLevel: 'attendee' | 'admin' | 'instructor';
  sessionToken: string;
}

export interface PortalAccessDeniedEvent extends BaseEvent {
  userId?: string;
  email?: string;
  reason: 'not_enrolled' | 'session_expired' | 'insufficient_permissions';
  attemptedResource: string;
}

export interface WorkshopMaterialAccessedEvent extends BaseEvent {
  userId: string;
  workshopId: string;
  materialId: string;
  materialType: 'video' | 'pdf' | 'exercise' | 'quiz';
  accessedAt: Date;
}

export interface ProgressUpdatedEvent extends BaseEvent {
  userId: string;
  workshopId: string;
  completedItems: string[];
  progressPercentage: number;
  lastActivityAt: Date;
}

// Union type for all auth events
export type AuthEvent = 
  | LoginAttemptedEvent
  | LoginSuccessEvent
  | LoginFailedEvent
  | LogoutInitiatedEvent
  | LogoutSuccessEvent
  | SessionExpiredEvent
  | SessionValidatedEvent
  | SessionInvalidEvent
  | RegistrationAttemptedEvent
  | RegistrationSuccessEvent
  | RegistrationFailedEvent
  | EmailVerificationSentEvent
  | EmailVerifiedEvent
  | PasswordResetRequestedEvent
  | PasswordResetEmailSentEvent
  | PasswordResetTokenValidatedEvent
  | PasswordResetSuccessEvent
  | PasswordResetFailedEvent
  | SuspiciousLoginAttemptEvent
  | MultipleFailedAttemptsEvent
  | AccountLockedEvent
  | AccountUnlockedEvent
  | PortalAccessGrantedEvent
  | PortalAccessDeniedEvent
  | WorkshopMaterialAccessedEvent
  | ProgressUpdatedEvent; 