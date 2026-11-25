# clashofcode — Brand & Product Design System

**Version:** 1.1  
**Status:** Brand direction and frontend design specification  
**Product:** Competitive coding platform for professional developers  
**Tagline:** **Code. Compete. Conquer.**

---

## 1. Brand Overview

### Brand name
**clashofcode** — use lowercase in product UI, marketing copy, documentation, and social profiles.

### Positioning
clashofcode is a competitive coding arena built for professional software developers. It gives experienced engineers a place to solve challenging problems, compete in programming contests, track their performance, and build a visible record of technical achievement.

### Brand promise
A focused, fair, skill-based arena where professional developers can challenge themselves and earn recognition for demonstrated engineering ability.

### Audience
- Professional software engineers
- Backend, frontend, full-stack, mobile, and platform engineers
- Senior and staff-level developers
- Competitive programmers seeking advanced challenges
- Engineering teams participating in team competitions

### Personality
| Attribute | Direction |
|---|---|
| Personality | Confident, intelligent, competitive |
| Voice | Direct, technical, motivating |
| Visual character | Dark, precise, high-contrast |
| Experience | Focused, fast, distraction-free |
| Emotional outcome | Mastery, confidence, recognition |

### Brand principles
1. **Competence over hype:** emphasize meaningful challenges and measurable performance.
2. **Competition with integrity:** scoring, rankings, and contest rules should be transparent.
3. **Respect the craft:** design for people who write and review code every day.
4. **Clarity under pressure:** contest and editor interfaces must remain readable.
5. **Progress that means something:** ratings and achievements should reflect demonstrated performance.

---

## 2. Brand Messaging

**Primary tagline:** Code. Compete. Conquer.  
**Supporting statement:** The competitive arena built for professional developers.

**Short description:** clashofcode is a competitive programming platform where professional developers solve advanced challenges, compete in contests, track their ratings, and demonstrate their engineering skills.

| Pillar | Message | Example |
|---|---|---|
| Competition | Put your skills to the test | Enter the arena. |
| Mastery | Improve through challenging work | Take on problems built for experienced engineers. |
| Recognition | Make performance visible | Build your rating. Earn your rank. |
| Community | Compete with serious developers | Challenge engineers around the world. |

### Voice and tone
- Be concise and confident.
- Prefer specific technical language over generic motivational phrases.
- Use competitive language purposefully, not excessively.
- Do not insult beginners or imply that one rating defines a developer's worth.
- Explain rules, scoring, and outcomes clearly.

**Preferred:** “Your next contest starts in 10 minutes.”  
**Avoid:** “Only coding legends can survive this epic battle!”

---

## 3. Logo Identity

### Logo concept
The logo is based on a geometric, open **C-shaped arena mark** with code brackets at its center.

- **C:** Clash, code, and competition.
- **Code brackets:** Software engineering and developers.
- **Angular open form:** An arena, challenge, and forward momentum.
- **Faceted orange construction:** Energy, precision, and structure.

### Logo colors
- Orange: `#F97316`
- Dark charcoal: `#101114`
- White: `#FFFFFF`

### Logo variants
1. Primary horizontal logo — symbol plus `clashofcode` wordmark.
2. Stacked logo — symbol above wordmark.
3. Symbol-only logo — standalone C-shaped mark.
4. White-background symbol — orange C with dark code brackets on white.
5. Dark-background symbol — orange C with white code brackets on dark.
6. Monochrome white logo — for dark backgrounds.
7. Monochrome dark logo — for light backgrounds.
8. App icon — centered symbol in a square container.

### Logo usage
**Do**
- Use the approved master artwork.
- Preserve the logo's aspect ratio and internal spacing.
- Use the white-background version on white or very light surfaces.
- Use the dark-background version on dark surfaces.
- Keep sufficient clear space around the symbol.

**Do not**
- Stretch, rotate, skew, or redraw the logo.
- Add unapproved shadows, outlines, or effects.
- Change the relationship between the C mark and code brackets.
- Place the logo over a visually busy background.
- Use the dark-bracket version on a dark background.

### Clear space and minimum size
- Maintain clear space around the mark equal to at least the width of one code-bracket stroke.
- Recommended minimum symbol size in UI: 24 px high.
- Recommended minimum horizontal logo width: 140 px.
- For favicon and tiny sizes, use the symbol-only mark and test legibility at 16 px.

