# Lucide - AI-Powered Meeting Assistant 🎙️

**Lucide** is a comprehensive, intelligent meeting assistant built with Electron that transforms your meetings into actionable insights through real-time transcription, AI analysis, and automated follow-up.

## ✨ Key Features

### 🎯 Phase 1: Meeting Notes & Export
- **Real-time transcription** with Speech-to-Text
- **AI-powered summaries** using Claude Sonnet 4
- **Multi-format export** (Markdown, PDF, CSV)
- **Persistent storage** (SQLite/Firebase)

### 👥 Phase 2: Smart Attribution & Follow-up
- **Speaker attribution** with intelligent participant detection
- **Email generation** (4 types: Follow-up, Summary, Action Items, Thank You)
- **Advanced task management** with priorities, tags, and deadlines
- **AI-powered suggestions** for next steps and action items

### 💡 Phase 3: Live Insights & Intelligence
- **Real-time insight detection** (8 types: decisions, actions, deadlines, questions, key points, blockers, topic changes, recurring topics)
- **AI sentiment analysis** (5 types: positive, neutral, negative, urgent, collaborative)
- **Proactive AI suggestions** generated every 5 conversation turns
- **Smart notifications** (desktop + in-app) with priority-based alerting
- **30+ pattern detection** algorithms for context-aware insights

### 📊 Phase 4: Analytics & Dashboard
- **Comprehensive analytics** across all your meetings
- **Trending topics** extraction with frequency analysis
- **Productivity trends** tracking (daily/weekly/monthly)
- **Session comparisons** and engagement scoring
- **Interactive dashboard** with period filtering (7 days, 30 days, all time)

## 🚀 Quick Start

### Prerequisites

