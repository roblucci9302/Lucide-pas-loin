# SPÉCIFICATION DESIGN LUCIDE - POUR GRAPHISTE
## Document de Référence pour la Refonte du Front-End

---

## 📋 PRÉSENTATION DE L'APPLICATION

### Qu'est-ce que Lucide ?

**Lucide** (anciennement "Glass by Pickle") est une **application desktop d'assistant IA** sophistiquée qui combine plusieurs fonctionnalités avancées :

#### Fonctionnalités Principales
1. **Capture d'écran intelligente** - Analyse en temps réel ce que vous voyez
2. **Transcription de réunions** - Transcrit et résume les conversations en direct
3. **Chat avec IA** - Conversations avec plusieurs modèles d'IA (Claude, GPT-4, etc.)
4. **Gestion de documents** - Upload et analyse de fichiers
5. **Historique de conversations** - Archive et recherche avancée
6. **Mode invisible** - N'apparaît pas dans les captures d'écran/enregistrements

#### Technologies
- **Application**: Electron (Desktop multi-plateforme)
- **Frontend**: Web Components (LitElement) - PAS de React/Vue
- **Styling**: CSS Custom Properties + CSS-in-JS
- **Design Tokens**: Système de variables CSS pour thématisation

---

## 🎨 SYSTÈME DE DESIGN ACTUEL

### Deux Modes Visuels