### Asset naming
```text
public/
  brand/
    logos/
      clashofcode-logo-primary.svg
      clashofcode-logo-white.svg
      clashofcode-logo-black.svg
      clashofcode-symbol-dark.svg
      clashofcode-symbol-white.svg
      clashofcode-symbol-orange-on-white.svg
    icons/
      clashofcode-app-icon.svg
      clashofcode-favicon.svg
```

SVG should be the source of truth. PNG files are raster exports for previews and platforms that require them.

---

## 4. Color System

### Core palette
| Token | Hex | Usage |
|---|---|---|
| `brand.primary` | `#F97316` | Primary actions, active states, brand accents |
| `brand.secondary` | `#FFC107` | Secondary highlights, limited emphasis |
| `background.canvas` | `#101114` | Main application background |
| `background.surface` | `#17191F` | Cards, panels, navigation |
| `background.elevated` | `#20232B` | Menus, popovers, elevated panels |
| `border.default` | `#30343D` | Dividers and component borders |
| `text.primary` | `#F5F5F7` | Main text on dark surfaces |
| `text.secondary` | `#A1A1AA` | Supporting text |
| `text.disabled` | `#686B75` | Disabled text |
| `status.success` | `#22C55E` | Accepted submissions and success |
| `status.warning` | `#F59E0B` | Warnings and time-sensitive notices |
| `status.error` | `#EF4444` | Errors and failed submissions |
| `status.info` | `#38BDF8` | Informational states |

### Color usage
- Use `#101114` as the primary dark canvas.
- Use `#17191F` and `#20232B` to establish surface hierarchy.
- Reserve orange for primary actions, selected navigation, and important brand moments.
- Use yellow sparingly so it does not compete with orange.
- Status colors must communicate meaning, not serve as decoration.
- Never communicate submission status through color alone; include a label or icon.

The main product experience is dark-first. Use white backgrounds for approved logo assets, exported brand material, and optional light-theme surfaces. If a complete light theme is introduced, define semantic light-theme tokens rather than simply reversing the dark palette.

---

## 5. Typography

| Role | Typeface | Usage |
|---|---|---|
| UI and body | Inter | Navigation, labels, body copy, forms |
| Display / headings | Space Grotesk | Marketing headlines and selected headings |
| Code / technical | JetBrains Mono | Editor, snippets, IDs, logs |

### CSS font stacks
```css
:root {
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system,
    BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-display: "Space Grotesk", "Inter", ui-sans-serif, system-ui,
    sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular,
    Menlo, Monaco, Consolas, monospace;
}
```

### Type scale
| Token | Size | Line height | Weight | Usage |
|---|---:|---:|---:|---|
| `text-xs` | 12 px | 16 px | 400–500 | Metadata, helper text |
| `text-sm` | 14 px | 20 px | 400–500 | Labels, secondary UI |
| `text-base` | 16 px | 24 px | 400 | Body text |
| `text-lg` | 18 px | 28 px | 500 | Lead text |
| `text-xl` | 20 px | 28 px | 600 | Card headings |
| `text-2xl` | 24 px | 32 px | 600 | Section headings |
| `text-3xl` | 30 px | 36 px | 600–700 | Page headings |
| `text-4xl` | 36 px | 40 px | 700 | Marketing headings |
| `text-5xl` | 48 px | 1.1 | 700 | Hero headlines |

Use sentence case for most UI labels. Use tabular numerals for ratings, timers, scores, and leaderboard values. Keep problem statements readable; reserve monospace for code and technical identifiers.

---

## 6. Layout, Spacing, and Responsive Rules

### Spacing scale
Use a 4 px base unit.

| Token | Value |
|---|---:|
| `space-1` | 4 px |
| `space-2` | 8 px |
| `space-3` | 12 px |
| `space-4` | 16 px |
| `space-5` | 20 px |
| `space-6` | 24 px |
| `space-8` | 32 px |
| `space-10` | 40 px |
| `space-12` | 48 px |
| `space-16` | 64 px |
| `space-20` | 80 px |

