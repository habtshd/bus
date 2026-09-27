# Abyssinia Bus S.C. — Complete Screen & Navigation Architecture Map
**Document Version:** 1.0.0  
**Status:** Approved Master UI Specification  
**Architecture:** Omnichannel Unified Multi-Portal Platform  
**Target Applications:** Passenger App, Driver & Conductor App, Counter POS, Dispatch Center, Fleet & Workshop, Finance Portal, Support Desk, Executive Dashboard, Super Admin

---

## Master Navigation & Application Taxonomy

```text
                                  CENTRAL BACKEND ENGINE
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
  PASSENGER CHANNELS               OPERATIONAL CHANNELS                MANAGEMENT PORTALS
        │                                   │                                   │
  ├── Flutter Mobile (iOS/Android)    ├── Driver/Conductor App (Flutter)  ├── Finance & Accounting (Web)
  └── Public Responsive Web           ├── Agent Counter POS (Next.js)     ├── Customer Support Desk (Web)
                                      ├── Dispatch Control Center (Web)   ├── Fleet & Maintenance (Web)
                                      └── Workshop Tablet App             ├── Executive Dashboard (Web)
                                                                          └── Super Admin Console (Web)
```

---

# 1. Passenger Mobile Application & Responsive Web (Flutter / Web)

The Passenger interface delivers a frictionless, transparent booking journey tailored for Ethiopian travelers with multi-lingual support (Amharic, English, Afaan Oromoo, Tigrinya) and native Ethiopian payment integrations.

```text
PASSENGER NAVIGATION TREE
├── [SCR-PAX-01] Splash & Language Selection
├── [SCR-PAX-02] Onboarding Carousel
├── [SCR-PAX-03] Passenger Authentication & OTP Login
├── [SCR-PAX-04] Home Search Hub
├── [SCR-PAX-05] Trip Search Results
├── [SCR-PAX-06] Trip Detail & Stop Schedule Modal
├── [SCR-PAX-07] Interactive Bus Seat Selection Map
├── [SCR-PAX-08] Passenger Details Form
├── [SCR-PAX-09] Fare Breakdown & Promo Code Sheet
├── [SCR-PAX-10] Payment Checkout Hub (Telebirr / CBE / Chapa)
├── [SCR-PAX-11] Payment Processing & Status Polling
├── [SCR-PAX-12] Booking Confirmed & E-Ticket
├── [SCR-PAX-13] My Bookings & Offline Wallet
├── [SCR-PAX-14] Ticket Detail & High-Contrast QR Pass
├── [SCR-PAX-15] Live Bus Radar & En-Route GPS Tracking
├── [SCR-PAX-16] Reschedule Journey Workflow
├── [SCR-PAX-17] Cancel Booking & Refund Calculation
├── [SCR-PAX-18] Notifications & Travel Alerts Center
├── [SCR-PAX-19] Support, FAQ & Lost Item Claim
└── [SCR-PAX-20] Passenger Profile & Saved IDs
```

---

### [SCR-PAX-01] Splash & Language Selection
* **Route:** `/splash` | `/language-select`
* **Role:** Unauthenticated Guest / Passenger
* **Layout & Structure:**
  - Full-screen brand splash screen featuring Abyssinia Bus logo and golden/emerald livery.
  - Language selection cards: English, አማርኛ (Amharic), Afaan Oromoo, ትግርኛ (Tigrinya).
  - Background system checks: Connectivity status, API health ping, cached authentication token.
* **Primary Actions:**
  - `[ SELECT LANGUAGE & CONTINUE ]` $\to$ Saves language token to local storage, routes to `SCR-PAX-02` or `SCR-PAX-04`.
* **State & Errors:** If offline, displays cached language preference and proceeds with offline banner.

---

### [SCR-PAX-02] Onboarding Carousel
* **Route:** `/onboarding`
* **Layout & Structure:**
  - 3-slide visual carousel with micro-animations:
    1. *Direct Bus Booking:* Reserve your seat from Addis Ababa to 20+ Ethiopian cities.
    2. *Pay Seamlessly:* Direct Telebirr, CBE Birr, and mobile banking integration.
    3. *Live Bus Tracking:* Track your bus in real time on Ethiopian highways.
  - Pagination dot indicators, `[Skip]` in top right, sticky bottom button.
* **Primary Actions:**
  - `[ GET STARTED ]` $\to$ Navigates to `SCR-PAX-04: Home Search Hub`.

---

### [SCR-PAX-03] Passenger Authentication & OTP Login
* **Route:** `/auth/login` | `/auth/verify-otp`
* **Layout & Structure:**
  - Mobile phone number input with Ethiopian flag prefix `+251`.
  - 6-digit SMS OTP entry boxes with automatic clipboard pasting.
  - Resend OTP countdown timer (60 seconds).
  - Quick option: `[ Continue as Guest ]` (Allows booking without upfront account creation).
* **Primary Actions:**
  - `[ SEND OTP ]` $\to$ Calls `/api/v1/auth/passenger-otp`.
  - `[ VERIFY & LOGIN ]` $\to$ Exchanges OTP for JWT bearer token.

---

### [SCR-PAX-04] Home Search Hub
* **Route:** `/home`
* **Layout & Structure:**
  - **Header:** User greeting, notification bell icon with unread badge, active language switch.
  - **Search Card (Hero):**
    - `Origin Terminal` dropdown with search auto-complete (e.g., *Addis Ababa — Autobus Tera*, *Addis Ababa — Meskel Square*, *Kality*).
    - Swap button with rotation animation.
    - `Destination Terminal` dropdown (e.g., *Bahir Dar Central*, *Gondar Azezo*, *Hawassa Bus Terminal*).
    - `Travel Date` selector with quick chips: `[ Today ]`, `[ Tomorrow ]`, `[ Custom Date ]`.
    - `Passengers` stepper counter (1 to 5 passengers).
  - **Recent Searches:** Horizontal pill chips of previous routes.
  - **Popular Corridors:** Photo cards showing route distance, starting fare, and daily departure count.
  - **Active Trip Banner (Conditional):** If passenger has a trip today, shows a persistent banner with departure countdown and gate number.
* **Primary Actions:**
  - `[ SEARCH TRIPS ]` $\to$ Navigates to `SCR-PAX-05: Trip Results`.

---

### [SCR-PAX-05] Trip Search Results
* **Route:** `/trips/results?origin={id}&dest={id}&date={YYYY-MM-DD}&pax={n}`
* **Layout & Structure:**
  - **Top Bar:** Route summary (e.g., *Addis Ababa $\to$ Bahir Dar*), travel date, and edit search button.
  - **Date Strip:** Horizontal scrollable date ribbon showing 7 consecutive days with lowest fare indicators.
  - **Filter Bar:**
    - Time filter chips: `All`, `Morning (05:00 - 08:00)`, `Afternoon (12:00 - 16:00)`.
    - Bus Class filter: `Luxury 2x2`, `Standard 2x3`.
    - Price sort: `Lowest First`, `Earliest Departure`.
  - **Trip Cards List:**
    - Departure time & arrival time with total journey duration (e.g., `05:30 AM → 02:30 PM (9h 00m)`).
    - Bus type badge, bus side number (e.g., `SB-023`).
    - Amenities icon row: WiFi, AC, USB Charging, Reclining Seats, Water Bottle.
    - Available seats counter: Highlighted in green if $>10$ seats, orange if $\le 5$ seats.
    - Fare display: `ETB 850.00` per passenger.
