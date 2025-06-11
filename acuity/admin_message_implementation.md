# Admin-Only Message Implementation for Acuity Scheduling

## Step 1: Add the HTML snippet
Add this HTML snippet at the top of your Acuity page, right after the opening `<body>` tag:

```html
<div class="admin-message">
  <strong>Admin Notice:</strong> This is the YOLOVibeCodeBootCamp admin view. Customer-facing elements are shown below. Any changes made here will affect the public booking page.
</div>
```

## Step 2: Add the CSS
Copy the entire contents of the `acuity_custom.css` file and paste it into the "Advanced CSS" section of your Acuity Scheduling admin interface.

## How it works
- The `.admin-message` class is hidden by default (`display: none`)
- When an admin is logged in, Acuity adds the `.is-owner` class to the body
- Our CSS shows the message only when this class is present: `body.is-owner .admin-message { display: block; }`
- Regular users will never see this message

## Additional customization options

### Change the admin message appearance
Modify these CSS properties in the `acuity_custom.css` file:

```css
.admin-message {
  background-color: #f8fafc;      /* Background color */
  border-left: 4px solid #6366f1; /* Left border color and thickness */
  color: #1e293b;                 /* Text color */
  margin: 10px 0;                 /* Top and bottom margin */
  padding: 10px 15px;             /* Inner padding */
  font-size: 14px;                /* Font size */
}
```

### Add more admin-only elements
You can add more admin-only elements by using the same pattern:

```html
<div class="admin-only">
  <!-- Any content here will only be visible to admins -->
</div>
```

And add this CSS:

```css
.admin-only {
  display: none;
}

body.is-owner .admin-only {
  display: block;
}
```
