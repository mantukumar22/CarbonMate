# Contributing to CarbonMate 🌿

Thank you for your interest in contributing to CarbonMate! We want to make contributing as easy and safe as possible. Below is a guide on our design guidelines, tech stack structure, and code submission rules.

---

## 🏗️ Code Quality Guidelines

1. **Keep Components Small & Focused**: To limit file size and maintain readability, visual components should target under 150 lines of code. If a component grows too complex, extract child components to dedicated subfiles.
2. **Strict TypeScript Typing**:
   - Explicitly type all functional components and handlers.
   - Always declare logical return type structures for helper utilities.
   - Standard React components returning JSX elements must use the `React.JSX.Element` return type.
3. **Use Tailwind Directly**: Avoid writing custom external CSS or mixing in styled-components, stick entirely to Tailwind utility classes.
4. **Icons**: Use icons exclusively from `lucide-react`.

---

## ⚡ Architecture Best Practices

### 🔄 Optimistic State Syncing
All mutation triggers (creating/deleting logs, profile preference updates) must follow an optimistic update pattern:
1. Mutate local React state instantly.
2. Commit background write intents using `withRetry` (exponential backoff helper).
3. If background tasks fail entirely across all attempts, roll back the local state elegantly and notify the user via a persistent Toast.

### 📶 Offline First Capabilities
Firestore must remain resilient online or offline:
- Use `persistentLocalCache` configuration to cache documents inside indexedDB persistent cache.
- Mirror active items in browser `localStorage` as local fallback arrays to enforce high availability when offline.

---

## 💻 Sandbox Development Setup

### 1. Verification Checking
Always run linter and compiler validations before submitting code changes:
```bash
# Validate linter specifications
npm run lint

# Compile and check TypeScript types
npm run build
```

### 2. Live Dev Server
The full-stack Express + Vite environment runs on port `3000`:
```bash
npm run dev
```

---

## 🚀 Branching & Committing

- Write clean, descriptive and imperative commit messages (e.g., `feat: integrate timezone safe streak tracker hook`).
- Prioritize visual quality, accessible markup, and rigorous error safety above all.

Thank you for helping us clean up Earth's carbon footprint! 🌍✨
