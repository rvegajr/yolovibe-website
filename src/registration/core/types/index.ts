/**
 * Core Business Types - Data Models for YOLOVibe Registration System
 * These types support our 13 core interfaces
 */

// Workshop & Product Types
export enum ProductType {
  THREE_DAY = '3-day',
  FIVE_DAY = '5-day'
}

export enum WorkshopType {
  THREE_DAY = '3-day',
  FIVE_DAY = '5-day'
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  price: number;
  duration: number; // days
  description: string;
  maxCapacity: number;
  availableStartDays: string[]; // ['monday', 'tuesday', 'wednesday'] for 3-day
}

export interface Workshop {
  id: string;
  productId: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  currentAttendees: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  calendarEventId?: string;
}

export interface WorkshopMetrics {
  workshopId: string;
  totalBookings: number;
  currentCapacity: number;
  maxCapacity: number;
  revenue: number;
  attendeeCount: number;
  completionRate: number;
}

export interface CapacityStatus {
  workshopId: string;
  current: number;
  maximum: number;
  available: number;
  isFull: boolean;
  waitlistCount: number;
}

// Booking Types
export interface BookingRequest {
  productId: string;
  startDate: Date;
  attendeeCount: number;
  pointOfContact: ContactInfo;
  attendees: AttendeeInfo[];
  couponCode?: string;
  paymentMethod: PaymentMethod;
}

export interface BookingResult {
  bookingId: string;
  workshopId: string;
  status: 'confirmed' | 'pending' | 'failed';
  totalAmount: number;
  discountApplied?: number;
  paymentId?: string;
  confirmationNumber: string;
}

export interface Booking {
  id: string;
  workshopId: string;
  pointOfContactId: string;
  attendees: Attendee[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  bookingDate: Date;
  status: 'active' | 'cancelled' | 'completed';
  confirmationNumber: string;
}

// Payment Types
export interface PaymentRequest {
  amount: number;
  currency: string;
  bookingId: string;
  paymentMethod: PaymentMethod;
  description: string;
}

export interface PaymentMethod {
  type: 'card' | 'bank_transfer';
  cardToken?: string;
  billingAddress?: Address;
}

export interface PaymentResult {
  paymentId: string;
  status: 'success' | 'failed' | 'pending';
  transactionId?: string;
  errorMessage?: string;
  receiptUrl?: string;
}

export interface RefundResult {
  refundId: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
  errorMessage?: string;
}

export interface PaymentStatus {
  paymentId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  amount: number;
  transactionDate: Date;
}

export interface PaymentSummary {
  totalRevenue: number;
  totalTransactions: number;
  averageTransactionAmount: number;
  refundAmount: number;
  netRevenue: number;
  dateRange: DateRange;
}

export interface RevenueAnalytics {
  monthlyRevenue: MonthlyRevenue[];
  productRevenue: ProductRevenue[];
  refundRate: number;
  averageBookingValue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookingCount: number;
}

export interface ProductRevenue {
  productType: ProductType;
  revenue: number;
  bookingCount: number;
}

// People Types
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
}

export interface AttendeeUpdates {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
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
  bookingId: string;
  isAttendee: boolean;
  createdDate: Date;
}

export interface AccessStatus {
  attendeeId: string;
  hasAccess: boolean;
  passwordGenerated: boolean;
  lastAccessDate?: Date;
  expirationDate?: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Coupon Types
export interface CouponValidation {
  isValid: boolean;
  couponCode: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumAmount?: number;
  expirationDate?: Date;
  usageLimit?: number;
  currentUsage: number;
  errorMessage?: string;
}

export interface CouponUsage {
  couponCode: string;
  totalUsage: number;
  usageLimit?: number;
  remainingUses?: number;
  lastUsedDate?: Date;
}

// Authentication Types
export interface Credentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  userId?: string;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  errorMessage?: string;
}

export interface Session {
  sessionId: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthenticationResult {
  success: boolean;
  user?: User | null;
  sessionToken?: string | null;
  errorMessage?: string | null;
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
}

export interface UserSession {
  sessionId: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
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

export interface PasswordResetRequest {
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

// Material Types
export interface Material {
  id: string;
  workshopId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: Date;
  downloadUrl: string;
  accessLevel: 'public' | 'attendees_only' | 'admin_only';
}

// Utility Types
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  fileName?: string;
  errorMessage?: string;
}

// File handling (for browser compatibility)
export interface File {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
}

// Email Types
export interface EmailRequest {
  to: string;
  subject: string;
  content: string;
  from: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
}

export interface EmailResult {
  emailId: string;
  status: 'success' | 'failed' | 'pending';
  messageId?: string;
  errorMessage?: string;
}

export interface EmailStatus {
  emailId: string;
  status: 'sent' | 'delivered' | 'failed' | 'bounced';
  recipient: string;
  sentAt: Date;
  deliveredAt?: Date;
  templateId?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: string[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
}

// Calendar Management Types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDateTime: Date;
  endDateTime: Date;
  location?: string;
  attendees?: string[];
  isAllDay?: boolean;
}

export interface CalendarEventRequest {
  title: string;
  description?: string;
  startDateTime: Date;
  endDateTime: Date;
  location?: string;
  attendees?: string[];
  isAllDay?: boolean;
  workshopId?: string;
}

export interface CalendarEventUpdate {
  title?: string;
  description?: string;
  startDateTime?: Date;
  endDateTime?: Date;
  location?: string;
  attendees?: string[];
  isAllDay?: boolean;
  status?: 'confirmed' | 'tentative' | 'cancelled';
}

// Purchase Workflow Types
export interface PurchaseRequest {
  bookingRequest: BookingRequest;
  paymentMethod: PaymentMethod;
  billingAddress?: Address;
  savePaymentMethod?: boolean;
}

export interface PurchaseResult {
  purchaseId: string;
  bookingId: string;
  paymentId: string;
  status: 'completed' | 'failed' | 'pending';
  totalAmount: number;
  confirmationNumber: string;
  receiptUrl?: string;
  errorMessage?: string;
}

export interface PurchaseStatus {
  purchaseId: string;
  bookingStatus: 'confirmed' | 'cancelled' | 'pending';
  paymentStatus: 'completed' | 'failed' | 'pending' | 'refunded';
  totalAmount: number;
  paidAmount: number;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}
