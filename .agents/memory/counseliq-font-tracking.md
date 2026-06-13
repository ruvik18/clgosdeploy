---
name: CounselIQ PP Neue Montreal tabular-nums
description: OTF tabular figures in PP Neue Montreal cause wide digit gaps when combined with font-bold. Fix is to avoid tabular-nums on stats strips and marquees.
---

The PP Neue Montreal OTF font's tabular figures (tnum OpenType feature) produce visually wide sidebearings that look like spaces between digits when rendered bold at small sizes. This showed up in:
- Homepage stats strip (tracking-widest fixes it by compressing spacing)
- College detail marquee ticker (tracking-normal is sufficient)

**Why:** The font's tabular number glyph widths are wider than proportional figures, and at bold weight this becomes very visible.

**How to apply:** On any element using this font that renders numbers at small bold sizes, use `tracking-widest` or `tracking-normal` Tailwind class instead of `tabular-nums`. For large display numbers (like the dark stats grid), `tracking-tight tabular-nums` together works fine.
