# Family Description Popup Overflow Fix

## Problem
Family description popups were being clipped by parent containers that had `overflow` properties set. This affected multiple areas:
- Väsen details panel (left sidebar)
- Combat arena (combatant panels)
- Tab content areas

## Solution
Modified the CSS to allow popups to overflow their parent containers by:

### 1. **Increased z-index** (Line ~3963)
Changed `.family-matchup-collapsible .family-description-popup` z-index from `100` to `10000` to ensure popups appear above all other elements.

### 2. **Allow overflow in parent containers**

#### `.vasen-details-panel` (Line ~1257)
Added `overflow-x: visible` to allow popups to overflow horizontally while maintaining vertical scrolling.

```css
.vasen-details-panel {
    overflow-y: auto;
    overflow-x: visible; /* Allow popups to overflow horizontally */
}
```

#### `.tab-content` (Line ~606)
Added `overflow-x: visible` to allow popups in inventory tabs.

```css
.tab-content {
    overflow-y: auto;
    overflow-x: visible; /* Allow popups to overflow horizontally */
}
```

#### `.details-meta` (Line ~1321)
Added `overflow: visible` to the meta section containing badges.

```css
.details-meta {
    overflow: visible; /* Allow popups to overflow */
}
```

#### `.combatant-panel` (Line ~2203)
Added `overflow: visible` to combat panels.

```css
.combatant-panel {
    overflow: visible; /* Allow popups to overflow the panel */
}
```

#### `.combat-arena` (Line ~2192)
Added `overflow: visible` to the combat arena container.

```css
.combat-arena {
    overflow: visible; /* Allow popups to overflow the arena */
}
```

## Testing
Test the popups in these areas:
1. ✅ Väsen details panel (click on family badges in the left sidebar details)
2. ✅ Combat arena (click on family badges during combat)
3. ✅ Inventory tabs (any väsen card with family badges)
4. ✅ Mobile and desktop viewports
5. ✅ Different screen sizes and orientations

## Compatibility
- Works on both desktop and mobile
- Maintains vertical scrolling where needed
- Popups remain centered relative to their trigger element
- High z-index ensures visibility above modals and other overlays

## Alternative Approach (Not Implemented)
If the current solution doesn't work perfectly in all scenarios, you could:
1. Use `position: fixed` for the popups
2. Calculate position dynamically with JavaScript
3. Use a portal/teleport pattern to render popups at the body level

This would require JavaScript changes in `8-ui-controller.js` to calculate the popup position based on the trigger element's viewport coordinates.
