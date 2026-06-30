# Dependencies Documentation

This document provides detailed information about all dependencies used in the Spenza (Group Expense Splitter) project.

## 📦 Production Dependencies

### Core Framework & Runtime

- **next** (15.4.7) - React framework with server-side rendering, routing, and optimization
- **react** (19.1.0) - JavaScript library for building user interfaces
- **react-dom** (19.1.0) - React package for working with the DOM

### UI Components & Styling

- **@radix-ui/react-dialog** (^1.1.15) - Accessible dialog/modal primitives
- **@radix-ui/react-popover** (^1.1.15) - Accessible popover primitives
- **@radix-ui/react-select** (^2.2.6) - Accessible select/dropdown primitives
- **@radix-ui/react-tabs** (^1.1.13) - Accessible tabs primitives
- **@radix-ui/react-toast** (^1.2.15) - Accessible toast notification primitives
- **@radix-ui/react-tooltip** (^1.2.8) - Accessible tooltip primitives
- **@mui/material** (^7.3.4) - Material-UI React components
- **@mui/icons-material** (^7.3.4) - Material Design icons as React components
- **@emotion/react** (^11.14.0) - CSS-in-JS library for styling components
- **@emotion/styled** (^11.14.1) - Styled components API for Emotion

### Styling & CSS Utilities

- **class-variance-authority** (^0.7.1) - Utility for creating CSS class variants
- **clsx** (^2.1.1) - Utility for constructing className strings conditionally

### Animation & Motion

- **framer-motion** (^12.23.12) - Production-ready motion library for React

### Icons & Graphics

- **lucide-react** (^0.540.0) - Beautiful & consistent icon toolkit

### Backend & Database

- **@supabase/supabase-js** (^2.75.0) - JavaScript client for Supabase

### UI Enhancements

- **vaul** (^1.1.2) - Drawer component for mobile interfaces

### Validation & Type Safety

- **zod** (^4.0.17) - TypeScript-first schema validation with static type inference

## 🛠 Development Dependencies

### Testing Framework & Utilities

- **vitest** (^3.2.4) - Fast unit test framework powered by Vite
- **@vitest/ui** (^3.2.4) - UI for Vitest test runner
- **@vitejs/plugin-react** (^5.0.1) - Official Vite plugin for React
- **jsdom** (^26.1.0) - Pure JavaScript implementation of WHATWG DOM and HTML standards

### Testing Libraries

- **@testing-library/react** (^16.3.0) - Testing utilities for React components
- **@testing-library/jest-dom** (^6.7.0) - Custom Jest matchers for DOM elements
- **@testing-library/user-event** (^14.6.1) - Fire events the same way the user does
- **jest-axe** (^10.0.0) - Custom Jest matcher for accessibility testing

### Code Quality & Linting

- **eslint** (^9) - Pluggable JavaScript linter
- **eslint-config-next** (15.4.7) - ESLint configuration for Next.js
- **@eslint/eslintrc** (^3) - ESLint configuration utilities

### Styling & CSS

- **tailwindcss** (^4) - Utility-first CSS framework
- **@tailwindcss/postcss** (^4) - PostCSS plugin for Tailwind CSS

## 📋 Dependency Categories

### Essential Dependencies (Cannot be removed)

- **next, react, react-dom** - Core framework
- **@supabase/supabase-js** - Database and authentication
- **zod** - Data validation
- **lucide-react** - Icons

### UI Framework Dependencies

- **@radix-ui/\*** - Accessible component primitives
- **@mui/\*** - Material-UI components and icons
- **@emotion/\*** - CSS-in-JS styling
- **framer-motion** - Animations
- **vaul** - Mobile drawer component

### Development Dependencies

- **vitest, @testing-library/\*** - Testing framework
- **eslint** - Code quality
- **tailwindcss** - Styling framework

### Utility Dependencies

- **class-variance-authority** - CSS class management
- **clsx** - Conditional CSS classes

## 🔄 Dependency Update Strategy

### Regular Updates (Monthly)

- **@testing-library/\*** - Testing utilities
- **eslint-config-next** - Next.js ESLint config
- **@vitest/ui** - Testing UI

### Careful Updates (Quarterly)

- **next** - Major framework updates
- **react, react-dom** - Core React updates
- **@radix-ui/\*** - UI primitive updates
- **framer-motion** - Animation library updates

### Conservative Updates (As Needed)

- **@supabase/supabase-js** - Backend client updates
- **tailwindcss** - CSS framework updates
- **zod** - Validation library updates

## 🚨 Critical Dependencies

### Security-Critical

- **@supabase/supabase-js** - Handles authentication and data security
- **zod** - Input validation and sanitization
- **next** - Server-side security and routing

### Performance-Critical

- **next** - Bundle optimization and performance
- **framer-motion** - Animation performance
- **react, react-dom** - Core rendering performance

### Accessibility-Critical

- **@radix-ui/\*** - Accessible component behavior
- **jest-axe** - Accessibility testing

## 📊 Bundle Size Impact

### Large Dependencies (>50KB)

- **@mui/material** (~200KB) - Material-UI components
- **framer-motion** (~150KB) - Animation library
- **@supabase/supabase-js** (~100KB) - Supabase client
- **next** (~80KB) - Next.js runtime

### Medium Dependencies (10-50KB)

- **@radix-ui/\*** (~30KB total) - UI primitives
- **@emotion/\*** (~25KB) - CSS-in-JS
- **lucide-react** (~20KB) - Icons
- **zod** (~15KB) - Validation

### Small Dependencies (<10KB)

- **clsx** (~2KB) - CSS utilities
- **class-variance-authority** (~3KB) - Class variants
- **vaul** (~5KB) - Drawer component

## 🔧 Optimization Strategies

### Bundle Optimization

- **Tree Shaking**: Enabled for all dependencies
- **Code Splitting**: Route-based splitting with Next.js
- **Dynamic Imports**: Lazy loading for non-critical components
- **Package Optimization**: Using optimizePackageImports in Next.js config

### Performance Monitoring

- **Bundle Analyzer**: Regular bundle size analysis
- **Dependency Audit**: Monthly security and performance audits
- **Update Testing**: Comprehensive testing before dependency updates

## 🚀 Future Dependency Considerations

### Potential Additions

- **@tanstack/react-query** - Server state management
- **react-hook-form** - Form management
- **date-fns** - Date manipulation utilities
- **recharts** - Advanced charting library

### Potential Removals

- **@mui/material** - Could be replaced with custom Radix UI components
- **@emotion/\*** - Could migrate to pure Tailwind CSS
- **vaul** - Could be replaced with custom drawer implementation

### Migration Paths

- **Tailwind CSS v5** - When available, migrate from v4
- **React 20** - When stable, upgrade from React 19
- **Next.js 16** - When released, upgrade from Next.js 15

## 📝 Dependency Management Best Practices

### Version Management

- Use exact versions for critical dependencies
- Use caret ranges (^) for development dependencies
- Pin versions for security-critical packages

### Security

- Regular `npm audit` checks
- Automated dependency updates with testing
- Monitor for security advisories

### Performance

- Regular bundle size monitoring
- Lazy loading for large dependencies
- Tree shaking verification

### Maintenance

- Monthly dependency review
- Quarterly major version updates
- Annual dependency architecture review

---

This documentation should be updated whenever dependencies are added, removed, or significantly updated.
