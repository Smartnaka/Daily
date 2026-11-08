# Daily Design System

Daily uses a warm editorial visual language designed for comfortable reading
on iOS and Android. It combines native system UI conventions with Lora for
quote content and a restrained forest, sage, and terracotta palette.

## Principles

- Content is the visual focus; decoration is restrained.
- Use `#F7F4ED`, `#292A26`, `#263D32`, `#A7B5A0`, `#C77D61`, and white selectively.
- Use SF Pro/system fonts for interface text and the licensed Lora font only for quotes.
- Prefer borders and tonal contrast over heavy shadows.
- Do not add gradients, decorative quote marks, or repeated status cards without a functional reason.
- Every interactive control has a clear pressed, disabled, and accessible state.
- Keep touch targets at least 44 points high/wide.
- Use system theme colors unless a feature explicitly needs a semantic state color.
- Loading, empty, and error states should be explicit and actionable.

## Tokens

Tokens live in `src/constants/theme.ts`.

- `Colors`: semantic Forest Journal light and dark colors.
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

- Use `display` for a primary screen title only when needed.
- Use `title` for screen and section titles.
- Use `quote` for quote content; render it with the loaded Lora family.
- Use `body` and `bodyMedium` for readable supporting copy.
- Use `caption` for metadata and explanatory text.
- Use `label` for buttons and compact actions.
- Use `overline` sparingly for uppercase metadata.

## Interaction conventions

Use `Pressable` feedback for all controls. Use `IconButton` for icon-only
actions and provide a meaningful `accessibilityLabel`. Keep animations subtle
and use the `Motion` tokens for durations. Prefer native controls and separators
over custom visual effects. Any future animation work should respect reduced
motion preferences.
