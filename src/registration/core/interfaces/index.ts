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

// =====================================================
// PRODUCT & WORKSHOP MANAGEMENT INTERFACES
// =====================================================

/**
 * Product Catalog Management
 * Handles workshop products, availability, and scheduling
 */
export interface IProductCatalog {
  getAvailableProducts(): Promise<Product[]>;
  getProductDetails(productId: string): Promise<Product>;
  getAvailableStartDates(productType: ProductType): Promise<Date[]>;
  
  // Consulting methods
  getHourlyAvailability(date: Date, startHour: number, endHour: number): Promise<TimeSlot[]>;
  bookConsultingSession(request: ConsultingBookingRequest): Promise<BookingResult>;
}

/**
 * Workshop Booking Management
 * Handles all booking operations for workshops and consulting
 */
export interface IBookingManager {
  createBooking(request: BookingRequest): Promise<BookingResult>;
  getBooking(bookingId: string): Promise<Booking>;
  updateBooking(bookingId: string, updates: Partial<Booking>): Promise<Booking>;
  cancelBooking(bookingId: string): Promise<Booking>;
  
  // Capacity management
  getWorkshopCapacity(workshopId: string): Promise<CapacityStatus>;
  checkAvailability(productId: string, startDate: Date): Promise<boolean>;
  
  // Booking queries
  getBookingsByDateRange(startDate: Date, endDate: Date): Promise<Booking[]>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getUpcomingBookings(): Promise<Booking[]>;
}

/**
 * Workshop Administration
 * Admin-level workshop management and oversight
 */
export interface IWorkshopAdmin {
  createWorkshop(workshop: Omit<Workshop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workshop>;
  updateWorkshop(workshopId: string, updates: Partial<Workshop>): Promise<Workshop>;
  cancelWorkshop(workshopId: string, reason: string): Promise<void>;
  
  // Metrics and reporting
  getWorkshopMetrics(workshopId: string): Promise<WorkshopMetrics>;
  getAllWorkshops(): Promise<Workshop[]>;
  getWorkshopsByDateRange(startDate: Date, endDate: Date): Promise<Workshop[]>;
  
  // Capacity management
  updateWorkshopCapacity(workshopId: string, newCapacity: number): Promise<void>;
  getCapacityReport(): Promise<CapacityStatus[]>;
}

// =====================================================
// PAYMENT PROCESSING INTERFACES
// =====================================================

/**
 * Payment Processing
 * Handles all payment operations via Square integration
 */
export interface IPaymentProcessor {
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  refundPayment(paymentId: string, amount?: number): Promise<RefundResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
  
  // Payment method management
  savePaymentMethod(userId: string, paymentMethod: any): Promise<string>;
  getPaymentMethods(userId: string): Promise<any[]>;
  deletePaymentMethod(paymentMethodId: string): Promise<void>;
  
  // Reporting
  getPaymentSummary(startDate: Date, endDate: Date): Promise<PaymentSummary>;
}

/**
 * Coupon Management
 * Handles discount codes and promotional offers
 */
export interface ICouponManager {
  validateCoupon(couponCode: string, bookingAmount: number): Promise<CouponValidation>;
  applyCoupon(couponCode: string, bookingId: string): Promise<CouponUsage>;
  
  // Admin coupon management
  createCoupon(coupon: {
    code: string;
    discountType: 'percentage' | 'fixed_amount';
    discountValue: number;
    expiryDate?: Date;
    usageLimit?: number;
    minimumAmount?: number;
  }): Promise<void>;
  
  deactivateCoupon(couponCode: string): Promise<void>;
  getCouponUsage(couponCode: string): Promise<CouponUsage[]>;
  getAllCoupons(): Promise<any[]>;
}

// =====================================================
// PEOPLE MANAGEMENT INTERFACES
// =====================================================

/**
 * Attendee Management
 * Manages workshop attendees and their information
 */
export interface IAttendeeManager {
  addAttendee(bookingId: string, attendeeInfo: AttendeeInfo): Promise<void>;
  updateAttendee(attendeeId: string, updates: AttendeeUpdates): Promise<Attendee>;
  removeAttendee(attendeeId: string): Promise<void>;
  
