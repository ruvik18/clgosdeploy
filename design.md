# CounselIQ Design System Spec

This document details the typography, layout constraints, and color palette configured for CounselIQ.

## Typography

### Font Families
*   **Sans-Serif (Default)**: `'PP Neue Montreal'`, sans-serif
    *   *Thin*: Weight `100` (Normal)
    *   *Book*: Weight `300` (Normal)
    *   *Medium*: Weight `500` (Normal)
    *   *Bold*: Weight `700` (Normal)
    *   *Italic*: Weight `400` (Italic)
    *   *Semibold Italic*: Weight `600` (Italic)
*   **Serif**: `Georgia`, serif
*   **Monospace**: `'Fragment Mono'`, monospace

---

### Text Sizing Classes
Use these class utilities for custom display headers, labels, and data points.

| Class | Font Family | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `.text-display-xl` | Sans-Serif | `56px` | `500` | `67.2px` | `-0.56px` |
| `.text-display-l` | Sans-Serif | `54px` | `500` | `59.4px` | `-0.54px` |
| `.text-display-m` | Sans-Serif | `48px` | `500` | `57.6px` | `-0.48px` |
| `.text-display-s` | Sans-Serif | `40px` | `500` | `44.0px` | `-0.40px` |
| `.text-heading` | Sans-Serif | `30px` | `600` | `30.0px` | `-0.90px` |
| `.text-body-large` | Sans-Serif | `16px` | `500` | `24.0px` | `+0.16px` |
| `.text-body-base` | Sans-Serif | `14px` | `500` | `21.0px` | `+0.14px` |
| `.text-label` | Sans-Serif | `12px` | `400` | *Auto* | *Auto* |
| `.text-label-bold` | Sans-Serif | `12px` | `700` | *Auto* | *Auto* |
| `.text-data-small` | Monospace | `8.41px` | `400` | `10.09px` | *Auto* |
| `.text-data-base` | Monospace | `12.62px` | `400` | `15.14px` | *Auto* |
| `.text-data-large` | Monospace | `14px` | `400` | `21.0px` | *Auto* |

---

## Color Palette

The system defines colors in HSL formats under custom variables and maps them directly to Shadcn / Tailwind color schemes.

### Core HSL Variables

| Variable | Coordinate (H S L) | Hex Equiv. | Description / Use Case |
| :--- | :--- | :--- | :--- |
| `--primary` | `219 100% 52%` | `#0B5FFF` | Primary actions and links |
| `--primary-hover` | `221 93% 43%` | `#0848d1` | Primary action hover states |
| `--accent` | `263 83% 58%` | `#7C3AED` | Highlights and important CTAs |
| `--neutral-900` | `222 47% 11%` | `#0F172A` | Main body text |
| `--neutral-700` | `215 25% 27%` | `#334155` | Secondary text |
| `--neutral-300` | `214 32% 84%` | `#CBD5E1` | Borders, subtle card frames |
| `--success` | `161 84% 39%` | `#10B981` | Positive states (NAAC Grades, etc.) |
| `--warning` | `38 92% 50%` | `#F59E0B` | Alert / caution notifications |
| `--danger` | `0 84% 60%` | `#EF4444` | Destructive states / critical flags |

---

### Shadcn Custom Color Mapping

#### Light Mode (`:root`)
*   **Background (`--background`)**: Soft Cream (`30 33% 96%` / `#f8f4f0`)
*   **Foreground (`--foreground`)**: Neutral-900 (`--neutral-900`)
*   **Primary (`--primary`)**: Primary Blue (`--primary`)
*   **Primary Foreground (`--primary-foreground`)**: White (`#ffffff`)
*   **Secondary (`--secondary`)**: Neutral-300 (`--neutral-300`)
*   **Secondary Foreground (`--secondary-foreground`)**: Neutral-900 (`--neutral-900`)
*   **Card Background (`--card`)**: White (`#ffffff`)
*   **Card Foreground (`--card-foreground`)**: Neutral-900 (`--neutral-900`)
*   **Border (`--border`)**: Neutral-300 (`--neutral-300`)
*   **Accent (`--accent`)**: Purple Accent (`--accent`)
*   **Accent Foreground (`--accent-foreground`)**: White (`#ffffff`)

#### Dark Mode (`.dark`)
*   **Background (`--background`)**: Neutral-900 (`--neutral-900`)
*   **Foreground (`--foreground`)**: Neutral-300 (`--neutral-300`)
*   **Primary (`--primary`)**: Primary Blue (`--primary`)
*   **Primary Foreground (`--primary-foreground`)**: White (`#ffffff`)
*   **Secondary (`--secondary`)**: Neutral-700 (`--neutral-700`)
*   **Secondary Foreground (`--secondary-foreground`)**: Neutral-300 (`--neutral-300`)
*   **Card Background (`--card`)**: Neutral-700 (`--neutral-700`)
*   **Card Foreground (`--card-foreground`)**: Neutral-300 (`--neutral-300`)
*   **Border (`--border`)**: Neutral-700 (`--neutral-700`)
*   **Accent (`--accent`)**: Purple Accent (`--accent`)
*   **Accent Foreground (`--accent-foreground`)**: White (`#ffffff`)

---

## Utility Classes
*   **Marquee Scroll**: `.animate-marquee` (Translates content continuously horizontally)
*   **Focus Ring**: `.focus-ring-lavender` (Adds custom inner-box-shadow with soft lavender)
*   **Subtle Shadow**: `.shadow-subtle` (Sets high-end subtle elevation borders)
