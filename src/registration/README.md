# YOLOVibe Registration System

## 🎯 TEST-DRIVEN DEVELOPMENT ARCHITECTURE

This registration system follows **strict Test-Driven Development (TDD)** principles with **Interface-Only Programming**. Every interface is validated through CLI tests BEFORE any implementation is written.

## 📁 Project Structure

```
/YOLOVibeWebsite/src/registration/
├── core/
│   ├── interfaces/           # 13 Core Business Interfaces (PUBLIC API)
│   │   └── index.ts         # All interface definitions
│   └── types/               # TypeScript Data Models
│       └── index.ts         # All type definitions
├── modules/                 # Implementation Modules (PRIVATE)
│   ├── workshop/           # IProductCatalog, IBookingManager, IWorkshopAdmin
│   ├── payment/            # IPaymentProcessor, ICouponManager
│   ├── attendee/           # IAttendeeManager, IAttendeeAccessManager
│   ├── communication/      # IEmailSender, IPointOfContactManager
│   ├── calendar/           # ICalendarManager
│   ├── content/            # IMaterialManager
│   ├── auth/               # IUserAuthenticator
│   └── reporting/          # IReportingManager
├── cli/                    # CLI Test Harnesses
│   ├── test-all-interfaces.ts      # Master test runner
│   ├── test-product-catalog.ts     # IProductCatalog tests
│   ├── test-booking-manager.ts     # IBookingManager tests
│   └── [more interface tests...]
├── infrastructure/         # External Service Adapters
│   ├── square/            # Square payment integration
│   ├── auth0/             # Auth0 authentication
│   ├── sendgrid/          # SendGrid email service
│   └── google-calendar/   # Google Calendar integration
└── README.md              # This file
```

## 🧪 CLI Testing Commands

```bash
# Test all interfaces
npm run test:interfaces

# Test individual interfaces
npm run test:product-catalog
npm run test:booking-manager

# Run specific interface test
npx tsx src/registration/cli/test-product-catalog.ts
```

## 🔒 Core Principles

### 1. **Interface-Only Programming**
- ALL client code depends ONLY on interfaces, never concrete implementations
- Interfaces are public contracts - implementations are internal details
- No direct imports of implementation classes in business logic
- Dependency injection used exclusively for implementation binding

### 2. **Test-Driven Interface Design**
- Write CLI test for interface BEFORE writing any implementation
- Test drives the interface design (not the other way around)
- Each interface method must have corresponding CLI test case
- Tests validate behavior through interface contracts only

### 3. **Implementation Isolation**
- Implementation modules are NOT exported from main package
- Only interfaces and types are exposed as public API
- Concrete classes are internal implementation details
- Easy to swap implementations without changing client code

## 📋 13 Core Business Interfaces

### Product & Workshop Management
- **IProductCatalog** - Workshop catalog and availability ✅ TESTED
- **IBookingManager** - Workshop booking operations ✅ TESTED
- **IWorkshopAdmin** - Workshop administration

### Payment Processing
- **IPaymentProcessor** - Square payment integration
- **ICouponManager** - Discount code functionality

### People Management
- **IAttendeeManager** - Attendee list management
- **IPointOfContactManager** - Point of contact operations
- **IAttendeeAccessManager** - Attendee password and access control

### Communication & Content
- **IEmailSender** - SendGrid email integration
- **IMaterialManager** - Workshop content and resources

### System Services
- **ICalendarManager** - Google Calendar integration and date blocking
- **IUserAuthenticator** - Auth0 authentication integration
- **IReportingManager** - Business analytics and reporting

## 🎉 Current Status

✅ **Architecture Established** - Clean module separation with interface-first design
✅ **Type System Complete** - All business data models defined
✅ **CLI Testing Framework** - Test-driven development infrastructure ready
✅ **IProductCatalog** - Interface designed and validated through CLI tests
✅ **IBookingManager** - Interface designed and validated through CLI tests

## 🚀 Next Steps

1. **Continue CLI Test Development** - Build remaining 11 interface test suites
2. **Implement Business Logic** - Create concrete classes that fulfill interface contracts
3. **Integration Testing** - Test complete customer journey workflows
4. **UI Integration** - Connect interfaces to Astro frontend components
5. **External Service Integration** - Connect to Square, Auth0, SendGrid, Google Calendar

## 🎯 Business Requirements

### Workshop Products
- **3-Day Workshop**: $3,000/seat, Mon/Tue/Wed start days, 3 consecutive days, max 1/week
- **5-Day Workshop**: $4,500/seat, Monday start only, Mon-Fri, max 1/week

### Key Features
- Credit card payments via Square
- Coupon code support
- Client portal with attendee management
- Google Calendar integration
- Automated email notifications
- Workshop materials sharing
- Access control and reporting

---

**Remember: Tests First, Implementation Second!** 🧪✨
