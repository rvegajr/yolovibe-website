-- =====================================================
-- YOLOVibe Workshop Registration System Database Schema
-- =====================================================
-- This schema supports all 13 core interfaces with proper
-- relationships, constraints, and performance optimization
-- =====================================================

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- =====================================================
-- CORE ENTITIES
-- =====================================================

-- Users table (supports IUserAuthenticator)
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME,
    password_reset_token TEXT,
    password_reset_expires DATETIME,
    session_token TEXT,
    session_expires DATETIME
);

-- Products table (supports IProductCatalog)
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    product_type TEXT NOT NULL CHECK (product_type IN ('THREE_DAY', 'FIVE_DAY', 'HOURLY_CONSULTING')),
    price DECIMAL(10,2) NOT NULL,
    duration_days INTEGER, -- NULL for hourly consulting
    duration_hours INTEGER, -- For hourly consulting
    max_capacity INTEGER NOT NULL DEFAULT 12,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workshops table (supports IBookingManager, IWorkshopAdmin)
CREATE TABLE workshops (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_capacity INTEGER NOT NULL,
    max_capacity INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED', 'COMPLETED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Bookings table (supports IBookingManager, IPaymentProcessor)
CREATE TABLE bookings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    workshop_id TEXT NOT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED')),
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    final_amount DECIMAL(10,2) NOT NULL,
    coupon_code TEXT,
    payment_intent_id TEXT,
    payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE,
    FOREIGN KEY (coupon_code) REFERENCES coupons(code) ON DELETE SET NULL
);

-- =====================================================
-- ATTENDEE MANAGEMENT
-- =====================================================

