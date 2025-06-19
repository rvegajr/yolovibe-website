# MASTER ACUITY SETUP GUIDE
## Simplified Two-Product Workshop Scheduling

### Overview
This guide will help you configure Acuity Scheduling to support only two workshop products with specific day-of-week restrictions:

- **3-Day Workshop**: Monday, Tuesday, or Wednesday starts only
- **5-Day Workshop**: Monday starts only

---

## QUICK REFERENCE
- **Acuity Owner ID**: 35993562
- **3-Day Appointment Type ID**: 79465314
- **5-Day Appointment Type ID**: 79465467
- **3-Day Catalog ID**: 1993193
- **5-Day Catalog ID**: 1993196

---

## STEP-BY-STEP SETUP

### Phase 1: Configure 3-Day Workshop (ID: 79465314)

1. **Login to Acuity Admin**
   - Go to https://app.acuityscheduling.com/
   - Login with your admin credentials

2. **Navigate to Appointment Types**
   - Business Settings > Appointment Types
   - Find "3-Day Rapid VibeCode Workshop" (ID: 79465314)
   - Click "Edit"

3. **Set Availability**
   - **Available Days**: Monday, Tuesday, Wednesday ONLY
   - **Duration**: 8 hours
   - **Consecutive Days**: 3 days required
   - **Time Slots**: Configure your preferred 8-hour blocks

4. **Configure Scheduling Rules**
   - **Maximum per week**: 1
   - **Lead time**: 7 days minimum
   - **Cancellation policy**: 14 days for full refund

5. **Set Buffer Times**
   - **Before**: 24 hours
   - **After**: 24 hours

### Phase 2: Configure 5-Day Workshop (ID: 79465467)

1. **Edit 5-Day Appointment Type**
   - Find "5-Day VibeCode + Business Plan" (ID: 79465467)
   - Click "Edit"

2. **Set Availability**
   - **Available Days**: Monday ONLY
   - **Duration**: 8 hours per day
   - **Consecutive Days**: 5 days required (Mon-Fri)
   - **Time Slots**: Configure your preferred 8-hour blocks

3. **Configure Scheduling Rules**
   - **Maximum per week**: 1
   - **Lead time**: 14 days minimum
   - **Cancellation policy**: 14 days for full refund

4. **Set Buffer Times**
   - **Before**: 48 hours
   - **After**: 48 hours

### Phase 3: Prevent Conflicts

1. **Calendar Blocking Rules**
   - When 5-day workshop is booked (Monday), block entire week
   - When 3-day workshop is booked, block overlapping days
   - Ensure no double-bookings possible

2. **Advanced Settings**
   - Go to Business Settings > Scheduling Preferences
   - Enable "Prevent overlapping appointments"
   - Set "Block time when appointment is booked"

### Phase 4: Test Your Setup

1. **Test 3-Day Booking**
   - Visit: https://app.acuityscheduling.com/schedule.php?owner=35993562&appointmentType=79465314
   - Verify only Mon/Tue/Wed show as available start days
   - Confirm consecutive day selection works

2. **Test 5-Day Booking**
   - Visit: https://app.acuityscheduling.com/schedule.php?owner=35993562&appointmentType=79465467
   - Verify only Monday shows as available start day
   - Confirm full week gets blocked when booked

3. **Test Conflict Prevention**
   - Book a 5-day workshop
   - Verify 3-day workshops are blocked for that week
   - Test cancellation and rebooking

---

## TROUBLESHOOTING

### Common Issues:
1. **Wrong days showing**: Check "Available Days" in appointment type settings
2. **Overlapping bookings**: Verify buffer times and conflict prevention rules
3. **Calendar not blocking**: Check "Block time when appointment is booked" setting

### Support Resources:
- Acuity Help Center: https://help.acuityscheduling.com/
- Contact: contact@yolovibecodebootcamp.com

---

## FINAL CHECKLIST

- [ ] 3-Day workshop only shows Mon/Tue/Wed starts
- [ ] 5-Day workshop only shows Monday starts
- [ ] No overlapping bookings possible
- [ ] Proper buffer times configured
- [ ] Cancellation policies set
- [ ] Test bookings completed successfully
- [ ] Website links working correctly

---

**Next Steps**: After completing this setup, update your website booking page if needed and test the complete user flow from website to booking confirmation.
