-- =====================================================
-- Workshop Reminder System Database Schema
-- =====================================================
-- This schema supports the Workshop Reminder Service
-- Following the TDD tests we've already written! 🎉
-- =====================================================

-- Reminder schedules table
CREATE TABLE IF NOT EXISTS reminder_schedules (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    workshop_id TEXT NOT NULL,
    attendee_email TEXT NOT NULL,
    workshop_date DATETIME NOT NULL,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('WORKSHOP_48H', 'WORKSHOP_24H', 'WORKSHOP_2H', 'WORKSHOP_POST')),
    scheduled_for DATETIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'SENT', 'FAILED', 'CANCELLED')),
    attempts INTEGER DEFAULT 0,
    last_attempt DATETIME,
    error_message TEXT,
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (workshop_id) REFERENCES workshops(id)
);

-- Index for finding pending reminders
CREATE INDEX idx_reminders_pending ON reminder_schedules(status, scheduled_for) 
WHERE status = 'SCHEDULED';

-- Index for booking lookups
CREATE INDEX idx_reminders_booking ON reminder_schedules(booking_id);

-- Index for workshop lookups
CREATE INDEX idx_reminders_workshop ON reminder_schedules(workshop_id);

-- Reminder templates table
CREATE TABLE IF NOT EXISTS reminder_templates (
    id TEXT PRIMARY KEY,
    reminder_type TEXT NOT NULL UNIQUE CHECK (reminder_type IN ('WORKSHOP_48H', 'WORKSHOP_24H', 'WORKSHOP_2H', 'WORKSHOP_POST')),
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default reminder templates
INSERT OR IGNORE INTO reminder_templates (id, reminder_type, subject, html_content, text_content) VALUES
('template-48h', 'WORKSHOP_48H', 'Get Ready! {{workshopName}} is in 2 Days 🚀', 
 '<h1>Get Ready for an Amazing Experience!</h1>
<p>Hi {{attendeeName}},</p>
<p>Your <strong>{{workshopName}}</strong> is coming up in just 2 days!</p>
<p><strong>📅 Date:</strong> {{workshopDate}}<br>
<strong>⏰ Time:</strong> {{workshopTime}}<br>
{{#if location}}<strong>📍 Location:</strong> {{location}}<br>{{/if}}
{{#if zoomLink}}<strong>💻 Zoom Link:</strong> <a href="{{zoomLink}}">Join Workshop</a><br>{{/if}}</p>
<p>Get ready to transform your skills and have fun!</p>
<p>Best,<br>The YOLOVibe Team</p>',
 'Hi {{attendeeName}},

Your {{workshopName}} is coming up in just 2 days!

Date: {{workshopDate}}
Time: {{workshopTime}}
{{#if location}}Location: {{location}}{{/if}}
{{#if zoomLink}}Zoom Link: {{zoomLink}}{{/if}}

Get ready to transform your skills and have fun!

Best,
The YOLOVibe Team'),

('template-24h', 'WORKSHOP_24H', 'Tomorrow is the Day! {{workshopName}} 🎉', 
 '<h1>Tomorrow is YOUR Day!</h1>
<p>Hi {{attendeeName}},</p>
<p>Can you feel the excitement? Your <strong>{{workshopName}}</strong> is TOMORROW!</p>
<p><strong>📅 Date:</strong> {{workshopDate}}<br>
<strong>⏰ Time:</strong> {{workshopTime}}<br>
{{#if location}}<strong>📍 Location:</strong> {{location}}<br>{{/if}}
{{#if zoomLink}}<strong>💻 Zoom Link:</strong> <a href="{{zoomLink}}">Join Workshop</a><br>{{/if}}</p>
<p>Make sure to:</p>
<ul>
<li>✅ Get a good night''s sleep</li>
<li>✅ Have your notebook ready</li>
<li>✅ Bring your enthusiasm!</li>
</ul>
<p>See you tomorrow!<br>The YOLOVibe Team</p>',
 'Hi {{attendeeName}},

Can you feel the excitement? Your {{workshopName}} is TOMORROW!

Date: {{workshopDate}}
Time: {{workshopTime}}
{{#if location}}Location: {{location}}{{/if}}
{{#if zoomLink}}Zoom Link: {{zoomLink}}{{/if}}

Make sure to:
- Get a good night''s sleep
- Have your notebook ready
- Bring your enthusiasm!

See you tomorrow!
The YOLOVibe Team'),

('template-2h', 'WORKSHOP_2H', 'Starting Soon! {{workshopName}} 🚀', 
 '<h1>🎯 Starting in 2 Hours!</h1>
<p>Hi {{attendeeName}},</p>
<p>Your <strong>{{workshopName}}</strong> starts in just 2 HOURS!</p>
<p><strong>⏰ Time:</strong> {{workshopTime}}<br>
{{#if location}}<strong>📍 Location:</strong> {{location}}<br>{{/if}}
{{#if zoomLink}}<strong>💻 Zoom Link:</strong> <a href="{{zoomLink}}">Join Workshop</a><br>{{/if}}</p>
<p>Final checklist:</p>
<ul>
<li>☕ Grab your favorite beverage</li>
<li>📝 Have your materials ready</li>
<li>🎯 Get in the zone!</li>
</ul>
<p>See you very soon!<br>The YOLOVibe Team</p>',
 'Hi {{attendeeName}},

Your {{workshopName}} starts in just 2 HOURS!

Time: {{workshopTime}}
{{#if location}}Location: {{location}}{{/if}}
{{#if zoomLink}}Zoom Link: {{zoomLink}}{{/if}}

Final checklist:
- Grab your favorite beverage
- Have your materials ready
- Get in the zone!

See you very soon!
The YOLOVibe Team'),

('template-post', 'WORKSHOP_POST', 'Thank You for Joining {{workshopName}}! 🙏', 
 '<h1>You Did It! 🎉</h1>
<p>Hi {{attendeeName}},</p>
<p>Thank you for being part of <strong>{{workshopName}}</strong>!</p>
<p>We hope you had an amazing experience and learned valuable skills.</p>
<p><strong>What''s Next?</strong></p>
<ul>
<li>📚 Access your workshop materials (link coming soon)</li>
<li>💬 Join our community forum</li>
<li>🚀 Apply what you learned!</li>
</ul>
<p>We''d love to hear your feedback! Please reply to this email with your thoughts.</p>
<p>Keep being awesome!<br>The YOLOVibe Team</p>',
 'Hi {{attendeeName}},

Thank you for being part of {{workshopName}}!

We hope you had an amazing experience and learned valuable skills.

What''s Next?
- Access your workshop materials (link coming soon)
- Join our community forum
- Apply what you learned!

We''d love to hear your feedback! Please reply to this email with your thoughts.

Keep being awesome!
The YOLOVibe Team');

-- Trigger to update the updated_at timestamp
CREATE TRIGGER update_reminder_schedules_timestamp 
    AFTER UPDATE ON reminder_schedules
    BEGIN
        UPDATE reminder_schedules SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER update_reminder_templates_timestamp 
    AFTER UPDATE ON reminder_templates
    BEGIN
        UPDATE reminder_templates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;