-- Points of contact table (supports IPointOfContactManager)
CREATE TABLE points_of_contact (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    is_attendee BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Attendees table (supports IAttendeeManager, IAttendeeAccessManager)
CREATE TABLE attendees (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    dietary_restrictions TEXT,
    access_password_hash TEXT,
    password_expires_at DATETIME,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'REMOVED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- =====================================================
-- COUPONS & DISCOUNTS
-- =====================================================

-- Coupons table (supports ICouponManager)
CREATE TABLE coupons (
    code TEXT PRIMARY KEY,
    description TEXT,
    discount_percentage DECIMAL(5,2) NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    usage_limit INTEGER,
    times_used INTEGER DEFAULT 0,
    expires_at DATETIME,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Coupon usage tracking
CREATE TABLE coupon_usage (
    id TEXT PRIMARY KEY,
    coupon_code TEXT NOT NULL,
    booking_id TEXT NOT NULL,
    used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_code) REFERENCES coupons(code) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    UNIQUE(coupon_code, booking_id)
);

-- =====================================================
-- CALENDAR & SCHEDULING
-- =====================================================

-- Calendar blockouts table (supports ICalendarManager)
CREATE TABLE calendar_blockouts (
    id TEXT PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    google_calendar_event_id TEXT,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Workshop capacity history (supports IWorkshopAdmin)
CREATE TABLE workshop_capacity_history (
    id TEXT PRIMARY KEY,
    workshop_id TEXT NOT NULL,
    previous_capacity INTEGER NOT NULL,
    new_capacity INTEGER NOT NULL,
    changed_by TEXT NOT NULL,
    change_reason TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- MATERIALS & CONTENT
-- =====================================================

-- Workshop materials table (supports IMaterialManager)
CREATE TABLE workshop_materials (
    id TEXT PRIMARY KEY,
    workshop_id TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    download_url TEXT NOT NULL,
    access_level TEXT NOT NULL DEFAULT 'ATTENDEES' CHECK (access_level IN ('ATTENDEES', 'ADMIN', 'PUBLIC')),
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    uploaded_by TEXT NOT NULL,
    FOREIGN KEY (workshop_id) REFERENCES workshops(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Material access tracking
CREATE TABLE material_access (
    id TEXT PRIMARY KEY,
    material_id TEXT NOT NULL,
    attendee_id TEXT NOT NULL,
    has_access BOOLEAN DEFAULT TRUE,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    revoked_at DATETIME,
    FOREIGN KEY (material_id) REFERENCES workshop_materials(id) ON DELETE CASCADE,
    FOREIGN KEY (attendee_id) REFERENCES attendees(id) ON DELETE CASCADE,
    UNIQUE(material_id, attendee_id)
);

-- =====================================================
-- CONSULTING SESSIONS
-- =====================================================

-- Consulting sessions table (supports hourly AI consulting bookings)
CREATE TABLE consulting_sessions (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_hours INTEGER NOT NULL DEFAULT 2,
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 200.00,
    zoom_link TEXT,
    zoom_meeting_id TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- =====================================================
-- EMAIL & COMMUNICATIONS
-- =====================================================

-- Email templates table (supports IEmailSender)
CREATE TABLE email_templates (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    template_variables TEXT, -- JSON array of variable names
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Email send log (supports IEmailSender, IReportingManager)
CREATE TABLE email_logs (
    id TEXT PRIMARY KEY,
    template_id TEXT,
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'BOUNCED')),
    external_message_id TEXT,
    error_message TEXT,
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE SET NULL
);

-- =====================================================
-- REPORTING & ANALYTICS
-- =====================================================

-- Payment transactions table (supports IReportingManager)
CREATE TABLE payment_transactions (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('PAYMENT', 'REFUND', 'PARTIAL_REFUND')),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT,
    external_transaction_id TEXT,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    processed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_session_token ON users(session_token);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Workshop indexes
CREATE INDEX idx_workshops_product_id ON workshops(product_id);
CREATE INDEX idx_workshops_start_date ON workshops(start_date);
CREATE INDEX idx_workshops_status ON workshops(status);

-- Booking indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_workshop_id ON bookings(workshop_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Attendee indexes
CREATE INDEX idx_attendees_booking_id ON attendees(booking_id);
CREATE INDEX idx_attendees_email ON attendees(email);
CREATE INDEX idx_attendees_status ON attendees(status);

-- Material indexes
CREATE INDEX idx_materials_workshop_id ON workshop_materials(workshop_id);
CREATE INDEX idx_materials_access_level ON workshop_materials(access_level);

-- Email log indexes
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);

-- Transaction indexes
CREATE INDEX idx_transactions_booking_id ON payment_transactions(booking_id);
CREATE INDEX idx_transactions_type ON payment_transactions(transaction_type);
CREATE INDEX idx_transactions_created_at ON payment_transactions(created_at);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update timestamps automatically
CREATE TRIGGER update_users_timestamp 
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_products_timestamp 
    AFTER UPDATE ON products
    BEGIN
        UPDATE products SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_workshops_timestamp 
    AFTER UPDATE ON workshops
    BEGIN
        UPDATE workshops SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_bookings_timestamp 
    AFTER UPDATE ON bookings
    BEGIN
        UPDATE bookings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_attendees_timestamp 
    AFTER UPDATE ON attendees
    BEGIN
        UPDATE attendees SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_coupons_timestamp 
    AFTER UPDATE ON coupons
    BEGIN
        UPDATE coupons SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert default products
INSERT INTO products (id, name, description, product_type, price, duration_days, max_capacity) VALUES
('prod-3day', '3-Day YOLO Workshop', 'Intensive 3-day workshop covering core YOLO principles and practices', 'THREE_DAY', 3000.00, 3, 12),
('prod-5day', '5-Day YOLO Intensive', 'Comprehensive 5-day deep-dive workshop with advanced techniques', 'FIVE_DAY', 4500.00, 5, 12);

-- Insert default email templates
INSERT INTO email_templates (id, name, subject, html_content, text_content, template_variables) VALUES
('registration-confirmation', 'Registration Confirmation', 'Welcome to {{workshopName}} - Registration Confirmed!', 
 '<h1>Welcome {{attendeeName}}!</h1><p>Your registration for {{workshopName}} has been confirmed.</p><p>Workshop Date: {{workshopDate}}</p><p>Total Amount: ${{totalAmount}}</p>',
 'Welcome {{attendeeName}}! Your registration for {{workshopName}} has been confirmed. Workshop Date: {{workshopDate}}. Total Amount: ${{totalAmount}}',
 '["attendeeName", "workshopName", "workshopDate", "totalAmount"]'),
('attendee-invitation', 'Workshop Invitation', 'You''re invited to {{workshopName}}!',
 '<h1>You''re Invited!</h1><p>Hi {{attendeeName}}, you''ve been added to {{workshopName}}.</p><p>Your access password: {{accessPassword}}</p>',
 'Hi {{attendeeName}}, you''ve been added to {{workshopName}}. Your access password: {{accessPassword}}',
 '["attendeeName", "workshopName", "accessPassword"]');

-- Insert sample coupon
INSERT INTO coupons (code, description, discount_percentage, usage_limit, expires_at) VALUES
('EARLY2025', 'Early Bird 2025 Discount', 15.00, 100, '2025-12-31 23:59:59');
