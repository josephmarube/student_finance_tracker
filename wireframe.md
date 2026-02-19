# Wireframes

## Layout Structure
```
┌─────────────────────────────────────────────────────┐
│ SIDEBAR (230px)        │ MAIN CONTENT             │
│ ┌───────────────┐      │                          │
│ │ ◈ Fintrack    │      │ ┌─ DASHBOARD ─────────┐ │
│ └───────────────┘      │ │ Stats Cards (4)      │ │
│                        │ │ ┌─────────┬────────┐ │ │
│ [⬡ Dashboard    ]      │ │ │ Count   │ Total  │ │ │
│ [ ≡ Records     ]      │ │ └─────────┴────────┘ │ │
│ [ ◎ Analysis    ]      │ │                      │ │
│ [ ＋ Add         ]      │ │ Chart Card           │ │
│ [ ⚙ Settings    ]      │ │ [Month ◀ ▶] [Type▾] │ │
│ [ ◉ About       ]      │ │ ┌──────────────────┐ │ │
│                        │ │ │  Bar/Line Chart  │ │ │
│                        │ │ └──────────────────┘ │ │
│                        │ └──────────────────────┘ │
│                        │                          │
│                        │                          │
└─────────────────────────────────────────────────────┘
```

## Mobile Layout (<800px)
```
┌───────────────────────┐
│ ◈ Fintrack            │
│ [Dash][Rec][Add][Set] │ ← Horizontal nav
├───────────────────────┤
│                       │
│   Stats (2x2 grid)    │
│                       │
│   Chart (full width)  │
│                       │
└───────────────────────┘
```

## Color Scheme
- Light: #f2f1ed background, #1a1814 text
- Dark: #0e0d0a background, #f4f1ea text
- Accent: #4338ca (indigo), 5 alternatives
- Success: #059669, Danger: #e11d48

## Typography
- Display: Syne (600/700/800)
- Body: DM Sans (400/500/600)
- Base: 15px, Line height: 1.6
