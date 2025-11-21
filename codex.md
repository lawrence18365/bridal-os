# Codex Design Loop - Bridal OS Landing Page

## Overview
This document defines the AI-driven design loop methodology for iteratively improving the Bridal OS landing page through visual testing, feedback, and refinement.

## Design Loop Methodology

### 1. **Capture Current State**
Use Playwright MCP to take screenshots of the current landing page across different viewport sizes:
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

### 2. **Define Design Goals**
Document specific visual and UX improvements to be made based on:
- Conversion rate optimization principles
- Modern bridal industry design trends
- User experience best practices
- Brand consistency guidelines

### 3. **Implement Changes**
Make targeted code changes to React components, Tailwind CSS classes, and layout structures.

### 4. **Visual Diff Comparison**
- Take new screenshots after implementation
- Generate visual diff images using Pixelmatch
- Identify unintended changes or regressions
- Validate that intended changes are visible

### 5. **Iterate Based on Feedback**
- Review visual diffs
- Refine implementation based on discrepancies
- Re-test until design goals are achieved
- Document successful patterns

### 6. **Validate Cross-Browser**
- Test in Chrome, Firefox, Safari
- Verify responsive behavior
- Check accessibility standards
- Validate performance metrics

## Current Landing Page Architecture

### File Structure
```
app/page.tsx                 - Main landing page component
components/ROICalculator.tsx - Interactive ROI calculator widget
app/pricing/page.tsx         - Pricing page
app/onboarding/page.tsx      - Post-signup onboarding flow
```

### Key Sections
1. **Hero Section** (lines 103-237)
   - Badge: "Trusted by 100+ bridal boutiques"
   - Headline: "Your bridal studio's calm command center"
   - Two CTAs: "Start 14-Day Free Trial" + "View sample workspace"
   - Stats cards: 98% portal engagement, 60% admin time saved

2. **Product Demo** (lines 163-237)
   - Visual mockup showing dashboard UI
   - Status indicators, appointment cards, reminders

3. **Features Grid** (lines 241-347)
   - 3 main features with icons and descriptions
   - Calendar, automation, analytics focus

4. **How It Works** (lines 350-395)
   - 3-step process explanation
   - Onboard → Automate → Grow

5. **Social Proof CTA** (lines 398-413)
   - Final conversion section
   - Two CTAs: "Start Free Trial" + "Explore the product"

6. **ROI Calculator** (line 417-421)
   - Interactive sliders for brides/month, hours/bride, hourly rate
   - Real-time calculations

7. **Comparison Table** (lines 424-566)
   - Bridal OS vs Spreadsheets vs Generic CRM
   - 9 feature comparisons

8. **FAQ Section** (lines 569-611)
   - 6 common questions with detailed answers

## Design Principles for Bridal Industry

### Visual Identity
- **Color Palette**: Rose (primary), Stone (neutral), Emerald (success), Amber (accent)
- **Typography**: Serif for headings (elegant), Sans-serif for body (readable)
- **Spacing**: Generous whitespace to convey luxury and calm
- **Shadows**: Soft, rose-tinted shadows for depth

### UX Patterns
- **Progressive Disclosure**: Show complexity gradually
- **Trust Signals**: Social proof, testimonials, security badges
- **Emotional Design**: Warm, welcoming, professional
- **Clarity Over Cleverness**: Direct messaging, clear CTAs

### Conversion Optimization
- **Above-the-Fold**: Value proposition + CTA within 3 seconds
- **F-Pattern Layout**: Important info along left side and top
- **Visual Hierarchy**: Size, contrast, whitespace guide attention
- **Scarcity/Urgency**: Limited trial period, early adopter benefits

## Playwright MCP Tools Available

### Navigation & Interaction
- `browser_navigate(url)` - Navigate to a URL
- `browser_click(selector)` - Click an element
- `browser_fill(selector, value)` - Fill form fields
- `browser_scroll(direction, amount)` - Scroll page

### Visual Testing
- `browser_take_screenshot(path, fullPage)` - Capture screenshot
- `browser_resize(width, height)` - Set viewport size
- `browser_get_console_logs()` - Check for errors

### Inspection
- `browser_evaluate(expression)` - Run JavaScript
- `browser_get_element(selector)` - Get element details

## Visual Diff Process

### Setup
```bash
# Install dependencies
npm install pixelmatch pngjs --save-dev
```

### Compare Images Script
```typescript
// scripts/compare-images.ts
import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const img1 = PNG.sync.read(fs.readFileSync('baseline.png'));
const img2 = PNG.sync.read(fs.readFileSync('current.png'));
const { width, height } = img1;
const diff = new PNG({ width, height });

const numDiffPixels = pixelmatch(
  img1.data,
  img2.data,
  diff.data,
  width,
  height,
  { threshold: 0.1 }
);

fs.writeFileSync('diff.png', PNG.sync.write(diff));
console.log(`Diff pixels: ${numDiffPixels}`);
```