* **Primary Actions:**
  - `[ SELECT SEAT ]` $\to$ Navigates to `SCR-PAX-07: Seat Selection Map`.
  - Card Tap $\to$ Opens `SCR-PAX-06: Trip Detail Modal`.

---

### [SCR-PAX-06] Trip Detail & Stop Schedule Modal
* **Route:** Bottom sheet / modal
* **Layout & Structure:**
  - Bus photo, plate number, side number.
  - Step-by-step route timeline:
    - *05:30 AM* — Addis Ababa Autobus Tera (Origin Departure)
    - *09:15 AM* — Dejen Rest Stop (30-min breakfast & washroom stop)
    - *11:45 AM* — Debre Markos Station (Intermediate stop)
    - *02:30 PM* — Bahir Dar Central Terminal (Final Destination)
  - Baggage allowance details: 1 checked piece (up to 20 kg) + 1 hand luggage.
  - Cancellation & refund policy summary table.
* **Primary Actions:**
  - `[ CONTINUE TO SEATS ]` $\to$ Routes to `SCR-PAX-07`.

---

### [SCR-PAX-07] Interactive Bus Seat Selection Map
* **Route:** `/trips/:id/seats`
* **Layout & Structure:**
  - **Top Sticky Bar:** Selected trip summary, remaining seats counter, and active **5-Minute Countdown Timer** (appears once first seat is tapped).
  - **Legend:** `Available (White/Outline)`, `Selected (Emerald Green)`, `Held by Others (Yellow)`, `Booked (Grey)`, `Driver/Door (Icons)`.
  - **Bus Seating Canvas:**
    - Front cab with Driver wheel icon on left, Entry Door on right.
    - 2x2 luxury layout (Aisle in center, A/B on left, C/D on right) or 2x3 standard layout.
    - Rows 1 to 11 with row numbers.
    - Window indicators next to Column A and Column D.
    - Rear bench row (5 seats).
  - **Bottom Dock:**
    - List of selected seat chips (e.g., `Seat 12A`, `Seat 12B`).
    - Running total: `ETB 1,700.00 (2 Seats)`.
* **Primary Actions:**
  - Tapping an available seat creates an atomic hold via `/api/v1/reservations`.
  - `[ PROCEED TO PASSENGER INFO ]` $\to$ Navigates to `SCR-PAX-08`.
* **Error Handling:** If another passenger claims the seat before tap, flashes a red tooltip: *"Seat 12A was just reserved by someone else"*.

---

### [SCR-PAX-08] Passenger Details Form
* **Route:** `/booking/passengers`
* **Layout & Structure:**
  - Number of passenger cards equals number of selected seats (e.g., *Passenger 1 — Seat 12A*, *Passenger 2 — Seat 12B*).
  - **For Each Passenger:**
    - Full Legal Name (Amharic or English as matching National ID).
    - Ethiopian Phone Number (+251 9... / 7...).
    - National ID / Kebele Card Number / Passport Number (Required by Ethiopian Federal Transport Authority for intercity security checkpoints).
    - Nationality dropdown (Default: *Ethiopian*).
  - Primary contact checkbox (*"Send ticket & SMS alerts to Passenger 1 phone"*).
  - Emergency contact details (Name & Phone).
* **Primary Actions:**
  - `[ PROCEED TO PAYMENT ]` $\to$ Validates form fields, opens `SCR-PAX-10`.

---

### [SCR-PAX-09] Fare Breakdown & Promo Code Sheet
* **Route:** Bottom sheet / expandable section
* **Layout & Structure:**
  - Base Fare (e.g., $2 \times 850 = 1,700\text{ ETB}$).
  - Terminal & Service Fee: Included (0.00 ETB).
  - Government VAT (if applicable): Included.
  - Promo code entry input box with `[ Apply ]` button.
  - Final Total: `1,700.00 ETB`.

---

### [SCR-PAX-10] Payment Checkout Hub
* **Route:** `/booking/payment`
* **Layout & Structure:**
  - **Order Summary:** Trip, Departure Date, Seats (`12A, 12B`), Amount Due (`1,700 ETB`).
  - **Hold Expiration Banner:** Persistent yellow alert with countdown: *"Your seats are held for 03:42. Complete payment before hold expires."*
  - **Payment Method Selectors:**
    1. **Telebirr:** Direct USSD Push Prompt / In-App SuperApp redirect.
    2. **CBE Birr:** Commercial Bank of Ethiopia direct account debit.
    3. **Chapa Gateway:** Supports Awash Birr, Bank of Abyssinia, Dashen Amole, and Visa/Mastercard debit cards.
    4. **Pay at Terminal Counter (Cash Hold):** Only available if departure is $>24$ hours away (Requires payment at branch within 6 hours).
* **Primary Actions:**
  - `[ PAY 1,700 ETB VIA TELEBIRR ]` $\to$ Triggers payment initiation API, navigates to `SCR-PAX-11`.

---

### [SCR-PAX-11] Payment Processing & Status Polling
* **Route:** `/booking/processing`
* **Layout & Structure:**
  - High-res animated circular progress indicator.
  - Status text: *"Waiting for Telebirr payment confirmation... Please approve the prompt on your phone."*
  - Background SSE / WebSocket connection listening to payment webhook callback.
  - Fallback countdown: 90 seconds. If unpaid, offers `[ Check Again ]` or `[ Change Payment Method ]`.
* **State Transitions:**
  - Webhook received $\to$ Instant sound chime, routes to `SCR-PAX-12: Booking Confirmed`.

---

### [SCR-PAX-12] Booking Confirmed & E-Ticket
* **Route:** `/booking/confirmation/:id`
* **Layout & Structure:**
  - Green celebration checkmark animation.
  - Booking Reference: `BK-20261005-00125`.
  - Route & Date: *Addis Ababa $\to$ Bahir Dar | 05 Oct 2026, 05:30 AM*.
  - Passenger Card with high-contrast 2D QR Code.
  - Departure Terminal: *Addis Ababa Autobus Tera, Gate 4*.
  - SMS Confirmation Notice: *"Ticket confirmation sent to +251 911 223 344"*.
* **Primary Actions:**
  - `[ VIEW DIGITAL PASS ]` $\to$ Navigates to `SCR-PAX-14`.
  - `[ DOWNLOAD PDF TICKET ]` $\to$ Generates printable PDF in device storage.
  - `[ ADD TO MY TRIPS ]` $\to$ Navigates to `SCR-PAX-13`.

