# GLOBALHR CLOUD

## HRM SAAS PLATFORM

### SUPER ADMIN PANEL ARCHITECTURE

------------------------------------------------------------------------

## ROUTE

`/superadmin`

------------------------------------------------------------------------

## SUPER ADMIN PAGE STRUCTURE

    SuperAdminDashboard
    │
    ├── SidebarNavigation
    │   ├── Dashboard
    │   ├── Companies
    │   ├── Subscriptions
    │   ├── Transactions
    │   ├── OfflineRequests
    │   ├── EmailQueries
    │   ├── SuperAdminManagement
    │   ├── WebsiteSettings
    │   └── SystemSettings
    │   └── Logout
    │
    └── MainContentArea
        ├── TopHeader
        │   ├── PageTitle
        │   ├── LanguageSelector
        │   └── ProfileMenu
        │
        └── ContentPanel

------------------------------------------------------------------------

# WEBSITE SETTINGS ARCHITECTURE

    WebsiteSettings
    │
    ├── HeaderSettings
    │   ├── HeaderTitle
    │   ├── HeaderSubtitle
    │   ├── HeaderDescription
    │   ├── HeaderBackgroundImage
    │   ├── HeaderButton1
    │   │   ├── ButtonText
    │   │   └── ButtonURL
    │   └── HeaderButton2
    │       ├── ButtonText
    │       └── ButtonURL
    │
    ├── HeaderFeatures
    │   └── FeatureTable
    │       ├── FeatureRow
    │       │   ├── FeatureName
    │       │   ├── FeatureDescription
    │       │   ├── FeatureIcon
    │       │   └── Actions
    │       │       ├── Edit
    │       │       └── Delete
    │       └── AddFeatureButton
    │
    ├── ClientSettings
    │   ├── ClientLogo
    │   ├── ClientName
    │   └── ClientWebsite
    │
    ├── TestimonialsSettings
    │   ├── TestimonialName
    │   ├── TestimonialRole
    │   ├── TestimonialMessage
    │   └── TestimonialImage
    │
    ├── FeaturesSettings
    │   ├── FeatureTitle
    │   ├── FeatureDescription
    │   └── FeatureIcon
    │
    ├── ContactSettings
    │   ├── CompanyEmail
    │   ├── CompanyPhone
    │   ├── CompanyAddress
    │   └── MapLocation
    │
    ├── PriceSettings
    │   ├── PlanName
    │   ├── PlanPrice
    │   ├── PlanFeatures
    │   └── BillingCycle
    │
    ├── FAQSettings
    │   ├── Question
    │   └── Answer
    │
    ├── FooterSettings
    │   ├── FooterLogo
    │   ├── FooterDescription
    │   ├── FooterLinks
    │   └── SocialLinks
    │
    ├── CallToActionSettings
    │   ├── CTAHeadline
    │   ├── CTADescription
    │   └── CTAButton
    │
    ├── RegisterSettings
    │   ├── EnableRegistration
    │   ├── DefaultPlan
    │   └── TrialDays
    │
    └── SEOSettings
        ├── MetaTitle
        ├── MetaDescription
        ├── MetaKeywords
        └── OpenGraphImage

------------------------------------------------------------------------

# FRONTEND ARCHITECTURE

    frontend/

    src
    │
    ├── pages
    │   ├── SuperAdminDashboard.jsx
    │   ├── CompaniesPage.jsx
    │   ├── SubscriptionsPage.jsx
    │   ├── TransactionsPage.jsx
    │   ├── WebsiteSettingsPage.jsx
    │   └── EmailQueriesPage.jsx
    │
    ├── components
    │   ├── Sidebar.jsx
    │   ├── TopHeader.jsx
    │   ├── SettingsTabs.jsx
    │   ├── FeatureTable.jsx
    │   ├── FeatureForm.jsx
    │   ├── SettingsForm.jsx
    │   └── ImageUploader.jsx
    │
    ├── services
    │   ├── companyService.js
    │   ├── subscriptionService.js
    │   ├── websiteService.js
    │   └── emailService.js
    │
    └── styles
        └── superadmin.css

------------------------------------------------------------------------

# BACKEND ARCHITECTURE

    backend/

    src
    │
    ├── controllers
    │   ├── companyController.js
    │   ├── subscriptionController.js
    │   ├── transactionController.js
    │   ├── websiteController.js
    │   └── emailController.js
    │
    ├── routes
    │   ├── companyRoutes.js
    │   ├── subscriptionRoutes.js
    │   ├── transactionRoutes.js
    │   ├── websiteRoutes.js
    │   └── emailRoutes.js
    │
    ├── services
    │   ├── companyService.js
    │   ├── subscriptionService.js
    │   ├── websiteService.js
    │   └── emailService.js
    │
    ├── models
    │   ├── CompanyModel.js
    │   ├── SubscriptionModel.js
    │   ├── TransactionModel.js
    │   ├── FeatureModel.js
    │   ├── WebsiteSettingsModel.js
    │   └── ContactMessageModel.js
    │
    └── server.js

------------------------------------------------------------------------

# API ENDPOINTS

    GET  /api/superadmin/dashboard

    GET  /api/companies
    POST /api/companies
    PUT  /api/companies/{id}
    DELETE /api/companies/{id}

    GET  /api/subscriptions
    POST /api/subscriptions

    GET  /api/transactions

    GET  /api/website/header
    PUT  /api/website/header

    GET  /api/website/features
    POST /api/website/features
    PUT  /api/website/features/{id}
    DELETE /api/website/features/{id}

    GET  /api/website/settings
    PUT  /api/website/settings

    GET  /api/email-queries

------------------------------------------------------------------------

# DATABASE TABLES

## companies

    company_id
    company_name
    owner_name
    email
    subscription_plan
    created_at

## subscriptions

    subscription_id
    company_id
    plan_name
    price
    billing_cycle
    status

## transactions

    transaction_id
    company_id
    amount
    payment_method
    payment_status
    created_at

## website_header

    header_id
    title
    subtitle
    description
    background_image
    button1_text
    button1_url
    button2_text
    button2_url

## website_features

    feature_id
    name
    description
    icon

## contact_messages

    message_id
    name
    email
    message
    created_at

------------------------------------------------------------------------

# END
