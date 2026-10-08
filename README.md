# ApexPC Builder - AI Powered PC Hardware Configurator

ApexPC Builder is a full-stack, cyberpunk-styled computer builder platform featuring real-time hardware compatibility checking, AI budget auto-building, a floating hardware intelligence chat assistant, and accurate gaming FPS estimation.

---

## 🌟 Key Features

### 1. Manual PC Builder & Hardware Catalog
- **8 Core Categories**: CPU, Motherboard, RAM, Graphics Card (GPU), Storage (SSD/HDD), Power Supply (PSU), Case, CPU Cooler.
- **Rich Hardware Database**: At least 8-10 authentic components per category with authentic specs (Socket, TDP, RAM DDR type, form factors, card lengths, cooler clearance, PCIe generations).
- **Dual Currency Support**: Switch between **USD ($)** and **UZS (so'm)** anytime with real-time conversion.
- **Card-based Layout**: High-resolution imagery, verified specs badges, user review ratings, and comprehensive technical detail modal.

### 2. Real-Time Hardware Compatibility Engine
- **Socket Synergy**: CPU socket matches motherboard socket (e.g. AM5, AM4, LGA1700).
- **RAM Validation**: DDR4 vs DDR5 compatibility with motherboard and CPU memory controllers.
- **Chassis Physical Dimensions**:
  - Maximum GPU clearance vs GPU length.
  - Air cooler height vs Case clearance limit.
  - Motherboard form factor support (ATX, Micro-ATX, Mini-ITX).
- **Thermal & Power Headroom**:
  - Cooler TDP dissipation rating vs CPU thermal wattage.
  - Total system peak power draw (CPU + GPU + Mobo + RAM + SSD + Fans).
  - Power supply wattage adequacy check with safe 30% headroom indicator.
- **Video Signal Warning**: Alerts if a CPU lacks integrated graphics (e.g. 5600X, 13100F, 13400F) without a dedicated GPU installed.

### 3. AI Auto-Build (Budget Allocator)
- Input target budget in USD or UZS.
- Select primary purpose:
  - **Gaming & Esports** (heavier GPU allocation)
  - **Programming & DevOps** (multi-core CPU & 32GB+ RAM)
  - **Video Editing & VFX** (large VRAM & NVMe cache)
  - **3D Graphics & CAD Rendering**
  - **Live Streaming & Content Creation**
  - **Office & Everyday Computing**
- Specify custom preferences (e.g., "RGB lighting", "Quiet operation", "White aesthetic", "AM5 future upgrades").
- Generates 3 distinct tiers:
  - **Budget / Value**
  - **Balanced / Optimal**
  - **High-End / Extreme**
- Includes component-by-component reasoning, pros/cons, and 1-click **"Load into Manual Builder"** button.

### 4. AI Build Analysis & Architectural Diagnostics
- **Comprehensive Hardware Diagnostic**: Evaluates your active PC configuration using the Gemini 3.8 Flash model.
- **Hardware Synergy Score**: Generates an overall architectural health and balance rating (e.g., `8.8/10`).
- **Core Strengths**: Highlights key platform advantages such as AM5 socket longevity, high PCIe 4.0/5.0 NVMe speeds, GPU VRAM headroom, and cooling capacity.
- **Identified Weaknesses & Bottlenecks**: Pinpoints compromises and rated risks (low, medium, high severity) such as memory speed ceilings, power supply headroom margins, or chassis clearance.
- **Sequential Upgrade Roadmap**: Provides a 3-phase strategic upgrade plan (e.g. Near-term RAM bump, mid-term high-speed storage expansion, long-term GPU/PSU overhaul) with expected real-world impact.
- **Platform Longevity & Workload Verdict**: Estimates expected platform lifespan (in years) and optimal primary use-case.

### 5. Hardware AI Chat Assistant
- Floating assistant in the lower-right corner.
- Context-aware: sees the user's active build in real-time.
- Answers questions regarding bottlenecks, performance upgrades, and compatibility.

### 6. Gaming FPS & Bottleneck Estimator
- Predicts average framerates for popular titles:
  - *Counter-Strike 2*
  - *Cyberpunk 2077*
  - *Fortnite (UE5)*
  - *Valorant*
  - *Call of Duty: Warzone*
  - *Grand Theft Auto V / VI Ready*
- Resolution selector: **1080p Full HD**, **1440p 2K QHD**, and **4K Ultra HD**.
- Bottleneck ratio analysis: identifies CPU vs GPU balance and percentage throughput limits.

### 7. Saved Builds Library with Custom Tags & Filtering
- **Custom Tagging System**: Tag saved configurations (e.g. `'Workstation'`, `'Gaming'`, `'Budget'`, `'High-End'`, `'Mini-ITX'`, or custom user-typed tags).
- **Tag Filtering Toolbar**: Filter stored configurations by any tag with real-time count badges (e.g., `All (3)`, `Gaming (2)`, `Workstation (1)`).
- **Inline Tag Editor**: Add or remove tags directly on saved build cards with instant suggestions.
- **Search & Inline Renaming**: Quickly filter by name, tag keyword, or component specs.

### 8. Side-by-Side PC Build Comparison
- **Select Any Two Builds**: Compare two configurations side-by-side using the "Compare" button or floating comparison queue.
- **Cost Difference Calculator**: Real-time price delta and percentage difference (e.g., "$350 cheaper (-23%)").
- **Component-by-Component Table**: CPU, Motherboard, RAM, GPU, Storage, PSU, Case, and Cooler specifications side-by-side.
- **Performance & Gaming FPS Delta**: Direct comparison of estimated framerates across CS2, Cyberpunk 2077, Fortnite, Valorant, and Warzone.
- **Power & Bottleneck Metrics**: Compare peak system TDP, recommended PSU wattage, and hardware balance.
- **One-Click Switch & Load**: Swap compared builds dynamically or load either configuration directly into the active workbench.

### 9. Exporting, Sharing & AI Video Animation
- **PDF Spec Sheet Quotation**: Formatted document with itemized costs, TDP, and warranty overview using `jspdf`.
- **Shareable Link**: Encodes build IDs into URL parameters for easy sharing.
- **Veo Video Animator**: Upload a photo of your PC setup / battlestation and render a cinematic 3D animated showcase video using `veo-3.1-fast-generate-preview` (16:9 Landscape or 9:16 Portrait).
- **Multilingual Support**: English, Uzbek (O'zbekcha), and Russian (Русский).
- **Theme Support**: Cyber Neon Dark and Clean Light modes.

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, tsx.
- **AI SDK**: `@google/genai` (Gemini 3.8 Flash model via server-side API).
- **PDF Generation**: jsPDF.

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (version 18+ or 20+ recommended)
- npm or yarn

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
Create or update your `.env` file in the root directory:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
PORT=3000
```
*(If `GEMINI_API_KEY` is not provided, the platform automatically switches to its built-in rule-based algorithmic PC configurator without crashing).*

### Step 3: Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### Step 4: Build for Production
```bash
npm run build
npm start
```
