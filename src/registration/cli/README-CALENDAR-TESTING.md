# Google Calendar Integration Testing Suite

This directory contains comprehensive testing tools for the Google Calendar integration that use the **exact same code** as the production website.

## 🎯 **Architecture Overview**

### **Clean Architecture Principles Applied**
- **Interface Segregation**: `GoogleCalendarService` provides focused, single-responsibility methods
- **Dependency Inversion**: CLI tests and API endpoints both depend on the same `GoogleCalendarService` abstraction
- **Single Responsibility**: Each test focuses on one specific calendar operation
- **DRY Principle**: CLI tests and API endpoints use identical service layer code

### **Code Reuse Strategy**
```
┌─────────────────────┐    ┌─────────────────────┐
│   CLI Test Suite    │    │   API Endpoints     │
│                     │    │                     │
├─────────────────────┤    ├─────────────────────┤
│ ✅ Same Service     │    │ ✅ Same Service     │
│ ✅ Same Validation  │    │ ✅ Same Validation  │
│ ✅ Same Error Logic │    │ ✅ Same Error Logic │
└─────────────────────┘    └─────────────────────┘
           │                           │
           └───────────┬───────────────┘
                       │
           ┌─────────────────────┐
           │ GoogleCalendarService│
           │                     │
           │ • createEvent()     │
           │ • getEvent()        │
           │ • updateEvent()     │
           │ • deleteEvent()     │
           │ • checkConflicts()  │
           └─────────────────────┘
```

## 🧪 **Test Suite 1: Direct Calendar Integration**

### **File**: `test-calendar-integration.ts`

**Purpose**: Test Google Calendar operations directly using the same `GoogleCalendarService` that the website uses.

### **Usage Examples**:
```bash
# Basic test with default attendee
npx tsx src/registration/cli/test-calendar-integration.ts

# Custom attendee and duration
npx tsx src/registration/cli/test-calendar-integration.ts --attendee=rvegajr@darkware.net --duration=2

# Different event types
npx tsx src/registration/cli/test-calendar-integration.ts --type=workshop --duration=3
npx tsx src/registration/cli/test-calendar-integration.ts --type=consulting --duration=1
npx tsx src/registration/cli/test-calendar-integration.ts --type=blocked

# Skip deletion (for manual verification)
npx tsx src/registration/cli/test-calendar-integration.ts --skip-delete
```

### **Test Operations**:
1. **Connection Validation** - Verify Google Calendar API access
2. **Event Creation** - Create events with attendees and proper formatting
3. **Event Verification** - Retrieve and validate all event parameters
4. **Event Updates** - Modify existing events
5. **Conflict Detection** - Check for overlapping events
6. **Event Deletion** - Clean up test events

### **Event Types Supported**:
- **Workshop**: Green color, training center location, email reminders
- **Consulting**: Purple color, virtual location, Google Meet integration
- **Blocked**: Red color, all-day events, opaque scheduling
- **Meeting**: Blue color, standard business meeting format

## 🌐 **Test Suite 2: API Endpoint Testing**

### **File**: `test-calendar-api.ts`

**Purpose**: Test the REST API endpoints that use the same `GoogleCalendarService` as the direct tests.

### **Usage Examples**:
```bash
# Test against local development server
npx tsx src/registration/cli/test-calendar-api.ts --attendee=rvegajr@darkware.net

# Test against different server
npx tsx src/registration/cli/test-calendar-api.ts --base-url=https://your-domain.com

# Skip deletion for manual verification
npx tsx src/registration/cli/test-calendar-api.ts --skip-delete
```

### **API Endpoints Tested**:
1. **POST** `/api/calendar/events/create` - Create new events
2. **GET** `/api/calendar/events/[id]` - Retrieve event details
3. **PATCH** `/api/calendar/events/[id]/update` - Update existing events
4. **DELETE** `/api/calendar/events/[id]/delete` - Remove events

