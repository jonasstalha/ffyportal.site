UI/UX Guidelines — FruitsForYou Platform

Purpose

- Provide a single-source-of-truth for UI and UX rules across the FruitsForYou platform.
- Keep interfaces consistent, accessible, and easy to use for all users.

Content contract (inputs/outputs)

- Inputs: component props, user actions, data states (loading, empty, error, success).
- Outputs: predictable UI states, accessible elements, and clear affordances.

Design tokens

- Primary color: use --color-primary (or Tailwind: bg-emerald-600 / text-emerald-600)
- Accent color: --color-accent (Tailwind: bg-amber-400 / text-amber-400)
- Neutral: grays for surfaces and borders (Tailwind: gray-50..900)
- Spacing scale: 4px * [1,2,3,4,6,8] -> (1=4px, 2=8px, 3=12px, 4=16px, 6=24px, 8=32px)
- Border radius: 6px (Tailwind: rounded-md)
- Typography: system font stack, sizes in rem—base 16px.

Accessibility (A11y)

- All interactive controls must be reachable via keyboard and have visible focus states (outline or ring).
- Use semantic HTML: buttons, labels, nav, main, header, footer, table where appropriate.
- Provide aria-labels and roles where semantics are not enough.
- Color contrast: text must meet WCAG AA (4.5:1 for normal text). Use bold text or larger sizes to improve contrast when needed.
- Alt text for images and descriptive labels for icons.

Layout & spacing

- Use a clear visual hierarchy: headers > subheaders > body.
- Keep content width comfortable for reading: 680–880px for text-heavy pages.
- Consistent padding on containers: typically p-4 / p-6 depending on density.
- Group related actions together and separate destructive actions from primary actions.

Forms & Inputs

- Label every input; place labels above inputs when possible.
- Provide inline validation and friendly error messages; errors should be programmatic (aria-live) for screen readers.
- Use placeholders only as examples, not as labels.
- Primary action appears on the right (or bottom-right on mobile). Secondary actions are less visually prominent.

Buttons & Actions

- Primary button: solid primary color, white text, prominent.
- Secondary: outline or neutral background.
- Disabled state: reduced opacity and non-interactive.
- Always include an icon only when it adds meaning; use accessible labels for icon-only buttons.

States & Feedback

- Loading states: show skeletons or spinners with the same layout to avoid layout shifts.
- Success and error states must be clear and short; use consistent colors (success = green, error = red) and icons.
- Toasts: short messages, dismissible, do not block interaction.

Navigation

- Keep global navigation simple and predictable.
- Use breadcrumbs for deep flows (multi-step processes) and clearly indicate current step.
- Mobile: use bottom navigation or hamburger depending on available top-level sections.

Data tables & Lists

- Offer sortable columns and persistent filters where needed.
- Provide concise summaries and allow row expansion for details rather than loading full pages.
- Paginate large datasets; prefer server-side pagination for performance.

Dialogs & Modals

- Only use modals for focused tasks; avoid stacking modals.
- Focus trap inside modal, return focus to the originating control when closed.
- Provide clear cancel/confirm actions; mark destructive actions clearly.

Microcopy & Tone

- Keep labels and messages short, direct, and action-oriented.
- Use plain language; avoid jargon.
- Use consistent verbs for actions (Create, Save, Upload, Delete).

Do's and Don'ts

- Do: keep primary actions consistent across screens.
- Do: prioritize clarity over cleverness.
- Don't: overload pages with too many actions.
- Don't: rely solely on color to convey meaning (add icons/labels).

Examples / Patterns

- Empty state: show illustrative icon, brief explanation, and one clear action (e.g., "Upload your first lot").
- Error state: show helpful next steps and contact/support link.
- Confirmation: brief summary of what changed and an undo option when possible.

Implementation checklist

- [ ] Use semantic HTML and accessible attributes.
- [ ] Confirm color contrast with a tool (axe, Lighthouse).
- [ ] Keyboard navigation test (tab order, focus states).
- [ ] Mobile responsive check at common breakpoints (320px, 375px, 768px, 1024px).
- [ ] Add unit/storybook examples for patterns when appropriate.

Where to add this file

- Place this file at the repository root as a quick reference, and import the `client/src/components/ui-ux/UiUxGuidelines.tsx` component into `client/src/App.tsx` or an internal documentation route to view it in-app.

Contact

- If you want, I can also add a route and link to the component inside `client/src/App.tsx` or create a Storybook story.