- **Node.js** v20.x.x ([Download](https://nodejs.org/en/download))
- **Python** ([Download](https://www.python.org/downloads/))
- **Windows only**: [Build Tools for Visual Studio](https://visualstudio.microsoft.com/downloads/)

```bash
# Check your Node.js version
node --version

# If needed, use nvm to switch to Node.js 20
# nvm install 20
# nvm use 20
```

### Installation

```bash
# Clone the repository
git clone https://github.com/roblucci9302/Lucide-pas-loin.git
cd Lucide-pas-loin

# Install dependencies
npm run setup

# Start the application
npm start
```

### Optional Dependencies

Lucide uses a graceful degradation system. Core features work without these, but for full functionality:

```bash
# All optional dependencies
npm install uuid better-sqlite3 pg mysql2

# Or individually
npm install uuid          # For document indexing
npm install better-sqlite3 # For local SQLite database
npm install pg            # For PostgreSQL support
npm install mysql2        # For MySQL support
```

## 🎨 Features Deep Dive

### Live Insights Detection

Lucide automatically detects and categorizes insights during your meetings:

- **✅ Decisions**: "We decided to go with option A"
- **📋 Actions**: "John will handle the API integration"
- **⏰ Deadlines**: "We need this by next Friday"
- **❓ Questions**: "How should we approach the database design?"
- **💡 Key Points**: "The most important aspect is security"
- **⛔ Blockers**: "We're blocked by the API issue"
- **🔄 Topic Changes**: "Let's talk about the frontend now"
- **🔁 Recurring Topics**: Topics mentioned 3+ times

### Intelligent Notifications

- **4 priority levels**: Low, Medium, High, Critical
- **Desktop notifications** for high-priority insights
- **In-app notification center** with badge counter
- **Configurable preferences** (types, sound, desktop/in-app)
- **Auto-expiration** for non-critical notifications (30s)

### Analytics Dashboard

- **Overview statistics**: Total meetings, duration, insights, transcriptions
- **Insights breakdown** by type with visual cards
- **Most productive day** identification
- **Trending topics** with frequency bars
- **Productivity timeline** with visual trends

### Task Management

- **5 task states**: Todo, In Progress, Completed, Cancelled, On Hold
- **Priority levels**: Low, Medium, High, Urgent
- **Custom tags** and categorization
- **Deadline tracking** with reminders
- **CSV export** for external tools
- **Advanced filtering** by status, priority, tags

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Lit Elements (Web Components)
- **Backend**: Electron + Node.js
- **Database**: SQLite (local) + Firebase (optional cloud sync)
- **AI**: Claude Sonnet 4 (Anthropic)
- **STT**: Multiple providers (OpenAI, Google, Local)

### Project Structure

```
src/
├── features/
│   ├── listen/              # Meeting recording & transcription
│   │   ├── stt/            # Speech-to-Text service
│   │   ├── summary/        # AI summary generation
│   │   ├── export/         # Export to MD/PDF/CSV
│   │   ├── participants/   # Speaker attribution (Phase 2.1)
│   │   ├── email/          # Email generation (Phase 2.2)
│   │   ├── tasks/          # Task management (Phase 2.3)
│   │   ├── followUp/       # AI suggestions (Phase 2.4)
│   │   └── liveInsights/   # Real-time insights (Phase 3)
│   │       ├── liveInsightsService.js
│   │       ├── notificationService.js
│   │       └── contextualAnalysisService.js
│   └── analytics/          # Analytics & Dashboard (Phase 4)
├── ui/
│   ├── listen/             # Meeting UI components
│   │   ├── LiveInsightsPanel.js
│   │   └── NotificationCenter.js
│   └── analytics/          # Analytics dashboard
│       └── AnalyticsDashboard.js
├── bridge/                 # IPC communication
│   └── modules/            # Feature-specific bridges
└── preload.js             # Exposed APIs
```

### API Overview

Lucide exposes 50+ methods via `window.api`:

- **Insights**: 14 methods + 4 event listeners
- **Notifications**: 14 methods + 6 event listeners
- **Analytics**: 5 methods
- **Tasks**: Extended task management
- **Participants**: 7 methods
- **Email**: 5 methods

## ⌨️ Keyboard Shortcuts

- `Ctrl/Cmd + \` : Show/hide main window
- `Ctrl/Cmd + Enter` : Ask AI using context
- `Ctrl/Cmd + Arrows` : Move window position

## 🧪 Testing

### Integration Tests

```bash
# Start test databases (Docker required)
npm run docker:start

# Run all integration tests
npm run test:integration

# Run specific database tests
npm run test:integration:postgres
npm run test:integration:mysql
npm run test:integration:sqlite

# Stop test databases
npm run docker:stop
```

### Manual Testing

Follow the comprehensive testing guide:

```bash
# View testing guide
cat TESTING_GUIDE.md
```

**31 manual test cases** covering all phases:
- Phase 1: 4 tests
- Phase 2: 5 tests
- Phase 3: 11 tests
- Phase 4: 8 tests
- Integration: 3 tests

## 📊 Implementation Stats

- **~6500+ lines** of production code
- **18 new files** created
- **8 files** modified
- **50+ API methods** exposed
- **10+ AI prompts** implemented
- **8 insight types** detected
- **30+ regex patterns** for detection

## 🤝 Contributing

We welcome contributions! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass before submitting

## 📝 Documentation

- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**: Manual testing guide (31 tests)
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)**: Complete feature documentation
- **[DEPENDENCY_MANAGEMENT.md](./DEPENDENCY_MANAGEMENT.md)**: Dependency guide
- **[CONTRIBUTING.md](./CONTRIBUTING.md)**: Contribution guidelines

## 🔧 Configuration

### API Keys

Lucide supports multiple AI providers:

- **OpenAI API**: [Get API Key](https://platform.openai.com/api-keys)
- **Gemini API**: [Get API Key](https://aistudio.google.com/apikey)
- **Claude API**: [Get API Key](https://console.anthropic.com/)
- **Local LLM**: Ollama & Whisper (no API key needed)

Configure in Settings → API Keys

### Notification Preferences

Customize notification behavior in Settings:
- Desktop notifications (on/off)
- In-app notifications (on/off)
- Sound alerts
- Priority filters (high only, all, etc.)
- Type filters (blockers, deadlines, decisions, etc.)

## 🗺️ Roadmap

### Completed ✅
- [x] Phase 1: Meeting Notes & Export
- [x] Phase 2: Attribution, Emails, Tasks, Suggestions
- [x] Phase 3: Live Insights, AI Analysis, Notifications
- [x] Phase 4: Analytics & Dashboard

### Future Enhancements 🚀
- [ ] Multi-language support
- [ ] Integration with Slack, Teams, Calendar
- [ ] Collaborative note-taking
- [ ] Voice commands during meetings
- [ ] Mobile app (iOS/Android)
- [ ] Cloud synchronization improvements
- [ ] Custom AI model training
- [ ] Meeting templates

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

This project is a fork of [CheatingDaddy](https://github.com/sohzm/cheating-daddy) with extensive modifications. Thanks to [Soham](https://x.com/soham_btw) and all open-source contributors.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/roblucci9302/Lucide-pas-loin/issues)
- **Discussions**: [GitHub Discussions](https://github.com/roblucci9302/Lucide-pas-loin/discussions)

---

**Built with ❤️ using Electron, Lit Elements**

*Last updated: 2025-11-22*
