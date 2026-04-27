# Bilillee - Design System & Styling Guide

## Brand Foundation

### Brand Identity

**Brand Name**: Bilillee  
**Tagline**: "Beauty & Wellness, Simplified"  
**Brand Essence**: Empowering, Modern, Trustworthy, Vibrant

**Brand Story**:  
Bilillee exists to eliminate the friction between beauty professionals and their clients. We believe technology should fade into the background, letting human connection shine. Our visual language balances professional credibility with the warmth of personal care.

### Color Palette

#### Primary Colors

```css
:root {
  /* Brand Primary - Vibrant Coral */
  --color-primary-50: #FFF5F5;
  --color-primary-100: #FFE3E3;
  --color-primary-200: #FFC9C9;
  --color-primary-300: #FFA8A8;
  --color-primary-400: #FF8787;
  --color-primary-500: #FF6B6B;  /* Main brand color */
  --color-primary-600: #FA5252;
  --color-primary-700: #F03E3E;
  --color-primary-800: #E03131;
  --color-primary-900: #C92A2A;

  /* Brand Secondary - Deep Teal */
  --color-secondary-50: #E6FCF5;
  --color-secondary-100: #C3FAE8;
  --color-secondary-200: #96F7D6;
  --color-secondary-300: #63E6BE;
  --color-secondary-400: #38D9A9;
  --color-secondary-500: #20C997;  /* Success, growth */
  --color-secondary-600: #12B886;
  --color-secondary-700: #0CA678;
  --color-secondary-800: #099268;
  --color-secondary-900: #087F5B;
}
```

#### Neutral Colors

```css
:root {
  /* Gray Scale */
  --color-gray-50: #F8F9FA;   /* Backgrounds */
  --color-gray-100: #F1F3F5;  /* Hover states */
  --color-gray-200: #E9ECEF;  /* Borders */
  --color-gray-300: #DEE2E6;  /* Disabled */
  --color-gray-400: #CED4DA;  /* Placeholders */
  --color-gray-500: #ADB5BD;  /* Secondary text */
  --color-gray-600: #868E96;  /* Captions */
  --color-gray-700: #495057;  /* Body text */
  --color-gray-800: #343A40;  /* Headings */
  --color-gray-900: #212529;  /* Primary text */

  /* Pure */
  --color-white: #FFFFFF;
  --color-black: #000000;
}
```

#### Semantic Colors

```css
:root {
  /* Success - Teal */
  --color-success-light: #E6FCF5;
  --color-success: #20C997;
  --color-success-dark: #087F5B;

  /* Warning - Amber */
  --color-warning-light: #FFF9DB;
  --color-warning: #FFC107;
  --color-warning-dark: #F08C00;

  /* Error - Rose */
  --color-error-light: #FFF5F5;
  --color-error: #FF6B6B;
  --color-error-dark: #C92A2A;

  /* Info - Blue */
  --color-info-light: #E7F5FF;
  --color-info: #339AF0;
  --color-info-dark: #1864AB;

  /* Commission/Gold */
  --color-commission: #FFD43B;
  --color-commission-light: #FFF9DB;
}
```

#### Usage Patterns

| Context | Color | Usage |
|---------|-------|-------|
| **Primary Actions** | `--color-primary-500` | CTA buttons, links, active states |
| **Secondary Actions** | `--color-secondary-500` | Success states, growth metrics, confirmations |
| **Backgrounds** | `--color-gray-50` | Page backgrounds, cards |
| **Text Primary** | `--color-gray-900` | Headings, body text |
| **Text Secondary** | `--color-gray-600` | Captions, metadata |
| **Borders** | `--color-gray-200` | Dividers, input borders |
| **Hover States** | `--color-primary-50` | Row hovers, card hovers |

### Typography

#### Font Family