#### 1. Mode CLASSIQUE (Sombre)
- **Style**: Glassmorphisme (verre flou)
- **Fond**: Sombre avec effets d'opacité/flou
- **Texte**: Blanc (#FFFFFF)
- **Accent**: Orange (#D97706)
- **Ambiance**: Moderne, élégant, futuriste

#### 2. Mode CLAUDE (Clair)
- **Style**: Minimal, inspiré de Claude.ai
- **Fond**: Beige clair (#F5F5F0)
- **Texte**: Gris foncé (#1a1a1a)
- **Accent**: Orange (#D97706)
- **Ambiance**: Épuré, professionnel, lisible

### Palette de Couleurs

```
COULEURS PRINCIPALES
├── Accent Orange: #D97706
├── Succès Vert: #10b981
├── Erreur Rouge: #DC2626
└── Attention Jaune: #FBBF24

MODE SOMBRE
├── Fond: rgba(0, 0, 0, 0.8) avec flou
├── Texte: #FFFFFF
├── Bordures: rgba(255, 255, 255, 0.1-0.2)
└── Ombres: Profondes avec flou

MODE CLAIR
├── Fond: #F5F5F0 (beige chaud)
├── Texte: #1a1a1a (presque noir)
├── Bordures: #e5e5e0 (gris clair)
└── Ombres: Légères et subtiles
```

### Typographie

```
FAMILLE DE POLICES
├── Système: -apple-system, Helvetica Neue, Roboto, Arial
└── Monospace: 'Consolas', 'Monaco', 'Courier New'

TAILLES
├── xs: 11px (labels, légendes)
├── sm: 13px (texte standard)
├── base: 16px (titres secondaires)
├── lg: 20px (titres)
├── xl: 24px (grands titres)
└── 2xl: 32px (titres hero)

POIDS
├── Light: 300
├── Regular: 400
├── Medium: 500
├── Semibold: 600
└── Bold: 700
```

### Espacements & Grille

```
SYSTÈME 8px
├── 4px (0.5 unité)
├── 8px (1 unité) - base
├── 12px (1.5 unités)
├── 16px (2 unités)
├── 24px (3 unités)
├── 32px (4 unités)
└── 48px (6 unités)

BORDURES
├── Rayon: 4px, 6px, 8px, 12px, 16px
└── Épaisseur: 1px standard

OMBRES
├── sm: 0 1px 2px rgba(0,0,0,0.05)
├── md: 0 4px 6px rgba(0,0,0,0.1)
└── lg: 0 10px 15px rgba(0,0,0,0.15)
```

---

## 📱 LES 7 VUES PRINCIPALES

### 1. 🎤 LISTEN VIEW (Écoute/Transcription)
**Largeur**: 400px | **Type**: Fenêtre flottante

**Composants**:
- **Header** avec statut de connexion
- **3 Onglets**:
  - 📝 Transcript (transcription en temps réel)
  - 💡 Insights (résumé IA, action items)
  - 💬 Responses (suggestions de réponses)
- **Bulles de conversation** avec timestamps
- **Boutons de contrôle** (start/stop, paramètres)

**Usage**: 
Transcrit les réunions en temps réel et génère des résumés intelligents avec action items.

---

### 2. 💬 ASK VIEW (Chat/Conversation)
**Type**: Plein écran | **2 Modes disponibles**

#### Mode CLASSIQUE
```
┌─────────────────────────────┐
│      Boutons navigation     │
├─────────────────────────────┤
│                             │
│    Zone de réponse IA       │
│    (plein écran)            │
│    • Markdown                │
│    • Code blocks             │
│    • Formatage riche         │
│                             │
├─────────────────────────────┤
│  Input + Bouton Send        │
└─────────────────────────────┘
```

#### Mode CLAUDE (Nouveau)
```
┌──────────┬───────────────────┬──────────┐
│  SIDEBAR │      CHAT         │ ARTIFACTS│
│  260px   │    flex-grow      │  400px   │
│          │                   │          │
│ • Convos │  Messages:        │ • Code   │
│ • Search │  ┌─────────────┐  │ • Preview│
│ • New    │  │ User msg    │  │ • Render │
│ • Tags   │  └─────────────┘  │          │
│ • Filter │  ┌─────────────┐  │          │
│          │  │ AI response │  │          │
│          │  │ + actions   │  │          │
│          │  └─────────────┘  │          │
│          │                   │          │
│          │ Input fixe:       │          │
│          │ • Textarea        │          │
│          │ • Upload files    │          │
│          │ • Send button     │          │
└──────────┴───────────────────┴──────────┘
```

**Fonctionnalités**:
- Messages utilisateur (droite, fond clair)
- Messages assistant (gauche, avec avatar)
- Actions sur messages (copier, éditer, régénérer, réagir, supprimer)
- Upload de fichiers par drag-and-drop
- Preview des fichiers uploadés
- Code blocks avec coloration syntaxique
- Panel Artifacts pour code/previews
- Recherche avancée dans conversations
- Tags et filtres
- Export (Markdown, PDF, JSON)

---

### 3. 📄 DOCUMENTS VIEW
**Type**: Vue liste avec grille

```
┌─────────────────────────────────┐
│  Header [+ Upload] [Search]     │
├─────────────────────────────────┤
│  Filters: [All] [PDFs] [Images] │
├─────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐     │
│  │ Doc │  │ Doc │  │ Doc │     │
│  │ 1   │  │ 2   │  │ 3   │     │
│  └─────┘  └─────┘  └─────┘     │
│                                 │
│  • Drag & Drop Zone             │
│  • Preview on hover             │
│  • Context menu                 │
└─────────────────────────────────┘
```

**Fonctionnalités**:
- Upload par drag-and-drop ou bouton
- Cards avec preview/thumbnails
- Recherche et filtres
- Types supportés: PDF, DOCX, images, etc.

---

### 4. 📚 HISTORY VIEW (Historique)
**Largeur**: 320px | **Type**: Sidebar

```
┌─────────────────────┐
│  Historique         │
│  X conversations    │
├─────────────────────┤
│  🔍 [Search...]     │
├─────────────────────┤
│  [Today] [Week]     │
│  [Month] [All]      │
├─────────────────────┤
│  ┌─────────────┐    │
│  │ Convo 1     │    │
│  │ Timestamp   │    │
│  └─────────────┘    │
│  ┌─────────────┐    │
│  │ Convo 2     │    │
│  │ Timestamp   │    │
│  └─────────────┘    │
│  ...                │
└─────────────────────┘
```

**Fonctionnalités**:
- Liste scrollable des conversations
- Filtres temporels
- Recherche
- Statistiques

---

### 5. ⚙️ SETTINGS VIEW
**Largeur**: 240px | **Type**: Sidebar

**Sections**:
- 🔑 **API Keys** (OpenAI, Anthropic, etc.)
- 🤖 **Model Selection** (GPT-4, Claude, etc.)
- 🎨 **Theme** (Light/Dark/Auto)
- ⌨️ **Shortcuts** (Display only)
- 👤 **Account** (User info)
- 🔧 **Advanced** (Advanced options)

---

### 6. 🌐 BROWSER VIEW
**Type**: Plein écran navigateur web intégré

```
┌─────────────────────────────────┐
│ ← → ↻  [https://...] [🔍] [⚙️] │
├─────────────────────────────────┤
│                                 │
│     Webview / Browser           │
│                                 │
└─────────────────────────────────┘
```

**Fonctionnalités**:
- Navigation (back, forward, refresh)
- Barre d'URL avec indicateur HTTPS
- Contrôles de zoom
- DevTools toggle
- Find-in-page

---

### 7. 🚀 ONBOARDING WIZARD
**Type**: Assistant multi-étapes

**Étapes** (4-5 steps):
1. **Bienvenue** - Intro à l'app
2. **Profil** - Sélection du profil utilisateur
3. **API Keys** - Configuration des clés
4. **Permissions** - Demande d'accès (screen capture, etc.)
5. **Terminé** - Prêt à utiliser

**UI**:
- Progress dots en haut
- Boutons Next/Back
- Skip option
- Animation de transition

---

## 🧩 35 COMPOSANTS UI (Liste Complète)

### COMPOSANTS DE BASE (4)
1. **ClaudeButton** - Variantes: primary, secondary, danger, ghost
2. **ClaudeInput** - Input texte avec états (focus, error, disabled)
3. **ClaudeCard** - Container avec coins arrondis
4. **ClaudeAvatar** - Avatars utilisateur/profil (rond, 32-48px)

### COMPOSANTS DE MESSAGES (4)
5. **MessageUser** - Message utilisateur (aligné droite, fond clair)
6. **MessageAssistant** - Message IA (aligné gauche, avec avatar, markdown)
7. **MessageActionBar** - Barre d'actions (copy, like, regenerate, share)
8. **MessageActions** - Actions sur messages (éditer, supprimer, réactions)

### COMPOSANTS D'INPUT (1)
9. **ClaudeInputArea** - Textarea auto-expand + upload + bouton send

### COMPOSANTS D'UPLOAD (2)
10. **FileDropZone** - Zone drag-and-drop avec feedback visuel
11. **FilePreview** - Preview fichier (thumbnail, taille, progress, bouton remove)

### COMPOSANTS DE DIALOGUE (3)
12. **ConfirmDialog** - Dialogue de confirmation (Yes/No, variantes)
13. **RenameConversationDialog** - Renommer une conversation
14. **ExportDialog** - Sélection format d'export + download

### COMPOSANTS DE NOTIFICATION (2)
15. **ToastContainer** - Conteneur pour toasts
16. **ToastNotification** - Notification toast (success, error, warning, info)

### COMPOSANTS DE CODE (1)
17. **CodeBlock** - Bloc de code avec:
    - Coloration syntaxique (20+ langages)
    - Numéros de ligne
    - Bouton copier
    - Badge de langage
    - Support plein écran

### COMPOSANTS DE RECHERCHE (1)
18. **AdvancedSearchPanel** - Panneau de recherche avec:
    - Filtres (date, rôle, tags)
    - Opérateurs (AND, OR, NOT)
    - Historique de recherche
    - Preview des résultats

### COMPOSANTS DE TAGS (2)
19. **TagFilter** - Affichage et filtre par tags
20. **TagManager** - Gestion des tags (ajouter, supprimer, créer)

### COMPOSANTS DE STATISTIQUES (2)
21. **StatisticsPanel** - Panneau de stats
22. **StatisticsModal** - Modal de statistiques détaillées

### COMPOSANTS DE SETTINGS (2)
23. **SettingsPanel** - Panneau de configuration principal
24. **NotificationSettings** - Paramètres de notifications

### COMPOSANTS D'ARTIFACTS (1)
25. **ArtifactsPanel** - Panneau latéral pour:
    - Preview de code
    - Rendering HTML/SVG
    - Download

### COMPOSANTS DE THÈME (2)
26. **ThemeToggle** - Switch Light/Dark rapide
27. **ThemeSelector** - Sélecteur de thèmes de profil

### COMPOSANTS DE SIDEBAR (1)
28. **ConversationSidebar** - Sidebar conversations avec:
    - Liste des conversations
    - Recherche
    - Sélecteur de profil
    - Nouveau chat

### COMPOSANTS DE COMMANDE (1)
29. **CommandPalette** - Palette de commandes avec:
    - Fuzzy search
    - Catégories
    - Navigation clavier
    - Raccourcis affichés

### COMPOSANTS MOBILE (1)
30. **MobileHeader** - Header mobile avec menu hamburger

### COMPOSANTS DE LOADING (1)
31. **LoadingSkeleton** - Placeholders animés (shimmer effect):
    - Text
    - Avatar
    - Card
    - Message
    - Conversation

### COMPOSANTS D'ERREUR (1)
32. **ErrorBoundary** - Capture et affichage d'erreurs avec:
    - Icône d'erreur
    - Message
    - Bouton Retry
    - Bouton Reload

### AUTRES COMPOSANTS (3)
33. **ClaudeLayout** - Layout principal 3 colonnes
34. **ProfileThemeManager** - Gestion des thèmes de profil
35. **ProfileSuggestionBanner** - Bannière de suggestion de profil

---

## 🎯 FONCTIONNALITÉS PRINCIPALES

### 1. 🎤 LISTEN (Écoute en Temps Réel)
- **STT (Speech-to-Text)**: Transcription live
- **Summarization**: Résumé automatique avec points clés
- **Action Items**: Extraction automatique des tâches
- **Response Suggestions**: 2-3 suggestions de réponse
- **Export**: Transcript + summary

### 2. 💬 ASK (Chat/Conversation)
- **Multi-Provider**: OpenAI, Anthropic, Google, etc.
- **Streaming**: Réponses en temps réel
- **Markdown**: Formatage riche
- **Code Blocks**: Coloration syntaxique
- **File Upload**: Images, PDFs, documents
- **Conversation Management**: Renommer, supprimer, exporter
- **Search**: Recherche avancée dans messages
- **Tags**: Organisation par tags

### 3. 📄 DOCUMENTS
- **Upload**: Drag-and-drop ou bouton
- **Formats**: PDF, DOCX, images, etc.
- **Preview**: Thumbnails et preview rapide
- **OCR**: Extraction de texte
- **Indexation**: Recherche dans contenu

### 4. 📚 HISTORY
- **Archive**: Toutes les conversations
- **Search**: Recherche full-text
- **Filters**: Date, tags, profil
- **Stats**: Nombre de messages, tokens utilisés

### 5. 👤 PROFILES
- **Agent Profiles**: Différents modes (Developer, Writer, etc.)
- **Custom Prompts**: Prompts personnalisés par profil
- **Themes**: Thèmes visuels par profil

### 6. 🎨 THEMES
- **Light/Dark**: Basculement automatique
- **Auto**: Suit les préférences système
- **Custom**: Couleurs personnalisables

### 7. 👁️ INVISIBILITÉ
- **Screen Capture**: Invisible dans screenshots
- **Recording**: Invisible dans enregistrements
- **Dock**: Peut être masqué du dock

### 8. 📴 OFFLINE
- **Cache**: Conversations en cache
- **Sync**: Synchronisation auto à la reconnexion

---

## 🔄 PARCOURS UTILISATEUR TYPIQUES

### Parcours 1: Nouvelle Conversation
```
1. Ouvrir l'app
2. Cliquer "New Chat" dans sidebar
3. Taper un message
4. Upload fichiers (optionnel)
5. Envoyer
6. Recevoir réponse streamée
7. Actions sur message (copier, régénérer, etc.)
```

### Parcours 2: Transcription de Réunion
```
1. Ouvrir Listen View
2. Cliquer "Start Recording"
3. Transcription en temps réel
4. Voir résumé dans onglet Insights
5. Voir suggestions de réponses
6. Copier résumé ou action items
7. Export transcript
```

### Parcours 3: Upload de Document
```
1. Aller dans Documents View
2. Drag-and-drop fichier
3. Attendre upload + processing
4. Document indexé et searchable
5. Poser question sur le document dans Ask
```

### Parcours 4: Recherche dans Historique
```
1. Ouvrir History View
2. Taper recherche
3. Appliquer filtres (date, tags)
4. Cliquer sur conversation
5. Reprendre conversation
```

---

## 📐 MESURES & DIMENSIONS CLÉS

### Largeurs
```
Sidebar Conversations:   260px
History Sidebar:         320px
Settings Sidebar:        240px
Listen View:             400px
Artifacts Panel:         400px
Messages (max-width):    800px
```

### Hauteurs
```
Header:                  60-80px
Input Area:              Auto (min 56px, max 200px)
Message Bubble:          Auto (min 40px)
Toast:                   Auto (min 48px)
```

### Breakpoints Responsive
```
Mobile:     < 768px
Tablet:     768px - 1024px
Desktop:    1024px - 1280px
Wide:       > 1280px
```

---

## ⚡ ANIMATIONS & TRANSITIONS

### Durées
```
Fast:       150ms (hover, focus)
Base:       250ms (transitions standard)
Slow:       350ms (modals, panels)
Elastic:    500ms (bouncy effects)
```

### Easings
```
ease-in:    Accélération
ease-out:   Décélération (préféré)
ease-in-out: S-curve
elastic:    Rebond (pour feedbacks)
```

### Animations Communes
```
- Fade in/out (opacity)
- Slide in/out (transform)
- Scale (transform)
- Shimmer (loading)
- Bounce (feedback)
```

---

## ♿ ACCESSIBILITÉ

### Keyboard Navigation
- **Tab**: Navigation entre éléments
- **Enter**: Activer bouton/lien
- **Esc**: Fermer modal/dialog
- **Cmd/Ctrl+K**: Command Palette
- **Cmd/Ctrl+F**: Search
- **Cmd/Ctrl+N**: New Chat
- **Arrows**: Navigation dans listes

### ARIA
- Tous les boutons ont `aria-label`
- Dialogs utilisent `role="dialog"`
- Alerts utilisent `role="alert"`
- Navigation avec `role="navigation"`

### Focus Visible
- Outline bleu sur focus
- Skip links pour navigation rapide

---

## 📱 RESPONSIVE DESIGN

### Mobile (< 768px)
- Sidebar en overlay
- Messages pleine largeur
- Input simplifié
- Hamburger menu
- Gestures (swipe)

### Tablet (768px - 1024px)
- Sidebar collapsible
- Messages max 600px
- Touch targets 44x44px min

### Desktop (> 1024px)
- Layout 3 colonnes
- Keyboard shortcuts actifs
- Hover effects
- Multi-window support

---

## 🎨 RECOMMANDATIONS POUR LA REFONTE

### Priorités Design
1. **Clarté**: Interface épurée, hiérarchie claire
2. **Performance**: Animations fluides, pas de lag
3. **Accessibilité**: WCAG 2.1 AA minimum
4. **Cohérence**: Design system rigoureux
5. **Feedback**: Retours visuels immédiats

### Ce qui Fonctionne Bien (À Conserver)
✅ Système de design tokens
✅ Mode Claude (layout 3 colonnes)
✅ Code blocks avec coloration syntaxique
✅ Animations subtiles et fluides
✅ Responsive design
✅ Drag-and-drop file upload
✅ Search avancée
✅ Command Palette

### Ce qui Peut Être Amélioré
⚠️ Icônes (actuellement des emojis → utiliser des SVG)
⚠️ Contraste de certains textes en mode sombre
⚠️ Spacing inconsistant dans certaines vues
⚠️ Trop de variantes de boutons (simplifier)
⚠️ Mobile experience (améliorer touch targets)
⚠️ Onboarding (rendre plus engageant)
⚠️ Illustrations/Empty states (ajouter)

### Suggestions d'Amélioration
💡 **Illustrations**: Ajouter des illustrations custom pour empty states
💡 **Micro-interactions**: Plus de feedback visuel sur actions
💡 **Dark Mode**: Améliorer le contraste et la lisibilité
💡 **Icons**: Bibliothèque d'icônes SVG cohérente
💡 **Loading States**: Plus d'états de chargement contextuels
💡 **Errors**: Messages d'erreur plus explicites et visuels
💡 **Tooltips**: Plus de tooltips pour guider l'utilisateur
💡 **Shortcuts Visual**: Affichage des raccourcis dans l'UI

---

## 📦 LIVRABLES ATTENDUS DU GRAPHISTE

### 1. Design System
- [ ] Palette de couleurs finalisée (Light + Dark)
- [ ] Typographie (font pairing, tailles, poids)
- [ ] Espacements (8px grid system)
- [ ] Composants de base (boutons, inputs, cards, etc.)
- [ ] Icônes SVG (set complet, monochrome)
- [ ] Illustrations (empty states, onboarding, errors)

### 2. Maquettes Figma/Sketch
- [ ] **7 vues principales** (desktop + mobile)
- [ ] **35 composants** documentés
- [ ] **Flows utilisateur** (wireflows)
- [ ] **Prototypes interactifs** (key flows)
- [ ] **Specs d'export** (pour développeurs)

### 3. Documentation
- [ ] Guide de style (style guide)
- [ ] Tokens documentation (JSON export)
- [ ] Component library (Storybook-ready)
- [ ] Animation guidelines
- [ ] Accessibility checklist

### 4. Assets
- [ ] Icônes (SVG, multiple sizes)
- [ ] Illustrations (SVG optimisés)
- [ ] Logos (multiple formats)
- [ ] Favicons (multiple sizes)
- [ ] App icons (macOS, Windows, Linux)

---

## 🔗 DOCUMENTS COMPLETS DISPONIBLES

Pour plus de détails techniques, consulter :

1. **LUCIDE_DESIGN_SPECIFICATION.md** (1,500+ lignes)
   - Spécifications techniques complètes
   - Architecture des composants
   - Code samples
   - Services & API

2. **DESIGN_SUMMARY.md** (Ce document - version anglaise)
   - Vue d'ensemble rapide
   - Référence visuelle
   - Checklist

3. **LAYOUT_DIAGRAMS.md**
   - Diagrammes ASCII des layouts
   - Dimensions exactes
   - Spacing grids
   - Responsive breakpoints

---

## 📞 PROCHAINES ÉTAPES

1. **Review** - Le graphiste lit cette spécification
2. **Questions** - Clarifications et précisions
3. **Exploration** - Essai de l'app actuelle (si possible)
4. **Moodboard** - Création de références visuelles
5. **Wireframes** - Premiers concepts low-fi
6. **Mockups** - Designs haute-fidélité
7. **Prototype** - Prototype interactif
8. **Validation** - Review et ajustements
9. **Handoff** - Export specs pour développeurs

---

**Bon courage pour la refonte ! 🎨✨**

Si vous avez des questions, n'hésitez pas à demander des clarifications sur n'importe quelle partie de cette spécification.
