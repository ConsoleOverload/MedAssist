# MedAssist — Clinical Operations & Patient Care Platform (MERN)

A full-stack, enterprise-grade, HIPAA-aligned Clinical Operations and Patient Care OS engineered for modern polyclinics and multi-specialty healthcare centers.

Built using Node.js, Express, MongoDB (Mongoose), React 18, Vite, and Tailwind CSS.

---

## 🎨 Design System & Color Palette

MedAssist follows an intentional, clinical-grade visual hierarchy modeled after modern hospital command centers:

| Token | Hex | Role |
| :--- | :--- | :--- |
| `primary` | `#004357` | Deep Deep Teal / Brand Command |
| `primary-container` | `#0d5c75` | Active Navigation Pill / Primary Accents |
| `inverse-surface` | `#213145` | Clinical Sidebar Surface |
| `surface` | `#f8f9ff` | Ambient Main Canvas Surface |
| `surface-container-lowest` | `#ffffff` | Pure White Clinical Cards & Workspace Sheets |
| `surface-container-low` | `#eff4ff` | Subtle Grouping & Table Rows |
| `surface-container` | `#e5eeff` | Dividers & Badges |
| `secondary` | `#006398` | Clinical Secondary Actions & In-Room Counters |
| `secondary-container` | `#5bb8fe` | Interactive Timeline Bars & Highlights |
| `tertiary` | `#004730` | Forest Teal for Completed Care / Verified States |
| `tertiary-fixed` | `#85f8c4` | Live Indicator Pulse & Status Pings |
| `error` | `#ba1a1a` | Critical Diagnostic Alerts & Allergies |
| `error-container` | `#ffdad6` | Critical Allergy & Urgent Diagnostic Pills |

Typography is governed by **Inter** for clean legibility and **JetBrains Mono** for medical record numbers (MRNs), accession IDs, and physiological vitals. Icons are provided by **Material Symbols Outlined**.

---

## 👥 Five Core Clinical Roles & Capabilities

### 1. Attending Doctor Workspace (`/doctor/dashboard`)
- **Real-Time Caseload Bar:** Real-time breakdown of today's pulmonary appointments (Completed, In-Room, Waiting).
- **Active Exam Room Banner:** Live timer, patient banner with MRN, DOB, and critical allergy tags (Aspirin/NSAIDs, Sulfa).
- **5-Point Vitals Ribbon:** SpO2 Room Air with hypoxia detection, Respiratory Rate, Heart Rate, PEFR (Peak Flow), Blood Pressure.
- **OPD Queue & Triage Table:** Instant triage status, time slots, patient location, and 1-click "Call In" alerts.
- **AI Pulmonary Care Summary Rail:** Real-time pre-consultation synthesis consolidating spirometry, inhaler compliance, chest imaging, and clinical next steps.
- **Pending Approvals Quick Sign Drawer:** Fast review and digital signing of Arterial Blood Gas (ABG) panels and Polysomnography reports.
- **Full Clinical Encounter Console (`/doctor/encounter/:id`):** SOAP note writing (Subjective, Objective, Assessment, Plan), ICD code selector, stat lab ordering, electronic prescriptions, and Gemini/Local AI visit summarization with clinician approval workflow.

### 2. Reception & Front Desk (`/receptionist/dashboard`)
- **Queue Orchestration:** Live arrival lobby status, patient token numbering, and transition from arrived to in-consultation.
- **Appointment Slot Engine (`/receptionist/booking`):** Conflict-free provider schedule calculation respecting working hours and lunch breaks with atomic collision prevention.
- **Patient Registration (`/receptionist/patients/new`):** Master patient index registration generating unique MRNs.
- **Billing & Point-of-Sale (`/receptionist/billing`):** Line-item invoice generation, copay recording, payment reconciliation, and printable PDF receipts.

