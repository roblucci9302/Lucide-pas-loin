# LUCIDE APPLICATION - COMPREHENSIVE UI/UX SPECIFICATION

## EXECUTIVE SUMMARY

**Lucide** (also known as "Glass by Pickle") is a sophisticated desktop AI assistant application built with Electron and Web Components (LitElement). It functions as a "Digital Mind Extension" that:
- Captures your screen in real-time
- Transcribes and summarizes meetings/conversations
- Provides AI-powered insights and answers based on screen context
- Manages documents and conversation history
- Operates invisibly (never appears in screen recordings or screenshots)

The application is a **Tauri-style desktop app** with a **modern glassmorphic UI** featuring:
- Multiple UI modes (Classic dark theme + Claude AI mode)
- Responsive design for desktop
- Real-time streaming responses
- Advanced conversation management
- Multi-provider AI support (OpenAI, Google Gemini, Anthropic Claude, Local Ollama)

---

## 1. APPLICATION OVERVIEW

### Purpose & Core Value
Lucide is designed to be an always-available AI assistant that:
1. **Observes your screen** without being visible
2. **Listens in real-time** to meetings/conversations
3. **Analyzes context** - understands what you're doing
4. **Provides insights** - summaries, action items, answers
5. **Stores knowledge** - maintains conversation history & documents

### Architecture
- **Frontend**: Web Components (LitElement) + Lit HTML templates
- **Backend**: Electron + Node.js
- **Styling**: CSS Custom Properties (design tokens system)
- **State Management**: Reactive properties
- **Database**: SQLite, Firebase, PostgreSQL, MySQL support
- **i18n**: Multi-language support (English, French)

### Key Technologies
- **Web Components**: LitElement framework
- **Styling**: CSS-in-JS via LitElement, CSS Custom Properties
- **Icons/Animations**: Emoji + CSS animations
- **Code Highlighting**: highlight.js integration
- **File Handling**: PDF parsing, image processing, document indexing

---

## 2. ALL VIEWS/SCREENS

### 2.1 LISTEN VIEW (Real-time Transcription & Summarization)
**Primary View**: `/src/ui/listen/ListenView.js`

**Purpose**: Capture and analyze real-time audio from meetings/conversations

**Subcomponents**:
1. **STT View** (`SttView.js`) - Speech-to-Text
   - Displays live transcription as conversation happens
   - Two-sided chat bubble layout (left="them", right="me")
   - Scrollable transcript container
   - Real-time updates as user speaks

2. **Summary View** (`SummaryView.js`) - AI Insights
   - Real-time meeting insights & summaries
   - Action items extraction
   - Key points highlighted
   - Markdown rendering with syntax highlighting
   - Copyable summary content

3. **Response View** (`ResponseView.js`) - Suggested Responses
   - Shows 2-3 AI-suggested responses user could say
   - Updates after user finishes speaking
   - Card-based suggestion UI with hover effects

**Key UI Elements**:
- Transcription area (scrollable, selectable text)
- Insights/summary section
- Response suggestion cards
- Tab switcher (Show Transcript / Show Insights)
- Copy buttons for both transcript and insights
- Session controls (Listen, Stop, Done)

---

### 2.2 ASK VIEW (Context-Based Questions & Chat)
**Classic Mode**: `/src/ui/ask/AskView.js`
**Claude Mode**: `/src/ui/ask/ClaudeAskView.js`

**Purpose**: Ask questions about your screen, get AI-powered answers based on context

#### 2.2.1 Classic Ask View
**Layout**: Full-screen
- Input area at bottom
- Response scrollable container
- Quick actions panel

**Features**:
- Full-screen response display
- Question-response format
- Markdown rendering with code blocks
- Line-by-line copy functionality
- Text selection enabled
- Animated transitions
- Loading states with spinner

**Key UI Elements**:
- Text input field (with placeholder: "Ask a question about your screen or audio")
- Send button
- Loading indicator during AI processing
- Response container with:
  - Code block support (syntax highlighting)
  - Markdown formatting
  - Copy buttons for lines/blocks
  - Hover-activated action bars

#### 2.2.2 Claude Ask View (Alternative UI Mode)
**Layout**: 3-column layout inspired by Claude.ai
```
[Sidebar] [Chat Area] [Artifacts Panel]
```

**Sidebar Features**:
- Conversations list
- New conversation button
- Search conversations
- Tag filtering
- Profile selection
- Mode switcher (Ask/Listen/Browser)

**Chat Area**:
- Messages centered (max 800px width)
- User messages right-aligned (light background)
- Assistant messages left-aligned (transparent)
- Avatar + name header for assistant
- Streaming response support
- Message action bar (copy, react, edit)

**Artifacts Panel** (Right Column):
- Code preview/rendering
- React component preview
- Markdown rendering
- Fullscreen mode toggle
- Copy code button
- Close button

**Key Dialogs**:
- Rename conversation
- Delete confirmation
- Export conversation
- Statistics view
- Search/filter panel
- Tag manager

