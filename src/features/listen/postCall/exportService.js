const fs = require('fs');
const path = require('path');
const { app } = require('electron');

/**
 * Export Service
 * Gère l'export des notes de réunion dans différents formats
 * Formats supportés: Markdown, Text, HTML, SRT, VTT
 */
class ExportService {
    constructor() {
        this.defaultExportPath = path.join(app.getPath('documents'), 'Lucide', 'Meetings');
        this._ensureExportDirectoryExists();
    }

    /**
     * Export meeting notes to Markdown format
     * @param {Object} meetingNotes - Meeting notes object from database
     * @param {Array<Object>} tasks - Array of tasks
     * @param {Array<Object>} transcripts - Original transcripts
     * @param {string} customPath - Optional custom export path
     * @returns {Promise<string>} Path to exported file
     */
    async exportToMarkdown(meetingNotes, tasks, transcripts, customPath = null) {
        console.log('[ExportService] Exporting to Markdown...');

        const markdown = this._generateMarkdownContent(meetingNotes, tasks, transcripts);
        const fileName = this._generateFileName(meetingNotes, 'md');
        const filePath = customPath || path.join(this.defaultExportPath, fileName);

        await fs.promises.writeFile(filePath, markdown, 'utf8');
        console.log(`[ExportService] ✅ Markdown exported to: ${filePath}`);

        return filePath;
    }

    /**
     * Export to plain text format
     * @param {Object} meetingNotes - Meeting notes object
     * @param {Array<Object>} tasks - Array of tasks
     * @param {Array<Object>} transcripts - Original transcripts
     * @param {string} customPath - Optional custom export path
     * @returns {Promise<string>} Path to exported file
     */
    async exportToText(meetingNotes, tasks, transcripts, customPath = null) {
        console.log('[ExportService] Exporting to Text...');

        const text = this._generateTextContent(meetingNotes, tasks, transcripts);
        const fileName = this._generateFileName(meetingNotes, 'txt');
        const filePath = customPath || path.join(this.defaultExportPath, fileName);

        await fs.promises.writeFile(filePath, text, 'utf8');
        console.log(`[ExportService] ✅ Text exported to: ${filePath}`);

        return filePath;
    }

    /**
     * Export to HTML format (for email)
     * @param {Object} meetingNotes - Meeting notes object
     * @param {Array<Object>} tasks - Array of tasks
     * @param {string} customPath - Optional custom export path
     * @returns {Promise<string>} Path to exported file
     */
    async exportToHTML(meetingNotes, tasks, customPath = null) {
        console.log('[ExportService] Exporting to HTML...');

        const html = this._generateHTMLContent(meetingNotes, tasks);
        const fileName = this._generateFileName(meetingNotes, 'html');
        const filePath = customPath || path.join(this.defaultExportPath, fileName);

        await fs.promises.writeFile(filePath, html, 'utf8');
        console.log(`[ExportService] ✅ HTML exported to: ${filePath}`);

        return filePath;
    }

    /**
     * Export transcripts to SRT (SubRip subtitle format)
     * @param {Array<Object>} transcripts - Array of transcripts with timestamps
     * @param {string} customPath - Optional custom export path
     * @returns {Promise<string>} Path to exported file
     */
    async exportToSRT(transcripts, sessionId, customPath = null) {
        console.log('[ExportService] Exporting to SRT...');

        const srt = this._generateSRTContent(transcripts);
        const fileName = `meeting_${sessionId}_subtitles.srt`;
        const filePath = customPath || path.join(this.defaultExportPath, fileName);

        await fs.promises.writeFile(filePath, srt, 'utf8');
        console.log(`[ExportService] ✅ SRT exported to: ${filePath}`);

        return filePath;
    }

    /**
     * Export transcripts to VTT (WebVTT subtitle format)
     * @param {Array<Object>} transcripts - Array of transcripts with timestamps
     * @param {string} customPath - Optional custom export path
     * @returns {Promise<string>} Path to exported file
     */
    async exportToVTT(transcripts, sessionId, customPath = null) {
        console.log('[ExportService] Exporting to VTT...');

        const vtt = this._generateVTTContent(transcripts);
        const fileName = `meeting_${sessionId}_subtitles.vtt`;
        const filePath = customPath || path.join(this.defaultExportPath, fileName);

        await fs.promises.writeFile(filePath, vtt, 'utf8');
        console.log(`[ExportService] ✅ VTT exported to: ${filePath}`);

        return filePath;
    }

