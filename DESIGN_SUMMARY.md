# LUCIDE UI/UX DESIGN SPECIFICATION - SUMMARY FOR GRAPHIC DESIGNER

## Quick Overview

**Lucide** is a sophisticated desktop AI assistant (Electron app) that:
- Captures screen in real-time for context-aware AI answers
- Transcribes and summarizes meetings in real-time
- Manages conversation history and documents
- Provides multiple AI provider support
- Operates invisibly (hidden from screenshots/recordings)

---

## Current Design System

### Technology Stack
- **Frontend**: Web Components (LitElement) - NOT React or Vue
- **Styling**: CSS Custom Properties (Design Tokens) + CSS-in-JS
- **No Framework**: Pure CSS, custom component system
- **Animation**: CSS animations + transitions

### Two UI Modes
1. **Classic Dark Theme** (Glassmorphic)
   - Dark backgrounds with opacity/blur effects
   - White text
   - Orange accents
   - Modern, sleek appearance

2. **Claude Light Theme** (Optional)
   - Light background (#F5F5F0)
   - Dark text (#1a1a1a)
   - Orange accents (#D97706)
   - Minimalist, clean

---

## Key Views/Screens (7 Main Views)

### 1. LISTEN VIEW (400px width)
Real-time meeting transcription & summarization
- **STT View**: Live transcription in chat bubbles
- **Summary View**: AI-generated insights & action items
- **Response View**: Suggested responses (2-3 cards)
- **Tabs**: Switch between Transcript/Insights/Responses

### 2. ASK VIEW (Full Screen) - Two Modes
**Classic Mode**:
- Full-screen response area
- Input at bottom with send button
- Markdown + code blocks with syntax highlighting

**Claude Mode** (New, inspired by Claude.ai):
- 3-column layout: Sidebar | Chat | Artifacts Panel
- Conversations list with search/filter
- Centered messages (max 800px)
- Right sidebar for code/previews

### 3. DOCUMENTS VIEW
- Header with upload button
- Search bar + filters
- Document cards in scrollable list
- Drag-and-drop file upload

### 4. HISTORY VIEW (320px sidebar)
- Header with stats ("X conversations")
- Search input
- Filter buttons (Today, Week, Month, All)
- Scrollable history list

### 5. SETTINGS VIEW (240px sidebar)
- API key/model configuration
- Theme selection
- Keyboard shortcut display
- Account info
- Advanced options

### 6. BROWSER VIEW (Full Screen)
- Navigation bar (back, forward, refresh, URL)
- URL bar with HTTPS indicator
- Zoom controls
- DevTools toggle
- Find-in-page

### 7. ONBOARDING WIZARD
- Multi-step wizard (4+ steps)
- Progress dots
- Profile selection
- API key setup
- Permission grants

---

## 35 UI Components (Organized by Type)

### Base Components (4)
- **ClaudeButton**: Primary, secondary, danger, ghost variants
- **ClaudeInput**: Text input with states
- **ClaudeCard**: Container with rounded corners
- **ClaudeAvatar**: User/profile avatars

### Message Components (4)
- **MessageUser**: Right-aligned bubble, light background
- **MessageAssistant**: Left-aligned with avatar, markdown
- **MessageActionBar**: Copy, like, regenerate, share
- **MessageActions**: Wrapper for all actions

### Input Components (1)
- **ClaudeInputArea**: Auto-expanding textarea, file upload, send button

### Upload Components (2)
- **FileDropZone**: Drag-and-drop target
- **FilePreview**: Thumbnail, size, progress, remove

### Dialog Components (3)
- **ConfirmDialog**: Yes/No with variants (danger, warning, info)
- **RenameConversationDialog**: Rename input
- **ExportDialog**: Format selection + download

### Notification Components (2)
- **ToastContainer**: Queue management
- **ToastNotification**: Toast popup (success, error, warning, info)

### Code Components (1)
- **CodeBlock**: Syntax highlight, copy, fullscreen, line numbers

### Search Components (1)
- **AdvancedSearchPanel**: Search with filters + history

### Tag Components (2)
- **TagFilter**: Display + filter by tags
- **TagManager**: Add/remove/create tags

### Statistics Components (2)
- **StatisticsPanel**: Display stats
- **StatisticsModal**: Modal presentation

### Settings Components (2)
- **SettingsPanel**: API, model, theme, etc.
- **NotificationSettings**: Notification toggles

### Artifacts Components (1)
- **ArtifactsPanel**: Code preview + rendering

### Theme Components (2)
- **ThemeToggle**: Light/dark switch
- **ThemeSelector**: Profile theme selection

### Sidebar Components (1)
- **ConversationSidebar**: Conversations list, search, profile

### Command Palette (1)
- **CommandPalette**: Fuzzy search, categories, keyboard nav

### Mobile Components (1)
- **MobileHeader**: Hamburger menu (mobile only)

### Loading Components (1)
- **LoadingSkeleton**: Shimmer animation placeholder

### Error Components (1)
- **ErrorBoundary**: Error catching & display

---

## Design Tokens System

### Colors
```
Primary: #D97706 (Orange) - for accents
Success: #10b981 (Green)
Error: #DC2626 (Red)
Warning: #FBBF24 (Yellow)

Dark Theme:
- Background: Dark with opacity/blur
- Text: White (#FFFFFF)
- Borders: White with 10-20% opacity

Light Theme:
- Background: #F5F5F0 (Warm white)
- Text: #1a1a1a (Dark gray)
- Borders: #e5e5e0 (Light gray)
```

### Typography
```
Font Family: System fonts (Helvetica Neue, -apple-system, Roboto, etc.)
Monospace: System monospace (for code)

Sizes:
- 12px (xs)
- 13px (sm) - commonly used
- 16px (base)
- 20px (lg)
- 24px (xl)
- 32px (2xl)

Weights: 300, 400, 500, 600, 700
Line Height: 1.4 (tight), 1.6 (normal), 1.8 (relaxed)
```

### Spacing
```
4px, 8px, 12px, 16px, 20px, 24px, 32px, ...
(CSS variables: --space-0-5, --space-1, --space-2, etc.)
```

### Border Radius
```
4px (sm)
8px (md)
12px (lg) - most common
16px (xl) - cards, modals
9999px (full/circles)
```

### Shadows
```
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px rgba(0,0,0,0.1)
lg: 0 10px 15px rgba(0,0,0,0.1)
xl: 0 20px 25px rgba(0,0,0,0.15)
```

### Animations
```
Durations: 150ms (fast), 200ms (base), 350ms (base), 500ms (slow)
Easing: ease, standard, smooth-in, smooth-out, elastic
Effects: slide, fade, scale, rotate, ping, pulse
```

---

## Key Features to Understand

### 1. Real-Time Listening
- Captures microphone audio
- Uses Deepgram/Whisper for STT
- Real-time transcription display
- AI summarization as conversation happens

### 2. Context-Aware Asking
- Captures current screen as image
- Compresses image with Sharp.js
- Sends with question to AI
- Supports multiple AI providers (OpenAI, Gemini, Claude, Ollama)

### 3. Multi-Provider Support
- OpenAI (GPT-4, GPT-3.5)
- Google Gemini (with vision)
- Anthropic Claude (with vision)
- Local Ollama (self-hosted)

### 4. Document Management (RAG)
- Upload PDFs, Word docs, images
- Automatic indexing + embeddings
- Semantic search integration
- Docs included in Ask responses

### 5. Conversation Management
- Auto-save conversations
- Full-text search
- Tag/filter conversations
- Export to Markdown/PDF

### 6. Privacy/Invisibility
- Hidden from screen recordings
- Not visible in dock
- Click-through mode available
- Privacy-focused by design

---

## Responsive Design Notes

### Desktop (> 1024px)
- Full multi-column layouts
- Sidebar navigation
- Artifacts panel visible
- Wide chat area

### Tablet (768px - 1024px)
- Adjust columns
- Hide artifacts panel
- Full-width sidebars
- Touch-friendly buttons

### Mobile (< 768px)
- MobileHeader with hamburger
- Drawer sidebar
- Single column layout
- Full-width modals
- Large touch targets (48px min)

---

## Redesign Recommendations for Graphic Designer

### 1. Areas to Refine
1. **Spacing & Alignment**: Ensure consistent 8px grid
2. **Typography Hierarchy**: Clear size/weight differentiation
3. **Color Consistency**: Ensure all UI elements follow palette
4. **Icon System**: Replace emoji with custom icon set
5. **Animations**: Polish transitions and micro-interactions
6. **Component States**: Clear visual feedback (hover, active, disabled)

### 2. Potential Improvements
1. **Visual Depth**: Add more sophisticated shadows/layering
2. **Micro-interactions**: Smooth state transitions
3. **Gesture Support**: Better mobile touch interactions
4. **Accessibility**: Enhanced contrast ratios, focus states
5. **Brand Identity**: Stronger visual consistency across views
6. **Load States**: Better skeleton screens, progress indicators

### 3. Design Opportunities
1. **Theme Variations**: Expand color palette options
2. **Custom Icons**: Replace emoji with branded icons
3. **Data Visualization**: Charts for statistics view
4. **Animation Library**: Consistent motion language
5. **Dark Mode Refinement**: Better contrast, polish
6. **Light Mode Refinement**: Warmth, personality

### 4. Mobile/Responsive
1. Optimize drawer menu for mobile
2. Touch-friendly sizes (48px minimum)
3. Simplified navigation hierarchy
4. Full-screen modal handling
5. Bottom sheet patterns (if needed)

---

## File Locations to Reference

- **Main Views**: `/src/ui/*/View.js`
- **Components**: `/src/ui/components/*/`
- **Styles**: `/src/ui/styles/` (CSS files with design tokens)
- **Services**: `/src/ui/services/` (Business logic)
- **i18n**: `/src/ui/i18n/locales/` (Translations)

---

## Next Steps

1. **Audit Current Design**: Take screenshots of each view
2. **Identify Gaps**: What's missing from current implementation?
3. **Create Design System**: Establish comprehensive design tokens
4. **Component Mockups**: Design all 35 components
5. **Layout Specs**: Define exact spacing, typography, colors
6. **State Variations**: Show all component states (hover, active, etc.)
7. **Responsive Mockups**: Mobile, tablet, desktop versions
8. **Animation Specs**: Define transition timings and easing
9. **Accessibility**: AA+ WCAG compliance review
10. **Implementation Guide**: Hand off to developers

---

## Key Measurements

- **Listen View**: 400px width
- **History View**: 320px width
- **Settings View**: 240px width
- **Chat Area Max Width**: 800px
- **Artifacts Panel**: 350px width
- **Mobile Breakpoint**: 768px
- **Border Radius**: Mostly 8-12px
- **Spacing Grid**: 8px base unit

---

## Design Philosophy

Lucide's design reflects:
- **Privacy-first**: Invisible, non-intrusive
- **Modern**: Glassmorphic dark theme
- **Accessible**: Good contrast, clear labels
- **Consistent**: Design token system
- **Efficient**: Minimal UI, max functionality
- **Fast**: Smooth animations, quick interactions
- **Flexible**: Light mode option, theme customization

---

## Full Specification Document

See `/LUCIDE_DESIGN_SPECIFICATION.md` for detailed breakdown of:
- All 7 views with exact layouts
- All 35 components with features
- Complete design tokens
- User flows
- Data types
- Technical notes
- Accessibility guidelines

---

**Document Created**: November 20, 2025
**Codebase**: Lucide (Glass by Pickle) - Electron + LitElement
**Status**: Production ready - ready for redesign