### Radius scale
| Token | Value | Usage |
|---|---:|---|
| `radius-sm` | 4 px | Small controls and tags |
| `radius-md` | 8 px | Inputs and buttons |
| `radius-lg` | 12 px | Cards and panels |
| `radius-xl` | 16 px | Large feature panels |
| `radius-full` | 9999 px | Pills and avatars |

### Borders and elevation
- Standard border: 1 px solid `#30343D`.
- Prefer surface contrast over heavy shadows.
- Keep shadows soft and restrained.
- Avoid excessive glow, glass effects, and decorative gradients in productivity screens.

### Breakpoints
| Breakpoint | Width | Layout guidance |
|---|---:|---|
| Small | `< 640 px` | Single column, compact navigation |
| Medium | `640–1023 px` | Adaptive two-column layouts |
| Large | `1024–1279 px` | Full dashboard layouts |
| Extra large | `>= 1280 px` | Multi-panel workspace |

The coding workspace must prioritize the editor and problem statement. On narrow screens, use tabs or a deliberate panel switcher instead of squeezing all panels side by side.

---

## 7. Component Guidelines

### Buttons
| Variant | Appearance | Use |
|---|---|---|
| Primary | Orange fill, dark text | Submit, start contest, primary CTA |
| Secondary | Graphite fill or transparent with border | Supporting actions |
| Ghost | Transparent with subtle hover | Low-priority actions |
| Danger | Restrained red treatment | Destructive actions |
| Success | Green status treatment | Accepted state and confirmation |

Button specifications: standard height 40 px; compact 32 px; large 48 px; horizontal padding 16–20 px. Provide visible focus, hover, active, disabled, and loading states.

### Inputs
- Default height: 44 px.
- Background: `#17191F` or `#20232B`.
- Border: `#30343D`.
- Focus border: brand orange.
- Labels remain visible when fields are populated.
- Error messages explain how to resolve the issue.

### Cards and panels
- Standard card background: `#17191F`.
- Elevated surface: `#20232B`.
- Default radius: 12 px.
- Internal padding: 16–24 px.
- Align actions and metadata consistently.

### Badges
Use badges for difficulty, topic, contest state, and verified achievements. Keep labels short and do not rely on color alone.

Difficulty: Easy, Medium, Hard, Expert.  
States: Upcoming, Live, Completed, Accepted, Wrong Answer, Time Limit Exceeded.

### Navigation
- Keep primary navigation stable across authenticated pages.
- Clearly distinguish active and inactive states.
- Use labels with icons when meaning is not immediately obvious.
- Avoid overcrowding the top navigation.

### Tables and leaderboards
- Align numeric columns consistently.
- Use tabular numerals.
- Make rank, handle, rating, and movement easy to scan.
- Use pagination or virtualization for large result sets.
- Explain ranking and rating context.

---

## 8. Product Screens

### Public landing page
**Goal:** Explain the product and convert professional developers into registered users.

Recommended sections:
1. Navigation: logo, Problems, Contests, Leaderboard, Sign in, Join the arena.
2. Hero headline: “The coding arena for professionals.”
3. Supporting statement about advanced challenges and competition.
4. Primary CTA: “Start solving”.
5. Secondary CTA: “Explore contests”.
6. Platform statistics, only when backed by real data.
7. Featured skill tracks.
8. Upcoming contests.
9. Explanation of the rating system.
10. Footer with product, community, and legal links.

### Developer dashboard
Recommended modules:
- Current rating and rating change
- Global and regional rank
- Weekly coding activity
- Recent submissions
- Recommended challenges
- Upcoming contests
- Skill-track progress
- Recent achievements

Use clear empty states for new accounts. Never fabricate user metrics.

### Problem discovery
Recommended filters: difficulty, topic/tag, completion status, acceptance rate, estimated solving time, recently added, and recommended skill level.

Problem rows should show title, difficulty, topic tags, acceptance rate, and completion state.

### Problem workspace
The workspace is the core product experience.

Recommended desktop composition:
- **Problem panel:** statement, examples, constraints, hints.
- **Editor panel:** code editor and language selector.
- **Evaluation panel:** test cases, custom input, output, and submission results.
- **Workspace header:** problem title, difficulty, tags, contest state, and navigation.

Requirements:
- Resizable panels.
- Keyboard-accessible controls.
- Language selector.
- Distinct Run and Submit actions.
- Custom test cases.
- Clear compilation and runtime errors.
- Submission history.
- Safe draft persistence with clear save status.
- Preserve code when switching problem tabs, subject to session rules.