  // Attendee queries
  getAttendee(attendeeId: string): Promise<Attendee>;
  getAttendeesByBooking(bookingId: string): Promise<Attendee[]>;
  getAttendeesByWorkshop(workshopId: string): Promise<Attendee[]>;
  
  // Bulk operations
  addMultipleAttendees(bookingId: string, attendees: AttendeeInfo[]): Promise<void>;
  updateAttendeeList(bookingId: string, attendees: AttendeeInfo[]): Promise<void>;
}

/**
 * Point of Contact Management
 * Manages primary contacts for bookings
 */
export interface IPointOfContactManager {
  createPointOfContact(contactInfo: ContactInfo): Promise<PointOfContact>;
  updatePointOfContact(contactId: string, updates: Partial<ContactInfo>): Promise<PointOfContact>;
  getPointOfContact(contactId: string): Promise<PointOfContact>;
  
  // Contact queries
  findContactByEmail(email: string): Promise<PointOfContact | null>;
  getContactsByCompany(company: string): Promise<PointOfContact[]>;
  getAllContacts(): Promise<PointOfContact[]>;
}

/**
 * Attendee Access Management
 * Manages attendee passwords and access control
 */
export interface IAttendeeAccessManager {
  generateAccessPassword(attendeeId: string): Promise<string>;
  validateAccess(attendeeId: string, password: string): Promise<boolean>;
  revokeAccess(attendeeId: string): Promise<void>;
  
  // Access status management
  getAccessStatus(attendeeId: string): Promise<AccessStatus>;
  updateAccessStatus(attendeeId: string, status: Partial<AccessStatus>): Promise<AccessStatus>;
  
  // Bulk access operations
  generateBulkAccess(bookingId: string): Promise<{ attendeeId: string; password: string }[]>;
  resetAllPasswords(bookingId: string): Promise<void>;
}

// =====================================================
// COMMUNICATION & CONTENT INTERFACES
// =====================================================

/**
 * Email Communication
 * Handles all email sending via SendGrid integration
 */
export interface IEmailSender {
  sendEmail(request: EmailRequest): Promise<EmailResult>;
  sendBulkEmail(requests: EmailRequest[]): Promise<EmailResult[]>;
  
  // Template-based emails
  sendTemplateEmail(templateId: string, to: string, data: Record<string, any>): Promise<EmailResult>;
  
  // Workshop-specific emails
  sendBookingConfirmation(bookingId: string): Promise<EmailResult>;
  sendWorkshopReminder(workshopId: string): Promise<EmailResult[]>;
  sendAccessCredentials(attendeeId: string): Promise<EmailResult>;
  
  // Email status tracking
  getEmailStatus(messageId: string): Promise<EmailStatus>;
  getDeliveryReport(startDate: Date, endDate: Date): Promise<any>;
}

/**
 * Material Management
 * Manages workshop materials and content
 */
export interface IMaterialManager {
  uploadMaterial(workshopId: string, file: File, metadata: Partial<Material>): Promise<Material>;
  getMaterial(materialId: string): Promise<Material>;
  updateMaterial(materialId: string, updates: Partial<Material>): Promise<Material>;
  deleteMaterial(materialId: string): Promise<void>;
  
  // Material queries
  getMaterialsByWorkshop(workshopId: string): Promise<Material[]>;
  getPublicMaterials(): Promise<Material[]>;
  getAttendeeMaterials(attendeeId: string): Promise<Material[]>;
  
