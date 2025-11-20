# LUCIDE APPLICATION - LAYOUT DIAGRAMS

## 1. LISTEN VIEW (Compact, 400px width)

```
┌─────────────────────────────────┐
│        LISTEN VIEW              │  400px width
├─────────────────────────────────┤
│  [Tab: Transcript▼] [Summary] [Response]
├─────────────────────────────────┤
│                                 │
│  Transcription Container        │  flex: 1
│  (scrollable)                   │  max-height: 600px
│                                 │
│  "Them: Hello there"            │
│  "Me: Hi, how are you?"         │
│  "Them: Great! Let's talk..."   │
│                                 │
├─────────────────────────────────┤
│  [📋 Copy Transcript]           │
└─────────────────────────────────┘
```

## 2. ASK VIEW - CLASSIC MODE (Full Screen)

```
┌─────────────────────────────────────────────────────┐
│                    ASK VIEW                         │ Full screen
├─────────────────────────────────────────────────────┤
│                                                     │
│  [Your Question]                                    │
│  "What is on this page?"                            │
│                                                     │
│  [AI Response - Scrollable Container]              │
│  Shows markdown with syntax highlighting           │
│  Code blocks with copy buttons                      │
│                                                     │
│  The page shows a dashboard with...                │
│  ```javascript                                      │
│  function example() { ... }  [📋 Copy]            │
│  ```                                                │
│                                                     │
│  More response text...                              │
│                                                     │
├─────────────────────────────────────────────────────┤
│  [Input Area]                              [Send]  │
│  "Ask a question about your screen..."             │
└─────────────────────────────────────────────────────┘
```

## 3. ASK VIEW - CLAUDE MODE (3-Column Layout)

```
┌──────────────┬─────────────────────────┬───────────────┐
│              │                         │               │
│  Sidebar     │     Chat Area           │   Artifacts   │
│   (250px)    │   (flexible)            │   Panel       │
│              │   max-width: 800px      │   (350px)     │
│              │                         │               │
├──────────────┼─────────────────────────┼───────────────┤
│              │                         │               │
│ Logo         │  [User Question]        │               │
│ "Lucide"     │  What's this about?     │   Code Block  │
│              │                         │   Preview     │
│ [New Chat]   │  [Assistant Response]   │   ┌────────┐ │
│              │  Let me analyze this    │   │ Code   │ │
│ Search box   │  page for you...        │   │ Render │ │
│              │                         │   │ Mode   │ │
│ Convs List   │  More content here      │   │ [Copy] │ │
│  - Today     │  Lorem ipsum...         │   │        │ │
│    • Conv 1  │                         │   └────────┘ │
│    • Conv 2  │                         │               │
│                                                       │
│ Settings     │[Close] [Maximize]       │   [Close]     │
│ Profile      │                         │   [Fullscr]   │
└──────────────┴─────────────────────────┴───────────────┘
┌───────────────────────────────────────────────────────┐
│  Input Area (sticky bottom, max-width: 800px)        │
│  [📎] [What to ask?...] [Send]                       │
│  Files preview: File1.pdf  File2.docx                │
└───────────────────────────────────────────────────────┘
```

## 4. HISTORY VIEW (320px Sidebar)

```
┌───────────────────────────────────┐
│        HISTORY PANEL              │  320px width
├───────────────────────────────────┤
│ History                           │
│ 42 conversations                  │
│                                   │
│ [Search... ]                      │
│                                   │
│ [Today] [Week] [Month] [All]     │
│                                   │
│ Scrollable Conversations List:    │
│                                   │
│ ┌──────────────────────────────┐ │
│ │ • Meeting Notes              │ │
│ │   Today at 2:30 PM           │ │
│ │   "Let's discuss the roadm..." │ │
│ │                              │ │
│ └──────────────────────────────┘ │
│                                   │
│ ┌──────────────────────────────┐ │
│ │ • Project Review             │ │
│ │   Yesterday at 10:00 AM      │ │
│ │   "Great work on the design" │ │
│ └──────────────────────────────┘ │
│                                   │
│ ┌──────────────────────────────┐ │
│ │ • Quick Question             │ │
│ │   3 days ago                 │ │
│ │   "How do I implement..."    │ │
│ └──────────────────────────────┘ │
│                                   │
└───────────────────────────────────┘
```

## 5. SETTINGS VIEW (240px Sidebar)

```
┌─────────────────────────────────┐
│      SETTINGS PANEL             │  240px width
├─────────────────────────────────┤
│ Lucide                          │
│ Account: Not Connected          │ [Login]
├─────────────────────────────────┤
│                                 │
│ LLM MODEL                       │
│ Provider: OpenAI ▼              │
│ Model: GPT-4 ▼                  │
│ [Change LLM Model]              │
│                                 │
│ STT MODEL                       │
│ Provider: Whisper ▼             │
│ Model: Base ▼                   │
│ ✓ Installed                     │
│                                 │
│ SHORTCUTS                       │
│ Show/Hide     Cmd + \           │
│ Ask Question  Cmd + Enter       │
│ [Edit Shortcuts]                │
│                                 │
│ THEME                           │
│ ◉ Dark  ○ Light                │
│                                 │
│ ADVANCED                        │
│ Language: English ▼             │
│ ☑ Auto-Updates                 │
│ ☑ Invisibility Mode            │
│                                 │
│ [Quit Application]              │
│                                 │
└─────────────────────────────────┘
```

## 6. DOCUMENTS VIEW (Full Screen)