```css
:root {
  /* Primary - Modern Sans-Serif */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* Display - Elegant for headings */
  --font-display: 'Playfair Display', Georgia, serif;

  /* Monospace - For numbers, codes */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

#### Type Scale

```css
:root {
  /* Font Sizes */
  --text-xs: 0.75rem;     /* 12px - Captions, tags */
  --text-sm: 0.875rem;  /* 14px - Secondary text */
  --text-base: 1rem;      /* 16px - Body text */
  --text-lg: 1.125rem;    /* 18px - Lead paragraphs */
  --text-xl: 1.25rem;     /* 20px - Small headings */
  --text-2xl: 1.5rem;     /* 24px - Section headings */
  --text-3xl: 1.875rem;   /* 30px - Page headings */
  --text-4xl: 2.25rem;    /* 36px - Hero headings */
  --text-5xl: 3rem;       /* 48px - Display text */

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

#### Typography Hierarchy

| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| **Display** | 48px | 700 | 1.1 | Hero sections, marketing |
| **H1** | 36px | 700 | 1.2 | Page titles |
| **H2** | 30px | 600 | 1.25 | Section headings |
| **H3** | 24px | 600 | 1.3 | Card titles, subsections |
| **H4** | 20px | 600 | 1.4 | Widget headings |
| **H5** | 18px | 600 | 1.4 | List headings |
| **H6** | 16px | 600 | 1.4 | Small headings, labels |
| **Body** | 16px | 400 | 1.5 | Paragraphs, descriptions |
| **Small** | 14px | 400 | 1.5 | Secondary text, metadata |
| **Caption** | 12px | 500 | 1.4 | Tags, timestamps, badges |

### Spacing System

```css
:root {
  /* Spacing Scale (4px base) */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */

  /* Component Spacing */
  --padding-card: var(--space-6);
  --padding-button: var(--space-3) var(--space-5);
  --padding-input: var(--space-3) var(--space-4);
  --gap-grid: var(--space-6);
  --gap-list: var(--space-4);
}
```

### Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.25rem;   /* 4px - Small elements */
  --radius-md: 0.5rem;    /* 8px - Buttons, inputs */
  --radius-lg: 0.75rem;   /* 12px - Cards, modals */
  --radius-xl: 1rem;      /* 16px - Large cards */
  --radius-2xl: 1.5rem;   /* 24px - Hero sections */
  --radius-full: 9999px;  /* Pills, avatars */
}
```

### Shadows

```css
:root {
  /* Shadow Scale */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  /* Colored Shadows */
  --shadow-primary: 0 4px 14px 0 rgba(255, 107, 107, 0.39);
  --shadow-success: 0 4px 14px 0 rgba(32, 201, 151, 0.39);
}
```

### Transitions & Animation

```css
:root {
  /* Durations */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;

  /* Easings */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* Standard Transitions */
  --transition-colors: color var(--duration-fast) var(--ease-in-out), 
                         background-color var(--duration-fast) var(--ease-in-out),
                         border-color var(--duration-fast) var(--ease-in-out);
  --transition-transform: transform var(--duration-normal) var(--ease-out);
  --transition-shadow: box-shadow var(--duration-fast) var(--ease-in-out);
  --transition-all: all var(--duration-normal) var(--ease-in-out);
}
```

## Component Library

### Buttons

#### Primary Button

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-5);
  background-color: var(--color-primary-500);
  color: var(--color-white);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: var(--transition-colors), var(--transition-shadow);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background-color: var(--color-primary-600);
  box-shadow: var(--shadow-primary);
  transform: translateY(-1px);
}

.btn-primary:active {
  background-color: var(--color-primary-700);
  transform: translateY(0);
}

.btn-primary:disabled {
  background-color: var(--color-gray-300);
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}
```

#### Secondary Button

```css
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-5);
  background-color: var(--color-white);
  color: var(--color-gray-700);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-gray-300);
  cursor: pointer;
  transition: var(--transition-colors);
}

.btn-secondary:hover {
  background-color: var(--color-gray-50);
  border-color: var(--color-gray-400);
  color: var(--color-gray-900);
}
```

