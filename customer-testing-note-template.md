# Customer Testing Note Template

## Ready-to-Send Email Template

**Subject:** 🛍️ Test YOLOVibe as a Real Customer (Free with Coupon Code)

---

Hi [FIRST_NAME],

I need your help testing YOLOVibe from the perspective of a **real customer who's ready to purchase**. Please approach this as if you genuinely want to book a workshop and are willing to pay for it.

## 🎁 Your FREE Coupon Code

**BETATEST100** - Use this at checkout for 100% off any workshop

## 🛒 What I Need You to Test

**Think like a customer:** You're a professional looking to upskill and you're ready to invest in your development. You have a budget and specific learning goals.

### Step 1: 🔍 Discover & Evaluate (5 minutes)
- Visit: [YOUR_WEBSITE_URL]
- Browse the homepage - does it communicate value clearly?
- Explore both workshop offerings (Product A & Product B)
- Check the pricing - does it feel fair?
- **Ask yourself:** Would I trust this company with my money?

### Step 2: 🤔 Make Your Decision (3 minutes)
- Choose the workshop that appeals to you most
- Read all the details carefully
- Click "Book Now" when you're genuinely ready to purchase

### Step 3: 📝 Complete Registration (5 minutes)
- Create your account with real information
- Fill out attendee details as if you're actually attending
- Apply coupon code **BETATEST100** at checkout
- **Ask yourself:** Does this feel secure and professional?

### Step 4: 💳 Complete Your "Purchase" (3 minutes)
- Verify the coupon shows $0.00 total
- Go through the complete payment process
- Check your email for confirmation
- **Ask yourself:** Do I feel confident this worked?

### Step 5: ✅ Post-Purchase (2 minutes)
- Log into your account and review your booking
- Look for workshop materials or instructions
- **Ask yourself:** Do I feel taken care of as a customer?

### Step 6: 📱 Try on Mobile (2 minutes)
- Visit the site on your phone
- Try browsing and potentially booking on mobile
- **Ask yourself:** Would I buy this on my phone?

## 💭 What I Need Your Feedback On

After completing the journey, please tell me:

1. **Trust Factor:** Did you feel confident "purchasing"?
2. **Value Perception:** Does the pricing feel fair?
3. **User Experience:** Was the process smooth?
4. **Biggest Issues:** What would prevent you from actually buying?

**Total time needed:** About 15-20 minutes

**Send feedback to:** [YOUR_EMAIL]

## Important Notes
- This is a real booking in our test environment
- You won't be charged anything with the coupon
- No actual workshop will be scheduled
- Use the coupon code **BETATEST100** at checkout

Thanks so much for helping me test this! Your perspective as a potential customer is incredibly valuable.

[YOUR_NAME]

---

## Quick Customization Checklist

- [ ] Replace `[FIRST_NAME]` with their name
- [ ] Replace `[YOUR_WEBSITE_URL]` with your actual URL
- [ ] Replace `[YOUR_EMAIL]` with your feedback email
- [ ] Replace `[YOUR_NAME]` with your name
- [ ] Update "Product A & Product B" to match your actual workshop names

## Usage Instructions

1. **Copy the email text above**
2. **Replace all placeholders with actual values**
3. **Send via your preferred email client**
4. **Follow up in 2-3 days if no response**

## Alternative: Use CLI Tool

```bash
# Send single customer journey test
npm run send-customer-journey -- --email tester@example.com --name "First Name"

# Create and send bulk tests
npm run send-customer-journey -- --create-sample
# Edit customer-testers-sample.json then:
npm run send-customer-journey -- --bulk customer-testers-sample.json
``` 