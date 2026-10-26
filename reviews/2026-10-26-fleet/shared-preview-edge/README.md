# Shared preview edge correction

Source `4f83f34` adds a 1px preview boundary so a swatch sidebar remains visible
against a matching card panel. Border-box sizing keeps the preview at 48px. Shared
styles also make descriptions, theme names and mode labels wrap normally.

The paired before images live in `../shared-release/` at source `f48e7a0`. These
use the same 23-card component fixture and viewport/theme conditions. The manifest
records both image hashes, the source assets and the crop trimming only empty
fixture space. They are component captures, not whole-app screenshots.

Checked with Node 26: zero-warning lint, 14 unit tests and 32 Chromium contracts.
The real-app passes separately verify the owner's request to remove the compact
navigation theme dropdown, retain the Appearance link, and use the same wrapping
and description copy. Product acceptance and council scoring remain pending.
