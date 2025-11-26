# Lumia UI Design System

A framework-aware, Next.js-first design system published as an independent NPM package for use across multiple admin and internal tools. This is the Lumia UI design-system library.

> **Note:** This README is a structural skeleton. Fill in details as features are implemented.

---

## 1. Overview

- Short description of the design system
- Intended consumers (admin apps, internal tools, public dashboards)
- High-level feature list (components, validation layer, layouts, dynamic route renderer)

---

## 2. Goals & Principles

- Primary goals of the design system
- Design and UX principles (consistency, accessibility, performance, etc.)
- Non-goals and explicit scope boundaries

---

## 3. Architecture

### 3.1. Tech Stack

- Core technologies used (React, TypeScript, Tailwind, shadcn, etc.)
- Supported React/Next.js versions
- Peer dependency expectations

### 3.2. Package Structure

- High-level folder structure inside the package:
  - `@lumia/tokens` — design tokens and token utilities
  - `@lumia/theme` — React ThemeProvider to apply token CSS variables
  - `@lumia/runtime` — runtime schemas for pages/blocks/resources
  - `@lumia/components` — React components (currently a `Hello` placeholder to validate build/test harness)
  - `@lumia/icons` — in-memory icon registry that maps string IDs to SVG React components
- Naming conventions for components, hooks, and utilities
- Separation of:
  - Core components
  - Form/validation layer
  - Layouts
  - Router utilities
  - Theme and tokens

### 3.3. Consumption Model

- How this package is meant to be consumed in other apps
- Responsibilities of the consuming app vs the design system
- Constraints (for example: assumes Tailwind is present, assumes React 18, etc.)

---

## 4. Getting Started (Consumer App)

### 4.1. Installation

- NPM/Yarn/PNPM install commands
- Required peer dependencies

### 4.2. Minimal Setup Steps

- Tailwind configuration requirements (at a high level)
- Global styles and tokens
- Wrap the app with `ThemeProvider` from `@lumia/theme`, passing a `ThemeTokens` object (for example `defaultTheme` from `@lumia/tokens`) so CSS variables land on `document.documentElement`
- Environment assumptions (SSR/CSR, Next.js app/router notes)

### 4.3. First Integration Checklist

- Verify Tailwind + tokens loaded correctly
- Render a basic page using design system primitives
- Confirm dark/light theme (if applicable)

---

## 5. Core Building Blocks

### 5.1. Component Library

- Types of components provided (buttons, inputs, overlays, navigation, feedback, etc.)
- Naming and usage conventions
- Guidelines for when to extend vs when to wrap at app level

### 5.2. Form & Validation Layer

- Concept of validation configuration per field
- Passing validation arrays into components
- Shared validation rules and utilities
- How error states and messages are surfaced

### 5.3. Layout System

- Available layout primitives (app shell, auth shell, minimal shell, etc.)
- Composition pattern (header, sidebar, content, page header, sections)
- How layouts relate to routing and navigation

### 5.4. Dynamic Route Renderer

- Route definition shape (id, path, layout, nav metadata, permission codes)
- How the renderer chooses layouts and builds navigation
- Integration points with RBAC/permissions (high level)
- Extensibility / customization points

---

## 6. Design Tokens & Theming

- Color system overview
- Typography scale and usage guidelines
- Spacing, radii, elevation tokens
- Theming model (light/dark or multi-theme support)
- How apps can override or extend tokens safely

---

## 7. Usage Patterns & Best Practices

- Recommended approach for building new screens
- Guidelines for consistent forms and error handling
- Accessibility expectations and patterns
- Performance considerations (lazy loading, tree-shaking expectations)
- Versioning and handling breaking changes in consuming apps

---

## 8. Internal Development Guide (For Contributors)

### 8.1. Local Development

- How to run story/docs app (if any)
- How to link this package to a test consumer app

### 8.2. Code Standards

- Linting and formatting rules
- TypeScript strictness expectations
- Testing approach (unit, visual, or snapshot tests)

### 8.3. Adding New Components

- Steps to scaffold a new component
- Requirements before merging (docs, stories, tests)
- API design checklist (props, naming, accessibility)

### 8.4. Release & Publishing Process

- Versioning strategy (semver rules)
- Changelog requirements
- Publishing steps to NPM and tagging in Git

### 8.5. Resource Scaffolding CLI

- Generate a new resource config with `pnpm --filter @lumia/cli exec lumia-resource <resource-name>`.
- The command creates `src/resources/<resource-name>.resource.ts` in the current working directory with a `defineResource` template; fill in pages, fields, and data fetchers, then run type-check/build to confirm it compiles.

---

## 9. Roadmap

- Short-term planned components and utilities
- Future improvements (better docs, theming, integrations)
- Ideas under consideration but not yet committed

---

## 10. FAQ

- Common questions from consumer apps
- Troubleshooting known issues (build, styles, theming)
- Where to ask for help or request features

---

## 11. License & Ownership

- License type
- Copyright and ownership details
- Internal vs open-source usage notes (if applicable)