    /**
     * Generate Markdown content
     * @private
     */
    _generateMarkdownContent(meetingNotes, tasks, transcripts) {
        const data = this._parseNoteData(meetingNotes);

        let md = `# 📋 Compte-rendu de réunion\n\n`;

        // Metadata
        md += `**Date**: ${new Date(meetingNotes.created_at * 1000).toLocaleString('fr-FR')}\n`;
        if (data.meetingMetadata?.duration) {
            md += `**Durée**: ${data.meetingMetadata.duration}\n`;
        }
        md += `\n---\n\n`;

        // Executive Summary
        if (data.executiveSummary) {
            md += `## 📝 Résumé exécutif\n\n${data.executiveSummary}\n\n`;
        }

        // Participants
        if (data.participants && data.participants.length > 0) {
            md += `## 👥 Participants\n\n`;
            data.participants.forEach(p => md += `- ${p}\n`);
            md += `\n`;
        }

        // Key Points
        if (data.keyPoints && data.keyPoints.length > 0) {
            md += `## 🎯 Points clés\n\n`;
            data.keyPoints.forEach(point => md += `- ${point}\n`);
            md += `\n`;
        }

        // Decisions
        if (data.decisions && data.decisions.length > 0) {
            md += `## 🔍 Décisions prises\n\n`;
            data.decisions.forEach((decision, i) => {
                md += `### Décision ${i + 1}: ${decision.decision || decision.title || 'Décision'}\n`;
                md += `${decision.description || decision.rationale || ''}\n\n`;
            });
        }

        // Action Items / Tasks
        if (tasks && tasks.length > 0) {
            md += `## ✅ Actions à suivre\n\n`;
            tasks.forEach((task, i) => {
                md += `${i + 1}. **${task.task_description}**\n`;
                md += `   - Assigné à: ${task.assigned_to}\n`;
                md += `   - Deadline: ${task.deadline}\n`;
                md += `   - Priorité: ${task.priority}\n`;
                if (task.context) {
                    md += `   - Contexte: ${task.context}\n`;
                }
                md += `\n`;
            });
        }

        // Timeline
        if (data.timeline && data.timeline.length > 0) {
            md += `## ⏱️ Timeline de la réunion\n\n`;
            data.timeline.forEach(segment => {
                md += `- **${segment.time}**: ${segment.topic}`;
                if (segment.duration) {
                    md += ` (${segment.duration})`;
                }
                md += `\n`;
            });
            md += `\n`;
        }

        // Unresolved Items
        if (data.unresolvedItems && data.unresolvedItems.length > 0) {
            md += `## ❗ Points en suspens\n\n`;
            data.unresolvedItems.forEach(item => md += `- ${item}\n`);
            md += `\n`;
        }

        // Next Steps
        if (data.nextSteps && data.nextSteps.length > 0) {
            md += `## 🔮 Prochaines étapes\n\n`;
            data.nextSteps.forEach(step => md += `- ${step}\n`);
            md += `\n`;
        }

        // Important Quotes
        if (data.importantQuotes && data.importantQuotes.length > 0) {
            md += `## 💬 Citations importantes\n\n`;
            data.importantQuotes.forEach(quote => {
                md += `> "${quote.quote}" — **${quote.speaker}**\n`;
                if (quote.context) {
                    md += `>\n> *${quote.context}*\n`;
                }
                md += `\n`;
            });
        }

        // Transcript
        if (transcripts && transcripts.length > 0) {
            md += `\n---\n\n## 📄 Transcription complète\n\n`;
            transcripts.forEach(t => {
                const time = t.created_at ? new Date(t.created_at * 1000).toLocaleTimeString('fr-FR') : '';
                md += `**[${time}] ${t.speaker}**: ${t.text}\n\n`;
            });
        }

        md += `\n---\n\n*Généré par Lucide Meeting Assistant*\n`;

        return md;
    }

