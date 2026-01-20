```text
CORE DATA MODEL – COMPLETE LIST (BY CATEGORY)
(TENANT-FIRST)


TABLE OF CONTENTS
1. Tenant & Business Context
   1.1 Tenant
   1.2 Tenant Profile
2. Organization Structure
   2.1 Business Units
   2.2 Locations
   2.3 Hours & Calendars
3. People & Identity
   3.1 Staff
   3.2 Employee Profiles
4. Contacts & Communication
   4.1 Directory
5. Brand & Presentation
   5.1 Brands


--------------------------------------------------
1. TENANT & BUSINESS CONTEXT
--------------------------------------------------

1.1 Tenant
- Tenant ID
- Tenant Name
- Tenant Status (Active, Suspended)
- Industry Type
- Subscription Plan / Tier
- Default Locale
- Default Currency
- Created Date
- Owner / Admin Account
- Feature Flags / Entitlements

1.2 Tenant Profile
- Legal Business Name
- Trading Name
- Tax / Registration Numbers
- Primary Business Address
- Billing Contact
- Support Contact
- Data Retention Policy
- Compliance Requirements
- SLA Level
- Notification Defaults
- Default Workflows & Templates


--------------------------------------------------
2. ORGANIZATION STRUCTURE
--------------------------------------------------

2.1 Business Units
- Business Unit ID
- Business Unit Name
- Parent Unit
- Cost Center Code
- Manager / Owner
- Default Location(s)
- Budget Reference
- KPI Set

2.2 Locations
- Location ID
- Location Name
- Location Type (Office, Store, Site, Warehouse)
- Address
- Geo-Coordinates
- Time Zone
- Operating Status
- Manager in Charge
- Capacity / Size
- Safety Requirements

2.3 Hours & Calendars
- Hours Profile ID
- Location Reference
- Business Hours
- Shift Definitions
- Break Rules
- Holiday Calendar
- Seasonal Overrides
- Time Zone
- Overtime Rules


--------------------------------------------------
3. PEOPLE & IDENTITY
--------------------------------------------------

3.1 Staff
- Staff ID
- Employment Status
- Role / Title
- Business Unit
- Primary Location
- Manager / Supervisor
- Hire Date
- Employment Type
- Skills / Certifications
- Compliance Status
- Availability / Working Pattern
- Contact Reference (Directory)

3.2 Employee Profiles
- Employee ID
- First Name
- Last Name
- Preferred Name
- Email
- Phone
- Profile Photo
- Time Zone
- Language Preference
- Emergency Contact
- Address (Optional)
- Notes / Bio


--------------------------------------------------
4. CONTACTS & COMMUNICATION
--------------------------------------------------

4.1 Directory
- Directory ID
- Internal Contacts (People & Teams)
- External Contacts / Vendors
- Roles & Responsibilities
- Contact Methods (Email, Phone)
- Escalation Order
- Availability / On-Call Schedule
- Notes


--------------------------------------------------
5. BRAND & PRESENTATION
--------------------------------------------------

5.1 Brands
- Brand ID
- Brand Name
- Logo Assets
- Color Palette
- Typography
- Domain / Subdomain
- Social Links
- Customer-Facing Tone / Voice
- Default Templates (Email, Web, POS)
```

If you want, the next logical step is to **lock Tenant/Profile as immutable roots** and explicitly mark which downstream entities inherit settings vs override them.
