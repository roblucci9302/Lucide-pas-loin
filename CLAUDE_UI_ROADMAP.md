# 🗺️ Roadmap - Améliorations Interface Claude Lucide

**Statut Actuel** : Interface Claude complète avec backend intégré
**Dernière mise à jour** : 2025-11-19

---

## ✅ Complété (Phases 0-6 + Intégrations)

- [x] Phase 0-6: Foundation, Layout, Messages, Input, Artifacts, Dark Mode, Animations
- [x] Backend Integration: IPC Bridge, Streaming, State Management
- [x] Settings Panel: Mode/Theme Toggle
- [x] Keyboard Shortcuts: Cmd+K, Cmd+,, Esc
- [x] Toast Notifications: Success/Error/Warning/Info
- [x] Conversation Search: Real-time filtering with highlights

**Lignes de code** : ~8500+ lignes
**Fichiers créés** : 25+ composants et services

---

## 🚀 Plan d'Implémentation - Prochaines Améliorations

### **PHASE 7 : Gestion Avancée des Conversations** (Priorité : HAUTE)
**Durée estimée** : 2-3 jours
**Difficulté** : ⭐⭐⭐

#### 7.1 - Renommer les Conversations
- [ ] Modal de renommage avec input
- [ ] Validation du titre (min 1 char, max 100 chars)
- [ ] Appel IPC `ask:updateSessionTitle`
- [ ] Update en temps réel dans la sidebar
- [ ] Toast de confirmation "Conversation renommée"
- [ ] Raccourci : F2 ou double-clic sur titre

**Fichiers à créer** :
- `src/ui/components/dialogs/RenameConversationDialog.js`

**Fichiers à modifier** :
- `src/ui/components/ConversationSidebar.js` (ajouter événement rename)
- `src/ui/ask/ClaudeAskView.js` (handler rename)

#### 7.2 - Supprimer les Conversations
- [ ] Modal de confirmation "Êtes-vous sûr ?"
- [ ] Option "Ne plus me demander" (localStorage)
- [ ] Appel IPC `ask:deleteSession`
- [ ] Suppression de la liste + redirection vers nouvelle conversation
- [ ] Toast de confirmation "Conversation supprimée"
- [ ] Raccourci : Delete/Backspace (avec modal)

**Fichiers à créer** :
- `src/ui/components/dialogs/ConfirmDialog.js` (réutilisable)

**Fichiers à modifier** :
- `src/ui/components/ConversationSidebar.js` (ajouter événement delete)
- `src/ui/ask/ClaudeAskView.js` (handler delete)

#### 7.3 - Actions en Masse
- [ ] Checkbox de sélection multiple
- [ ] Barre d'actions flottante en bas (Supprimer sélection, Exporter)
- [ ] Sélection avec Shift (range selection)
- [ ] Raccourci : Cmd+A (tout sélectionner)

**Fichiers à modifier** :
- `src/ui/components/ConversationSidebar.js`

---

### **PHASE 8 : Export de Conversations** (Priorité : HAUTE)
**Durée estimée** : 2-3 jours
**Difficulté** : ⭐⭐⭐⭐

#### 8.1 - Export Markdown
- [ ] Générer fichier .md avec conversation complète
- [ ] Format : `# Conversation - [Titre]\n\n## Vous\n[message]\n\n## Lucide\n[réponse]`
- [ ] Métadonnées : date, nombre de messages, tokens utilisés
- [ ] Download automatique via `<a download>`

#### 8.2 - Export JSON
- [ ] Format structuré : `{ conversation: {...}, messages: [...] }`
- [ ] Inclure métadonnées complètes
- [ ] Pretty-print (indent 2 espaces)

#### 8.3 - Export PDF
- [ ] Utiliser `jsPDF` ou bibliothèque similaire
- [ ] Styling propre avec logo Lucide
- [ ] Pagination automatique
- [ ] Table des matières si > 10 messages

#### 8.4 - Export Multiple
- [ ] Export par lot (sélection multiple)
- [ ] Format ZIP avec plusieurs fichiers
- [ ] Nommage intelligent : `lucide-export-2025-11-19.zip`

**Fichiers à créer** :
- `src/ui/components/dialogs/ExportDialog.js`
- `src/ui/services/exportService.js`
- `src/ui/utils/pdfGenerator.js`
- `src/ui/utils/zipGenerator.js`

**Fichiers à modifier** :
- `src/ui/components/ConversationSidebar.js` (bouton export dans actions)
- `src/ui/ask/ClaudeAskView.js` (handler export)