    /**
     * Generate plain text content
     * @private
     */
    _generateTextContent(meetingNotes, tasks, transcripts) {
        const data = this._parseNoteData(meetingNotes);

        let text = `═══════════════════════════════════════════════════════════\n`;
        text += `              COMPTE-RENDU DE RÉUNION\n`;
        text += `═══════════════════════════════════════════════════════════\n\n`;

        // Metadata
        text += `Date: ${new Date(meetingNotes.created_at * 1000).toLocaleString('fr-FR')}\n`;
        if (data.meetingMetadata?.duration) {
            text += `Durée: ${data.meetingMetadata.duration}\n`;
        }
        text += `\n${'─'.repeat(60)}\n\n`;

        // Executive Summary
        if (data.executiveSummary) {
            text += `RÉSUMÉ EXÉCUTIF\n\n${data.executiveSummary}\n\n`;
        }

        // Participants
        if (data.participants && data.participants.length > 0) {
            text += `PARTICIPANTS\n\n`;
            data.participants.forEach(p => text += `  • ${p}\n`);
            text += `\n`;
        }

        // Key Points
        if (data.keyPoints && data.keyPoints.length > 0) {
            text += `POINTS CLÉS\n\n`;
            data.keyPoints.forEach((point, i) => text += `  ${i + 1}. ${point}\n`);
            text += `\n`;
        }

        // Decisions
        if (data.decisions && data.decisions.length > 0) {
            text += `DÉCISIONS PRISES\n\n`;
            data.decisions.forEach((decision, i) => {
                text += `  ${i + 1}. ${decision.decision || decision.title}\n`;
                text += `     ${decision.description || decision.rationale || ''}\n\n`;
            });
        }

        // Tasks
        if (tasks && tasks.length > 0) {
            text += `ACTIONS À SUIVRE\n\n`;
            tasks.forEach((task, i) => {
                text += `  ${i + 1}. ${task.task_description}\n`;
                text += `     Assigné à: ${task.assigned_to} | Deadline: ${task.deadline} | Priorité: ${task.priority}\n`;
                if (task.context) {
                    text += `     Contexte: ${task.context}\n`;
                }
                text += `\n`;
            });
        }

        text += `${'─'.repeat(60)}\n\n`;
        text += `Généré par Lucide Meeting Assistant\n`;

        return text;
    }

