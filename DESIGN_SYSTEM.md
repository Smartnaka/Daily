# Daily Design System

Daily uses a quiet, editorial visual language designed for comfortable reading
on iOS and Android. The system favors semantic tokens and reusable primitives
over screen-specific styling.

## Principles

- Content is the visual focus; decoration is restrained.
- Use warm surfaces, charcoal text, and sage accents.
- Prefer borders and tonal contrast over heavy shadows.
- Every interactive control has a clear pressed, disabled, and accessible state.
- Keep touch targets at least 44 points high/wide.
- Use system theme colors unless a feature explicitly needs a semantic state color.
- Loading, empty, and error states should be explicit and actionable.

## Tokens

Tokens live in `src/constants/theme.ts`.

- `Colors`: semantic light and dark colors.
- `Typography`: display, title, quote, body, caption, label, and overline styles.
- `Spacing`: a 4-point-based layout scale.
- `Radii`: small, medium, large, and pill corner radii.
- `Elevation`: restrained shadow presets.
- `Motion`: fast, standard, and slow animation durations.

Use `ThemeColors` for component props instead of broad string maps.

## Shared components

Components live under `src/components/ui/`.

- `Button` and `IconButton`: primary, secondary, tertiary, loading, and pressed states.
- `Surface` and `StatusSurface`: bordered/elevated content and contextual status surfaces.
- `StateView`: loading, empty, and error content with an optional action.
- `SectionHeader`: consistent section title/action rows.
- `Divider`: theme-aware separators with optional inset.
- `TextField`: labeled, theme-aware input with error presentation.
- `Sheet`: native modal bottom-sheet foundation with backdrop dismissal.

Screen redesigns should compose these primitives rather than recreate local
colors, radii, spacing, or button behavior.

## Typography guidance

- Use `display` for the primary screen message.
- Use `title` for screen and section titles.
- Use `quote` for the featured quote.
- Use `body` and `bodyMedium` for readable supporting copy.
- Use `caption` for metadata and explanatory text.
- Use `label` for buttons and compact actions.
- Use `overline` sparingly for uppercase metadata.

## Interaction conventions

Use `Pressable` feedback for all controls. Use `IconButton` for icon-only
actions and provide a meaningful `accessibilityLabel`. Keep animations subtle
and use the `Motion` tokens for durations. Any future animation work should
respect reduced-motion preferences.