---

### [SCR-PAX-13] My Bookings & Offline Wallet
* **Route:** `/my-trips`
* **Layout & Structure:**
  - **Tabs:** `[ Upcoming Trips ]` | `[ Past Journeys ]` | `[ Cancelled ]`.
  - **Offline Indicator:** Green badge *"Offline Ready — 2 Passes Cached"* (Passes stored locally in SQLite/Hive for offline presentation at remote checkpoints).
  - **Trip Cards:**
    - Date, Origin $\to$ Destination, Bus Plate, Seat Numbers, Booking Status (`CONFIRMED`, `BOARDED`, `COMPLETED`).
    - Quick actions: `[ View QR ]`, `[ Live Bus Radar ]`, `[ Reschedule ]`, `[ Cancel ]`.

---

### [SCR-PAX-14] Ticket Detail & High-Contrast QR Pass
* **Route:** `/tickets/:id`
* **Layout & Structure:**
  - Boarding pass visual styling with perforated edge aesthetic.
  - Screen auto-brightness boost upon opening (ensures 100% optical readability for conductor scanners).
  - Cryptographic 2D QR code with underlying verification hash string.
  - Passenger Legal Name, Seat Number (`12A`), Trip Code, Boarding Gate.
  - Bus Side Number (`SB-023`), Conductor Hotline.
  - Luggage tag pairing number (`TAG-0812`).

---

### [SCR-PAX-15] Live Bus Radar & En-Route GPS Tracking
* **Route:** `/trips/:id/track`
* **Layout & Structure:**
  - Full-screen interactive vector map (Mapbox / OpenStreetMap).
  - Polyline showing full route from Addis Ababa to Bahir Dar.
  - Live animated bus icon indicating real-time GPS position, speed (e.g., `72 km/h`), and heading.
  - Milestone cards along the path: *Debre Markos (Passed 11:42 AM)*, *Dejen (Passed 09:18 AM)*.
  - Updated Estimated Time of Arrival (ETA) with live traffic delay adjustments.
  - Emergency contact button: *"Call Terminal Support"*.

---

### [SCR-PAX-16] Reschedule Journey Workflow
* **Route:** `/booking/:id/reschedule`
* **Layout & Structure:**
  - Step 1: Select new travel date.
  - Step 2: Choose available departure and seat.
  - Step 3: Fare difference calculation:
    - *Original Ticket: 850 ETB*
    - *New Ticket: 900 ETB*
    - *Rebooking Fee: 50 ETB*
    - *Amount Due: 100 ETB*.
  - Step 4: Pay difference and receive updated ticket.

---

### [SCR-PAX-17] Cancel Booking & Refund Calculation
* **Route:** `/booking/:id/cancel`
* **Layout & Structure:**
  - Cancellation countdown clock relative to scheduled departure.
  - Policy tier indicator (e.g., *"More than 24 hours remaining: 90% refund eligible"*).
  - Financial breakdown:
    - Total Paid: `850.00 ETB`
    - Cancellation Fee (10%): `-85.00 ETB`
    - Net Refund to Passenger: `765.00 ETB`.
  - Payout destination: Telebirr account or Original payment method.
* **Primary Actions:**
  - `[ CONFIRM CANCELLATION & SUBMIT REFUND ]` $\to$ Releases seat back to inventory immediately.

---

### [SCR-PAX-18] Notifications & Travel Alerts Center
* **Route:** `/notifications`
* **Layout & Structure:**
  - Push and in-app alert feed:
    - *Departure Reminder:* "Your bus SB-023 departs tomorrow at 05:30 AM from Autobus Tera Gate 4. Arrive by 05:00 AM."
    - *Gate Update:* "Boarding has commenced for Trip #501."
    - *Delay Alert:* "Trip #501 delayed by 25 minutes due to highway checkpoint."

---

### [SCR-PAX-19] Support, FAQ & Lost Item Claim
* **Route:** `/support`
* **Layout & Structure:**
  - **Quick Contact:** Tap-to-call 24/7 hotline (`9908`), WhatsApp support link.
  - **Self-Service Actions:**
    - `[ Find Lost Baggage ]` $\to$ Opens luggage claim form (Luggage tag number, bus number, item description, photo).
    - `[ Request Ticket Re-Send via SMS ]`.
  - **Interactive FAQ Accordion:** Baggage limits, pet policy, child fare rules, refund timelines.

---