    /**
     * Generate HTML content (for email)
     * @private
     */
    _generateHTMLContent(meetingNotes, tasks) {
        const data = this._parseNoteData(meetingNotes);

        let html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compte-rendu de réunion</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        .metadata { background: #ecf0f1; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .summary { background: #e8f4f8; padding: 15px; border-left: 4px solid #3498db; margin: 20px 0; }
        ul { list-style-type: none; padding-left: 0; }
        li { margin-bottom: 10px; padding-left: 20px; position: relative; }
        li:before { content: "•"; color: #3498db; font-weight: bold; position: absolute; left: 0; }
        .task { background: #fff3cd; padding: 10px; margin-bottom: 10px; border-left: 4px solid #ffc107; }
        .decision { background: #d1ecf1; padding: 10px; margin-bottom: 10px; border-left: 4px solid #17a2b8; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #7f8c8d; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>📋 Compte-rendu de réunion</h1>

    <div class="metadata">
        <strong>Date:</strong> ${new Date(meetingNotes.created_at * 1000).toLocaleString('fr-FR')}<br>
        ${data.meetingMetadata?.duration ? `<strong>Durée:</strong> ${data.meetingMetadata.duration}<br>` : ''}
    </div>`;

        if (data.executiveSummary) {
            html += `\n    <div class="summary">
        <h2>📝 Résumé exécutif</h2>
        <p>${data.executiveSummary}</p>
    </div>`;
        }

        if (data.participants && data.participants.length > 0) {
            html += `\n    <h2>👥 Participants</h2>
    <ul>`;
            data.participants.forEach(p => html += `\n        <li>${p}</li>`);
            html += `\n    </ul>`;
        }

        if (data.keyPoints && data.keyPoints.length > 0) {
            html += `\n    <h2>🎯 Points clés</h2>
    <ul>`;
            data.keyPoints.forEach(point => html += `\n        <li>${point}</li>`);
            html += `\n    </ul>`;
        }

        if (data.decisions && data.decisions.length > 0) {
            html += `\n    <h2>🔍 Décisions prises</h2>`;
            data.decisions.forEach((decision, i) => {
                html += `\n    <div class="decision">
        <strong>${decision.decision || decision.title || `Décision ${i + 1}`}</strong><br>
        ${decision.description || decision.rationale || ''}
    </div>`;
            });
        }

        if (tasks && tasks.length > 0) {
            html += `\n    <h2>✅ Actions à suivre</h2>`;
            tasks.forEach((task, i) => {
                html += `\n    <div class="task">
        <strong>${i + 1}. ${task.task_description}</strong><br>
        Assigné à: ${task.assigned_to} | Deadline: ${task.deadline} | Priorité: ${task.priority}
        ${task.context ? `<br>Contexte: ${task.context}` : ''}
    </div>`;
            });
        }

        html += `\n    <div class="footer">
        <p><em>Généré par Lucide Meeting Assistant</em></p>
    </div>
</body>
</html>`;

        return html;
    }

    /**
     * Generate SRT subtitle content
     * @private
     */
    _generateSRTContent(transcripts) {
        let srt = '';
        let index = 1;

        transcripts.forEach((transcript, i) => {
            const startTime = transcript.start_at || (i * 2); // Estimate if not available
            const endTime = transcript.end_at || (startTime + 2);

            srt += `${index}\n`;
            srt += `${this._formatSRTTime(startTime)} --> ${this._formatSRTTime(endTime)}\n`;
            srt += `${transcript.speaker}: ${transcript.text}\n`;
            srt += `\n`;

            index++;
        });

        return srt;
    }

    /**
     * Generate VTT subtitle content
     * @private
     */
    _generateVTTContent(transcripts) {
        let vtt = 'WEBVTT\n\n';

        transcripts.forEach((transcript, i) => {
            const startTime = transcript.start_at || (i * 2);
            const endTime = transcript.end_at || (startTime + 2);

            vtt += `${this._formatVTTTime(startTime)} --> ${this._formatVTTTime(endTime)}\n`;
            vtt += `<v ${transcript.speaker}>${transcript.text}\n`;
            vtt += `\n`;
        });

        return vtt;
    }

    /**
     * Format time for SRT (HH:MM:SS,mmm)
     * @private
     */
    _formatSRTTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const millis = Math.floor((seconds % 1) * 1000);

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
    }

    /**
     * Format time for VTT (HH:MM:SS.mmm)
     * @private
     */
    _formatVTTTime(seconds) {
        return this._formatSRTTime(seconds).replace(',', '.');
    }

    /**
     * Parse note data from JSON strings
     * @private
     */
    _parseNoteData(meetingNotes) {
        const data = {};

        try {
            data.executiveSummary = meetingNotes.executive_summary || '';
            data.participants = JSON.parse(meetingNotes.participants || '[]');
            data.meetingMetadata = JSON.parse(meetingNotes.meeting_metadata || '{}');
            data.keyPoints = JSON.parse(meetingNotes.key_points || '[]');
            data.decisions = JSON.parse(meetingNotes.decisions || '[]');
            data.timeline = JSON.parse(meetingNotes.timeline || '[]');
            data.unresolvedItems = JSON.parse(meetingNotes.unresolved_items || '[]');
            data.nextSteps = JSON.parse(meetingNotes.next_steps || '[]');
            data.importantQuotes = JSON.parse(meetingNotes.important_quotes || '[]');
        } catch (error) {
            console.error('[ExportService] Error parsing note data:', error);
        }

        return data;
    }

    /**
     * Generate filename based on meeting notes
     * @private
     */
    _generateFileName(meetingNotes, extension) {
        const date = new Date(meetingNotes.created_at * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');

        return `meeting_${dateStr}_${timeStr}.${extension}`;
    }

    /**
     * Ensure export directory exists
     * @private
     */
    _ensureExportDirectoryExists() {
        if (!fs.existsSync(this.defaultExportPath)) {
            fs.mkdirSync(this.defaultExportPath, { recursive: true });
            console.log(`[ExportService] Created export directory: ${this.defaultExportPath}`);
        }
    }

    /**
     * Get default export path
     */
    getDefaultExportPath() {
        return this.defaultExportPath;
    }

    /**
     * Set custom export path
     */
    setDefaultExportPath(newPath) {
        this.defaultExportPath = newPath;
        this._ensureExportDirectoryExists();
    }
}

// Singleton instance
const exportService = new ExportService();
module.exports = exportService;
