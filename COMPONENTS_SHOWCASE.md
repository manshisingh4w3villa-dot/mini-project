# Premium UI Components Showcase

This file demonstrates how to use the premium UI components and utilities in your application.

## 🎨 Authentication Components

### Login Page
Located at: `src/pages/Login.jsx`

**Features:**
- Gradient background with animated floating elements
- Premium card design with shadow
- Labeled form inputs with focus states
- Error message with shake animation
- Loading spinner on submit

**Usage:**
```jsx
import Login from './pages/Login';
```

### Signup Page
Located at: `src/pages/Signup.jsx`

**Features:**
- Multi-step form layout with first/last name columns
- Beautiful gradient background
- Animated background elements
- Full validation support
- Loading and error states

**Usage:**
```jsx
import Signup from './pages/Signup';
```

## 📊 Dashboard

Located at: `src/App.jsx` (Dashboard component)

**Features:**
- Gradient background
- Responsive card grid
- Animated cards on load
- Hover effects with lift
- Icon-based cards

**Usage:**
```jsx
<Dashboard />
```

## 🧩 Reusable Components

### Form Elements

#### Form Input
```jsx
<div className="form-group">
  <label htmlFor="email">Email Address</label>
  <input
    id="email"
    className="form-input"
    name="email"
    type="email"
    placeholder="you@example.com"
  />
</div>
```

#### Form Button
```jsx
<button type="submit" className="auth-button" disabled={isLoading}>
  {isLoading && <span className="spinner"></span>}
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

#### Error Message
```jsx
{error && <div className="error-message">{error}</div>}
```

### Card Component

#### Basic Card
```jsx
<div className="card">
  <div className="card-icon">📊</div>
  <h3 className="card-title">Title</h3>
  <p className="card-description">Description text here</p>
</div>
```

#### Card with Action
```jsx
<div className="card">
  <h3 className="card-title">Premium Features</h3>
  <p className="card-description">Enjoy exclusive features</p>
  <button className="auth-button">Learn More</button>
</div>
```

### Loading States

#### Spinner
```jsx
<span className="spinner"></span>
```

#### Loading Screen
```jsx
<div style={{
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}}>
  <div style={{ textAlign: 'center' }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '4px solid rgba(255, 255, 255, 0.3)',
      borderTop: '4px solid white',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }}></div>
    <p style={{ color: 'white', marginTop: '20px' }}>Loading...</p>
  </div>
</div>
```

## 🎯 Utility Classes

### Spacing
```jsx
<div className="m-4 p-3">Content with margin and padding</div>
<div className="mt-5 mb-2">Content with top margin and bottom margin</div>
```

### Layout
```jsx
<div className="flex flex-col gap-2">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<div className="grid grid-3 gap-4">
  <div className="card">Card 1</div>
  <div className="card">Card 2</div>
  <div className="card">Card 3</div>
</div>
```

### Typography
```jsx
<h1 className="text-3xl font-bold">Large Heading</h1>
<p className="text-sm text-muted">Small text with muted color</p>
<p className="text-lg font-semibold text-primary">Important text</p>
```

### Animations
```jsx
<div className="animate-slideUp">Content slides up on mount</div>
<div className="animate-fadeIn">Content fades in smoothly</div>
<div className="animate-pulse">Pulsing content</div>
```

### Hover Effects
```jsx
<div className="hover-lift transition">Lifts on hover</div>
<div className="hover-grow transition">Grows on hover</div>
<div className="hover-opacity transition">Fades opacity on hover</div>
```

### Shadows
```jsx
<div className="shadow">Subtle shadow</div>
<div className="shadow-lg">Large shadow</div>
<div className="shadow-xl">Extra large shadow</div>
```

## 🌈 Gradient Backgrounds

### Primary Gradient (Default)
```jsx
<div className="gradient-primary">
  Content with gradient background
