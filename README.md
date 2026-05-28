# Aura Booking — Spa Management Admin Panel

A premium, highly interactive, and theme-customizable Spa Management Administration Panel built using React, Vite, Tailwind CSS, and Framer Motion. 

---

## 🎨 Theme & Branding
* **Primary Branding**: Aura Pink (`#F472B6`)
* **Accent Theme**: Aura Teal (`#67C4C0`)
* **Aesthetics**: Glassmorphism, smooth animations, dark-mode aware UI, and modern typography (Inter for UI, Playfair Display for Headings).

---

## 📁 Repository Structure

```
spa-management/
├── Frontend/                 # React SPA Client (Vite + Tailwind)
│   ├── src/
│   │   ├── api/              # Axios configuration & API helpers
│   │   ├── components/
│   │   │   ├── layout/       # Sidebar, Topbar, TopNavBar, CustomizerPanel
│   │   │   └── ui/           # Reusable widgets (Avatar, PageLoader, StatCard, etc.)
│   │   ├── context/          # Auth, Toast, Customizer State contexts
│   │   ├── hooks/            # Custom React hooks (e.g. useToast)
│   │   ├── pages/            # View pages (Dashboard, Appointments, Services, etc.)
│   │   ├── App.jsx           # Main routing configuration
│   │   ├── index.css         # Tailwind & custom CSS variable overrides
│   │   └── main.jsx          # App entrypoint
│   ├── vercel.json           # Vercel client-side routing config
│   ├── package.json          # Dependencies & scripts
│   └── tailwind.config.js    # Tailwind layout utility configurations
│
├── Backend/                  # REST API Service (Node + Express)
│
├── vercel.json               # Root routing config
└── ui.md                     # Comprehensive UI specifications
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/laxsavani/Aura-Booking.git
   cd Aura-Booking
   ```

2. **Frontend Setup:**
   ```bash
   cd Frontend
   npm install
   ```

3. **Backend Setup:**
   ```bash
   cd ../Backend
   npm install
   ```

### Running Locally

1. **Start the Backend server:**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Start the Frontend client:**
   ```bash
   cd Frontend
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser to view the admin panel.

---

## ⚡ Main Features

### 🔧 Customizer Theme Panel
Equipped with an interactive customizer drawer (`CustomizerPanel.jsx`) allowing real-time adjustments for:
* **Layout Styles**: Toggle between **Sidebar navigation** (desktop-default) or **Horizontal TopNavBar**.
* **Color Palettes**: Dynamic accent changes (Pink, Teal, Purple, Blue, etc.) mapped directly via index.css overrides using CSS variables.
* **Layout Density**: Compact or spacious paddings.
* **Theme Modes**: Full **Light** / **Dark** mode synchronization.

### 📅 Appointments Board
* Indeterminate loaders on list requests.
* Detailed metadata and timeline tracking on booking details.
* Quick actions for approving/rejecting user requests.

### 💇 Services Catalog
* Modular views (Grid / Table layouts).
* Publish/deactivate status toggle switches.
* Category and tier filters.

---

## 📦 Deployment

### Vercel (Frontend)
The client-side routing rules are fully configured in the `vercel.json` file to support clean URL reloads (React Router):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
Deploying the `Frontend` folder to Vercel will work out of the box.
