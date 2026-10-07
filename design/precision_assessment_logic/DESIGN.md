---
name: Precision Assessment Logic
colors:
  surface: '#f9f9ff'
  surface-dim: '#d3daea'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eefe'
  surface-container-high: '#e2e8f8'
  surface-container-highest: '#dce2f3'
  on-surface: '#151c27'
  on-surface-variant: '#464555'
  inverse-surface: '#2a313d'
  inverse-on-surface: '#ebf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#575e70'
  on-secondary: '#ffffff'
  secondary-container: '#d9dff5'
  on-secondary-container: '#5c6274'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#dce2f7'
  secondary-fixed-dim: '#c0c6db'
  on-secondary-fixed: '#141b2b'
  on-secondary-fixed-variant: '#404758'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f9f9ff'
  on-background: '#151c27'
  surface-variant: '#dce2f3'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-label:
    fontFamily: jetbrainsMono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-padding: 32px
  gutter: 24px
  section-gap: 48px
  sidebar-width: 260px
  sidebar-collapsed: 72px
---

## Brand & Style

The design system is built for an Online Test Platform that demands high cognitive focus and absolute clarity. The brand personality is professional, systematic, and unobtrusive, positioning itself as a high-performance tool rather than a decorative interface.

The visual style is **Modern Minimalist**, drawing inspiration from utility-first developer tools. It utilizes a "Layered White" aesthetic where depth is communicated through subtle tonal shifts and thin borders rather than heavy shadows. The UI stays out of the way of the content (the tests), ensuring that students and administrators can navigate complex data or intense examination environments without visual fatigue. Key traits include expansive whitespace, razor-sharp alignment, and a strict adherence to functional hierarchy.

## Colors

The palette is anchored by a neutral foundation to maintain a "paper-like" quality for reading and assessment. 

- **Primary (Deep Indigo):** Reserved for primary actions, focus states, and progress indicators. It should be used sparingly to maintain its impact.
- **Surface & Background:** A subtle distinction between the page background (#FAFAFA) and content cards (#FFFFFF) creates a natural hierarchy without requiring heavy shadows.
- **Borders:** All structural divisions use a consistent #E5E7EB grey, providing a framework that feels organized and precise.
- **Semantic Colors:** Success, Warning, and Error colors are used exclusively for status badges (e.g., "Passed"), validation messages, and destructive actions.

## Typography

This design system uses **Inter** for all UI elements to ensure maximum legibility across all screen densities. The typographic scale is tightly controlled to prevent "font-size sprawl."

- **Headlines:** Use a tighter letter-spacing and heavier weights to create a strong visual anchor.
- **Body Text:** Standardized at 16px for readability in long-form questions, while 14px is used for dense metadata and sidebars.
- **Monospace (Optional):** JetBrains Mono can be used for "Time Remaining" counters or specific ID strings (like Test Codes) to give a technical, precise feel.
- **Labels:** Small, all-caps labels are used for section headers in the sidebar and table headers to distinguish them from interactive data.

## Layout & Spacing

The layout follows a systematic **12-column grid** for desktop, transitioning to a single-column stack on mobile. 

- **The Workspace Model:** Use a fixed-width central container (max-width: 1200px) for the actual test-taking interface to limit line length and improve focus. 
- **The Dashboard Model:** Use a fluid grid for administrative views (tables, analytics) to utilize full-screen real estate.
- **Spacing Rhythm:** All spacing increments are multiples of 4px. Use 32px for primary page margins and 24px for gutters between cards.
- **Sidebar:** The sidebar is the primary navigation hub. It should be collapsible to a 72px "icon-only" rail to maximize workspace when the user is in "deep work" or "test mode."

## Elevation & Depth

Depth is achieved through **Tonal Layering** rather than traditional physical shadows.

- **Level 0 (Base):** #FAFAFA. The foundational layer for the entire application window.
- **Level 1 (Card):** #FFFFFF with a 1px #E5E7EB border. Used for the primary content areas, question blocks, and table containers.
- **Level 2 (Overlay):** #FFFFFF with a 1px border and a very soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)). Used for dropdowns, modals, and tooltips.
- **Interactive State:** On hover, cards or list items should transition their border color to a slightly darker grey (#D1D5DB) or the primary color, rather than increasing shadow depth.

## Shapes

The shape language is refined and consistent, moving away from sharp industrial corners toward a more approachable but still professional "soft-square" aesthetic.

- **Primary Elements:** Buttons, input fields, and standard cards use the 8px (0.5rem) radius.
- **Large Containers:** Modals and large feature sections use the 16px (1rem) radius.
- **Status Badges:** Use a "Pill" shape (full rounding) to clearly distinguish them from interactive buttons or input fields.

## Components

### Buttons
- **Primary:** Solid #4F46E5 background, white text. No gradient. 8px corner radius.
- **Secondary:** White background, 1px #E5E7EB border, #111827 text.
- **Tertiary/Ghost:** No background or border. Primary color text. Used for "Cancel" or less frequent actions.

### Tables
- **Structure:** No vertical borders. Only horizontal 1px #E5E7EB lines.
- **Header:** Background #F9FAFB, label-caps typography, 12px vertical padding.
- **Row Hover:** Transition background to #F9FAFB to indicate interactivity.
- **Status Badges:** Subtle background tints (e.g., Success: 10% opacity Green background with 100% opacity Green text).

### Form Fields
- **Inputs:** 1px #E5E7EB border that transitions to 1px #4F46E5 on focus with a 2px semi-transparent indigo ring (focus-ring).
- **Labels:** 14px Medium weight, positioned 8px above the input.
- **Help Text:** 12px #6B7280, positioned 4px below the input.

### Sidebar
- **Items:** 14px height, 8px horizontal padding. Active state uses a subtle #EEF2FF background and a 2px vertical "indicator" on the left edge in Primary Indigo.
- **Icons:** Simple 20px stroke-based icons (e.g., Lucide or Heroicons) with a 1.5px stroke width.

### Cards
- **Container:** White background, 1px #E5E7EB border, 8px-12px roundedness.
- **Header:** Optional header section with a bottom border to separate title from content.