#### Button Variants

| Variant | Class | Usage |
|---------|-------|-------|
| **Primary** | `.btn-primary` | Main CTAs, submit actions |
| **Secondary** | `.btn-secondary` | Cancel, back, alternative actions |
| **Ghost** | `.btn-ghost` | Low emphasis, icon buttons |
| **Danger** | `.btn-danger` | Delete, remove, destructive actions |
| **Success** | `.btn-success` | Confirm, approve, positive actions |

#### Button Sizes

```css
.btn-sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
}

.btn-md {
  padding: var(--space-3) var(--space-5);
  font-size: var(--text-base);
}

.btn-lg {
  padding: var(--space-4) var(--space-6);
  font-size: var(--text-lg);
}
```

### Forms

#### Input Fields

```css
.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  color: var(--color-gray-900);
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-md);
  transition: var(--transition-colors);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px var(--color-primary-100);
}

.form-input::placeholder {
  color: var(--color-gray-400);
}

.form-input:disabled {
  background-color: var(--color-gray-100);
  cursor: not-allowed;
}

.form-input.error {
  border-color: var(--color-error);
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px var(--color-error-light);
}
```

#### Labels & Helper Text

```css
.form-label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-gray-700);
}

.form-helper {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-gray-500);
}

.form-error {
  margin-top: var(--space-2);
  font-size: var(--text-sm);
  color: var(--color-error);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
```

### Cards

```css
.card {
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-6);
  transition: var(--transition-shadow), var(--transition-transform);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-gray-200);
}

.card-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-gray-900);
}

.card-body {
  color: var(--color-gray-700);
}

.card-footer {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}
```

### Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-primary {
  background-color: var(--color-primary-100);
  color: var(--color-primary-800);
}

.badge-success {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
}

.badge-warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning-dark);
}

.badge-error {
  background-color: var(--color-error-light);
  color: var(--color-error-dark);
}

.badge-commission {
  background-color: var(--color-commission-light);
  color: #F59F00;
  border: 1px solid var(--color-commission);
}
```

### Avatars

```css
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background-color: var(--color-primary-100);
  color: var(--color-primary-700);
  font-weight: var(--font-semibold);
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-xs { width: 24px; height: 24px; font-size: var(--text-xs); }
.avatar-sm { width: 32px; height: 32px; font-size: var(--text-sm); }
.avatar-md { width: 40px; height: 40px; font-size: var(--text-base); }
.avatar-lg { width: 48px; height: 48px; font-size: var(--text-lg); }
.avatar-xl { width: 64px; height: 64px; font-size: var(--text-xl); }
```

### Calendar Components

```css
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-2);
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-colors);
}

.calendar-day:hover {
  background-color: var(--color-gray-100);
}

.calendar-day.selected {
  background-color: var(--color-primary-500);
  color: var(--color-white);
}

.calendar-day.has-appointments::after {
  content: '';
  width: 4px;
  height: 4px;
  background-color: var(--color-primary-500);
  border-radius: var(--radius-full);
  margin-top: 2px;
}

/* Appointment Card in Calendar */
.appointment-card {
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-primary-50);
  border-left: 3px solid var(--color-primary-500);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
  cursor: pointer;
  transition: var(--transition-all);
}

.appointment-card:hover {
  background-color: var(--color-primary-100);
  transform: translateX(2px);
}

.appointment-card.confirmed {
  border-left-color: var(--color-success);
  background-color: var(--color-success-light);
}

.appointment-card.pending {
  border-left-color: var(--color-warning);
  background-color: var(--color-warning-light);
}
```

### Data Tables

```css
.table-container {
  overflow-x: auto;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--color-white);
}

.table th {
  padding: var(--space-4);
  text-align: left;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-gray-600);
  background-color: var(--color-gray-50);
  border-bottom: 1px solid var(--color-gray-200);
}

.table td {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-gray-200);
  color: var(--color-gray-700);
}

.table tr:hover td {
  background-color: var(--color-gray-50);
}