---

### 2.3 LISTEN VIEW - DETAILED LAYOUT
**Width**: 400px (compact sidebar-like)
**Height**: Full screen height

**Components Stacked Vertically**:
1. **STT View** - Live transcription (flex: 1)
2. **Summary View** - Insights (flex: 1)
3. **Response View** - Suggestions (flex: 1)

**Tab Control**: Allows switching between Transcript/Insights/Responses

---

### 2.4 DOCUMENTS VIEW (File Management & Knowledge Base)
**File**: `/src/ui/documents/DocumentsView.js`

**Purpose**: Upload, organize, and search documents for RAG (Retrieval-Augmented Generation)

**Layout**:
```
[Header: "Documents" | Upload Button]
[Search Bar]
[Filter/Sort Options]
[Document Cards List]
```

**Document Card Features**:
- Document icon (PDF, DOC, etc.)
- File name
- File size
- Upload date
- Last modified
- Preview thumbnail
- Delete button
- Hover states

**Supported File Types**:
- PDF (.pdf)
- Word documents (.docx)
- Images (.png, .jpg, .jpeg)
- Text files (.txt)

**Functionality**:
- Drag-and-drop upload
- File search
- Filter by type
- Delete documents
- View document preview (modally)

---

### 2.5 HISTORY VIEW (Conversation Management)
**File**: `/src/ui/history/HistoryView.js`
**Width**: 320px (sidebar)
**Height**: Full screen

**Layout**:
```
[Header: "History" | Stats]
[Search Box]
[Filter Buttons]
[Scrollable History List]
```

**Header Section**:
- Title: "History"
- Stats: "X conversations, Y messages"

**Search & Filter**:
- Text search input
- Filter buttons (Today, This Week, This Month, All)
- Sort options

**History List Items**:
- Conversation title (truncated)
- Timestamp (e.g., "2 hours ago")
- Message preview
- Pin/favorite button
- Delete button
- Click to load conversation

**Features**:
- Full-text search
- Date range filtering
- Grouped by date (Today, Yesterday, This Week, etc.)
- Keyboard shortcuts
- Click-to-restore conversation

---

### 2.6 SETTINGS VIEW (Configuration & Preferences)
**File**: `/src/ui/settings/SettingsView.js`
**Width**: 240px (sidebar)
**Height**: Full screen

**Layout**:
```
[Header Section]
[API Configuration]
[Model Selection]
[Shortcuts Display]
[Account Section]
[Actions]
```

**Header**:
- App title: "Lucide"
- Account info (connected/not connected)
- Invisibility toggle indicator

**Sections**:

1. **Model Configuration**
   - LLM Provider selector (OpenAI, Gemini, Claude, Ollama)
   - API Key input (with secure storage)
   - Model selection dropdown
   - Status indicators (✓ Installed, ⚠ Not Active, etc.)

2. **STT Configuration**
   - Provider selector (Deepgram, Whisper, etc.)
   - Model selection
   - Installation status

3. **Shortcuts Display**
   - Show/Hide toggle
   - Ask Question shortcut
   - Scroll Up/Down shortcuts
   - Edit Shortcuts button

4. **Account Section**
   - Login/Logout button
   - Account email display
   - Firebase sync status

5. **Advanced Options**
   - Language selection
   - Theme selection
   - Auto-update toggle
   - Invisibility mode toggle
   - Data encryption options
   - App version info

---

### 2.7 BROWSER VIEW (Integrated Web Browser)
**File**: `/src/ui/browser/BrowserView.js`

**Purpose**: Built-in web browsing with security features

**Layout**:
```
[Navigation Bar: Back | Forward | Refresh | URL Bar | Zoom | DevTools]
[Webview Container]
[Optional: Find-in-Page Bar]
[Optional: Download Progress]
```

**Navigation Bar Features**:
- Back/Forward buttons
- Refresh button
- Stop button
- URL address bar with autocomplete
- HTTPS security indicator
- Favicon display
- Zoom controls (+/-)
- DevTools toggle
- Full-screen toggle

**Address Bar**:
- Text input with validation
- HTTPS auto-completion
- Favicon display
- Security indicator (🔒 for HTTPS)

**Special Features**:
- Find-in-page (Cmd+F)
- DevTools toggle (Cmd+Opt+I)
- Zoom controls (Cmd+/-)
- Download management
- Navigation history

---

### 2.8 SHORTCUT SETTINGS VIEW (Keyboard Customization)
**File**: `/src/ui/settings/ShortCutSettingsView.js`

**Purpose**: Allow users to customize keyboard shortcuts

**Layout**:
```
[Header: "Edit Shortcuts"]
[Back Button]
[Shortcuts List]
  - Show/Hide
  - Ask Question
  - Scroll Up
  - Scroll Down
```

