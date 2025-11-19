/**
 * ExportService - Service for exporting conversations to various formats
 *
 * Supported formats:
 * - Markdown (.md): Human-readable text with formatting
 * - JSON (.json): Structured data for re-import
 * - PDF (.pdf): Printable document (requires jsPDF)
 *
 * Usage:
 * import { exportService } from './exportService.js';
 * exportService.exportToMarkdown(conversation, messages, options);
 */

export class ExportService {
    constructor() {
        // No initialization needed for now
    }

    /**
     * Export conversation to Markdown format
     * @param {Object} conversation - Conversation metadata
     * @param {Array} messages - Array of messages
     * @param {Object} options - Export options
     * @returns {string} Markdown content
     */
    exportToMarkdown(conversation, messages, options = {}) {
        const {
            includeMetadata = true,
            includeTimestamps = true,
        } = options;

        let markdown = '';

        // Add metadata header
        if (includeMetadata) {
            markdown += `# ${conversation.title || 'Conversation Lucide'}\n\n`;
            markdown += `---\n\n`;

            if (conversation.created_at) {
                const date = new Date(conversation.created_at);
                markdown += `**Date de création** : ${date.toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}\n\n`;
            }

            markdown += `**Nombre de messages** : ${messages.length}\n`;
            markdown += `**Messages utilisateur** : ${messages.filter(m => m.role === 'user').length}\n`;
            markdown += `**Messages assistant** : ${messages.filter(m => m.role === 'assistant').length}\n\n`;
            markdown += `---\n\n`;
        }

        // Add messages
        messages.forEach((message, index) => {
            const isUser = message.role === 'user';
            const name = isUser ? 'Vous' : 'Lucide';

            // Message header
            markdown += `## ${name}\n\n`;

            // Timestamp
            if (includeTimestamps && message.created_at) {
                const date = new Date(message.created_at);
                markdown += `*${date.toLocaleString('fr-FR')}*\n\n`;
            }

            // Message content
            markdown += `${message.content}\n\n`;

            // Files attached (if any)
            if (message.files && message.files.length > 0) {
                markdown += `**Fichiers attachés** :\n`;
                message.files.forEach(file => {
                    markdown += `- ${file.name} (${this._formatFileSize(file.size)})\n`;
                });
                markdown += `\n`;
            }

            // Separator (except for last message)
            if (index < messages.length - 1) {
                markdown += `---\n\n`;
            }
        });

        // Footer
        markdown += `\n---\n\n`;
        markdown += `*Exporté depuis Lucide le ${new Date().toLocaleDateString('fr-FR')}*\n`;

        return markdown;
    }

    /**
     * Export conversation to JSON format
     * @param {Object} conversation - Conversation metadata
     * @param {Array} messages - Array of messages
     * @param {Object} options - Export options
     * @returns {string} JSON content
     */
    exportToJSON(conversation, messages, options = {}) {
        const {
            includeMetadata = true,
            includeTimestamps = true,
        } = options;

        const exportData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            conversation: {},
            messages: [],
        };

        // Add conversation metadata
        if (includeMetadata) {
            exportData.conversation = {
                id: conversation.id,
                title: conversation.title || 'Conversation Lucide',
                created_at: conversation.created_at,
                updated_at: conversation.updated_at,
                message_count: messages.length,
            };
        }