.table tr:last-child td {
  border-bottom: none;
}
```

### Modals

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  animation: fadeIn var(--duration-fast) var(--ease-out);
}

.modal {
  background-color: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp var(--duration-normal) var(--ease-out);
}

.modal-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-200);
}

.modal-body {
  padding: var(--space-6);
  overflow-y: auto;
}

.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  background-color: var(--color-gray-50);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Toast Notifications

```css
.toast-container {
  position: fixed;
  top: var(--space-6);
  right: var(--space-6);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  min-width: 300px;
  max-width: 400px;
  animation: slideInRight var(--duration-normal) var(--ease-out);
}

.toast-success {
  border-left: 4px solid var(--color-success);
}

.toast-error {
  border-left: 4px solid var(--color-error);
}

.toast-warning {
  border-left: 4px solid var(--color-warning);
}

.toast-info {
  border-left: 4px solid var(--color-info);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

## Layout Patterns

### Dashboard Layout

```css
.dashboard {
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
}

.sidebar {
  background-color: var(--color-white);
  border-right: 1px solid var(--color-gray-200);
  padding: var(--space-6);
  position: fixed;
  width: 250px;
  height: 100vh;
  overflow-y: auto;
}

.main-content {
  margin-left: 250px;
  padding: var(--space-8);
  background-color: var(--color-gray-50);
  min-height: 100vh;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-8);
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-gray-900);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-8);
}

.stat-card {
  background-color: var(--color-white);
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-gray-900);
  margin-top: var(--space-2);
}

.stat-change {
  font-size: var(--text-sm);
  margin-top: var(--space-2);
}

.stat-change.positive {
  color: var(--color-success);
}

.stat-change.negative {
  color: var(--color-error);
}
```

### Calendar Layout

```css
.calendar-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-6);
  height: calc(100vh - 100px);
}

.calendar-sidebar {
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--space-6);
  overflow-y: auto;
}

.calendar-main {
  background-color: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-gray-200);
}

.calendar-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.calendar-view {
  flex: 1;
  overflow: auto;
  padding: var(--space-4);
}
```

### Mobile Responsive

```css
/* Mobile Breakpoint */
@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .main-content {
    margin-left: 0;
    padding: var(--space-4);
  }

  .calendar-layout {
    grid-template-columns: 1fr;
    height: auto;
  }

  .calendar-sidebar {
    display: none;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .modal {
    width: 95%;
    margin: var(--space-4);
  }

  .table-container {
    font-size: var(--text-sm);
  }

  .table th,
  .table td {
    padding: var(--space-3);
  }
}
```

## Dark Mode Support

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-gray-50: #212529;
    --color-gray-100: #343A40;
    --color-gray-200: #495057;
    --color-gray-300: #868E96;
    --color-gray-400: #ADB5BD;
    --color-gray-500: #CED4DA;
    --color-gray-600: #DEE2E6;
    --color-gray-700: #E9ECEF;
    --color-gray-800: #F1F3F5;
    --color-gray-900: #F8F9FA;

    --color-white: #1a1a1a;
    --color-black: #ffffff;
  }

  .card,
  .modal,
  .toast {
    background-color: var(--color-gray-100);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  }
}
```

## Iconography

**Icon Library**: Lucide React / Heroicons  
**Icon Size Scale**: 16px (sm), 20px (md), 24px (lg), 32px (xl)

**Common Icons**:
- Calendar: `Calendar`
- Clock: `Clock`
- User: `User`, `Users`
- Payment: `CreditCard`, `Wallet`
- Actions: `Edit`, `Trash2`, `Plus`, `Check`, `X`
- Navigation: `ChevronLeft`, `ChevronRight`, `Menu`
- Status: `CheckCircle`, `AlertCircle`, `Info`, `AlertTriangle`

## Accessibility

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Only

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

**Version**: 1.0  
**Last Updated**: 2026-04-14  
**Design Tool**: Figma (link to design system)