### 3. Laboratory & Diagnostic Operations (`/lab/queue`)
- **6-Stage Test Lifecycle:**
  1. `ordered`: Doctor creates stat or routine test order.
  2. `sample_collected`: Phlebotomy/collection documented with specimen type.
  3. `in_processing`: Analyzer accessioning.
  4. `completed_pending_verification`: Technician enters reference ranges and flag results (Normal, High, Low, Critical).
  5. `verified`: Lab director or senior specialist verification.
  6. `released`: Released into patient portal and medical record.
- **Printable Lab Report (`LabReportPrintModal`):** Hospital-headered diagnostic report with patient MRN, specimen details, reference intervals, and technician sign-off.

### 4. Patient Health Portal (`/patient/dashboard`)
- **Unified Health Summary:** Upcoming consultations, past visits, and balance overview.
- **Plain-Language AI Medication Guide (`/patient/prescriptions`):** Translates complex pharmacology into patient-friendly instructions, dosing timings, and safety warnings.
- **Diagnostic Results (`/patient/lab-reports`):** Patient privacy firewall ensuring only verified & released lab reports are accessible.
- **Printable E-Prescription (`PrescriptionPrintModal`):** Formal clinical prescription with doctor license number and dosage schedule.

### 5. Clinic Administration & Governance (`/admin/dashboard`)
- **Executive Operations Center:** Real-time KPI analytics, patient volume trends, and revenue metrics.
- **Staff Directory & Permissions (`/admin/staff`):** Role-based access control management with last-admin deletion protection.
- **Catalog & Fee Schedules (`/admin/services`):** Dynamic management of consultation fees, diagnostic test pricing, and department rosters.
- **Immutable Audit Trail (`/admin/audit`):** Append-only log recording actor ID, IP, user agent, clinical action, and resource identifiers.

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB instance running locally on `localhost:27017` (or MongoDB Atlas URI in `server/.env`)

### Installation & Launch

```bash
# 1. Install dependencies for all workspaces
npm install

# 2. Seed database with realistic clinical demo data
npm run seed

# 3. Start both backend (port 5001) and frontend (port 3000) concurrently
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 🔑 Demo Credentials

A quick 1-click role switcher is embedded at the bottom of the sidebar for instant demonstration, or you may log in directly:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Doctor** | `doctor@medassist.local` | `DoctorPass123!` |
| **Clinic Administrator** | `admin@medassist.local` | `AdminPass123!` |
| **Receptionist** | `receptionist@medassist.local` | `ReceptPass123!` |
| **Lab Technician** | `labtech@medassist.local` | `LabPass123!` |
| **Patient** | `patient@medassist.local` | `PatientPass123!` |

---

## 🧪 Automated Testing

MedAssist includes backend test suites covering authentication, scheduling conflict prevention, and the 6-stage diagnostic lab lifecycle:

```bash
cd server
npm test
```

Expected output:
```text
PASS tests/auth.test.js
PASS tests/scheduling.test.js
PASS tests/labLifecycle.test.js

Test Suites: 3 passed, 3 total
Tests:       8 passed, 8 total
```

---

## 🚢 Production Deployment

MedAssist supports both **unified monolithic deployment** (single container or Node server) and **decoupled micro-service deployment** (Vercel/Netlify + Backend API):

### Option A: Unified Full-Stack Deployment (Render, Railway, Fly.io, Docker)
When `NODE_ENV=production`, the Express server automatically serves the production-compiled React client bundle from `client/dist`:

```bash
# 1. Build client assets
npm run build

# 2. Start unified production server
NODE_ENV=production npm start
```

### Option B: Decoupled Deployment (Frontend on Vercel/Netlify, Backend on Render/Railway)
* **Frontend (Vercel / Netlify):**
  * Root Directory: `client`
  * Build Command: `npm run build`
  * Output Directory: `dist`
  * Environment Variable: `VITE_API_BASE_URL=https://your-api.onrender.com/api/v1`
* **Backend API (Render / Railway / AWS):**
  * Root Directory: `server`
  * Build Command: `npm run build`
  * Start Command: `npm start`
  * Environment Variables: `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN=https://your-frontend.vercel.app`