```
┌────────────────────────────────────────────────┐
│ Documents                    [Upload File] [+] │  Header
├────────────────────────────────────────────────┤
│                                                │
│ [Search Documents...] [PDF] [Word] [Images]  │  Search & Filter
│                                                │
│ Scrollable Document List:                      │
│                                                │
│ ┌────────────────────────────────────────────┐│
│ │ 📄 Project_Proposal.pdf                    ││
│ │ 2.4 MB • Uploaded 2 days ago               ││
│ │ "A comprehensive plan for the new..." [✕] ││
│ └────────────────────────────────────────────┘│
│                                                │
│ ┌────────────────────────────────────────────┐│
│ │ 📘 Meeting_Notes_2024.docx                 ││
│ │ 156 KB • Uploaded 1 day ago                ││
│ │ "Minutes from the quarterly review..." [✕] ││
│ └────────────────────────────────────────────┘│
│                                                │
│ ┌────────────────────────────────────────────┐│
│ │ 🖼️  Screenshot_UI.png                       ││
│ │ 845 KB • Uploaded 3 hours ago              ││
│ │ "UI mockup for design review" [✕]         ││
│ └────────────────────────────────────────────┘│
│                                                │
└────────────────────────────────────────────────┘
```

## 7. BROWSER VIEW (Full Screen)

```
┌────────────────────────────────────────────────┐
│  [◄] [►] [↻] [⏹]  [URL Bar: www.example.com]   │  Navigation Bar
│                    🔒 Secure  [+] [-] [=] [⚙️] [...] │
├────────────────────────────────────────────────┤
│                                                │
│  [Webview Container]                           │
│  Embedded web content renders here             │
│                                                │
│  Shows website/web app interface               │
│                                                │
│                                                │
│                                                │
└────────────────────────────────────────────────┘
```

## 8. RESPONSIVE LAYOUT CHANGES

### Desktop (> 1024px)
```
[Sidebar] [Main Content Area] [Optional Panel]
```

### Tablet (768px - 1024px)
```
[Sidebar] [Main Content Area]
(Optional panel collapses/hides)
```

### Mobile (< 768px)
```
[MobileHeader with Hamburger]
[Drawer Sidebar (hidden by default)]
[Full-width Content Area]
```

## 9. MODAL/DIALOG LAYOUT

```
┌─────────────────────────────────────────┐
│ (Backdrop - semi-transparent dark)      │
│                                         │
│          ┌───────────────────────┐     │
│          │  Dialog Title        │ ✕   │  Fixed at center
│          ├───────────────────────┤     │
│          │                       │     │
│          │  Dialog Content       │     │  max-width: 450px
│          │  Message goes here    │     │  Width: 90%
│          │                       │     │
│          │  [Cancel] [Confirm]   │     │
│          └───────────────────────┘     │
│                                         │
└─────────────────────────────────────────┘
```

## 10. COMPONENT SPACING REFERENCE

```
Common Spacing Values (8px grid):
- 4px   (--space-0-5) - Minimal, rare
- 8px   (--space-1)   - Tight spacing
- 12px  (--space-2)   - Small spacing
- 16px  (--space-3)   - Standard padding
- 20px  (--padding-lg)- Large padding
- 24px  (--space-4)   - Large spacing
- 32px  (--space-5)   - Generous spacing

Example Component:
┌──────────────────────────────────┐
│  16px padding                    │
│  ┌──────────────────────────────┐│
│  │ Title                        ││ 24px gap
│  │                              ││
│  │ Content area                 ││
│  │ Lorem ipsum...               ││
│  │                              ││ 12px gap
│  │ [Button] [Button]            ││
│  └──────────────────────────────┘│
│  16px padding                    │
└──────────────────────────────────┘
```

## 11. COLOR USAGE EXAMPLE

```
┌────────────────────────────────────────┐
│ Header                                 │  Dark bg: rgba(0,0,0,0.6)
│ with white text                        │  Text: #FFFFFF
├────────────────────────────────────────┤
│                                        │
│ Main Content Area                      │  Lighter bg: rgba(0,0,0,0.3)
│ with optional blur backdrop            │  Text: #FFFFFF
│                                        │
│ [Primary Button] [Secondary] [Danger] │  Orange: #D97706
│                                        │  Gray: #6B7280
│                                        │  Red: #DC2626
│                                        │
└────────────────────────────────────────┘
```

## 12. COMPONENT STATE VARIATIONS

```
Button States:

[  Default  ]   [  Hover   ]   [  Active  ]   [  Disabled  ]
 Background      Darker BG     Pressed       Reduced
 Text color      Brighter      Feedback      Opacity (0.4)

Input States:

[  Focused  ]   [  Error   ]   [  Success  ]
 Border glow    Red border     Green check
 Shadow         Error text     Confirmation

Card States:

Normal        Hover           Selected
┌─────┐     ┌─────┐         ┌─────┐
│     │     │     │         │     │
└─────┘     └─────┘         └─────┘
            Slightly lifted  Border/highlight
            (transform/shadow)(blue or accent)
```

## 13. SIZING REFERENCE

```
Width Guidelines:
- Sidebar (conversation): 250px
- Sidebar (history): 320px
- Sidebar (settings): 240px
- Chat area max-width: 800px
- Artifacts panel: 350px
- Desktop full width: 1920px+
- Tablet: 768px - 1024px
- Mobile: < 768px

Height Guidelines:
- Header/toolbar: 56px
- Footer/input area: 60-80px (dynamic)
- Message bubble: auto (min 48px)
- Button/input: 40-48px
- Icon: 16px - 24px
```

## 14. ANIMATION TIMING REFERENCE

```
Fast Interactions (150ms):
- Hover state
- Tooltip fade
- Icon rotation

Standard Transitions (200ms):
- Panel slide
- Fade in/out
- Background change

Page Transitions (350ms):
- View change
- Modal open
- Loading complete

Slow Animations (500ms):
- Onboarding steps
- Complex transitions
```

---

**Note**: These diagrams are ASCII approximations. 
Refer to actual component files for precise implementation details.
