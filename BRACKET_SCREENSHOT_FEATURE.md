# Bracket Screenshot Feature

## Summary

Changed the screenshot feature to capture the **full bracket tree view** (tournament bracket with all matches) instead of just the simple share card view.

## What Changed

### Before

- Screenshot only captured the small ShareCard component
- Showed: Champion name, flag, and path to final
- Limited information, small image
- File name: `wc26-{name}-{champion}.png`

### After

- Screenshot now captures the **entire bracket tree**
- Shows: All 31 matches from Round of 32 to Final
- Full interactive bracket with all picks
- Captures the scrollable content (entire bracket width/height)
- File name: `wc26-{name}-bracket-{champion}.png`

## Implementation

### 1. Added Bracket Reference

```typescript
const bracketRef = useRef<HTMLDivElement>(null);
```

### 2. Wrapped BracketTree Component

```tsx
<div ref={bracketRef}>
  <BracketTree
    picks={picks}
    onPick={handlePick}
    champ={champ}
    onCrown={() => setPhase("result")}
  />
</div>
```

### 3. Updated Download Function

```typescript
async function download() {
  // Use bracket view if available, otherwise fall back to share card
  const targetRef = bracketRef.current || shareRef.current;

  const isBracket = targetRef === bracketRef.current;

  // For bracket view, capture entire scrollable area
  const render = toPng(node, {
    pixelRatio: 2,
    backgroundColor: "#060418",
    width: isBracket ? node.scrollWidth : node.offsetWidth,
    height: isBracket ? node.scrollHeight : node.offsetHeight,
  });

  // File naming
  const fileType = isBracket ? "bracket" : "card";
  link.download = `wc26-${safe}-${fileType}-${champ}.png`;
}
```

## User Flow

### Result Page

1. User completes bracket and crowns champion
2. Goes to result page
3. Clicks "📸 Save image" button
4. **Screenshot captures the bracket tree from predict phase**
5. Downloads as: `wc26-maheenur-bracket-argentina.png`

## Technical Details

### Captured Content

The screenshot now captures:

- Full tournament bracket (all rounds)
- All 31 matches from Round of 32 to Final
- Team flags and names
- Match connections (lines between rounds)
- Winner indicators (gold highlights)
- Champion in center
- Entire scrollable area (not just viewport)

### Image Size

- **Width**: Full bracket width (~1500-2000px)
- **Height**: Full bracket height (~900-1000px)
- **Pixel Ratio**: 2x for high quality
- **Background**: Dark blue (#060418)

### Timeout

- Increased from 12 seconds to 15 seconds
- Larger image needs more time to render

## Fallback Behavior

The function has smart fallback:

```typescript
const targetRef = bracketRef.current || shareRef.current;
```

- **Primary**: Captures bracket tree (if in predict phase)
- **Fallback**: Captures share card (if bracket not available)
- File name reflects what was captured (`bracket` vs `card`)

## File Naming Convention

Format: `wc26-{username}-{type}-{champion}.png`

Examples:

- `wc26-maheenur-bracket-argentina.png`
- `wc26-jahidun-bracket-brazil.png`
- `wc26-anonymous-bracket-prediction.png` (no champion yet)

## Benefits

1. **More Information**
   - Shows all picks, not just champion
   - Full tournament path visible
   - Can see entire bracket strategy

2. **Shareable**
   - Perfect for social media
   - Shows complete prediction
   - Professional looking

3. **High Quality**
   - 2x pixel ratio (retina quality)
   - Captures full scrollable area
   - Vector-like quality for text

4. **Useful Reference**
   - Can compare with friends
   - Track your predictions
   - Review before tournament

## Testing

1. ✅ Complete a bracket
2. ✅ Crown a champion
3. ✅ Click "📸 Save image"
4. ✅ Check downloaded file
5. ✅ Should show full bracket tree
6. ✅ File name should include "bracket"

## Future Enhancements

Possible additions:

- Option to choose between bracket view or card view
- Add watermark with timestamp
- Add tournament dates/venue
- Include match dates on screenshot
- Add "share to social media" buttons

## Files Modified

1. **`src/components/Predictor.tsx`**
   - Added `bracketRef` reference
   - Wrapped `<BracketTree>` with ref div
   - Updated `download()` function
   - Smart target selection (bracket or card)
   - Updated file naming
   - Increased timeout to 15s

## Notes

- Screenshot is taken from the **predict phase** bracket, not the result page
- The `bracketRef` captures the scrollable area, not just visible viewport
- Uses `scrollWidth` and `scrollHeight` for full content
- Background color matches app theme (#060418)
- High-res image (2x pixel ratio) for quality