### Contests
Display contest name and format, start/end time with timezone, registration state, rules and scoring method, problem list, live standings where applicable, final results, and rating changes.

Make remaining time and submission status unambiguous.

### Leaderboards
Recommended views: Global, Country/region, Friends/following, Contest-specific, Seasonal.

Show rating methodology and update cadence. Do not imply that a platform rating completely measures engineering ability.

### Developer profile
Recommended sections: handle and profile identity, current and peak rating, rank and percentile with methodology, contest history, solved-problem distribution, skill strengths, achievements, and public activity controlled by privacy settings.

---

## 9. Code Editor and Submission Experience

### Editor principles
- Use JetBrains Mono or a similarly legible monospace font.
- Keep syntax highlighting readable against the dark editor surface.
- Preserve indentation and comfortable line spacing.
- Provide line numbers and clear cursor visibility.
- Make resizing and keyboard shortcuts discoverable.
- Respect reduced-motion preferences.

### Submission feedback
Each submission should provide verdict, runtime, memory usage where available, language and compiler/runtime version, test summary, error details when applicable, and submission timestamp.

Possible verdicts: Accepted, Wrong Answer, Time Limit Exceeded, Memory Limit Exceeded, Runtime Error, Compilation Error, Internal Error.

Do not expose hidden test data or sensitive evaluator infrastructure.

### Editor states
Define explicit states for Idle, Editing, Running, Submitting, Accepted, Rejected, Compilation error, Network interruption, and Evaluation unavailable.

---

## 10. Iconography and Illustration

- Use a consistent outline icon family.
- Recommended library: Lucide.
- Default stroke width: approximately 1.75–2 px.
- Standard sizes: 16, 18, 20, and 24 px.
- Use filled icons only for selected states or strong status indicators.
- Avoid mixing unrelated icon families or decorative emoji in core navigation.

| Concept | Icon direction |
|---|---|
| Problems | List or terminal |
| Contests | Trophy |
| Rankings | Chart or medal |
| Skill tracks | Layers |
| Profile | User |
| Notifications | Bell |
| Settings | Gear |

---

## 11. Motion and Interaction

Motion should provide feedback, not decoration.

| Interaction | Duration |
|---|---:|
| Hover / focus | 100–150 ms |
| Button press | 100 ms |
| Menu / popover | 150–200 ms |
| Panel transition | 180–240 ms |
| Page transition | 180–260 ms |

Prefer subtle opacity and transform transitions. Avoid continuous animation in the coding workspace. Never make a critical status depend on animation. Respect `prefers-reduced-motion` and avoid large layout shifts during contests.

---

## 12. Accessibility

Target **WCAG 2.2 AA** as the accessibility baseline.

- Maintain sufficient text and UI contrast.
- Ensure controls are keyboard accessible.
- Provide visible focus indicators.
- Use semantic headings and landmarks.
- Label form fields and icon-only buttons.
- Announce submission results and important status changes to assistive technologies.
- Do not use color as the only indicator of difficulty, verdict, or rank movement.
- Support browser zoom and responsive reflow.
- Provide reduced-motion support.
- Keep editor controls accessible outside the editor canvas where possible.

---

## 13. Content and Microcopy

| Concept | Preferred term |
|---|---|
| Challenge collection | Problems |
| Timed competition | Contest |
| Competitive coding environment | Arena |
| User score | Rating |
| Ranked list | Leaderboard |
| Related problem collection | Skill track |
| Code evaluation | Submission |
| Successful evaluation | Accepted |

| Context | Copy |
|---|---|
| Main CTA | Start solving |
| Contest CTA | Enter contest |
| Submit action | Submit solution |
| Run action | Run tests |
| Empty submissions | Your submissions will appear here. |
| Empty contests | No contests scheduled right now. |
| Accepted | Solution accepted. |
| Wrong answer | Some test cases did not pass. |
| Network issue | Connection interrupted. |

Only claim code is saved locally or remotely when the implementation actually guarantees it.

---

## 14. Design Tokens — CSS Reference

Use semantic tokens as the application-facing API. Avoid scattering raw hex values throughout components.