</div>
```

### Alternative Gradients
```jsx
<div className="gradient-warm">Warm gradient</div>
<div className="gradient-sunset">Sunset gradient</div>
<div className="gradient-mint">Mint gradient</div>
```

## 🎨 Color Usage

### Text Colors
```jsx
<p className="text-primary">Primary text (dark in light mode, light in dark mode)</p>
<p className="text-accent">Accent color text</p>
<p className="text-muted">Muted secondary text</p>
```

### Background Colors
```jsx
<div style={{ background: 'var(--bg)' }}>Page background</div>
<div style={{ background: 'var(--accent-bg)' }}>Accent background</div>
```

## 🌓 Dark Mode

The entire UI automatically adapts to dark mode based on system preferences:

```css
/* Colors automatically adjust */
@media (prefers-color-scheme: dark) {
  /* Styles are automatically applied */
}
```

No special handling needed in your components!

## 📱 Responsive Design

### Hiding Elements
```jsx
<div className="md-hide">Hidden on mobile</div>
<div className="sm-hide">Hidden on small screens</div>
```

### Grid Responsive
```jsx
<div className="grid grid-4">
  {/* 4 columns on desktop */}
  {/* 2 columns on tablet */}
  {/* 1 column on mobile */}
</div>
```

## 🔄 Common Patterns

### Success Message
```jsx
<div className="error-message" style={{ background: '#d1fae5', borderColor: '#10b981', color: '#065f46' }}>
  ✓ Operation successful
</div>
```

### Warning Message
```jsx
<div className="error-message" style={{ background: '#fef3c7', borderColor: '#f59e0b', color: '#92400e' }}>
  ⚠ Please review your input
</div>
```

### Info Alert
```jsx
<div className="error-message" style={{ background: '#dbeafe', borderColor: '#3b82f6', color: '#1e40af' }}>
  ℹ Helpful information here
</div>
```

### Button Group
```jsx
<div className="flex gap-2">
  <button className="auth-button">Primary Action</button>
  <button className="auth-button" style={{ background: '#6b7280' }}>
    Secondary Action
  </button>
</div>
```

### Form with Multiple Sections
```jsx
<form className="auth-form">
  <div className="form-group">
    <label>Name</label>
    <input className="form-input" />
  </div>
  
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
    <div className="form-group">
      <label>Email</label>
      <input className="form-input" type="email" />
    </div>
    <div className="form-group">
      <label>Phone</label>
      <input className="form-input" type="tel" />
    </div>
  </div>
  
  <button className="auth-button">Submit</button>
</form>
```

## 🚀 Animation Examples

### Stagger Animation
```jsx
<div className="animate-slideUp" style={{ animationDelay: '0s' }}>Item 1</div>
<div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>Item 2</div>
<div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>Item 3</div>
```

### Hover Animation
```jsx
<div
  style={{
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }}
  onMouseEnter={(e) => e.target.style.transform = 'translateY(-4px)'}
  onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
>
  Hover to lift
</div>
```

## 📋 Checklist for New Components

When creating new components, ensure:
- [ ] Use CSS variables for colors
- [ ] Include dark mode support via `@media (prefers-color-scheme: dark)`
- [ ] Add smooth transitions (0.3s duration)
- [ ] Include focus states for accessibility
- [ ] Make components responsive
- [ ] Use semantic HTML
- [ ] Test in both light and dark modes
- [ ] Verify color contrast ratios
- [ ] Add proper spacing using utility classes
- [ ] Include error/loading states

## 🎓 Best Practices

1. **Always use CSS variables** for colors and shadows
2. **Keep animations smooth** with appropriate durations
3. **Ensure accessibility** with proper focus states
4. **Test dark mode** for all new components
5. **Use utility classes** for consistent spacing
6. **Maintain consistent shadows** using the shadow system
7. **Keep components modular** and reusable
8. **Document props and usage** for other developers

## 🔗 Related Files

- [PREMIUM_UI_GUIDE.md](./PREMIUM_UI_GUIDE.md) - Design system overview
- [COLOR_PALETTE.md](./COLOR_PALETTE.md) - Color reference guide
- `src/styles/Auth.css` - Authentication styling
- `src/styles/Dashboard.css` - Dashboard styling
- `src/styles/utilities.css` - Utility classes and animations
- `src/index.css` - Global styles and CSS variables