**Dépendances à ajouter** :
```json
{
  "jspdf": "^2.5.1",
  "jszip": "^3.10.1"
}
```

---

### **PHASE 9 : Syntax Highlighting des Blocs de Code** (Priorité : MOYENNE)
**Durée estimée** : 1-2 jours
**Difficulté** : ⭐⭐

#### 9.1 - Intégration Highlight.js
- [ ] Installer `highlight.js` (version ES module)
- [ ] Créer service `syntaxHighlightService.js`
- [ ] Détecter langage automatiquement si non spécifié
- [ ] Appliquer highlighting après render du markdown
- [ ] Thème : "github" (light) / "github-dark" (dark)

#### 9.2 - Bouton "Copier le Code"
- [ ] Ajouter bouton dans le coin supérieur droit de chaque `<pre><code>`
- [ ] Animation hover
- [ ] Toast "Code copié" au clic
- [ ] Icône : 📋 → ✓ (feedback visuel)

#### 9.3 - Numéros de Ligne
- [ ] Option d'affichage (toggle dans settings)
- [ ] Sélection sans copier les numéros
- [ ] CSS Grid pour aligner parfaitement

**Fichiers à créer** :
- `src/ui/services/syntaxHighlightService.js`
- `src/ui/components/messages/CodeBlock.js`

**Fichiers à modifier** :
- `src/ui/components/messages/MessageAssistant.js` (utiliser CodeBlock component)
- `src/ui/components/settings/SettingsPanel.js` (option numéros de ligne)

**Dépendances à ajouter** :
```json
{
  "highlight.js": "^11.9.0"
}
```

---

### **PHASE 10 : Raccourcis Clavier Avancés** (Priorité : MOYENNE)
**Durée estimée** : 1 jour
**Difficulté** : ⭐⭐

