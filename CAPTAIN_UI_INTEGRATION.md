# Captain UI Integration - Complete

## Summary
Successfully integrated captain portraits into the BOTA UI screens for faction/captain selection.

## Changes Made

### 1. HTML (`index.html`)
- Added `<script src="src/captain_data.js"></script>` to load captain data

### 2. JavaScript (`src/ui.js`)
- **Captain Select Screen** (formerly Faction Select):
  - Renamed to "Choose Your Captain" 
  - Now displays a 3x3 grid of captain portrait cards
  - Each card shows the captain's portrait image with name overlay
  - Clicking a captain takes you to faction details
  
- **Faction Details Screen**:
  - Completely redesigned to feature the captain
  - **Left side**: Large captain portrait (300x300px), name, faction, description
  - **Right side**: Two sections:
    - Captain Dice: Personal die + Equipment die with faces
    - Starting Ship: Ship stats and ship dice
  - Changed button text from "Start Game" to "Begin Voyage"

### 3. CSS (`css/style.css`)
- Added `.captain-select-container` styles
- Added `.captain-grid` - 3x3 grid layout for captain portraits
- Added `.captain-card` - Portrait card with hover effects
- Added `.captain-portrait` - Image display styling
- Added `.captain-name-overlay` - Gradient text overlay at bottom of portrait
- Updated `.faction-details-container` to accommodate wider layout (1300px)
- Added `.faction-details-layout` - Side-by-side flex layout
- Added `.captain-details-side` and `.stats-details-side` - Two column layout
- Added `.captain-portrait-large` - Large 300x300 portrait display
- Added `.dice-section` and `.ship-section` - Styled info panels
- Added responsive breakpoints for mobile/tablet

### 4. Documentation
- Updated `docs/UI_SCREENS.md` - Captain Select screen layout
- Updated `docs/CAPTAIN_PORTRAITS.md` - Usage locations
- Updated `generate_captain_portraits.txt` - All commands use opaque backgrounds

## Features

### Captain Select Screen
- Grid of 9 captain portraits (200x200px each)
- Hover effects on cards (lift and glow)
- Captain names displayed as overlay on portraits
- Responsive layout (3 columns → 2 → 1 on smaller screens)

### Faction Details Screen
- Large captain portrait display (300x300px)
- Captain name, faction, and description
- Personal die and equipment die information clearly displayed
- Starting ship stats and ship dice
- Side-by-side layout on desktop, stacked on mobile

## Visual Design
- Captain portraits have painterly opaque backgrounds
- Cards use the game's maritime/fantasy theme
- Border color: #8b7355 (brown/tan)
- Text color: #f0e6d2 (parchment)
- Dark semi-transparent panels for readability
- Consistent with existing port screen styling

## Testing Checklist
- [ ] Captain Select screen displays all 9 portraits correctly
- [ ] Clicking each portrait navigates to correct faction details
- [ ] Faction Details shows correct captain image and data
- [ ] Dice information displays correctly formatted
- [ ] Ship stats display correctly
- [ ] "Begin Voyage" button starts game with correct faction
- [ ] Back button returns to captain select
- [ ] Responsive layout works on smaller screens
- [ ] Images load without errors

## Files Modified
1. `index.html` - Added captain_data.js script
2. `src/ui.js` - Updated showFactionSelect() and showFactionDetails()
3. `css/style.css` - Added captain UI styles
4. `generate_captain_portraits.txt` - Fixed all commands to use opaque backgrounds
5. `docs/UI_SCREENS.md` - Updated captain select documentation
6. `docs/CAPTAIN_PORTRAITS.md` - Updated usage documentation

## Next Steps
When implementing faction select screen in game flow:
1. Call `UI.showFactionSelect()` when "New Game" is clicked
2. Ensure captain portraits load correctly (check console for errors)
3. Test all 9 captains load and display
4. Verify faction selection starts game correctly
5. Add any additional game initialization logic needed

