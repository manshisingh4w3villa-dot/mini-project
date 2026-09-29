# Premium UI Color Palette

## Primary Colors

### Gradient (Main Brand)
- **Start**: `#667eea` (Soft Blue/Purple)
- **End**: `#764ba2` (Deep Purple)
- **Usage**: Buttons, links, accents, primary CTAs

### Dark Theme Accent
- **Color**: `#a78bfa` (Light Purple)
- **Usage**: Links and accents in dark mode

## Neutral Colors

### Light Mode
| Name | Color | RGB | Usage |
|------|-------|-----|-------|
| Text Primary | `#1f2937` | rgb(31, 41, 55) | Headings, primary text |
| Text Secondary | `#6b7280` | rgb(107, 114, 128) | Body text, descriptions |
| Background | `#f9fafb` | rgb(249, 250, 251) | Page background |
| Surface | `#ffffff` | rgb(255, 255, 255) | Cards, panels |
| Border | `#e5e7eb` | rgb(229, 231, 235) | Dividers, borders |
| Code Background | `#f3f4f6` | rgb(243, 244, 246) | Code blocks, code snippets |

### Dark Mode
| Name | Color | RGB | Usage |
|------|-------|-----|-------|
| Text Primary | `#f3f4f6` | rgb(243, 244, 246) | Headings, primary text |
| Text Secondary | `#d1d5db` | rgb(209, 213, 219) | Body text, descriptions |
| Background | `#111827` | rgb(17, 24, 39) | Page background |
| Surface | `#1f2937` | rgb(31, 41, 55) | Cards, panels |
| Border | `#374151` | rgb(55, 65, 81) | Dividers, borders |
| Code Background | `#1f2937` | rgb(31, 41, 55) | Code blocks, code snippets |

## Semantic Colors

### Status Colors
| Status | Color | RGB | Usage |
|--------|-------|-----|-------|
| Success | `#10b981` | rgb(16, 185, 129) | Success messages, checkmarks |
| Warning | `#f59e0b` | rgb(245, 158, 11) | Warnings, cautions |
| Error | `#ef4444` | rgb(239, 68, 68) | Errors, alerts, deletions |
| Info | `#3b82f6` | rgb(59, 130, 246) | Information, help text |

### Extended Accent Colors
| Name | Color | RGB | Usage |
|------|-------|-----|-------|
| Accent Light | `rgba(102, 126, 234, 0.1)` | - | Background for accent elements |
| Accent Border | `rgba(102, 126, 234, 0.5)` | - | Borders with accent color |
| Accent Dark | `#764ba2` | rgb(118, 75, 162) | Darker accent for hover states |

## Shadow System

### Light Mode
```
sm: rgba(0, 0, 0, 0.05) 0 1px 2px
md: rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px
lg: rgba(0, 0, 0, 0.1) 0 20px 25px -5px
xl: rgba(0, 0, 0, 0.3) 0 20px 60px
```

### Dark Mode
```
sm: rgba(0, 0, 0, 0.3) 0 1px 2px
md: rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px
lg: rgba(0, 0, 0, 0.3) 0 20px 25px -5px
xl: rgba(0, 0, 0, 0.6) 0 20px 60px
```

## Color Combinations

### Button Gradients
```
Primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Warm: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)
Sunset: linear-gradient(135deg, #fa709a 0%, #fee140 100%)
Mint: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)
Cool: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

### Text on Colors
- **On Primary Gradient**: Use white (`#ffffff`) for best contrast
- **On Surface**: Use text-primary (`#1f2937` light, `#f3f4f6` dark)
- **On Neutral**: Use text-secondary or text-primary based on surface

## Accessibility

### Contrast Ratios
All color combinations meet WCAG AA standards:
- **Minimum ratio**: 4.5:1 for normal text
- **Large text**: 3:1 minimum
- **Error**: 7:1+ for status indicators

### Color Blindness
- Avoid red/green only combinations
- Use status icons in addition to color
- Test with color blindness simulators

## Usage Guidelines

### When to Use Each Color

#### Primary Accent (`#667eea` - `#764ba2`)
- Main call-to-action buttons
- Active states
- Primary navigation
- Links
- Focus states

#### Text Colors
- **Primary Text**: Headers, important information
- **Secondary Text**: Descriptions, body text
- **Muted Text**: Hints, placeholders, disabled states

#### Semantic Colors
- **Success**: Confirmation messages, successful operations
- **Warning**: Cautions, important notices
- **Error**: Error messages, deletions, failures
- **Info**: Helpful information, tooltips

## CSS Variables Reference

```css
:root {
  /* Neutral */
  --text: #6b7280;          /* Body text */
  --text-h: #1f2937;        /* Headings */
  --bg: #f9fafb;            /* Background */
  --border: #e5e7eb;        /* Borders */
  
  /* Accent */
  --accent: #667eea;        /* Primary accent */
  --accent-bg: rgba(102, 126, 234, 0.1);
  --accent-border: rgba(102, 126, 234, 0.5);
  
  /* Shadow */
  --shadow: rgba(0, 0, 0, 0.1) 0 10px 15px -3px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --text: #d1d5db;
    --text-h: #f3f4f6;
    --bg: #111827;
    --border: #374151;
    --accent: #a78bfa;
    --accent-bg: rgba(167, 139, 250, 0.1);
    --accent-border: rgba(167, 139, 250, 0.5);
  }
}
```

## Color Transitions & Animations

All color transitions use:
- **Duration**: 0.3s
- **Timing**: cubic-bezier(0.4, 0, 0.2, 1)
- **Example**: `transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);`

## Testing Colors

- Use WebAIM Contrast Checker for accessibility
- Test with ColorBlind Web Page Filter
- Verify in both light and dark modes
- Test on various devices and screens
