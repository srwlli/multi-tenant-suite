# Business Dashboard Strategy Report: Tiered Implementation

## Overview
This report outlines the strategy for implementing tiered dashboard offerings within the Business Dashboard application. By categorizing the core data model into distinct tiers, we can provide modular, scalable solutions ranging from simple public-facing "one-pagers" to comprehensive "Enterprise Suites."

---

## 1. Tier 1: Basic Presence (One-Pager)
**Focus:** Public identity, discovery, and lead generation. This tier is designed to act as a "Smart Landing Page."

### Core Components (The "Actionable Menu")

#### 1. Identity & First Impression
- **Brand Hero Banner:** High-impact area showing logo, headline, and mission (`5.1 Brands`).
- **Core Services Grid:** Visual list of top 3-4 offerings (e.g., "Men's Cuts", "Consultations").
- **About Us / Bio:** Concise trusted narrative or owner bio widget (`3.2 Employee Profiles`).

#### 2. Physical & Temporal Access
- **Smart Location Card:** Physical address with "Get Directions" GPS integration (`2.2 Locations`).
- **Real-Time Hours Widget:** Dynamic badge showing `OPEN NOW` or `CLOSED` with state countdown.
- **Holiday/Alert Banner:** Top-bar for temporary announcements (e.g., "Closed for Holiday").

#### 3. Conversion & Action (Lead Gen)
- **Header Integrated Actions:** Primary "Call" or "Inquiry" buttons placed in the top navigation bar for a "Native App" feel.
- **Simple Inquiry Form:** Low-friction 2-field form for callback requests (`4.1 Directory`).
- **Social Proof Links:** Branded links to Instagram, Yelp, or Facebook (`5.1 Brands`).

#### 4. Tenant Utilities
- **Accessibility Toggles:** Dark Mode / High Contrast support (`1.1 Feature Flags`).
- **Locale Switcher:** Multi-language support for diverse local customer bases.

**Deployment:** Implemented as a vertical scrolling landing page (`tier1-basic.json`).

---

## 2. Tier 2: Business Pro (Operations Core)
**Focus:** Small to medium team operations and internal management.

### Includes Tier 1, plus:
- **Organization:** Business unit definitions and cost center grouping (`2.1 Business Units`).
- **Team Directory:** Internal staff profiles including photos and roles (`3.2 Employee Profiles`).
- **Connectivity:** Internal directory with escalation orders and team contact methods (`4.1 Directory`).

**Deployment:** Implemented with side navigation for switching between views (`tier2-pro.json`).

---

## 3. Tier 3: Enterprise Suite (Complete Suite)
**Focus:** Full operational control, compliance, and multi-tenant management.

### Includes Tier 2, plus:
- **Human Resources:** Full employment records, skills, certifications, and compliance tracking (`3.1 Staff`).
- **Governance:** Legal/tax registration data, SLA levels, and data retention policies (`1.2 Tenant Profile`).
- **Strategy:** Industry-specific feature flags and entitlement management (`1.1 Tenant`).

**Deployment:** Multi-dashboard cockpit for high-level oversight (`tier3-enterprise.json`).

---

## Implementation Roadmap
1. **Schema Validation:** Ensure all tier configurations strictly adhere to `tenant.schema.json`.
2. **Layout Creation:** Develop the three base JSON layouts in `packages/config/src/layouts/`.
3. **Demo Tenant:** Create a demonstration tenant to showcase the transition between tiers.
4. **Platform Integration:** Update the `@platform/config` resolver to handle tier-based entitlements.