### [SCR-PAX-20] Passenger Profile & Saved IDs
* **Route:** `/profile`
* **Layout & Structure:**
  - User details (Name, Phone number, Profile photo).
  - Saved Co-Passengers directory (Allows saving family members' names and Kebele ID numbers for rapid 1-click booking).
  - Language toggle, Dark/Light mode theme switch, Terms of Carriage link, Logout.

---

# 2. Driver & Conductor Mobile Application (Flutter Android)

Designed for rugged Android devices and harsh operational environments with high-contrast UI, offline caching, and sub-400ms QR verification.

```text
DRIVER & CONDUCTOR NAVIGATION TREE
├── [SCR-DRV-01] Duty Login & Biometric Authentication
├── [SCR-DRV-02] Driver Shift & Active Duty Dashboard
├── [SCR-DRV-03] Pre-Trip Vehicle Inspection Checklist
├── [SCR-DRV-04] Passenger Manifest & Check-In Directory
├── [SCR-DRV-05] Conductor High-Speed QR Camera Scanner
├── [SCR-DRV-06] Luggage Tagging & Excess Baggage Desk
├── [SCR-DRV-07] In-Transit HUD & Route Milestone Tracker
├── [SCR-DRV-08] Delay & Highway Incident Logger
├── [SCR-DRV-09] Emergency Breakdown & Assistance Request
└── [SCR-DRV-10] Trip Completion & Post-Trip Handover
```

---

### [SCR-DRV-01] Duty Login & Biometric Authentication
* **Route:** `/driver/login`
* **Role:** `DRIVER`, `CONDUCTOR`
* **Layout & Structure:**
  - Employee ID or Phone Number + 4-digit PIN.
  - Fingerprint / Face biometric quick-login for active shifts.
  - Terminal selection dropdown.
* **Actions:** `[ LOGIN TO DUTY ]`.

---

### [SCR-DRV-02] Driver Shift & Active Duty Dashboard
* **Route:** `/driver/dashboard`
* **Layout & Structure:**
  - **Duty Card:**
    - Assigned Bus: `SB-023` (*Plate: ET-3-A99102*).
    - Co-Driver / Conductor: *Kassahun Tadesse*.
    - Route: *Addis Ababa $\to$ Bahir Dar*.
    - Scheduled Departure: *05:30 AM (Gate 4)*.
    - Total Booked Passengers: `43 / 45`.
  - **Status Pill:** `ASSIGNED` $\to$ `INSPECTION_PENDING` $\to$ `BOARDING` $\to$ `DEPARTED`.
* **Primary Actions:**
  - `[ START PRE-TRIP INSPECTION ]` (Driver).
  - `[ OPEN BOARDING SCANNER ]` (Conductor).

---

### [SCR-DRV-03] Pre-Trip Vehicle Inspection Checklist
* **Route:** `/driver/inspection`
* **Layout & Structure:**
  - Mandatory 8-point safety verification checklist:
    1. [x] Front & rear tire tread condition and air pressure.
    2. [x] Foot brake, air pressure gauge, and retarder operation.
    3. [x] Engine oil, coolant level, and fuel gauge ($>80\%$).
    4. [x] Headlights, indicators, brake lights, and hazard flashers.
    5. [x] Speed governor seal intact and calibrated.
    6. [x] Fire extinguisher inspected and within valid date.
    7. [x] First aid kit fully stocked.
    8. [x] Windshield wipers and wash spray functional.
  - Starting odometer reading entry (e.g., `184,250 km`).
  - Driver signature pad.
* **Primary Actions:**
  - `[ SIGN & SUBMIT INSPECTION ]` $\to$ Changes trip status to `READY_FOR_BOARDING`.

---

### [SCR-DRV-04] Passenger Manifest & Check-In Directory
* **Route:** `/conductor/manifest`
* **Layout & Structure:**
  - Searchable list of all 45 seats ordered by Seat Number (`01A` to `11D`).
  - Each item shows: Seat #, Passenger Name, Drop-Off Stop, Phone, Boarding Status (`BOARDED` in green, `NOT_BOARDED` in grey).
  - Filter chips: `All (45)`, `Boarded (39)`, `Missing (6)`.
  - Manual check-in button (supervisor override in case of unreadable phone screen).

---

### [SCR-DRV-05] Conductor High-Speed QR Camera Scanner
* **Route:** `/conductor/scanner`
* **Layout & Structure:**
  - Full-screen high-frame-rate camera view with glowing aiming reticle.
  - Flashlight toggle button for night boarding.
  - **Instant Scan Overlay:**
    - **Valid Scan (Green Flash + Two Chimes):**
      - `✓ APPROVED: SEAT 12A`
      - `Abebe Bikila | Destination: Bahir Dar`
      - `Luggage: 2 Tags (#TAG-0145, #TAG-0146)`.
    - **Invalid Scan (Red Flash + Loud Buzzer):**
      - `✗ REJECTED: TICKET ALREADY BOARDED`
      - `Scanned at 04:52 AM at Door 1`.
    - **Wrong Bus Scan:**
      - `✗ WRONG TRIP: TICKET IS FOR TRIP #504 (HAWASSA)`.
* **Performance Benchmark:** Sub-400ms scan cycle; supports offline decryption verification if terminal cellular drops.

---

### [SCR-DRV-06] Luggage Tagging & Excess Baggage Desk
* **Route:** `/conductor/luggage`
* **Layout & Structure:**
  - Luggage tag barcode scanning (pairs physical sticker barcode with passenger ticket).
  - Baggage weight entry (e.g., `26 kg`).
  - Automatic calculation of excess baggage charge:
    - *Allowance: 20 kg*
    - *Excess: 6 kg @ 25 ETB/kg = 150 ETB*.
  - `[ Print Luggage Receipt / Collect Cash ]`.

---

### [SCR-DRV-07] In-Transit HUD & Route Milestone Tracker
* **Route:** `/driver/active-trip`
* **Layout & Structure:**
  - Large digital speedometer display with speed limit warning (e.g., `78 km/h / Max 80 km/h`).
  - Next Rest Stop card: *Dejen Rest Area (Arriving in 45 min / 42 km)*.
  - Automatic GPS telemetry pulse indicator (transmits latitude, longitude, and speed every 60s).
  - Quick action buttons: `[ Log Delay ]`, `[ Report Breakdown ]`, `[ Rest Stop Arrival ]`.

---

### [SCR-DRV-08] Delay & Highway Incident Logger
* **Route:** `/driver/log-incident`
* **Layout & Structure:**
  - One-tap categorization buttons:
    - `[ Police / Military Checkpoint ]`
    - `[ Highway Traffic / Road Construction ]`
    - `[ Severe Weather / Landslide ]`
    - `[ Minor Tire Puncture / Repair ]`
    - `[ Passenger Medical Emergency ]`.
  - Estimated delay slider: `15 min`, `30 min`, `45 min`, `1 hour+`.
  - Voice memo recording button (sends audio note directly to dispatcher).
* **Impact:** Automatically updates Operations Center radar and dispatches SMS updates to awaiting passengers at downstream stops.

---

### [SCR-DRV-09] Emergency Breakdown & Assistance Request
* **Route:** `/driver/breakdown-sos`
* **Layout & Structure:**
  - High-priority Red SOS interface.
  - Breakdown categories: *Engine Overheating*, *Transmission Failure*, *Suspension/Axle Break*, *Electrical Failure*.
  - Exact GPS coordinates auto-locked.
  - Nearest company branch / contracted workshop display.
  - Actions:
    - `[ DISPATCH EMERGENCY TOW & RESCUE BUS ]`
    - `[ CALL DISPATCH CONTROL HOTLINE ]`.

---

### [SCR-DRV-10] Trip Completion & Post-Trip Handover
* **Route:** `/driver/trip-complete`
* **Layout & Structure:**
  - Arrival terminal confirmation (*Bahir Dar Central Terminal*).
  - Ending odometer input (e.g., `184,815 km` $\to$ calculates `565 km traveled`).
  - Fuel consumption entry (liters refueled + photo of fuel receipt).
  - Conductor confirmation: All passengers safely disembarked; cabin inspected for lost items.
  - Final sign-off button: `[ COMPLETE TRIP & CLOSE DUTY ]`.

---

# 3. Agent & Terminal Counter POS System (Next.js / Desktop Web)

Engineered for ultra-fast, high-volume ticket sales at physical branch terminals (Autobus Tera, Meskel Square, Kality, etc.). Fully operable via keyboard shortcuts without a mouse.

```text
AGENT POS NAVIGATION TREE
├── [SCR-AGT-01] Shift Opening & Cash Float Modal
├── [SCR-AGT-02] Fast 1-Click Search & Trip Selector
├── [SCR-AGT-03] Visual Seat Matrix & Fast Keypad Selection
├── [SCR-AGT-04] Passenger Entry Form (Rapid Inline)
├── [SCR-AGT-05] Cash Tender & Change Calculator
├── [SCR-AGT-06] ESC/POS Thermal Receipt & A4 Ticket Print Preview
├── [SCR-AGT-07] Terminal Passenger Check-in & Gate Scan
├── [SCR-AGT-08] Booking Search, Reprint & Reschedule Desk
├── [SCR-AGT-09] Active Shift Sales & Drawer Tally
└── [SCR-AGT-10] End of Shift Reconciliation & Handover
```

---

### [SCR-AGT-01] Shift Opening & Cash Float Modal
* **Route:** `/agent/shift-open`
* **Role:** `TICKET_AGENT`, `BRANCH_MANAGER`
* **Layout & Structure:**
  - Agent profile info, active branch, terminal window number (e.g., *Window #3*).
  - Opening cash float entry input in ETB (e.g., `10,000.00 ETB`).
  - Bill denomination breakdown calculator (100 ETB notes, 200 ETB notes).
  - Supervisor witness PIN authorization.
* **Action:** `[ OPEN CASH DRAWER & START SHIFT ]` $\to$ Unlocks booking POS interface.

---

### [SCR-AGT-02] Fast 1-Click Search & Trip Selector
* **Route:** `/agent/pos`
* **Layout & Structure:**
  - **Keyboard Navigation First:** `Tab` moves between inputs, `Enter` executes search, `F1-F12` hotkeys.
  - **Quick Inputs:**
    - Destination: Number keys or auto-complete (`1` = Bahir Dar, `2` = Gondar, `3` = Hawassa).
    - Travel Date: Defaults to `Today` (Key `T`) or `Tomorrow` (Key `M`).
    - Passenger Count: Number input (1-5).
  - **Trips Table Grid:**
    - Columns: `Time`, `Destination`, `Bus Side #`, `Type`, `Seats Left`, `Fare ETB`, `Action [Enter]`.
    - Real-time inventory refresh via WebSocket every 5 seconds.

---

### [SCR-AGT-03] Visual Seat Matrix & Fast Keypad Selection
* **Route:** Sub-view inside POS layout
* **Layout & Structure:**
  - High-visibility 45-seat bus grid.
  - Keyboard direct input: Agent types `12A` and presses `Enter` to immediately lock seat.
  - Color-coded: Available (White), Locked by Me (Cyan), Held by Other Agent/Online (Yellow), Sold (Red).
  - Multi-seat selection support.

---

### [SCR-AGT-04] Passenger Entry Form (Rapid Inline)
* **Route:** Inline panel
* **Layout & Structure:**
  - High-speed form optimized for rapid data entry under 30 seconds:
    - Full Name (`Enter` jumps to next).
    - Phone Number (auto-fills `09` or `07`).
    - Kebele ID / Passport Number.
  - Recent customer lookup (Typing phone number auto-fills name and ID if passenger traveled previously).

---

### [SCR-AGT-05] Cash Tender & Change Calculator
* **Route:** Modal overlay / prominent right panel
* **Layout & Structure:**
  - **Total Amount Due:** `ETB 850.00`.
  - **Cash Tendered Input:** Agent enters `1000` (or taps quick bill buttons: `[500]`, `[1000]`, `[2000]`).
  - **CHANGE DUE DISPLAY (Huge Neon Green Text):**
    ```text
    ┌──────────────────────────────────────────┐
    │          CHANGE TO RETURN                │
    │             ETB 150.00                   │
    └──────────────────────────────────────────┘
    ```
  - Payment method toggle buttons: `[ Cash ]`, `[ Telebirr Agent QR ]`, `[ POS Card ]`.

---

### [SCR-AGT-06] ESC/POS Thermal Receipt & A4 Ticket Print Preview
* **Route:** Silent print background trigger / preview modal
* **Layout & Structure:**
  - Generates raw ESC/POS binary data sent directly to connected 58mm / 80mm USB thermal receipt printer in $<500\text{ms}$.
  - **Thermal Ticket Format:**
    ```text
    ========================================
             ABYSSINIA BUS S.C.
       Hotline: 9908  |  TIN: 0019283746
    ========================================
    BOOKING:   BK-20261005-00125
    TICKET:    TCK-00125-01
    DATE:      05 OCT 2026  |  05:30 AM
    ROUTE:     ADDIS ABABA -> BAHIR DAR
    BUS:       SB-023 (LUXURY 2X2)
    GATE:      GATE 4
    ----------------------------------------
    PASSENGER: ABEBE BIKILA
    SEAT:      12A (WINDOW)
    FARE:      ETB 850.00  (PAID CASH)
    ----------------------------------------
                [ 2D QR CODE ]
           *Scan at Bus Door Gate*
    ========================================
    ```
  - Also provides standard A4 laser printer option with official tax invoice template.

---

### [SCR-AGT-07] Terminal Passenger Check-in & Gate Scan
* **Route:** `/agent/checkin`
* **Layout & Structure:**
  - Terminal gate check-in interface for station staff.
  - USB handheld barcode gun scanner input field.
  - Instant passenger lookup, seat verification, and boarding status confirmation.

---

### [SCR-AGT-08] Booking Search, Reprint & Reschedule Desk
* **Route:** `/agent/bookings`
* **Layout & Structure:**
  - Universal search bar: Query by Booking Reference, Ticket Number, Passenger Phone, or Legal Name.
  - Action buttons:
    - `[ Reprint Ticket ]` (Prints with "DUPLICATE COPY" watermark; logs supervisor audit).
    - `[ Reschedule ]` (Opens date & seat exchange panel; calculates fare delta).
    - `[ Cancel / Refund ]` (Checks cancellation policy tier; calculates net cash refund; prints refund voucher).

---

### [SCR-AGT-09] Active Shift Sales & Drawer Tally
* **Route:** `/agent/my-shift`
* **Layout & Structure:**
  - Real-time drawer telemetry:
    - Opening Float: `10,000.00 ETB`
    - Cash Tickets Sold (42): `+35,700.00 ETB`
    - Cash Refunds Issued (1): `-850.00 ETB`
    - **Current Expected Cash in Drawer:** `44,850.00 ETB`.
    - Digital Sales (Telebirr/Card): `12,400.00 ETB` (Non-cash).

---

### [SCR-AGT-10] End of Shift Reconciliation & Handover
* **Route:** `/agent/shift-close`
* **Layout & Structure:**
  - Mandatory physical cash count input:
    - 200 ETB notes count, 100 ETB notes count, 50 ETB notes count $\to$ Computes **Actual Counted Cash**.
  - System computes difference:
    - *Expected Cash: 44,850.00 ETB*
    - *Counted Cash: 44,850.00 ETB*
    - *Variance: 0.00 ETB (Balanced)*.
  - If discrepancy exists: Mandatory explanation notes box.
  - Branch Manager signature / PIN sign-off.
  - `[ SUBMIT & PRINT SHIFT SETTLEMENT SLIP ]`.

---

# 4. Operations & Dispatch Control Center (Web)

The heartbeat of company operations. Manages active schedules, assigns buses and drivers, monitors highway movements, and resolves service disruptions.

```text
DISPATCH CONTROL NAVIGATION TREE
├── [SCR-DSP-01] Daily Terminal Master Departure Board
├── [SCR-DSP-02] Bus Fleet & Driver Dispatch Matrix (Gantt)
├── [SCR-DSP-03] Pre-Departure Clearance & Safety Sign-Off
├── [SCR-DSP-04] Emergency Bus Replacement Engine
├── [SCR-DSP-05] Real-Time Fleet Radar & GPS Map
├── [SCR-DSP-06] Incident Command Desk & Delay Alerts
└── [SCR-DSP-07] Standby Passenger Seat Allocation
```

---

### [SCR-DSP-01] Daily Terminal Master Departure Board
* **Route:** `/dispatch/board`
* **Role:** `DISPATCHER`, `OPERATIONS_MGR`
* **Layout & Structure:**
  - Real-time airport-style departure board for terminal operations.
  - Table columns:
    - `Trip #`, `Route`, `Scheduled Time`, `Bus Side #`, `Driver`, `Gate`, `Occupancy (Booked/Total)`, `Boarded Count`, `Status`, `Actions`.
  - Color-coded status chips: `SCHEDULED`, `BOARDING (Flashing Blue)`, `CLEARANCE_GRANTED (Green)`, `DELAYED (Orange)`, `DEPARTED`, `CANCELLED`.
  - Filter by terminal bay / gate and destination corridor.

---

### [SCR-DSP-02] Bus Fleet & Driver Dispatch Matrix (Gantt)
* **Route:** `/dispatch/assignments`
* **Layout & Structure:**
  - Interactive Gantt chart displaying all company buses on vertical axis, 24-hour timeline on horizontal axis.
  - Driver roster with legal duty rest tracking (prevents assigning a driver who completed an 8-hour drive without mandatory 12-hour rest).
  - Drag-and-drop assignment of buses and drivers to scheduled trip blocks.
  - Conflict warning banner: Flags bus overlapping trips or maintenance hold flags.

---

### [SCR-DSP-03] Pre-Departure Clearance & Safety Sign-Off
* **Route:** `/dispatch/clearance/:tripId`
* **Layout & Structure:**
  - 3-Way clearance audit checklist:
    1. Driver Pre-Trip Inspection submitted: `PASSED`.
    2. Conductor Manifest status: `43 Boarded, 2 No-Shows (Seats Released)`.
    3. Terminal Gate Clearance: Verified.
  - Primary Action: `[ ISSUE OFFICIAL DEPARTURE CLEARANCE STAMP ]` $\to$ Signals driver app to begin trip; transitions status to `IN_TRANSIT`.

---

### [SCR-DSP-04] Emergency Bus Replacement Engine
* **Route:** `/dispatch/bus-swap`
* **Layout & Structure:**
  - Workflow to resolve vehicle breakdowns:
    1. Select stranded / defective trip (e.g., `Trip #501 — Bus SB-023`).
    2. Select available standby replacement bus (e.g., `Bus SB-088`).
    3. Automatic Seat Map Migration: Matches 45 passenger seat numbers 1-to-1 to identical seats on replacement bus.
    4. Triggers automatic SMS notification broadcast to all booked passengers.
    5. Updates conductor manifest and driver assignment records in single atomic database transaction.

---

### [SCR-DSP-05] Real-Time Fleet Radar & GPS Map
* **Route:** `/dispatch/radar`
* **Layout & Structure:**
  - High-density vector map of Ethiopia showing all major intercity corridors:
    - Route A1 (Addis Ababa $\to$ Bahir Dar $\to$ Gondar)
    - Route A2 (Addis Ababa $\to$ Hawassa)
    - Route A4 (Addis Ababa $\to$ Jimma)
    - Route A3 (Addis Ababa $\to$ Dessie $\to$ Mekelle).
  - Live animated vehicle markers with side numbers and speed indicators.
  - Geofence alerts: Flags unauthorized stops, highway speeding ($>80\text{ km/h}$), or off-route deviations.

---

### [SCR-DSP-06] Incident Command Desk & Delay Alerts
* **Route:** `/dispatch/incidents`
* **Layout & Structure:**
  - Active incident tickets submitted by drivers, conductors, or branch dispatchers.
  - Incident triage cards: Severity (`CRITICAL`, `WARNING`, `INFO`), Location milepost, Description.
  - Dispatcher action panel: Broadcast delay notice to passengers, dispatch mechanic team, reroute traffic.

---

### [SCR-DSP-07] Standby Passenger Seat Allocation
* **Route:** `/dispatch/standby`
* **Layout & Structure:**
  - 15 minutes prior to departure, identifies all unboarded/no-show seats.
  - Automated release button: Frees seats to terminal ticket window for waiting standby walk-up passengers.

---

# 5. Fleet Management & Workshop Maintenance (Web / Tablet)

Oversees the technical health, preventative maintenance, tire lifecycle, and roadworthiness certification of the company's bus assets.

```text
FLEET & WORKSHOP NAVIGATION TREE
├── [SCR-FLT-01] Bus Fleet Asset Directory & Status
├── [SCR-FLT-02] Vehicle Regulatory & Insurance Expiry Tracker
├── [SCR-FLT-03] Preventative Maintenance Service Scheduler
├── [SCR-FLT-04] Workshop Work Order & Defect Logger
├── [SCR-FLT-05] Spare Parts Inventory & Usage Tracker
├── [SCR-FLT-06] Tire Serial Tracker & Tread Depth Matrix
└── [SCR-FLT-07] Roadworthiness Sign-Off & Return to Service
```

---

### [SCR-FLT-01] Bus Fleet Asset Directory & Status
* **Route:** `/fleet/buses`
* **Role:** `FLEET_MANAGER`, `MECHANIC`
* **Layout & Structure:**
  - Master grid of all buses with Side Number, Plate Number, Model (Yutong, Zhongtong, Scania), Engine #, Chassis #, Total Mileage, and Status (`AVAILABLE`, `ON_TRIP`, `WORKSHOP`, `OUT_OF_SERVICE`).
  - Total fleet health telemetry: Active buses, buses in workshop, buses scheduled for inspection.

---

### [SCR-FLT-02] Vehicle Regulatory & Insurance Expiry Tracker
* **Route:** `/fleet/compliance`
* **Layout & Structure:**
  - Regulatory document compliance dashboard:
    - Federal Transport Authority annual inspection validity.
    - Third-party insurance policy expiry.
    - Speed governor calibration certification.
  - Color-coded expiry alerts: Red (Expired), Yellow (Expiring within 30 days), Green (Valid).

---

### [SCR-FLT-03] Preventative Maintenance Service Scheduler
* **Route:** `/fleet/maintenance`
* **Layout & Structure:**
  - Odometer-driven preventative maintenance triggers:
    - *Service A (Every 5,000 km):* Engine oil & filter change, lube chassis.
    - *Service B (Every 15,000 km):* Brake lining inspection, fuel filters, air dryer.
    - *Service C (Every 30,000 km):* Transmission oil, differential oil, suspension bushings.
  - Visual progress bar showing km remaining until next mandatory service.

---

### [SCR-FLT-04] Workshop Work Order & Defect Logger
* **Route:** `/fleet/work-orders`
* **Layout & Structure:**
  - Repair ticket management system.
  - Work order creation: Bus #, Reported Defect, Assigned Lead Mechanic, Priority Level (`HIGH`, `MEDIUM`, `LOW`).
  - Labor hour tracking and photo upload of damaged/repaired components.

---

### [SCR-FLT-05] Spare Parts Inventory & Usage Tracker
* **Route:** `/fleet/inventory`
* **Layout & Structure:**
  - Workshop warehouse inventory: Filters, brake pads, belts, alternators, lubricants, bulbs.
  - Reorder alerts when stock drops below safety threshold.
  - Direct logging of parts consumed against specific work order IDs.

---

### [SCR-FLT-06] Tire Serial Tracker & Tread Depth Matrix
* **Route:** `/fleet/tires`
* **Layout & Structure:**
  - Bus visual tire diagram (6 positions: Front-Left, Front-Right, Rear-Outer-Left, Rear-Inner-Left, Rear-Inner-Right, Rear-Outer-Right).
  - Serial number tracking, current tread depth in millimeters, rotation history, and retread status.

---

### [SCR-FLT-07] Roadworthiness Sign-Off & Return to Service
* **Route:** `/fleet/work-orders/:id/signoff`
* **Layout & Structure:**
  - Quality assurance test drive checklist.
  - Mechanic digital signature and supervisor approval.
  - Updates bus status in master inventory from `WORKSHOP` to `AVAILABLE`.

---

# 6. Finance & Accounting Portal (Web)

Ensures zero revenue leakage, automates daily cash drawer settlement, reconciles digital banking gateways, and produces financial statements.

```text
FINANCE & ACCOUNTING NAVIGATION TREE
├── [SCR-FIN-01] Daily Financial Operations Dashboard
├── [SCR-FIN-02] Branch Cash Drawer Settlement & Deposit Review
├── [SCR-FIN-03] Digital Payment Gateway Auto-Reconciliation
├── [SCR-FIN-04] Refund, Cancellation & Adjustment Ledger
├── [SCR-FIN-05] Route & Trip Profitability Analysis
└── [SCR-FIN-06] General Ledger & Tax (ERCA/TIN) Export Center
```

---

### [SCR-FIN-01] Daily Financial Operations Dashboard
* **Route:** `/finance/dashboard`
* **Role:** `FINANCE_OFFICER`, `ACCOUNTANT`
* **Layout & Structure:**
  - Real-time revenue metrics:
    - Today's Gross Ticket Sales (ETB).
    - Payment Method Breakdown: Cash (Counter POS) vs Telebirr vs CBE Birr vs Chapa.
    - Total Refunds Issued today.
    - Net Operating Revenue.
  - Branch sales leaderboard: Addis Ababa HQ vs Bahir Dar vs Hawassa.

---

### [SCR-FIN-02] Branch Cash Drawer Settlement & Deposit Review
* **Route:** `/finance/settlements`
* **Layout & Structure:**
  - Review panel for closing shift slips submitted by branch managers.
  - Compares system calculated expected cash against branch physical bank deposit slip uploads.
  - Approval workflow: Finance Officer reviews $\to$ approves settlement $\to$ locks shift records.

---

### [SCR-FIN-03] Digital Payment Gateway Auto-Reconciliation
* **Route:** `/finance/reconciliation`
* **Layout & Structure:**
  - Bank and telecom statement CSV/API reconciliation engine:
    - Telebirr Merchant Settlement Statement.
    - CBE Birr Direct API Statement.
    - Chapa Gateway Payout Batches.
  - Auto-matching algorithm: Pairs external bank transaction references with internal booking IDs (`BK-YYYYMMDD-XXXXX`).
  - Discrepancy inbox: Flags unmatched or failed transactions for manual investigation.

---

### [SCR-FIN-04] Refund, Cancellation & Adjustment Ledger
* **Route:** `/finance/refunds`
* **Layout & Structure:**
  - Comprehensive audit list of all cancellations, customer refunds, and administrative fees retained.
  - Payout verification: Confirms customer received digital refund via Telebirr or cash voucher.

---

### [SCR-FIN-05] Route & Trip Profitability Analysis
* **Route:** `/finance/profitability`
* **Layout & Structure:**
  - Unit economics per trip:
    - Gross Fare Revenue.
    - Less: Fuel Expense (from driver log receipts).
    - Less: Highway Toll Fees.
    - Less: Driver & Conductor Allowances.
    - **Net Trip Operating Margin**.
  - Identifies top-performing corridors vs underperforming schedules.

---

### [SCR-FIN-06] General Ledger & Tax (ERCA/TIN) Export Center
* **Route:** `/finance/export`
* **Layout & Structure:**
  - Generates compliance reports for Ethiopian Ministry of Revenues (ERCA) with official TIN identification.
  - 1-click export to ERP formats (QuickBooks, SAP, Excel CSV).

---

# 7. Customer Support & Luggage Desk (Web)

Empowers customer service agents to resolve traveler inquiries, resend tickets, process authorized modifications, and track lost baggage.

```text
CUSTOMER SUPPORT NAVIGATION TREE
├── [SCR-SUP-01] 360-Degree Passenger & Booking Search
├── [SCR-SUP-02] Ticket Action Center & SMS Re-Dispatch
├── [SCR-SUP-03] Inquiries & Passenger Complaints Inbox
└── [SCR-SUP-04] Lost Baggage & Found Property Registry
```

---

### [SCR-SUP-01] 360-Degree Passenger & Booking Search
* **Route:** `/support/search`
* **Role:** `CUSTOMER_SUPPORT`
* **Layout & Structure:**
  - Universal omni-search: Enter Phone Number, Passenger Name, National ID, Booking Reference, or Ticket Number.
  - Displays full customer profile, complete past journey history, and active tickets.

---

### [SCR-SUP-02] Ticket Action Center & SMS Re-Dispatch
* **Route:** `/support/tickets/:id`
* **Layout & Structure:**
  - Detailed view of customer ticket with QR code preview, payment status, and boarding state.
  - Quick action buttons:
    - `[ Resend Ticket via SMS ]` (Dispatches instant SMS containing ticket link and code).
    - `[ Email PDF Ticket ]`.
    - `[ Request Authorized Reschedule ]`.
    - `[ Process Refund Request ]` (Routes to branch manager / finance approval).

---

### [SCR-SUP-03] Inquiries & Passenger Complaints Inbox
* **Route:** `/support/complaints`
* **Layout & Structure:**
  - Customer complaint ticketing desk.
  - Issue categories: Trip Delay, Air Conditioning, Driver Speeding, Luggage Handling, Staff Conduct.
  - Case resolution workflow with customer callback notes and SLA tracker.

---

### [SCR-SUP-04] Lost Baggage & Found Property Registry
* **Route:** `/support/lost-found`
* **Layout & Structure:**
  - Registry of missing passenger luggage paired with bus trips and luggage tag numbers.
  - Found property catalog logged by conductors at end-of-trip cleanings.
  - Matching engine: Links passenger report with logged found items; handles return verification.

---

# 8. Company Owner & Executive Dashboard (Web / Mobile Responsive)

Gives executive leadership macro-level visibility into company revenue, load factors, route profitability, and operational health without manual operational clutter.

```text
EXECUTIVE DASHBOARD NAVIGATION TREE
├── [SCR-OWN-01] Executive KPI Command Overview
├── [SCR-OWN-02] Route Performance & Profitability Benchmarking
├── [SCR-OWN-03] Fleet Utilization & Maintenance Downtime
└── [SCR-OWN-04] Sales Channel Distribution Analytics
```

---

### [SCR-OWN-01] Executive KPI Command Overview
* **Route:** `/executive`
* **Role:** `COMPANY_OWNER`, `SUPER_ADMIN`
* **Layout & Structure:**
  - High-level metric summary cards:
    ```text
    ┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
    │ TODAY'S REVENUE  │ PASSENGERS MOVED │ LOAD FACTOR (OCC)│ ON-TIME PERF     │
    │  ETB 482,500.00  │      1,240       │      88.4%       │      94.2%       │
    └──────────────────┴──────────────────┴──────────────────┴──────────────────┘
    ┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
    │ ACTIVE TRIPS     │ BUSES IN SERVICE │ BUSES IN GARAGE  │ DELAYED TRIPS    │
    │      28          │      26 / 30     │        3         │        1         │
    └──────────────────┴──────────────────┴──────────────────┴──────────────────┘
    ```
  - Real-time revenue velocity chart (hourly ticket sales comparison against same day last week).

---

### [SCR-OWN-02] Route Performance & Profitability Benchmarking
* **Route:** `/executive/routes`
* **Layout & Structure:**
  - Corridor comparison matrix:
    - *Addis Ababa $\leftrightarrow$ Bahir Dar:* 12 daily departures | 92% occupancy | 4.2 ETB revenue/seat-km.
    - *Addis Ababa $\leftrightarrow$ Hawassa:* 8 daily departures | 86% occupancy | 3.9 ETB revenue/seat-km.
    - *Addis Ababa $\leftrightarrow$ Jimma:* 6 daily departures | 78% occupancy | 3.5 ETB revenue/seat-km.
  - Capacity recommendation engine: Recommends adding departures on high-demand corridors.

---

### [SCR-OWN-03] Fleet Utilization & Maintenance Downtime
* **Route:** `/executive/fleet`
* **Layout & Structure:**
  - Fleet asset efficiency metrics:
    - Average km driven per bus per month.
    - Mean Time Between Failures (MTBF).
    - Unscheduled maintenance downtime percentage ($<3\%$ target).

---

### [SCR-OWN-04] Sales Channel Distribution Analytics
* **Route:** `/executive/channels`
* **Layout & Structure:**
  - Sales volume breakdown donut chart:
    - Terminal Counter POS: $58\%$
    - Passenger Mobile App: $28\%$
    - Public Website: $10\%$
    - Authorized Travel Agents: $4\%$.
  - Commission cost analysis per channel.

---

# 9. Super Admin & System Configuration Console (Web)

System provider and technical administrator portal for managing multi-branch infrastructure, routes, master schedules, security parameters, and audit trails.

```text
SUPER ADMIN NAVIGATION TREE
├── [SCR-ADM-01] Company Profile & Organization Setup
├── [SCR-ADM-02] Branch & Terminal Master Directory
├── [SCR-ADM-03] Route & Stop Geographic Builder
├── [SCR-ADM-04] Master Schedule & Trip Automation Generator
├── [SCR-ADM-05] User Directory & Granular RBAC Assignment
├── [SCR-ADM-06] System Audit Log & Security Monitor
└── [SCR-ADM-07] Payment Gateways & SMS Integrations Settings
```

---

### [SCR-ADM-01] Company Profile & Organization Setup
* **Route:** `/admin/company`
* **Role:** `SUPER_ADMIN`
* **Layout & Structure:**
  - Corporate registration: Legal name (English & Amharic), Trade name, Tax Identification Number (TIN), Commercial Registration #.
  - Headquarters address, official customer support telephone, company branding assets (Logo, brand colors, app icons).

---

### [SCR-ADM-02] Branch & Terminal Master Directory
* **Route:** `/admin/branches`
* **Layout & Structure:**
  - List of all physical branches and terminals:
    - *Addis Ababa Central (Autobus Tera)*
    - *Addis Ababa South (Kality)*
    - *Addis Ababa East (Meskel Square)*
    - *Bahir Dar Central*
    - *Hawassa Main Terminal*.
  - GPS coordinates, terminal manager assignment, counter window count, terminal contact numbers.

---

### [SCR-ADM-03] Route & Stop Geographic Builder
* **Route:** `/admin/routes`
* **Layout & Structure:**
  - Visual GIS route builder with interactive map:
    - Origin Stop & Destination Stop definition.
    - Sequence of intermediate stops (e.g., *Addis Ababa $\to$ Dejen $\to$ Debre Markos $\to$ Bahir Dar*).
    - Distance in kilometers and estimated travel duration per hop.
  - Automatic creation of segment combinations.

---

### [SCR-ADM-04] Master Schedule & Trip Automation Generator
* **Route:** `/admin/schedules`
* **Layout & Structure:**
  - Master timetable definitions:
    - Route, Departure Time (e.g., `05:30 AM`), Days of Week (`DAILY`, `WEEKENDS`, `CUSTOM`).
    - Assigned bus category (Luxury 2x2 vs Standard 2x3).
  - Automated Trip Generation Engine: Generates trips 30 days ahead, instantiating segment seat inventory automatically.

---

### [SCR-ADM-05] User Directory & Granular RBAC Assignment
* **Route:** `/admin/users`
* **Layout & Structure:**
  - Master user directory with role assignment (one of 13 system roles).
  - Branch stationing assignment (enforces branch data isolation for agents and branch managers).
  - Password reset, two-factor authentication enforcement, active status toggle.

---

### [SCR-ADM-06] System Audit Log & Security Monitor
* **Route:** `/admin/audit-logs`
* **Layout & Structure:**
  - Immutable audit trail recording every state-changing action:
    - `Timestamp`, `User ID`, `Role`, `Action` (e.g., `SEAT_LOCK`, `BOOKING_ISSUED`, `CANCELLATION`, `REPRINT`), `Entity Name`, `Entity ID`, `IP Address`, `Details JSON (Old vs New values)`.
  - Search and filter by user, date range, or booking reference.

---

### [SCR-ADM-07] Payment Gateways & SMS Integrations Settings
* **Route:** `/admin/integrations`
* **Layout & Structure:**
  - **Payment Credentials:**
    - Telebirr: Merchant App ID, App Key, Public Key, Callback Webhook URL.
    - CBE Birr: Merchant ID, Security Passphrase, B2C API Endpoint.
    - Chapa Gateway: Public Key, Secret Key, Webhook Secret.
  - **SMS Gateway:**
    - Ethio Telecom Bulk SMS API endpoint, Sender ID (*"ABYSSINIA"*), SMS templates in Amharic and English.