**Shortcut Items**:
- Shortcut name
- Current key binding (e.g., "Cmd + \")
- Edit button
- Disable toggle

**Edit Mode**:
- "Press new shortcut..." prompt
- Validation for conflicts
- Save/Cancel buttons

---

### 2.9 ONBOARDING WIZARD (First-Time Setup)
**File**: `/src/ui/onboarding/OnboardingWizard.js`

**Purpose**: Guide new users through initial configuration

**Features**:
- Multi-step wizard (4+ steps)
- Step indicators (progress dots)
- Profile selection
- API key configuration
- Permission setup
- Completion celebration

**Steps**:
1. Welcome & profile selection
2. API provider selection
3. API key entry
4. STT model selection
5. Permissions grant (Microphone, Screen, Encryption)
6. Completion

---

## 3. MAIN FEATURES

### 3.1 LISTEN FEATURE (Real-Time Meeting Capture)
**Services**: 
- `listenService.js` - Orchestrates listening
- `sttService.js` - Speech-to-text
- `summaryService.js` - Real-time summarization
- `responseService.js` - Suggested responses

**Capabilities**:
1. **Real-Time Transcription**
   - Captures audio from microphone
   - Continuous transcription using STT provider
   - Speaker identification (Speaker 1, Speaker 2, Me, etc.)
   - Live display in chat bubbles

2. **Live Summarization**
   - AI generates meeting summary as conversation progresses
   - Extracts action items
   - Identifies key points
   - Updates incrementally

3. **Suggested Responses**
   - AI suggests what user could say next
   - Based on conversation context
   - Updates when user finishes speaking

4. **Session Management**
   - Start/Stop listening sessions
   - Save conversation to database
   - Session state tracking

**UI Interactions**:
- Listen button (initiates session)
- Stop button (pauses capture)
- Done button (closes session)
- Switch between Transcript/Insights/Responses tabs

---

### 3.2 ASK FEATURE (Context-Aware Questions)
**Services**:
- `askService.js` - Orchestrates ask functionality
- `screenshotService` - Captures current screen
- `promptBuilder` - Generates system prompts

**Capabilities**:
1. **Screen Capture & Analysis**
   - Captures current screen as image
   - Compresses/optimizes image
   - Extracts text/layout information
   - Provides visual context to AI

2. **Context-Aware Responses**
   - AI understands what's on screen
   - Answers questions about current context
   - References visible elements
   - Maintains conversation history

3. **Audio-Based Questions**
   - Ask about recent transcriptions
   - Reference meeting content
   - Get AI insights about conversations

4. **Multiple AI Providers**
   - OpenAI (GPT-4, GPT-3.5)
   - Google Gemini (with vision)
   - Anthropic Claude (with vision)
   - Local Ollama (self-hosted)

**UI Interactions**:
- Type question in input
- Send with button or Ctrl/Cmd+Enter
- See streaming response in real-time
- Copy response or individual lines
- Edit and resend responses

---

### 3.3 DOCUMENT MANAGEMENT (Knowledge Base)
**Services**:
- `documentService.js` - Document lifecycle
- `indexingService.js` - Content indexing
- `ragService.js` - Retrieval-Augmented Generation
- `embeddingProvider.js` - Vector embeddings

**Capabilities**:
1. **Document Upload**
   - Drag-and-drop interface
   - Batch upload support
   - File type validation

2. **Document Processing**
   - PDF text extraction
   - Image OCR
   - Document indexing
   - Semantic search vectors

3. **RAG Integration**
   - Documents automatically included in Ask responses
   - Semantic search for relevant documents
   - Citation/reference tracking

4. **Document Organization**
   - Search by filename/content
   - Filter by type
   - Sort by date/size
   - Delete documents

---

### 3.4 CONVERSATION MANAGEMENT
**Services**:
- `conversationHistoryService.js` - Stores conversations
- Database repositories (SQLite, Firebase)

**Features**:
1. **Conversation Persistence**
   - Auto-save conversations
   - Sync to Firebase or local DB
   - Restore previous conversations

2. **Conversation Organization**
   - Title/rename conversations
   - Tag conversations
   - Pin important conversations
   - Date grouping

3. **Search & Filter**
   - Full-text search
   - Tag-based filtering
   - Date range filtering
   - Advanced search operators

4. **Export**
   - Export as Markdown
   - Export as PDF
   - Copy transcript
   - Share conversations

---

### 3.5 AGENT PROFILES & ROUTING
**Services**:
- `agentProfileService.js` - Profile management
- `agentRouterService.js` - Route to specialized agents

**Features**:
1. **Multiple Profiles**
   - lucide_assistant (default)
   - custom user profiles
   - Specialized agent profiles

2. **Profile Customization**
   - Custom system prompts
   - Behavior configuration
   - Output formatting preferences

3. **Agent Routing**
   - Route questions to specialized agents
   - Profile-specific responses
   - Context-aware agent selection

---

### 3.6 THEME & APPEARANCE
**Services**:
- `themeService.js` - Theme management
- `profileThemeManager.js` - Profile-specific themes

**Themes Available**:
1. **Classic Dark Theme**
   - Glassmorphic design
   - Semi-transparent backgrounds
   - White/light text on dark
   - Accent colors (primary, secondary)

2. **Claude Light Theme** (Optional Claude UI mode)
   - Light backgrounds (#F5F5F0)
   - Dark text (#1a1a1a)
   - Orange accents (#D97706)
   - Minimalist design

3. **Profile Themes**
   - Per-profile color schemes
   - Custom accent colors
   - Custom background colors

---

### 3.7 VISIBILITY CONTROL
**Feature**: "Invisibility Mode"
- App window hidden from screen recordings
- Not visible in screenshots
- Doesn't appear in dock/taskbar
- Transparent to screen sharing

**Implementation**: 
- Native Electron API integration
- Click-through mode option
- Privacy-focused design

---

### 3.8 OFFLINE & LOCAL LLM SUPPORT
**Services**:
- `ollamaService.js` - Local LLM integration
- `localAIManager.js` - Orchestrates local AI

**Features**:
1. **Ollama Integration**
   - Self-hosted LLM models
   - No API costs
   - Complete privacy
   - Offline capability

2. **Whisper STT**
   - Local speech recognition
   - Multiple quality levels (Tiny, Base, Small, Medium)
   - No API key required

---

## 4. UI COMPONENTS (Detailed Breakdown)

### 4.1 BASE COMPONENTS (`/components/base/`)

#### ClaudeButton.js
- **Variants**: primary, secondary, danger, ghost
- **States**: default, hover, active, disabled
- **Features**: 
  - Icon support
  - Loading state
  - Size variants (sm, md, lg)
  - Accessible ARIA labels

#### ClaudeInput.js
- **Features**:
  - Text/password/number types
  - Placeholder text
  - Error states
  - Icon support (left/right)
  - Disabled state
  - Clear button

#### ClaudeCard.js
- **Features**:
  - Rounded corners
  - Padding/spacing
  - Shadow effects
  - Hover states
  - Interactive styling

#### ClaudeAvatar.js
- **Features**:
  - User initials or image
  - Size variants
  - Badge support
  - Status indicators (online/offline)
  - Click handler for profile

---

### 4.2 MESSAGE COMPONENTS (`/components/messages/`)

#### MessageUser.js
- **Layout**: Right-aligned bubble
- **Features**:
  - User name display
  - Timestamp
  - Edit mode
  - Delete button
  - Hover action bar
  - Light background color (#F5F5F0)

#### MessageAssistant.js
- **Layout**: Left-aligned with avatar
- **Features**:
  - Assistant name + avatar
  - Timestamp
  - Markdown rendering
  - Code block syntax highlighting
  - Action bar (copy, thumbs up/down, regenerate)
  - Code block detection
  - Artifact highlighting

#### MessageActionBar.js
- **Actions**: Copy, Like/Dislike, Regenerate, Share
- **Features**:
  - Hover-activated
  - Loading states
  - Success feedback
  - Keyboard shortcuts

#### MessageActions.js
- **Wrapper**: Manages all message actions
- **Features**: Consistent action interface

---

### 4.3 INPUT COMPONENTS (`/components/input/`)

#### ClaudeInputArea.js
- **Features**:
  - Auto-expanding textarea
  - File attachment preview
  - Drag-and-drop zone
  - Character counter
  - Token estimator
  - Send button (orange, circular)
  - Attachment button
  - Footer disclaimer
  - Keyboard shortcuts:
    - Enter to send
    - Shift+Enter for newline
    - Cmd+Up to edit previous message

---

### 4.4 FILE UPLOAD COMPONENTS (`/components/upload/`)

#### FileDropZone.js
- **Features**:
  - Drag-and-drop target
  - Visual feedback on drag
  - Allowed file types validation
  - File size validation
  - Multiple file support

#### FilePreview.js
- **Features**:
  - Image thumbnails (48x48px)
  - File type icons
  - File size display
  - File name (truncated)
  - Upload progress bar
  - Remove button
  - Error states with messages

---

### 4.5 DIALOG COMPONENTS (`/components/dialogs/`)

#### ConfirmDialog.js
- **Variants**: danger (red), warning (yellow), info (blue)
- **Features**:
  - Title, message, icon
  - Confirm/Cancel buttons
  - "Don't ask again" checkbox (optional)
  - Keyboard support (Enter=confirm, Esc=cancel)
  - Backdrop click to cancel

#### RenameConversationDialog.js
- **Features**:
  - Text input for new name
  - Current name display
  - Character limit
  - Validation
  - Confirm/Cancel

#### ExportDialog.js
- **Features**:
  - Format selection (Markdown, PDF, JSON)
  - Preview
  - Download button
  - Copy to clipboard

---

### 4.6 NOTIFICATION COMPONENTS (`/components/notifications/`)

#### ToastContainer.js
- **Features**:
  - Toast queue management
  - Position control
  - Auto-dismiss timers

#### ToastNotification.js
- **Variants**: success, error, warning, info
- **Features**:
  - Icon + message
  - Auto-dismiss (configurable)
  - Close button
  - Action button (optional)
  - Stacking on multiple toasts

---

### 4.7 CODE COMPONENTS (`/components/code/`)

#### CodeBlock.js
- **Features**:
  - Syntax highlighting (via highlight.js)
  - Language detection
  - Line numbers (toggleable)
  - Copy button
  - Fullscreen mode
  - Scrollable for long code
  - Dark theme styling

---

### 4.8 SEARCH COMPONENTS (`/components/search/`)

#### AdvancedSearchPanel.js
- **Features**:
  - Search input with suggestions
  - Filter options (date, role, tags)
  - Search history
  - Result preview with highlights
  - Keyboard navigation
  - Fuzzy matching

---

### 4.9 TAG COMPONENTS (`/components/tags/`)

#### TagFilter.js
- **Features**:
  - Display selected tags
  - Filter by tag
  - Clear filters
  - Tag color coding

#### TagManager.js
- **Features**:
  - View current tags
  - Add/remove tags
  - Create new tags
  - Color picker
  - Tag search
  - Tag suggestions

---

### 4.10 STATISTICS COMPONENTS (`/components/statistics/`)

#### StatisticsPanel.js
- **Displays**:
  - Total conversations
  - Total messages
  - Total tokens
  - Activity timeline
  - Hour/day distribution
  - Top conversations

#### StatisticsModal.js
- **Features**:
  - Modal presentation of stats
  - Export statistics
  - Date range selection

---

### 4.11 SETTINGS COMPONENTS (`/components/settings/`)

#### SettingsPanel.js
- **Sections**:
  - API key management
  - Model selection
  - Theme selection
  - Notification settings
  - Account settings
  - Keyboard shortcuts
  - Data & Privacy

#### NotificationSettings.js
- **Options**:
  - Enable/disable notifications
  - Sound toggle
  - Desktop notifications
  - Notification categories

---

### 4.12 ARTIFACTS COMPONENTS (`/components/artifacts/`)

#### ArtifactsPanel.js
- **Features**:
  - Code preview/syntax highlight
  - React component preview
  - Markdown rendering
  - Fullscreen mode
  - Copy code button
  - Tab switching (Code/Preview)

---

### 4.13 THEME COMPONENTS (`/components/theme/`)

#### ThemeToggle.js
- **Features**:
  - Light/Dark switch button
  - Smooth transition
  - Icon change (sun/moon)
  - Tooltip on hover
  - Persists preference

#### ThemeSelector.js
- **Features**:
  - Profile theme selection
  - Color picker integration
  - Preview theme changes
  - Save preferences

---

### 4.14 SIDEBAR COMPONENTS

#### ConversationSidebar.js
- **Sections**:
  - Logo + app name
  - New Conversation button
  - Search conversations
  - Conversation list (grouped by date)
  - Profile selector
  - Mode switcher (Ask/Listen/Browser)
  - Settings button
  - User profile button

**Conversation List Features**:
- Title truncation
- Last message preview
- Timestamp (relative)
- Pin/star option
- Delete button (on hover)
- Click to load

---

### 4.15 COMMAND PALETTE (`/components/command/`)

#### CommandPalette.js
- **Features**:
  - Modal overlay
  - Search/fuzzy matching
  - Command categories
  - Keyboard navigation (↑↓ Enter Esc)
  - Command icons
  - Shortcuts display
  - Recent commands when empty
  - Beautiful animations

**Example Commands**:
- New Conversation
- Search Conversations
- Export Conversation
- Settings
- Help
- etc.

---

### 4.16 MOBILE COMPONENTS (`/components/mobile/`)

#### MobileHeader.js
- **Features**:
  - Hamburger menu button
  - App title/logo
  - Theme toggle
  - Search button
  - Fixed positioning
  - Only shows on mobile (<768px)

---

### 4.17 LOADING COMPONENTS (`/components/loading/`)

#### LoadingSkeleton.js
- **Features**:
  - Shimmer animation
  - Placeholder for messages
  - Placeholder for content
  - Smooth fade-in when loaded

---

### 4.18 ERROR COMPONENTS (`/components/error/`)

#### ErrorBoundary.js
- **Features**:
  - Catch component errors
  - Error logging
  - User-friendly error message
  - Retry button
  - Stack trace (dev mode)

---

## 5. LAYOUTS

### ClaudeLayout.js (`/layouts/`)
**Purpose**: Main container layout for Claude UI mode

**Structure**:
```
┌─────────────────────────────────────┐
│         Mobile Header               │  (only on mobile)
├────────┬──────────────┬─────────────┤
│        │              │             │
│ Sidebar│  Chat Area   │ Artifacts   │
│ 250px  │  (flex)      │  Panel      │
│        │              │ 350px       │
│        │              │             │
└────────┴──────────────┴─────────────┘
         │   Input Area (sticky bottom)
         │   Max-width: 800px
         └───────────────────────────────
```

**Responsive**:
- Desktop: 3-column layout
- Tablet: Hide artifacts panel, full width sidebar
- Mobile: Drawer sidebar, full-width chat

---

## 6. KEY USER INTERACTIONS & USER FLOWS

### 6.1 USER FLOW: New User Onboarding
```
1. Launch App
   ↓
2. Onboarding Wizard
   - Select Profile (Lucide Assistant, Custom)
   - Choose AI Provider (OpenAI, Gemini, Claude, Ollama)
   - Enter API Key (or use provided)
   - Grant Permissions (Mic, Screen, Keychain)
   - Choose STT Model
   ↓
3. Permission Prompts
   - Microphone Access
   - Screen Recording Access
   - Keychain (for encryption)
   ↓
4. Welcome/Tutorial
   - Quick intro to Listen/Ask/Browser
   - Keyboard shortcuts
   - Where to find settings
   ↓
5. Ready to Use
```

### 6.2 USER FLOW: Listen to Meeting
```
1. Click "Listen" button (or Cmd+\)
   ↓
2. Listen View appears
   ↓
3. Real-time transcript displays
   - Shows who's speaking
   - Updates as people talk
   ↓
4. See AI Summary panel
   - Real-time insights update
   - Action items extracted
   ↓
5. Optional: See suggested responses
   - Click suggestion to speak it
   ↓
6. Click "Done" when meeting ends
   - Conversation saved
   - Can ask follow-up questions
```

### 6.3 USER FLOW: Ask a Question
```
1. Click "Ask" tab or Cmd+Enter
   ↓
2. Type question about screen
   - "What is on this page?"
   - "How do I use this feature?"
   - "Summarize this conversation"
   ↓
3. Hits Enter or clicks Send
   ↓
4. App captures current screen
   - Extracts visible content
   - Includes recent audio/transcript
   ↓
5. AI responds in real-time
   - Streaming response appears
   - Can see response building
   ↓
6. Interact with response
   - Copy whole response
   - Copy specific lines
   - Click code blocks
   - Edit and resend
```

### 6.4 USER FLOW: Document Upload
```
1. Click "Documents" tab
   ↓
2. Click "Upload" button
   OR Drag-drop files into zone
   ↓
3. Select files (PDF, DOCX, images)
   ↓
4. Upload progress shows
   ↓
5. Documents appear in list
   - With preview thumbnails
   - Searchable
   - Can delete
   ↓
6. Automatically included in Ask responses
   - RAG pulls relevant sections
   - Cited in responses
```

### 6.5 USER FLOW: Search & Filter History
```
1. Click "History" tab or search icon
   ↓
2. Type in search box
   - Full-text search
   - Auto-suggests as you type
   ↓
3. Optional: Apply filters
   - Date range
   - Tag filter
   - Conversation type
   ↓
4. Results display
   - Grouped by date
   - Preview first message
   ↓
5. Click conversation to load
   - Full conversation loads
   - Can ask follow-ups
```

### 6.6 USER FLOW: Customize Settings
```
1. Click Settings (gear icon)
   ↓
2. Settings View shows options
   ↓
3. Configure:
   - AI Provider & API Key
   - LLM Model selection
   - STT Model
   - Theme (light/dark)
   - Language
   - Keyboard shortcuts
   ↓
4. Changes saved automatically
   - Persisted to localStorage + Firebase
```

---

## 7. DATA/CONTENT TYPES HANDLED

### 7.1 Text Content
- User questions/queries
- AI responses (markdown)
- Conversation transcripts
- Meeting summaries
- Code snippets
- Document text

### 7.2 Media Content
- Screenshots (JPEG, base64)
- Audio files (WAV, MP3 - captured)
- Images (from documents/clipboard)
- Animated GIFs (preview)

### 7.3 Code Content
- Programming code (multiple languages)
- Syntax highlighting (highlight.js)
- Language detection
- Code block markup
- Copyable code sections
- Full-screen code view

### 7.4 Document Types
- PDF files (text extraction)
- Microsoft Word (.docx)
- Google Docs (imported)
- Images with text (OCR)
- Code files (.js, .py, .ts, etc.)

### 7.5 Conversation Data
- Messages (user + assistant)
- Timestamps
- Token counts
- Tags/labels
- Attachments
- Citations/references

### 7.6 Metadata
- Conversation ID
- Message ID
- File upload date
- Last modified
- User/Author
- Language
- Model used
- Token usage
- Processing time

---

## 8. DESIGN SYSTEM & TOKENS

### 8.1 Color Palette

**Primary Colors**:
- `--color-primary-500`: Main accent (orange #D97706 in Claude mode)
- `--color-primary-400`: Lighter accent
- `--color-primary-600`: Darker accent

**Text Colors**:
- `--text-color`: Main text (white in dark, #1a1a1a in light)
- `--color-white-90`: Light text (light theme)
- `--color-text-secondary`: Secondary text
- `--color-text-tertiary`: Tertiary/muted text

**Background Colors**:
- `--glass-bg`: Semi-transparent dark background
- `--color-gray-800`: Dark gray (dark theme)
- `--color-white-5/10/15/20`: White overlays (varying opacity)
- `--claude-bg-primary`: Light background (#F5F5F0 in light mode)

**Border Colors**:
- `--color-white-10/20`: Light borders (dark theme)
- `--claude-border-subtle`: Light border (light theme)
- `--claude-border-normal/light`: Various border colors

**Semantic Colors**:
- `--color-success`: Green (#10b981)
- `--color-error/danger`: Red (#DC2626)
- `--color-warning`: Yellow (#FBBF24)
- `--color-info`: Blue (#3b82f6)

### 8.2 Typography

**Font Families**:
- `--font-family-primary`: Main font (system fonts: Helvetica Neue, -apple-system, etc.)
- `--font-family-mono`: Monospace (for code)

**Font Sizes**:
- `--font-size-xs`: 12px
- `--font-size-sm`: 13px (used often)
- `--font-size-base`: 16px
- `--font-size-lg`: 20px
- `--font-size-xl`: 24px
- `--font-size-2xl`: 32px

**Font Weights**:
- 300: Light
- 400: Regular
- 500: Medium
- 600: Semi-bold
- 700: Bold

**Line Heights**:
- `--line-height-tight`: 1.4
- `--line-height-normal`: 1.6
- `--line-height-relaxed`: 1.8

### 8.3 Spacing

**Size Scale** (using CSS variables):
- `--space-0-5`: 4px
- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-10`: 80px
- `--space-12`: 96px

**Padding/Margin Values**:
- `--padding-xs`: 8px
- `--padding-sm`: 12px
- `--padding-md`: 16px
- `--padding-lg`: 20px
- `--padding-xl`: 24px
- `--margin-xs`: 4px
- `--margin-sm`: 8px

### 8.4 Border Radius

- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 12px (common)
- `--radius-xl`: 16px (cards, modals)
- `--radius-full`: 9999px (circles)

### 8.5 Shadows

- `--shadow-sm`: 0 1px 2px rgba(0,0,0,0.05)
- `--shadow-md`: 0 4px 6px rgba(0,0,0,0.1)
- `--shadow-lg`: 0 10px 15px rgba(0,0,0,0.1)
- `--shadow-xl`: 0 20px 25px rgba(0,0,0,0.15)

### 8.6 Animations & Transitions

**Timing Functions**:
- `--easing-ease`: ease (default)
- `--easing-standard`: cubic-bezier(0.4, 0, 0.2, 1)
- `--easing-smooth-in`: cubic-bezier(0.3, 0, 1, 0.25)
- `--easing-smooth-out`: cubic-bezier(0.25, 0.46, 0.45, 0.94)
- `--easing-elastic`: cubic-bezier(0.34, 1.56, 0.64, 1)

**Duration**:
- `--transition-fast`: 150ms
- `--transition-base`: 200ms
- `--animation-base`: 350ms
- `--animation-slow`: 500ms

**Named Animations**:
- `slideDown` / `slideUp` / `slideLeft` / `slideRight`
- `fadeIn` / `fadeOut`
- `scaleIn` / `scaleOut`
- `rotate`
- `ping` / `pulse`

### 8.7 Z-Index Scale

- `--claude-z-base`: 1
- `--claude-z-header`: 900
- `--claude-z-modal`: 1000 (dialogs, modals)
- `--claude-z-fullscreen`: 1000
- `--claude-z-dropdown`: 500
- `--claude-z-tooltip`: 1000

---

## 9. ACCESSIBILITY & INTERACTIONS

### 9.1 Keyboard Shortcuts

**Global**:
- `Cmd/Ctrl + \`: Toggle window visibility
- `Cmd/Ctrl + Enter`: Ask question (send)
- `Cmd/Ctrl + Arrows`: Move window
- `Cmd/Ctrl + P`: Open command palette
- `Cmd/Ctrl + K`: Open search
- `Cmd/Ctrl + ,`: Open settings

**In Listen View**:
- `Space`: Play/pause
- `L`: Start Listen
- `S`: Stop listening

**In Chat**:
- `Enter`: Send message
- `Shift + Enter`: New line
- `Cmd/Ctrl + Up`: Edit last message
- `Escape`: Cancel edit

**In Modals**:
- `Escape`: Close dialog
- `Enter`: Confirm action (on focused button)

### 9.2 ARIA Labels & Accessibility

- Semantic HTML elements
- ARIA labels for icon buttons
- Role="button" for interactive divs
- Tab order management
- Focus indicators
- High contrast text
- Screen reader support

### 9.3 Mobile Responsiveness

**Breakpoints**:
- `< 768px`: Mobile (show MobileHeader, drawer sidebar)
- `768px - 1024px`: Tablet (adjust layout, hide artifacts)
- `> 1024px`: Desktop (full 3-column)

**Mobile Adaptations**:
- Hamburger menu → sidebar drawer
- Stacked layout instead of columns
- Touch-friendly button sizes (48px minimum)
- Full-width modals
- Scrollable content

---

## 10. TECHNICAL IMPLEMENTATION NOTES

### 10.1 Web Components (LitElement)

**Pattern Used**:
```javascript
export class ComponentName extends LitElement {
    static properties = { /* reactive properties */ };
    static styles = css`/* CSS-in-JS */`;
    
    render() {
        return html`<!-- Lit HTML template -->`;
    }
}

customElements.define('component-name', ComponentName);
```

### 10.2 Styling Approach

- **CSS-in-JS via LitElement**: `css` template literal
- **CSS Custom Properties**: Design tokens
- **CSS Cascade**: Inherits from host element
- **Shadow DOM**: Encapsulation for components
- **No CSS Framework**: Pure CSS (no Tailwind, Bootstrap)

### 10.3 State Management

- **LitElement Properties**: Reactive state
- **localStorage**: Persistent settings
- **Firebase**: Cloud sync
- **Services**: Business logic separation
- **Event Emitters**: Component communication
- **Lit store pattern**: Shared state (optional)

### 10.4 Asset Files

- `lit-core-2.7.4.min.js`: LitElement library
- `marked-4.3.0.min.js`: Markdown parser
- `highlight-11.9.0.min.js`: Code syntax highlighting
- `dompurify-3.0.7.min.js`: XSS protection
- `smd.js`: Simple markdown rendering

### 10.5 Service Architecture

**Services Pattern**:
- Singleton services in `src/ui/services/`
- Business logic separated from components
- Event-driven communication
- Dependency injection via imports
- Observable patterns (optional)

**Key Services**:
- `themeService.js`: Theme management
- `toastService.js`: Notifications
- `exportService.js`: Export conversations
- `tagsService.js`: Tag management
- `statisticsService.js`: Analytics
- `advancedSearchService.js`: Search logic
- `viewportService.js`: Viewport tracking
- `uiModeService.js`: UI mode switching

---

## 11. PERFORMANCE OPTIMIZATIONS

### 11.1 Animations & Performance
- `will-change` on animated elements
- `backface-visibility: hidden` for GPU acceleration
- `translate3d(0, 0, 0)` for hardware acceleration
- Debounced search/resize handlers
- RequestAnimationFrame for smooth animations

### 11.2 Code Splitting
- Lazy loading of large components
- Async imports for routes
- Module bundling with esbuild
- Dynamic imports for code blocks

### 11.3 Image Optimization
- Sharp.js for image compression
- JPEG quality settings (70-80%)
- Base64 encoding for inline images
- Thumbnail generation

---

## 12. BRANDING & VISUAL IDENTITY

### Logo/Icon
- Letter "L" in rounded square
- Orange accent color (#D97706)
- 32x32px standard size
- Appears in sidebar header

### Color Scheme
**Dark Theme (Classic)**:
- Dark backgrounds (#1a1a1a, transparent overlays)
- Light text (white, light gray)
- Orange/blue accents
- Glassmorphic (semi-transparent, blurred)

**Light Theme (Claude)**:
- Light background (#F5F5F0)
- Dark text (#1a1a1a)
- Orange accents (#D97706)
- Clean, minimal

### Typography
- Clean sans-serif (system fonts)
- Monospace for code
- Generous line-height (1.6)
- Good contrast ratios

### Visual Style
- Rounded corners (8-16px)
- Subtle shadows
- Smooth animations
- Glassmorphic effects (dark mode)
- Minimalist layout

---

## CONCLUSION

Lucide is a sophisticated, feature-rich AI assistant application with:
- Multiple UI modes and views
- Real-time capture and transcription
- AI-powered analysis and responses
- Comprehensive conversation management
- Modern, accessible UI design
- Strong privacy/invisibility features
- Flexible AI provider support
- Production-ready architecture

**For Graphic Designer**: The UI is primarily built with:
- **Light theme**: Clean, spacious, orange accents
- **Dark theme**: Glassmorphic, dark backgrounds, white text
- **Component-based**: Modular, reusable components
- **Token-driven**: Design tokens for consistency
- **Responsive**: Works on desktop and mobile

Key areas for redesign focus:
1. **Layout refinement** (spacing, alignment)
2. **Typography hierarchy** (font sizes, weights)
3. **Color system** (palette expansion, semantic colors)
4. **Iconography** (custom icons vs emoji)
5. **Animations** (transition refinement)
6. **Mobile experience** (touch-friendly, responsive)
7. **Accessibility** (contrast, focus states)
8. **Visual hierarchy** (prominence, emphasis)

