/**
 * Core Business Types - Data Models for YOLOVibe Registration System
 * These types support our 13 core interfaces and provide type safety
 * across the entire registration and workshop management system.
 */

// =====================================================
// WORKSHOP & PRODUCT TYPES
// =====================================================

export enum ProductType {
  THREE_DAY = 'THREE_DAY',
  FIVE_DAY = 'FIVE_DAY',
  HOURLY_CONSULTING = 'HOURLY_CONSULTING'
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  price: number;
  duration: number; // days for workshops, hours for consulting
  description: string;
  maxCapacity: number;
  availableStartDays: string[]; // ['monday', 'tuesday', 'wednesday'] for 3-day
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workshop {
  id: string;
  productId: string;
  startDate: Date;
  endDate: Date;
  currentCapacity: number;
  maxCapacity: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  location?: string;
  instructorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum WorkshopType {
  THREE_DAY_INTENSIVE = 'THREE_DAY_INTENSIVE',
  FIVE_DAY_BOOTCAMP = 'FIVE_DAY_BOOTCAMP',
  HOURLY_CONSULTING = 'HOURLY_CONSULTING'
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
  bookingId?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// =====================================================
// BOOKING TYPES
// =====================================================

export interface BookingRequest {
  productId: string;
  startDate: Date;
  attendeeCount: number;
  pointOfContact: ContactInfo;
  attendees: AttendeeInfo[];
  couponCode?: string;
  paymentMethod: PaymentMethod;
}

export interface ConsultingBookingRequest extends BookingRequest {
  preferredTimeSlots: TimeSlot[];
  consultingType: 'technical' | 'business' | 'strategy';
  projectDescription?: string;
}

export interface BookingResult {
  success: boolean;
  bookingId?: string;
  confirmationNumber?: string;
  totalAmount?: number;
  finalAmount?: number;
  discountAmount?: number;
  errorMessage?: string;
  paymentRequired?: boolean;
}

export interface Booking {
  id: string;
  workshopId: string;
  userId?: string;
  pointOfContactId: string;
  attendees: Attendee[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  couponCode?: string;
  paymentStatus: PaymentStatus;
  bookingDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  confirmationNumber: string;
  paymentIntentId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CapacityStatus {
  workshopId: string;
  currentCapacity: number;
  maxCapacity: number;
  availableSpots: number;
  isFullyBooked: boolean;
}

export interface WorkshopMetrics {
  workshopId: string;
  totalBookings: number;
  totalRevenue: number;
  averageBookingSize: number;
  cancellationRate: number;
  attendanceRate: number;
}

// =====================================================
// PEOPLE TYPES
// =====================================================

export interface AttendeeInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
}

export interface Attendee extends AttendeeInfo {
  id: string;
  bookingId: string;
  accessPassword?: string;
  accessStatus: AccessStatus;
  registrationDate: Date;
  lastLoginDate?: Date;
  workshopProgress?: WorkshopProgress;

  notes?: string;
}

export interface AttendeeUpdates {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
  notes?: string;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  title?: string;
  address?: Address;
}

export interface PointOfContact extends ContactInfo {
  id: string;
  bookingIds: string[];
  preferredContactMethod: 'email' | 'phone' | 'sms';
  timezone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface AccessStatus {
  attendeeId: string;
  hasAccess: boolean;
  passwordGenerated: boolean;
  lastAccessDate?: Date;
  accessExpiryDate?: Date;
  loginAttempts?: number;
  isLocked?: boolean;
}

export interface WorkshopProgress {
  attendeeId: string;
  workshopId: string;
  completedModules: string[];
  currentModule?: string;
  overallProgress: number; // 0-100
  lastActivityDate: Date;
  timeSpent: number; // minutes
}

// =====================================================
// PAYMENT TYPES
// =====================================================

export interface PaymentMethod {
  type: 'card' | 'ach' | 'wire' | 'check';
  cardLast4?: string;
  cardBrand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  billingAddress?: Address;
}

export interface PaymentRequest {
  amount: number;
  currency: 'USD';
  paymentMethod: PaymentMethod;
  bookingId: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  status?: PaymentStatus;
  errorMessage?: string;
  receiptUrl?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  status?: 'pending' | 'completed' | 'failed';
  errorMessage?: string;
  processingTime?: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED'
}

export interface CouponValidation {
  isValid: boolean;
  couponCode?: string;
  discountType?: 'percentage' | 'fixed_amount';
  discountValue?: number;
  discountAmount?: number;
  errorMessage?: string;
  expiryDate?: Date;
  usageLimit?: number;
  usageCount?: number;
}

export interface CouponUsage {
  couponCode: string;
  bookingId: string;
  discountAmount: number;
  usedAt: Date;
  userId?: string;
}

// =====================================================
// AUTHENTICATION TYPES
// =====================================================

export interface Credentials {
  email: string;
  password: string;
}

export interface LoginCredentials extends Credentials {
  rememberMe?: boolean;
}

export interface AuthResult {
  success: boolean;
  userId?: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  errorMessage?: string;
}

export interface AuthenticationResult {
  success: boolean;
  user?: User | null;
  sessionToken?: string | null;
  errorMessage?: string | null;
}

export interface Session {
  sessionId: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  lastAccessedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserSession extends Session {
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  isAdmin: boolean;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferences?: UserPreferences;
}

export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  isAdmin?: boolean;
}

export interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  timezone?: string;
  language?: string;
}

export interface PasswordResetRequest {
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

// =====================================================
// CONTENT & MATERIALS TYPES
// =====================================================

export interface Material {
  id: string;
  workshopId: string;
  title: string;
  description?: string;
  type: 'pdf' | 'video' | 'link' | 'exercise' | 'quiz';
  url?: string;
  content?: string;
  order: number;
  isRequired: boolean;
  accessLevel: 'public' | 'attendee_only' | 'admin_only';
  downloadable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface File {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  isPublic: boolean;
  metadata?: Record<string, any>;
}

// =====================================================
// COMMUNICATION TYPES
// =====================================================

export interface EmailRequest {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  attachments?: EmailAttachment[];
  tags?: string[];
  priority?: 'low' | 'normal' | 'high';
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
  disposition?: 'attachment' | 'inline';
  contentId?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  errorMessage?: string;
  deliveryStatus?: EmailStatus;
  sentAt?: Date;
}

export enum EmailStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  BOUNCED = 'BOUNCED',
  FAILED = 'FAILED',
  OPENED = 'OPENED',
  CLICKED = 'CLICKED'
}

// =====================================================
// REPORTING & ANALYTICS TYPES
// =====================================================

export interface PaymentSummary {
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionAmount: number;
  refundAmount: number;
  netRevenue: number;
  currency: string;
  periodStart: Date;
  periodEnd: Date;
}

export interface RevenueAnalytics {
  dailyRevenue: DailyRevenue[];
  monthlyRevenue: MonthlyRevenue[];
  revenueByProduct: ProductRevenue[];
  revenueByRegion?: RegionRevenue[];
  totalRevenue: number;
  projectedRevenue?: number;
  growthRate?: number;
}

export interface DailyRevenue {
  date: Date;
  revenue: number;
  transactions: number;
  refunds: number;
  netRevenue: number;
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  revenue: number;
  transactions: number;
  refunds: number;
  netRevenue: number;
  growth?: number;
}

export interface ProductRevenue {
  productId: string;
  productName: string;
  revenue: number;
  bookings: number;
  averageBookingValue: number;
  refunds: number;
  netRevenue: number;
}

export interface RegionRevenue {
  region: string;
  revenue: number;
  bookings: number;
  averageBookingValue: number;
}

export interface ExportResult {
  success: boolean;
  fileUrl?: string;
  filename?: string;
  format: 'csv' | 'excel' | 'pdf';
  recordCount?: number;
  errorMessage?: string;
  expiresAt?: Date;
}

// =====================================================
// PURCHASE WORKFLOW TYPES
// =====================================================

export interface PurchaseRequest {
  bookingRequest: BookingRequest;
  paymentMethod: PaymentMethod;
  billingAddress?: Address;
  savePaymentMethod?: boolean;
  agreeToTerms: boolean;
  marketingOptIn?: boolean;
}

export interface PurchaseResult {
  success: boolean;
  purchaseId?: string;
  bookingId?: string;
  paymentId?: string;
  confirmationNumber?: string;
  totalAmount?: number;
  discountAmount?: number;
  finalAmount?: number;
  paymentStatus?: PaymentStatus;
  bookingStatus?: string;
  errorMessage?: string;
  receiptUrl?: string;
  nextSteps?: string[];
}

export interface PurchaseStatus {
  purchaseId: string;
  bookingStatus: string;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  paidAmount: number;
  refundAmount: number;
  createdAt: Date;
  updatedAt: Date;
  completedSteps: string[];
  nextSteps: string[];
  canCancel: boolean;
  canRefund: boolean;
}

// =====================================================
// SYSTEM TYPES
// =====================================================

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  checks: HealthCheck[];
  timestamp: Date;
  version: string;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  responseTime?: number;
  error?: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
  requestId?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  error?: string;
  message?: string;
}

// =====================================================
// ERROR TYPES
// =====================================================

export class BusinessError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

export class ValidationError extends BusinessError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends BusinessError {
  constructor(resource: string, identifier?: string) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends BusinessError {
  constructor(message: string, details?: any) {
    super(message, 'CONFLICT', 409, details);
    this.name = 'ConflictError';
  }
}

export class UnauthorizedError extends BusinessError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends BusinessError {
  constructor(message: string = 'Forbidden access') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}