#### 10.1 - Raccourcis Globaux
- [ ] **Cmd+F / Ctrl+F** : Focus sur search conversations
- [ ] **Cmd+1/2/3** : Switch modes (Ask/Listen/Browser)
- [ ] **Cmd+B** : Toggle sidebar
- [ ] **Cmd+Shift+A** : Toggle artifacts panel
- [ ] **Cmd+/** : Afficher palette de raccourcis
- [ ] **Cmd+Shift+N** : Nouvelle conversation
- [ ] **↑/↓** dans search : Naviguer résultats
- [ ] **Enter** dans search : Sélectionner conversation

#### 10.2 - Raccourcis dans Chat
- [ ] **Cmd+Enter** : Envoyer message (alternative à bouton)
- [ ] **Esc** : Annuler génération en cours
- [ ] **Cmd+R** : Régénérer dernière réponse
- [ ] **Cmd+C** (sur message) : Copier message

#### 10.3 - Palette de Commandes (style VS Code)
- [ ] Modal searchable avec toutes les actions
- [ ] Fuzzy search dans les commandes
- [ ] Affichage des raccourcis
- [ ] Historique des commandes récentes

**Fichiers à créer** :
- `src/ui/components/dialogs/CommandPalette.js`
- `src/ui/services/keyboardShortcutService.js`

**Fichiers à modifier** :
- `src/ui/ask/ClaudeAskView.js` (ajouter tous les handlers)
- `src/ui/components/settings/SettingsPanel.js` (section raccourcis étendue)

---

### **PHASE 11 : Tags et Organisation** (Priorité : BASSE)
**Durée estimée** : 3-4 jours
**Difficulté** : ⭐⭐⭐⭐

#### 11.1 - Système de Tags
- [ ] Créer/éditer/supprimer tags
- [ ] Couleurs personnalisables (palette de 10 couleurs)
- [ ] Assigner tags à conversations
- [ ] Filtrage par tags dans sidebar
- [ ] Tag auto-suggéré basé sur contenu (ML basique)

#### 11.2 - Dossiers/Collections
- [ ] Créer dossiers personnalisés
- [ ] Drag & drop de conversations dans dossiers
- [ ] Arborescence pliable/dépliable
- [ ] Dossiers intelligents (automatiques basés sur critères)

#### 11.3 - Favoris
- [ ] Marquer conversations comme favorites (⭐)
- [ ] Section "Favoris" en haut de sidebar
- [ ] Raccourci : Cmd+D (toggle favori)

**Fichiers à créer** :
- `src/ui/components/tags/TagManager.js`
- `src/ui/components/tags/TagPicker.js`
- `src/ui/components/folders/FolderTree.js`
- `src/ui/services/tagService.js`
- `src/ui/services/folderService.js`

**Backend** :
- Ajouter tables SQL : `tags`, `conversation_tags`, `folders`
- IPC handlers pour CRUD tags/folders

---

### **PHASE 12 : Statistiques et Analytics** (Priorité : BASSE)
**Durée estimée** : 2-3 jours
**Difficulté** : ⭐⭐⭐

#### 12.1 - Statistiques par Conversation
- [ ] Nombre de messages (user + assistant)
- [ ] Tokens utilisés (approximation)
- [ ] Durée de la conversation
- [ ] Fichiers attachés

#### 12.2 - Dashboard Général
- [ ] Total conversations
- [ ] Messages ce mois/semaine/jour
- [ ] Graphiques (Chart.js) : évolution dans le temps
- [ ] Top 5 conversations les plus longues
- [ ] Temps de réponse moyen

#### 12.3 - Export Statistiques
- [ ] CSV avec données analytiques
- [ ] Graphiques exportables en PNG

**Fichiers à créer** :
- `src/ui/components/stats/StatsPanel.js`
- `src/ui/components/stats/ConversationStats.js`
- `src/ui/services/analyticsService.js`

**Dépendances à ajouter** :
```json
{
  "chart.js": "^4.4.0"
}
```

---

### **PHASE 13 : Notifications Desktop** (Priorité : BASSE)
**Durée estimée** : 1 jour
**Difficulté** : ⭐⭐

#### 13.1 - Notifications Système
- [ ] Notification quand réponse terminée (si fenêtre en arrière-plan)
- [ ] Badge sur icône app (macOS/Windows)
- [ ] Son de notification (optionnel, dans settings)
- [ ] Notification de nouvelles features (changelog)

#### 13.2 - Paramètres de Notifications
- [ ] Toggle général activer/désactiver
- [ ] Choix du son
- [ ] Mode "Ne pas déranger"
- [ ] Notifications uniquement si inactif > 30s

**Fichiers à créer** :
- `src/ui/services/notificationService.js`

**Fichiers à modifier** :
- `src/ui/components/settings/SettingsPanel.js` (section notifications)
- `src/ui/ask/ClaudeAskView.js` (trigger notifications)

---

### **PHASE 14 : Amélioration UX Messages** (Priorité : MOYENNE)
**Durée estimée** : 2 jours
**Difficulté** : ⭐⭐⭐

#### 14.1 - Éditer Messages Utilisateur
- [ ] Bouton "Éditer" sur messages user
- [ ] Mode édition inline
- [ ] Re-génération automatique après édition
- [ ] Historique des éditions

#### 14.2 - Réactions aux Messages
- [ ] Emoji picker pour réagir aux messages
- [ ] Affichage des réactions
- [ ] Stockage en DB
- [ ] Statistiques : messages les plus likés

#### 14.3 - Citations et Références
- [ ] Citer un message précédent dans la réponse
- [ ] Affichage visuel de la citation
- [ ] Navigation vers message cité

#### 14.4 - Partage de Messages
- [ ] Copier lien vers message spécifique
- [ ] Partager sur réseaux sociaux (Twitter, LinkedIn)
- [ ] Générer image du message (screenshot stylisé)

**Fichiers à créer** :
- `src/ui/components/messages/MessageReactions.js`
- `src/ui/components/dialogs/ShareMessageDialog.js`

---

### **PHASE 15 : Recherche Avancée** (Priorité : MOYENNE)
**Durée estimée** : 2-3 jours
**Difficulté** : ⭐⭐⭐⭐

#### 15.1 - Recherche dans le Contenu
- [ ] Search global dans tous les messages (pas seulement titres)
- [ ] Indexation full-text (SQLite FTS5)
- [ ] Filtres : date, mode, tags, auteur (user/assistant)
- [ ] Tri : pertinence, date, conversation

#### 15.2 - Interface de Recherche
- [ ] Modal dédiée (Cmd+Shift+F)
- [ ] Aperçu des résultats avec contexte
- [ ] Navigation dans les résultats (↑/↓)
- [ ] Jump to message dans conversation

#### 15.3 - Recherche Sémantique (Avancé)
- [ ] Utiliser embeddings pour recherche sémantique
- [ ] "Trouver des conversations similaires"
- [ ] Suggestions de recherche basées sur historique

**Fichiers à créer** :
- `src/ui/components/search/GlobalSearch.js`
- `src/ui/services/searchService.js`

**Backend** :
- Créer index FTS5 sur messages
- Ajouter IPC handler `search:global`

---

### **PHASE 16 : Multi-fenêtres et Tabs** (Priorité : BASSE)
**Durée estimée** : 3-4 jours
**Difficulté** : ⭐⭐⭐⭐⭐

#### 16.1 - Système d'Onglets
- [ ] Tabs pour conversations multiples
- [ ] Drag & drop pour réorganiser
- [ ] Cmd+T : Nouvel onglet
- [ ] Cmd+W : Fermer onglet
- [ ] Cmd+Tab : Switch entre onglets

#### 16.2 - Multi-fenêtres
- [ ] Détacher conversation dans nouvelle fenêtre
- [ ] Synchronisation état entre fenêtres
- [ ] Restauration des fenêtres au redémarrage

**Fichiers à créer** :
- `src/ui/components/tabs/TabBar.js`
- `src/ui/services/tabService.js`
- `src/ui/services/windowService.js`

---

### **PHASE 17 : Templates et Prompts Personnalisés** (Priorité : MOYENNE)
**Durée estimée** : 2-3 jours
**Difficulté** : ⭐⭐⭐

#### 17.1 - Bibliothèque de Prompts
- [ ] Créer/sauvegarder prompts réutilisables
- [ ] Catégories (Code, Écriture, Analyse, etc.)
- [ ] Variables dans prompts : {{topic}}, {{language}}
- [ ] Partage de prompts (import/export JSON)

#### 17.2 - Quick Actions
- [ ] Boutons rapides sous input : "Résumer", "Traduire", "Expliquer"
- [ ] Personnalisables dans settings
- [ ] Appliquer sur sélection de texte

**Fichiers à créer** :
- `src/ui/components/prompts/PromptLibrary.js`
- `src/ui/components/prompts/PromptEditor.js`
- `src/ui/services/promptService.js`

---

### **PHASE 18 : Accessibilité et Internationalisation** (Priorité : MOYENNE)
**Durée estimée** : 2-3 jours
**Difficulté** : ⭐⭐⭐

#### 18.1 - Accessibilité (a11y)
- [ ] Support complet clavier (tab navigation)
- [ ] ARIA labels sur tous les éléments
- [ ] Focus visible sur tous les interactifs
- [ ] Skip links
- [ ] Support screen readers
- [ ] Contraste WCAG AA minimum

#### 18.2 - Internationalisation (i18n)
- [ ] Support multi-langues (FR, EN, ES, DE)
- [ ] Service de traduction `i18nService.js`
- [ ] Fichiers de langues JSON
- [ ] Détection langue navigateur
- [ ] Sélection langue dans settings

**Fichiers à créer** :
- `src/ui/services/i18nService.js`
- `src/ui/locales/fr.json`
- `src/ui/locales/en.json`
- `src/ui/locales/es.json`
- `src/ui/locales/de.json`

---

### **PHASE 19 : Performance et Optimisations** (Priorité : HAUTE)
**Durée estimée** : 2-3 jours
**Difficulté** : ⭐⭐⭐⭐

#### 19.1 - Virtualisation des Listes
- [ ] Virtual scroll pour conversations (si > 100)
- [ ] Virtual scroll pour messages (si > 50)
- [ ] Lazy loading des anciens messages
- [ ] Pagination côté serveur

#### 19.2 - Optimisation Rendering
- [ ] Memoization des composants lourds
- [ ] Debounce sur search input (300ms)
- [ ] Throttle sur scroll events
- [ ] Code splitting par route

#### 19.3 - Cache et Persistence
- [ ] Cache IPC responses (LRU cache)
- [ ] IndexedDB pour messages récents
- [ ] Service Worker pour offline mode

**Fichiers à créer** :
- `src/ui/utils/virtualScroll.js`
- `src/ui/services/cacheService.js`
- `src/ui/workers/serviceWorker.js`

---

### **PHASE 20 : Tests et Documentation** (Priorité : HAUTE)
**Durée estimée** : 3-5 jours
**Difficulté** : ⭐⭐⭐

#### 20.1 - Tests Unitaires
- [ ] Tests services (toastService, uiModeService, etc.)
- [ ] Tests composants (MessageAssistant, ConversationSidebar)
- [ ] Coverage > 80%
- [ ] Framework : Vitest

#### 20.2 - Tests E2E
- [ ] Playwright tests
- [ ] Scénarios critiques : envoyer message, créer conversation, search
- [ ] Tests multi-navigateurs
- [ ] CI/CD avec GitHub Actions

#### 20.3 - Documentation
- [ ] JSDoc sur tous les services et composants
- [ ] Guide utilisateur (Markdown)
- [ ] Guide développeur (architecture, patterns)
- [ ] Changelog détaillé
- [ ] Screenshots et vidéos démo

**Fichiers à créer** :
- `tests/unit/**/*.test.js`
- `tests/e2e/**/*.spec.js`
- `docs/user-guide.md`
- `docs/developer-guide.md`
- `docs/architecture.md`

---

## 📊 Résumé Priorisation

### ⚡ PRIORITÉ HAUTE (À faire en premier)
1. **Phase 7** : Gestion Avancée des Conversations (renommer/supprimer)
2. **Phase 8** : Export de Conversations (MD/JSON/PDF)
3. **Phase 19** : Performance et Optimisations
4. **Phase 20** : Tests et Documentation

### 🔥 PRIORITÉ MOYENNE (À faire ensuite)
5. **Phase 9** : Syntax Highlighting
6. **Phase 10** : Raccourcis Clavier Avancés
7. **Phase 14** : Amélioration UX Messages
8. **Phase 15** : Recherche Avancée
9. **Phase 17** : Templates et Prompts
10. **Phase 18** : Accessibilité et i18n

### 💡 PRIORITÉ BASSE (Nice to have)
11. **Phase 11** : Tags et Organisation
12. **Phase 12** : Statistiques et Analytics
13. **Phase 13** : Notifications Desktop
14. **Phase 16** : Multi-fenêtres et Tabs

---

## 🎯 Jalons Clés (Milestones)

### **Milestone 1 : "Gestion Complète"** (Semaines 1-2)
- ✅ Phase 7 : Renommer/Supprimer conversations
- ✅ Phase 8 : Export complet (MD/JSON/PDF)
- ✅ Phase 9 : Syntax Highlighting

**Livrables** : Interface complète avec gestion et export

### **Milestone 2 : "Power User"** (Semaines 3-4)
- ✅ Phase 10 : Raccourcis avancés
- ✅ Phase 14 : UX Messages améliorée
- ✅ Phase 15 : Recherche globale

**Livrables** : Interface optimisée pour utilisateurs avancés

### **Milestone 3 : "Production Ready"** (Semaines 5-6)
- ✅ Phase 19 : Performance et optimisations
- ✅ Phase 20 : Tests et documentation
- ✅ Phase 18 : Accessibilité

**Livrables** : Application prête pour production

### **Milestone 4 : "Feature Complete"** (Semaines 7-8+)
- ✅ Phase 11-13 : Organisation avancée
- ✅ Phase 16-17 : Features premium

**Livrables** : Application complète avec toutes les features

---

## 📈 Estimation Totale

- **Durée totale** : 6-10 semaines (temps plein)
- **Lignes de code estimées** : +15,000 lignes supplémentaires
- **Nouveaux fichiers** : ~60-80 fichiers
- **Complexité globale** : ⭐⭐⭐⭐ (4/5)

---

## 🛠️ Dépendances NPM à Ajouter

```json
{
  "dependencies": {
    "highlight.js": "^11.9.0",
    "jspdf": "^2.5.1",
    "jszip": "^3.10.1",
    "chart.js": "^4.4.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0"
  }
}
```

---

## 📝 Notes Techniques

### Architecture Patterns
- **Services** : Singleton pattern pour tous les services globaux
- **Components** : Web Components (Lit Elements)
- **State** : Reactive properties + Event-driven
- **IPC** : Promisified invoke/on pattern
- **Persistence** : SQLite (main) + localStorage (renderer)

### Conventions de Code
- **Naming** : camelCase pour méthodes, PascalCase pour classes
- **Privé** : Préfixe `_` pour méthodes privées
- **Events** : kebab-case pour noms d'événements
- **CSS** : BEM naming ou classes utilitaires

### Performance Targets
- **First Paint** : < 200ms
- **Time to Interactive** : < 1s
- **Message render** : < 50ms
- **Search response** : < 100ms
- **Bundle size** : < 500KB (gzipped)

---

## 🎓 Ressources et Références

- **Lit Elements** : https://lit.dev/
- **Claude.ai** : https://claude.ai (référence design)
- **Electron IPC** : https://www.electronjs.org/docs/latest/api/ipc-renderer
- **Highlight.js** : https://highlightjs.org/
- **jsPDF** : https://github.com/parallax/jsPDF
- **Vitest** : https://vitest.dev/
- **Playwright** : https://playwright.dev/

---

**Dernière mise à jour** : 2025-11-19
**Auteur** : Claude (Assistant IA)
**Version** : 1.0
