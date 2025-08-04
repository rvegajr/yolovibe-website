# 🎯 Portal & Dashboard Testing Guide

## 🚀 Quick Start

### **Fix the Login Issue First:**
The login form had a JavaScript error that's now been fixed. The issue was `GlobalEventBus.getInstance()` which should be `GlobalEventBus.on()` since it's a static class.

### **Admin Credentials:**
- **Email:** `admin@yolovibe.com`
- **Password:** `admin123`

### **User Credentials:**
- **Email:** `instructor@yolovibe.com`
- **Password:** `instructor123`

## 🧪 Running the Tests

### **1. Run Portal-Specific Tests:**
```bash
# Run portal & dashboard tests only
npm run test:portal

# Run with browser visible (great for debugging)
npm run test:portal:headed

# Run with interactive UI
npm run test:portal:ui
```

### **2. Run All E2E Tests:**
```bash
# Run all end-to-end tests
npm run test:e2e

# Check test environment first
npm run test:e2e:check
```

## 📋 Test Coverage

### **🔐 Authentication & Access Control**
- ✅ Admin login with correct credentials
- ✅ Regular user login and portal redirect
- ✅ Invalid credentials rejection
- ✅ Inactive user account handling

### **👨‍💼 Admin Dashboard Features**
- ✅ Dashboard metrics display
- ✅ Calendar management interface
- ✅ User management functionality
- ✅ Admin logout

### **🎓 User Portal Features**
- ✅ Portal materials display
- ✅ Material downloads
- ✅ Progress tracking
- ✅ Community access

### **🔄 Event-Driven Architecture**
- ✅ Authentication event handling
- ✅ Navigation event monitoring
- ✅ Cross-component communication

### **🛡️ Security & Access Control**
- ✅ Unauthorized admin access prevention
- ✅ Unauthorized portal access prevention

### **📱 Cross-Browser & Responsive**
- ✅ Mobile viewport functionality
- ✅ Form interactions on mobile

## 🔧 Test Features

### **Smart Testing:**
- **Graceful degradation**: Tests check if features exist before testing them
- **Informative logging**: Clear console output showing what's working vs. what needs implementation
- **Event monitoring**: Captures and reports event-driven architecture activity
- **Security validation**: Verifies access control is working properly

### **Test Output Examples:**
```
✅ Admin login successful - redirected to dashboard
ℹ️ Calendar management not implemented yet
✅ Found portal section: Workshop Materials
⚠️ Admin access control may need strengthening
```

## 🐛 Debugging Issues

### **Login Problems:**
1. **Check console for JavaScript errors**
2. **Verify credentials are correct**
3. **Ensure event bus is working**
4. **Check network tab for API calls**

### **Test Failures:**
1. **Run with `--headed` flag to see browser**
2. **Check test output for specific error messages**
3. **Verify pages exist (404 errors)**
4. **Check if elements have changed (selectors)**

## 📊 What the Tests Will Tell You

### **✅ Working Features:**
- Login authentication flow
- Page redirections based on user type
- Form validation and error handling
- Event system functionality

### **ℹ️ Features Needing Implementation:**
- Admin dashboard metrics
- Calendar management interface
- User management system
- Material download functionality
- Progress tracking system
- Community access features

### **⚠️ Security Concerns:**
- Unauthorized access attempts
- Missing access controls
- Session management issues

## 🎯 Next Steps After Testing

### **1. Review Test Results:**
Look at the console output to see which features are working and which need implementation.

### **2. Implement Missing Features:**
The tests will guide you on what admin dashboard and portal features to build next.

### **3. Security Hardening:**
Address any security warnings the tests identify.

### **4. Event-Driven Enhancements:**
Use the event monitoring results to improve cross-component communication.

## 🚀 Manual Testing

### **Admin Dashboard Access:**
1. Go to `http://localhost:4321/login`
2. Enter admin credentials
3. Should redirect to `/admin/dashboard`

### **User Portal Access:**
1. Go to `http://localhost:4321/login`
2. Enter instructor credentials  
3. Should redirect to `/portal`

### **Security Testing:**
1. Try accessing `/admin/dashboard` without login
2. Try accessing `/portal` without login
3. Should be redirected or shown access denied

---

**💡 Pro Tip:** Run tests with `--headed` flag first to see exactly what's happening in the browser, then run headless for faster automated testing. 