```css
:root {
  color-scheme: dark;

  /* Brand */
  --color-brand-primary: #F97316;
  --color-brand-secondary: #FFC107;

  /* Backgrounds */
  --color-bg-canvas: #101114;
  --color-bg-surface: #17191F;
  --color-bg-elevated: #20232B;

  /* Borders */
  --color-border-default: #30343D;

  /* Text */
  --color-text-primary: #F5F5F7;
  --color-text-secondary: #A1A1AA;
  --color-text-disabled: #686B75;

  /* Status */
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #38BDF8;

  /* Typography */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Space Grotesk", "Inter", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Focus */
  --focus-ring: 0 0 0 2px var(--color-bg-canvas),
                0 0 0 4px var(--color-brand-primary);
}
```

---

## 15. Tailwind Mapping Guidance

Map semantic tokens into the Tailwind theme instead of scattering raw hex values through components.

Suggested semantic class intent:
- `bg-canvas` — page background
- `bg-surface` — cards and panels
- `bg-elevated` — menus and nested panels
- `text-primary` — primary text
- `text-secondary` — secondary text
- `border-default` — standard border
- `text-brand` / `bg-brand` — brand accent
- `text-success`, `text-warning`, `text-error` — status colors

Keep token names stable even if the implementation uses CSS variables, Tailwind theme variables, or another design-token solution.

---

## 16. Suggested Frontend Structure

```text
public/
  brand/
    logos/
    icons/
    social/

src/
  styles/
    tokens.css
    globals.css
  components/
    ui/
    navigation/
    editor/
    problems/
    contests/
    leaderboard/
  features/
    auth/
    dashboard/
    problem-solving/
    submissions/
    competitions/
    profiles/
```

Keep original editable logo artwork in a separate design source file. Export optimized SVGs for the application.

---

## 17. Design Do's and Don'ts

### Do
- Make the problem workspace the strongest product experience.
- Use orange to guide attention toward meaningful actions.
- Keep data-dense screens structured and scannable.
- Design for keyboard-first professional workflows.
- Make rating calculations and contest rules transparent.
- Include realistic loading, empty, error, and success states.
- Test at desktop, tablet, and mobile widths.

### Don't
- Copy LeetCode's visual identity or screen layouts.
- Make the platform look like an arcade game.
- Overuse orange glow, gradients, or decorative effects.
- Add badges and animations to every element.
- Hide contest rules or rating calculations.
- Present placeholder metrics as real platform data.
- Sacrifice accessibility for visual density.

---

## 18. Design Acceptance Checklist

### Brand
- [ ] Primary logo and symbol are approved.
- [ ] White-background and dark-background symbol variants exist.
- [ ] Light, dark, and monochrome logo variants exist.
- [ ] Logo clear space and minimum size are respected.
- [ ] Brand colors are implemented as tokens.
- [ ] Typography and fallback fonts are configured.

### UI foundations
- [ ] Spacing, radius, border, and elevation tokens are implemented.
- [ ] Buttons have hover, focus, active, disabled, and loading states.
- [ ] Inputs have default, focus, error, and disabled states.
- [ ] Semantic status colors are consistent.
- [ ] Keyboard focus is visible.

### Product screens
- [ ] Landing page is responsive.
- [ ] Dashboard includes first-time and returning-user states.
- [ ] Problem discovery supports filters and sorting.
- [ ] Coding workspace supports responsive panel layouts.
- [ ] Contest states and timers are clear.
- [ ] Leaderboards explain ranking context.
- [ ] Developer profiles respect privacy settings.

### Quality
- [ ] WCAG 2.2 AA checks are completed.
- [ ] Reduced-motion behavior is implemented.
- [ ] Empty, loading, error, and offline states are designed.
- [ ] Contrast is tested for text, controls, and status indicators.
- [ ] No placeholder metrics are presented as real platform data.

---

## 19. Final Creative Direction

**clashofcode should feel like a premium engineering arena—not a tutorial website and not an arcade game.**

The identity is built around:
- Arena Black for focus.
- Electric Orange for competitive energy.
- Inter for a clean product interface.
- Space Grotesk for distinctive display typography.
- JetBrains Mono for the coding environment.
- A geometric C-shaped symbol with code brackets for brand recognition.
- Clear, dense, keyboard-friendly layouts for professional workflows.

**clashofcode — Code. Compete. Conquer.**
