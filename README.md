# YOLOVibe Workshop Registration System

**A production-ready online registration system built with strict interface segregation and test-driven development principles.**

## 🚨 CRITICAL DEVELOPMENT PRINCIPLES

### ⚠️ **INTERFACE SEGREGATION MANDATORY**
**NOTHING should be created unless it's through a properly segregated interface.**

- **ALL business logic MUST implement one of the 13 core interfaces**
- **NO direct class instantiation** - only through interface contracts
- **Clients depend ONLY on methods they actually use**
- **Interfaces are behavioral contracts, NOT implementation blueprints**

### 🧪 **TEST-DRIVEN DEVELOPMENT REQUIRED**
**ALL business logic MUST be validated through CLI test harnesses BEFORE implementation.**

- **100% CLI test coverage** for all 13 core interfaces
- **Mock implementations** validate interface contracts
- **CLI tests exercise full business workflows**
- **No concrete implementation without passing CLI tests**

## 🏗️ Architecture Overview

This system integrates into the existing Astro + Vercel YOLOVibe website with:

- **13 Core Interfaces** with strict segregation
- **Pure TypeScript** business logic (no JavaScript mixing)
- **CLI Test Harnesses** for every interface
- **Interface-driven development** with dependency injection
- **Seamless Astro integration** for production deployment

## 🔌 Core Business Interfaces

### Product & Workshop Management
- `IProductCatalog` - Product discovery and availability
- `IBookingManager` - Booking lifecycle management  
- `IWorkshopAdmin` - Workshop capacity and metrics

### Payment Processing
- `IPaymentProcessor` - Payment and refund processing
- `ICouponManager` - Coupon validation and application

### People Management  
- `IAttendeeManager` - Attendee registration and updates
- `IPointOfContactManager` - Primary contact management
- `IAttendeeAccessManager` - Access control and passwords

### Communication & Content
- `IEmailSender` - Email notifications and templates
- `IMaterialManager` - Workshop material distribution

### System Services
- `ICalendarManager` - Date availability and scheduling
- `IUserAuthenticator` - Authentication and sessions
- `IReportingManager` - Analytics and reporting

## 🧪 CLI Test Infrastructure

Every interface has a dedicated CLI test harness:

```bash
# Test individual interfaces
npm run test:product-catalog
npm run test:booking-manager
npm run test:workshop-admin
npm run test:payment-processor
npm run test:coupon-manager
npm run test:attendee-manager
npm run test:point-of-contact-manager
npm run test:attendee-access-manager
npm run test:email-sender
npm run test:material-manager
npm run test:calendar-manager
npm run test:user-authenticator
npm run test:reporting-manager

# Test all interfaces
npm run test:all-interfaces
```

## 🚀 Development Workflow

### 1. Interface First
```typescript
// ✅ CORRECT: Define interface contract
export interface INewFeature {
  performAction(input: InputType): Promise<OutputType>;
}
```

### 2. CLI Test Harness
```bash
# ✅ CORRECT: Create CLI test first
tsx src/registration/cli/test-new-feature.ts
```

### 3. Mock Implementation
```typescript
// ✅ CORRECT: Mock validates interface
class MockNewFeature implements INewFeature {
  async performAction(input: InputType): Promise<OutputType> {
    // Mock implementation for testing
  }
}
```

### 4. Concrete Implementation
```typescript
// ✅ CORRECT: Only after CLI tests pass
class ConcreteNewFeature implements INewFeature {
  async performAction(input: InputType): Promise<OutputType> {
    // Real implementation
  }
}
```

## 🚫 Anti-Patterns (DO NOT DO)

```typescript
// ❌ WRONG: Direct class usage
const service = new SomeService();

// ❌ WRONG: Fat interfaces
interface IGodObject {
  doEverything(): void;
  handleAllCases(): void;
  // ... 50 more methods
}

// ❌ WRONG: Implementation before tests
class UntestableService {
  // No interface, no tests
}

// ❌ WRONG: JavaScript mixing
const jsFunction = function() { /* JS code */ };
```

## 📁 Project Structure

```
/src/registration/
├── core/
│   ├── interfaces/           # 13 core business interfaces
│   ├── types/               # TypeScript type definitions
│   └── implementations/     # Concrete implementations (internal)
├── cli/                     # CLI test harnesses
│   ├── test-*.ts           # Individual interface tests
│   └── test-all-interfaces.ts
└── factories/               # Dependency injection setup
```

## 🔧 Installation & Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
npm run deploy
```

## 🎯 Workshop Products

- **3-Day Workshop**: Mon/Tue/Wed start, $3,000 per seat
- **5-Day Workshop**: Monday start only, $4,500 per seat

## 📋 Development Checklist

Before implementing ANY new feature:

- [ ] Interface defined with proper segregation
- [ ] CLI test harness created and passing
- [ ] Mock implementation validates interface
- [ ] Type definitions are complete
- [ ] Integration tests with existing interfaces
- [ ] Documentation updated

## 🚨 Code Review Requirements

All PRs must demonstrate:

1. **Interface Segregation**: Small, focused interfaces
2. **CLI Test Coverage**: 100% business logic testing
3. **Type Safety**: Pure TypeScript implementation
4. **Contract Validation**: Interface compliance verified
5. **Integration Ready**: Seamless Astro compatibility

## 📚 Resources

- [Interface Segregation Principle](https://en.wikipedia.org/wiki/Interface_segregation_principle)
- [Test-Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)
- [Astro Documentation](https://docs.astro.build)
- [TypeScript Best Practices](https://typescript-eslint.io/rules/)

---

**Remember: Interface First, Test First, Implementation Last** 🎯
