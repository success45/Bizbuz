# BIZ-BUZ Frontend Starter

A responsive vanilla HTML, CSS and JavaScript frontend prototype for BIZ-BUZ.

## Folder structure

```text
biz-buz-platform/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
└── README.md
```

## Run locally

1. Extract the ZIP file.
2. Open the `biz-buz-platform` folder in Visual Studio Code.
3. Install the **Live Server** extension (if needed).
4. Right-click `index.html` and choose **Open with Live Server**.

You can also open `index.html` directly in a browser, though Live Server is recommended.

## Demo login

Administrator demo:
- Email: `admin@bizbuz.test`
- Password: `Admin123!`

You can also create a normal user account through the sign-up form.

## Included frontend screens

- Public landing page and feature section
- Subscription pricing: Starter ₦15,000; Business ₦30,000; Professional ₦45,000; Enterprise Custom
- Demo sign-up and login
- User dashboard and business profile form
- Campaign submission and status tracking
- Demo admin dashboard with campaign approve/reject actions
- Responsive layout for mobile and desktop

## Important security and functionality notice

This is a **frontend demonstration**, not a production-ready platform.

- Demo users, passwords, campaigns and plans are stored in browser `localStorage`.
- Passwords are not securely stored. Do not use real passwords or real customer data.
- The admin role and moderation controls are simulated in browser JavaScript and can be bypassed.
- No real database, secure authentication, file upload, payment processing, or social-media publishing is connected.
- Selecting a plan does not charge a customer or activate a paid subscription.
- Campaign approval in this demo does not publish an advert.

Before launch, connect Supabase Auth and a database with Row Level Security policies, enforce administrator permissions on the server, use secure storage for assets, and implement payment verification through a trusted server-side function and payment-provider webhooks. Never put Supabase service-role keys or payment secret keys in frontend code.

## Supabase note

This starter intentionally does not contain project credentials. Add Supabase configuration only when implementing the backend, and use the public publishable key in browser code. A publishable key is not a substitute for database access policies.