        // Add messages
        exportData.messages = messages.map(message => {
            const exportedMessage = {
                id: message.id,
                role: message.role,
                content: message.content,
            };

            if (includeTimestamps && message.created_at) {
                exportedMessage.created_at = message.created_at;
            }

            if (message.files && message.files.length > 0) {
                exportedMessage.files = message.files.map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                }));
            }

            return exportedMessage;
        });

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Export conversation to PDF format
     * @param {Object} conversation - Conversation metadata
     * @param {Array} messages - Array of messages
     * @param {Object} options - Export options
     * @returns {Promise<Blob>} PDF blob
     */
    async exportToPDF(conversation, messages, options = {}) {
        const {
            includeMetadata = true,
            includeTimestamps = true,
        } = options;

        // Check if jsPDF is available
        if (typeof window.jspdf === 'undefined') {
            throw new Error('jsPDF library not loaded. Please include jsPDF script.');
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let yPosition = 20;
        const lineHeight = 7;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const maxWidth = doc.internal.pageSize.width - 2 * margin;

        // Helper to add new page if needed
        const checkPageBreak = (requiredSpace = 20) => {
            if (yPosition + requiredSpace > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
        };

        // Title
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text(conversation.title || 'Conversation Lucide', margin, yPosition);
        yPosition += 15;

        // Metadata
        if (includeMetadata) {
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(100, 100, 100);

            if (conversation.created_at) {
                const date = new Date(conversation.created_at);
                doc.text(`Date: ${date.toLocaleDateString('fr-FR')}`, margin, yPosition);
                yPosition += lineHeight;
            }

            doc.text(`Messages: ${messages.length}`, margin, yPosition);
            yPosition += lineHeight + 5;

            // Separator
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, yPosition, doc.internal.pageSize.width - margin, yPosition);
            yPosition += 10;
        }

        // Messages
        doc.setTextColor(0, 0, 0);
        messages.forEach((message, index) => {
            const isUser = message.role === 'user';

            checkPageBreak(30);

            // Message header
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(isUser ? 'Vous' : 'Lucide', margin, yPosition);
            yPosition += lineHeight;

            // Timestamp
            if (includeTimestamps && message.created_at) {
                doc.setFontSize(9);
                doc.setFont(undefined, 'italic');
                doc.setTextColor(120, 120, 120);
                const date = new Date(message.created_at);
                doc.text(date.toLocaleString('fr-FR'), margin, yPosition);
                yPosition += lineHeight;
            }

            // Message content
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);

            const lines = doc.splitTextToSize(message.content, maxWidth);
            lines.forEach(line => {
                checkPageBreak();
                doc.text(line, margin, yPosition);
                yPosition += lineHeight;
            });

            yPosition += 5;

            // Separator
            if (index < messages.length - 1) {
                checkPageBreak(10);
                doc.setDrawColor(220, 220, 220);
                doc.line(margin, yPosition, doc.internal.pageSize.width - margin, yPosition);
                yPosition += 10;
            }
        });

        // Footer
        checkPageBreak(15);
        doc.setFontSize(8);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Exporté depuis Lucide le ${new Date().toLocaleDateString('fr-FR')}`,
            margin,
            yPosition
        );

        return doc.output('blob');
    }

    /**
     * Download file to user's computer
     * @param {string|Blob} content - File content
     * @param {string} filename - File name
     * @param {string} mimeType - MIME type
     */
    downloadFile(content, filename, mimeType = 'text/plain') {
        const blob = content instanceof Blob
            ? content
            : new Blob([content], { type: mimeType });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Export conversation in specified format
     * @param {string} format - Export format (markdown, json, pdf)
     * @param {Object} conversation - Conversation metadata
     * @param {Array} messages - Array of messages
     * @param {Object} options - Export options
     * @returns {Promise<void>}
     */
    async export(format, conversation, messages, options = {}) {
        const title = conversation.title || 'conversation';
        const sanitized = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const timestamp = new Date().toISOString().split('T')[0];

        switch (format) {
            case 'markdown': {
                const content = this.exportToMarkdown(conversation, messages, options);
                const filename = `lucide-${sanitized}-${timestamp}.md`;
                this.downloadFile(content, filename, 'text/markdown');
                break;
            }

            case 'json': {
                const content = this.exportToJSON(conversation, messages, options);
                const filename = `lucide-${sanitized}-${timestamp}.json`;
                this.downloadFile(content, filename, 'application/json');
                break;
            }

            case 'pdf': {
                const blob = await this.exportToPDF(conversation, messages, options);
                const filename = `lucide-${sanitized}-${timestamp}.pdf`;
                this.downloadFile(blob, filename, 'application/pdf');
                break;
            }

            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    /**
     * Format file size for display
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     * @private
     */
    _formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
    }
}

// Singleton instance
export const exportService = new ExportService();

// Expose globally for debugging
if (typeof window !== 'undefined') {
    window.__exportService = exportService;
}
