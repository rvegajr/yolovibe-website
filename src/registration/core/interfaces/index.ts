/**
 * Core Business Interfaces - Public API Contracts
 * These are the ONLY exports from our business logic modules
 * All client code must depend ONLY on these interfaces
 */

import type {
  Product,
  ProductType,
  BookingRequest,
  BookingResult,
  Booking,
  WorkshopMetrics,
  CapacityStatus,
  TimeSlot,
  ConsultingBookingRequest,
  PaymentRequest,
  PaymentResult,
  RefundResult,
  PaymentStatus,
  CouponValidation,
  CouponUsage,
  AttendeeInfo,
  Attendee,
  AttendeeUpdates,
  ContactInfo,
  PointOfContact,
  AccessStatus,
  Workshop,
  Material,
  WorkshopType,
  DateRange,
  Credentials,
  AuthResult,
  Session,
  PaymentSummary,
  RevenueAnalytics,
  ExportResult,
  File,
  EmailRequest,
  EmailResult,
  EmailStatus,
  RegistrationData,
  User,
  PurchaseRequest,
  PurchaseResult,
  PurchaseStatus
} from '../types/index.js';

// Product & Workshop Management
export interface IProductCatalog {
  getAvailableProducts(): Promise<Product[]>;
  getProductDetails(productId: string): Promise<Product>;
  getAvailableStartDates(productType: ProductType): Promise<Date[]>;
  // Consulting methods
  getHourlyAvailability(date: Date, startHour: number, endHour: number): Promise<TimeSlot[]>;
}

export interface IBookingManager {
  createBooking(request: BookingRequest): Promise<BookingResult>;
  getBooking(bookingId: string): Promise<Booking>;
  cancelBooking(bookingId: string): Promise<void>;
  // Consulting methods
  createConsultingBooking(request: ConsultingBookingRequest): Promise<BookingResult>;
}

export interface IWorkshopAdmin {
  setWorkshopCapacity(workshopId: string, capacity: number): Promise<void>;
  getWorkshopMetrics(workshopId: string): Promise<WorkshopMetrics>;
  isWorkshopFull(workshopId: string): Promise<boolean>;
  getCapacityStatus(workshopId: string): Promise<CapacityStatus>;
}

// Payment Processing
export interface IPaymentProcessor {
  processPayment(paymentRequest: PaymentRequest): Promise<PaymentResult>;
  processRefund(bookingId: string, amount?: number): Promise<RefundResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
}

// Purchase Workflow - Coordinates booking and payment
export interface IPurchaseManager {
  processPurchase(purchaseRequest: PurchaseRequest): Promise<PurchaseResult>;
  getPurchaseStatus(purchaseId: string): Promise<PurchaseStatus>;
  cancelPurchase(purchaseId: string): Promise<void>;
}

// Coupon Management
export interface ICouponManager {
  validateCoupon(code: string): Promise<CouponValidation>;
  applyCoupon(code: string, amount: number): Promise<number>;
  getCouponUsage(code: string): Promise<CouponUsage>;
}

// People Management
export interface IAttendeeManager {
  addAttendee(bookingId: string, attendeeInfo: AttendeeInfo): Promise<void>;
  getAttendees(bookingId: string): Promise<Attendee[]>;
  removeAttendee(attendeeId: string): Promise<void>;
  updateAttendee(attendeeId: string, updates: AttendeeUpdates): Promise<void>;
}

export interface IPointOfContactManager {
  setPointOfContact(bookingId: string, contactInfo: ContactInfo): Promise<void>;
  getPointOfContact(bookingId: string): Promise<PointOfContact>;
  makeContactAnAttendee(bookingId: string): Promise<void>;
}

export interface IAttendeeAccessManager {
  generateAccessPassword(attendeeId: string): Promise<string>;
  validateAccess(attendeeId: string, password: string): Promise<boolean>;
  expireAccess(attendeeId: string): Promise<void>;
  getAccessStatus(attendeeId: string): Promise<AccessStatus>;
}

// Communication & Content
export interface IEmailSender {
  sendEmail(emailRequest: EmailRequest): Promise<EmailResult>;
  sendTemplatedEmail(templateId: string, recipient: string, templateData: Record<string, any>): Promise<EmailResult>;
  getEmailStatus(emailId: string): Promise<EmailStatus>;
  sendBulkEmails(emailRequests: EmailRequest[]): Promise<EmailResult[]>;
  // Legacy methods for backward compatibility
  sendConfirmation(booking: Booking): Promise<void>;
  sendReminder(workshop: Workshop, daysBeforeWorkshop: number): Promise<void>;
  sendAttendeeInvitation(attendee: Attendee, workshop: Workshop): Promise<void>;
  sendPasswordReset(attendee: Attendee): Promise<void>;
}

// System Services
export interface ICalendarManager {
  isDateAvailable(date: Date, workshopType: WorkshopType): Promise<boolean>;
  blockDate(date: Date, reason: string): Promise<void>;
  createWorkshopEvent(workshop: Workshop): Promise<string>;
  getBlockedDates(dateRange: DateRange): Promise<Date[]>;
}

export interface IUserAuthenticator {
  registerUser(registrationData: RegistrationData): Promise<User>;
  authenticate(credentials: Credentials): Promise<AuthResult>;
  validateSession(token: string): Promise<boolean>;
  createSession(userId: string): Promise<Session>;
  logoutUser(sessionToken: string): Promise<boolean>;
  resetPassword(email: string): Promise<void>;
}

export interface IMaterialManager {
  uploadMaterial(workshopId: string, file: File): Promise<string>;
  getMaterials(workshopId: string): Promise<Material[]>;
  deleteMaterial(materialId: string): Promise<void>;
  getAttendeeAccess(attendeeId: string, materialId: string): Promise<boolean>;
}

export interface IReportingManager {
  getPaymentSummary(dateRange: DateRange): Promise<PaymentSummary>;
  getWorkshopMetrics(dateRange: DateRange): Promise<WorkshopMetrics>;
  exportTransactionData(format: 'csv' | 'excel'): Promise<ExportResult>;
  getRevenueAnalytics(dateRange: DateRange): Promise<RevenueAnalytics>;
}