  // File operations
  generateDownloadUrl(materialId: string, attendeeId?: string): Promise<string>;
  bulkUpload(workshopId: string, files: File[]): Promise<Material[]>;
}

// =====================================================
// SYSTEM SERVICES INTERFACES
// =====================================================

/**
 * Calendar Management
 * Integrates with Google Calendar and manages date blocking
 */
export interface ICalendarManager {
  // Date blocking for admin
  blockDate(date: Date, reason: string): Promise<void>;
  unblockDate(date: Date): Promise<void>;
  blockDateRange(startDate: Date, endDate: Date, reason: string): Promise<void>;
  isDateBlocked(date: Date): Promise<boolean>;
  getBlockedDates(startDate?: Date, endDate?: Date): Promise<Date[]>;
  
  // Google Calendar integration
  createCalendarEvent(event: {
    title: string;
    description?: string;
    startDateTime: Date;
    endDateTime: Date;
    attendees?: string[];
    location?: string;
  }): Promise<string>; // returns event ID
  
  updateCalendarEvent(eventId: string, updates: any): Promise<void>;
  deleteCalendarEvent(eventId: string): Promise<void>;
  
  // Workshop calendar management
  scheduleWorkshop(workshopId: string): Promise<string>;
  rescheduleWorkshop(workshopId: string, newStartDate: Date): Promise<void>;
  cancelWorkshopEvent(workshopId: string): Promise<void>;
}

/**
 * User Authentication
 * Handles user registration, login, and session management
 */
export interface IUserAuthenticator {
  registerUser(registrationData: RegistrationData): Promise<User>;
  authenticate(credentials: Credentials): Promise<AuthResult>;
  validateSession(token: string): Promise<boolean>;
  createSession(userId: string): Promise<Session>;
  logoutUser(sessionToken: string): Promise<boolean>;
  resetPassword(email: string): Promise<void>;
  
  // User management
  getUserById(userId: string): Promise<User>;
  getUserByEmail(email: string): Promise<User>;
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
  deactivateUser(userId: string): Promise<void>;
  
  // Admin functions
  getAllUsers(): Promise<User[]>;
  getUsersByRole(isAdmin: boolean): Promise<User[]>;
}

/**
 * Reporting & Analytics
 * Generates business reports and analytics
 */
export interface IReportingManager {
  // Revenue reports
  generateRevenueReport(startDate: Date, endDate: Date): Promise<RevenueAnalytics>;
  getPaymentSummary(startDate: Date, endDate: Date): Promise<PaymentSummary>;
  
  // Booking reports
  getBookingReport(startDate: Date, endDate: Date): Promise<any>;
  getAttendanceReport(workshopId?: string): Promise<any>;
  getCancellationReport(startDate: Date, endDate: Date): Promise<any>;
  
  // Workshop reports
  getWorkshopPerformance(): Promise<WorkshopMetrics[]>;
  getCapacityUtilization(): Promise<any>;
  
  // Export functions
  exportToCSV(reportType: string, data: any[]): Promise<ExportResult>;
  exportToExcel(reportType: string, data: any[]): Promise<ExportResult>;
  exportToPDF(reportType: string, data: any[]): Promise<ExportResult>;
  
  // Dashboard data
  getDashboardMetrics(): Promise<{
    totalRevenue: number;
    totalBookings: number;
    activeWorkshops: number;
    totalAttendees: number;
    averageBookingValue: number;
    monthlyGrowth: number;
  }>;
}

// =====================================================
// PURCHASE WORKFLOW INTERFACE
// =====================================================

/**
 * Purchase Management
 * Orchestrates the complete purchase workflow
 */
export interface IPurchaseManager {
  createPurchase(request: PurchaseRequest): Promise<PurchaseResult>;
  getPurchaseStatus(purchaseId: string): Promise<PurchaseStatus>;
  cancelPurchase(purchaseId: string, reason: string): Promise<void>;
  refundPurchase(purchaseId: string, amount?: number): Promise<RefundResult>;
  
  // Purchase queries
  getPurchasesByUser(userId: string): Promise<PurchaseResult[]>;
  getPurchasesByDateRange(startDate: Date, endDate: Date): Promise<PurchaseResult[]>;
  
  // Workflow management
  completePurchaseStep(purchaseId: string, step: string): Promise<void>;
  getNextSteps(purchaseId: string): Promise<string[]>;
}