### Workflow Commands
```bash
# 1. Capture baseline
npx playwright screenshot http://localhost:3000 baseline.png --full-page

# 2. Make code changes
# (edit app/page.tsx)

# 3. Capture current state
npx playwright screenshot http://localhost:3000 current.png --full-page

# 4. Generate visual diff
tsx scripts/compare-images.ts

# 5. Review diff.png to validate changes
```

## Design Goals for Landing Page Improvement

### Priority 1: Hero Section Enhancement
- [ ] Add subtle animation to hero section (fade-in, slide-up)
- [ ] Improve visual hierarchy of CTAs (primary vs secondary)
- [ ] Add testimonial quote from real boutique owner
- [ ] Optimize hero image/demo mockup for faster load

### Priority 2: Trust & Social Proof
- [ ] Add customer logos (with permission)
- [ ] Include case study snippet with metrics
- [ ] Display recent signup activity counter
- [ ] Add security/compliance badges (SOC2, GDPR)

### Priority 3: Visual Polish
- [ ] Refine gradient backgrounds for consistency
- [ ] Ensure consistent border-radius across components
- [ ] Optimize spacing rhythm (8px base grid)
- [ ] Add subtle micro-interactions on hover states

### Priority 4: Mobile Optimization
- [ ] Test all sections on mobile viewport
- [ ] Ensure touch targets are 44px minimum
- [ ] Optimize image sizes for mobile bandwidth
- [ ] Simplify comparison table for mobile view

### Priority 5: Performance
- [ ] Lazy load below-fold images
- [ ] Optimize font loading (preload, subset)
- [ ] Minimize layout shift (CLS)
- [ ] Ensure LCP under 2.5s

## Success Metrics

### Visual Quality
- Consistent spacing and alignment
- No layout shift during load
- Smooth animations (60fps)
- Readable typography (WCAG AA)

### Conversion Indicators
- Clear value proposition in 3 seconds
- Prominent CTA buttons
- Trust signals visible above fold
- Mobile-friendly forms

### Technical Performance
- Lighthouse score > 90
- Core Web Vitals pass
- No console errors
- Accessible (WCAG AA)

## Iteration Log Template

### Iteration N - [Date]
**Goal**: [What are we trying to improve?]

**Changes Made**:
- [ ] Change 1
- [ ] Change 2
- [ ] Change 3

**Visual Diff Results**:
- Diff pixels: [number]
- Intended changes: [confirmed/needs adjustment]
- Unintended changes: [none/list issues]

**Next Steps**:
- [ ] Action 1
- [ ] Action 2

**Screenshots**:
- Baseline: `screenshots/baseline-iteration-N.png`
- Current: `screenshots/current-iteration-N.png`
- Diff: `screenshots/diff-iteration-N.png`

## Best Practices

### Code Changes
- Make small, incremental changes
- Test one section at a time
- Document Tailwind class changes
- Keep semantic HTML structure

### Screenshot Naming
```
screenshots/
  ├── baseline-desktop-1920x1080.png
  ├── baseline-tablet-768x1024.png
  ├── baseline-mobile-375x667.png
  ├── iteration-1-desktop-current.png
  ├── iteration-1-desktop-diff.png
  └── ...
```

### Git Workflow
```bash
# Create feature branch for design iteration
git checkout -b design/landing-page-iteration-1

# Make changes, test, capture screenshots
# Commit with descriptive message
git add .
git commit -m "design: improve hero section visual hierarchy

- Increase CTA button size for better visibility
- Add subtle fade-in animation
- Adjust spacing between headline and subheading

Visual diff: 2,847 pixels changed (expected)
Screenshots: screenshots/iteration-1-*"

# Push and create PR with screenshot comparisons
git push origin design/landing-page-iteration-1
```

## Resources

### Design Inspiration
- [Dribbble - SaaS Landing Pages](https://dribbble.com/tags/saas-landing-page)
- [Land-book - Landing Page Gallery](https://land-book.com/)
- [SaaS Landing Page Examples](https://saaslandingpage.com/)

### Bridal Industry Examples
- The Knot - Clean, elegant, trust-focused
- Zola - Modern, friendly, colorful
- Joy - Minimal, sophisticated, high-end

### Conversion Optimization
- [CXL - Landing Page Optimization](https://cxl.com/blog/landing-page-optimization/)
- [Unbounce - Conversion Benchmark Report](https://unbounce.com/conversion-benchmark-report/)
- [Good UI - Evidence-based Patterns](https://goodui.org/)

### Accessibility
- [WebAIM - Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE - Web Accessibility Evaluation Tool](https://wave.webaim.org/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Tools Setup

### Required npm packages
```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "pixelmatch": "^5.3.0",
    "pngjs": "^7.0.0",
    "tsx": "^4.7.0"
  }
}
```

### VS Code Extensions
- Playwright Test for VSCode
- Tailwind CSS IntelliSense
- Headwind (Tailwind class sorter)
- Image Preview

### Browser DevTools
- Lighthouse (Performance)
- Accessibility Insights
- React Developer Tools
- Network throttling for mobile testing