## 🏗️ **Architecture Benefits**

### **1. Code Consistency**
- CLI tests and API endpoints use **identical** `GoogleCalendarService` methods
- Same validation logic, error handling, and event formatting
- Changes to calendar logic automatically apply to both CLI and API

### **2. Interface Segregation**
- `GoogleCalendarService` provides focused, single-purpose methods
- Each method has a clear responsibility (create, read, update, delete)
- Easy to mock and test individual operations

### **3. Clean Error Handling**
- Consistent error messages between CLI and API
- Proper HTTP status codes in API responses
- Graceful fallback and cleanup on failures

### **4. Attendee Management**
- Parameterized attendee email addresses
- Proper attendee response status handling
- Verification that attendees are correctly added

## 📊 **Test Results Analysis**

### **What Success Looks Like**:
```
🎉 Test Suite Results:
=====================
✅ Connection validation: PASSED
✅ Event creation: PASSED
✅ Event verification: PASSED
✅ Event update: PASSED
✅ Conflict detection: PASSED
✅ Event deletion: PASSED

🎯 Google Calendar integration is working perfectly!
🚀 Your system is ready for production calendar management!
```

### **Common Issues and Solutions**:

**Issue**: `Request had insufficient authentication scopes`
**Solution**: Re-authenticate with proper calendar scope:
```bash
gcloud auth application-default login --scopes=https://www.googleapis.com/auth/calendar
```

**Issue**: `Calendar not accessible`
**Solution**: Verify calendar ID and sharing permissions in `.env`

**Issue**: `Event still exists after deletion`
**Solution**: Google Calendar API may have slight delays - this is normal behavior

## 🔧 **Configuration Requirements**

### **Environment Variables**:
```bash
# Required
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
USE_APPLICATION_DEFAULT_CREDENTIALS=true

# Optional (if not using ADC)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./path-to-service-account.json
```

### **Authentication Options**:
1. **Application Default Credentials** (Recommended for development)
2. **Service Account** (Recommended for production)
3. **OAuth2 Client** (Fallback option)

## 🚀 **Production Readiness**

### **What These Tests Validate**:
- ✅ Google Calendar API integration works end-to-end
- ✅ Event creation with proper formatting and attendees
- ✅ Event retrieval and parameter verification
- ✅ Event updates and modifications
- ✅ Event deletion and cleanup
- ✅ Conflict detection for scheduling
- ✅ Error handling and graceful failures
- ✅ API endpoints use same logic as direct integration

### **Integration Points Verified**:
- ✅ Workshop booking → Calendar event creation
- ✅ Consulting sessions → Calendar appointments
- ✅ Admin date blocking → Calendar blocked events
- ✅ Attendee management → Calendar invitations
- ✅ Event updates → Calendar modifications
- ✅ Event cleanup → Calendar event deletion

## 📝 **Command Line Reference**

### **Direct Calendar Testing**:
```bash
# Full test suite
npx tsx src/registration/cli/test-calendar-integration.ts

# Custom parameters
npx tsx src/registration/cli/test-calendar-integration.ts \
  --attendee=user@example.com \
  --duration=2 \
  --type=consulting \
  --skip-delete
```

### **API Testing**:
```bash
# Test API endpoints
npx tsx src/registration/cli/test-calendar-api.ts

# Custom parameters
npx tsx src/registration/cli/test-calendar-api.ts \
  --attendee=user@example.com \
  --base-url=http://localhost:4321 \
  --skip-delete
```

## 🎯 **Next Steps**

1. **Run Both Test Suites** to verify your Google Calendar integration
2. **Check Google Calendar** to see the created events visually
3. **Test Different Event Types** (workshop, consulting, blocked)
4. **Verify Attendee Management** with real email addresses
5. **Test API Integration** for frontend calendar features

---

**Key Principle**: These tests use the **exact same code** that your production website will use, ensuring complete confidence in your calendar integration! 🎉 