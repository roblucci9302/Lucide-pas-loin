/**
 * Document Export Service
 *
 * Handles exporting generated documents to various formats:
 * - PDF: Using pdfkit (already installed)
 * - DOCX: Using docx (already installed)
 * - MD: Native markdown export
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { app, dialog } = require('electron');

class DocumentExportService {
    constructor() {
        this.exportDir = path.join(app.getPath('documents'), 'Lucide', 'Exports');
    }

    /**
     * Ensure export directory exists
     */
    async ensureExportDirectory() {
        try {
            await fs.mkdir(this.exportDir, { recursive: true });
            return this.exportDir;
        } catch (error) {
            console.error('[DocumentExportService] Error creating export directory:', error);
            throw error;
        }
    }

    /**
     * Sanitize filename to remove invalid characters
     */
    sanitizeFilename(filename) {
        return filename
            .replace(/[<>:"/\\|?*]/g, '-')
            .replace(/\s+/g, '_')
            .substring(0, 200); // Limit length
    }

    /**
     * Generate unique filename with timestamp
     */
    generateFilename(title, extension) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const sanitized = this.sanitizeFilename(title || 'document');
        return `${sanitized}_${timestamp}.${extension}`;
    }

    /**
     * Export document to PDF using pdfkit
     */
    async exportToPDF(documentData) {
        try {
            const PDFDocument = require('pdfkit');
            const { title, content, type } = documentData;

            await this.ensureExportDirectory();
            const filename = this.generateFilename(title, 'pdf');
            const filePath = path.join(this.exportDir, filename);

            console.log(`[DocumentExportService] Exporting to PDF: ${filePath}`);

            // Create PDF document
            const doc = new PDFDocument({
                size: 'A4',
                margins: {
                    top: 50,
                    bottom: 50,
                    left: 50,
                    right: 50
                }
            });

            // Create write stream
            const writeStream = require('fs').createWriteStream(filePath);
            doc.pipe(writeStream);

            // Add title
            doc.fontSize(20)
                .font('Helvetica-Bold')
                .text(title || 'Document', {
                    align: 'center'
                });

            doc.moveDown();

            // Add document type
            if (type) {
                doc.fontSize(12)
                    .font('Helvetica-Oblique')
                    .text(`Type: ${type}`, {
                        align: 'center'
                    });
                doc.moveDown(2);
            }

            // Add content with basic formatting
            const lines = content.split('\n');

            for (const line of lines) {
                if (!line.trim()) {
                    doc.moveDown(0.5);
                    continue;
                }

                // Headers
                if (line.startsWith('# ')) {
                    doc.fontSize(18)
                        .font('Helvetica-Bold')
                        .text(line.substring(2), { align: 'left' });
                    doc.moveDown();
                } else if (line.startsWith('## ')) {
                    doc.fontSize(16)
                        .font('Helvetica-Bold')
                        .text(line.substring(3), { align: 'left' });
                    doc.moveDown(0.5);
                } else if (line.startsWith('### ')) {
                    doc.fontSize(14)
                        .font('Helvetica-Bold')
                        .text(line.substring(4), { align: 'left' });
                    doc.moveDown(0.3);
                } else if (line.startsWith('- ') || line.startsWith('* ')) {
                    // Bullet points
                    doc.fontSize(11)
                        .font('Helvetica')
                        .text(`• ${line.substring(2)}`, {
                            indent: 20,
                            align: 'left'
                        });
                } else if (/^\d+\.\s/.test(line)) {
                    // Numbered lists
                    doc.fontSize(11)
                        .font('Helvetica')
                        .text(line, {
                            indent: 20,
                            align: 'left'
                        });
                } else {
                    // Regular paragraph
                    doc.fontSize(11)
                        .font('Helvetica')
                        .text(line, {
                            align: 'justify'
                        });
                }
            }

            // Add footer with generation date
            const pageCount = doc.bufferedPageRange().count;
            for (let i = 0; i < pageCount; i++) {
                doc.switchToPage(i);
                doc.fontSize(9)
                    .font('Helvetica-Oblique')
                    .text(
                        `Généré par Lucide - ${new Date().toLocaleDateString('fr-FR')}`,
                        50,
                        doc.page.height - 30,
                        {
                            align: 'center',
                            width: doc.page.width - 100
                        }
                    );
            }

            // Finalize PDF
            doc.end();

            // Wait for write to complete
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });

            console.log(`[DocumentExportService] PDF exported successfully: ${filePath}`);

            return {
                success: true,
                filePath,
                filename,
                format: 'pdf'
            };
        } catch (error) {
            console.error('[DocumentExportService] Error exporting to PDF:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Export document to DOCX using docx library
     */
    async exportToDOCX(documentData) {
        try {
            const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
            const { title, content, type } = documentData;

            await this.ensureExportDirectory();
            const filename = this.generateFilename(title, 'docx');
            const filePath = path.join(this.exportDir, filename);

            console.log(`[DocumentExportService] Exporting to DOCX: ${filePath}`);

            // Create document structure
            const sections = [];

            // Add title
            sections.push(
                new Paragraph({
                    text: title || 'Document',
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER
                })
            );

            // Add type
            if (type) {
                sections.push(
                    new Paragraph({
                        text: `Type: ${type}`,
                        alignment: AlignmentType.CENTER,
                        italics: true
                    })
                );
                sections.push(new Paragraph({ text: '' })); // Spacer
            }

            // Process content lines
            const lines = content.split('\n');

            for (const line of lines) {
                if (!line.trim()) {
                    sections.push(new Paragraph({ text: '' }));
                    continue;
                }

                // Headers
                if (line.startsWith('# ')) {
                    sections.push(
                        new Paragraph({
                            text: line.substring(2),
                            heading: HeadingLevel.HEADING_1
                        })
                    );
                } else if (line.startsWith('## ')) {
                    sections.push(
                        new Paragraph({
                            text: line.substring(3),
                            heading: HeadingLevel.HEADING_2
                        })
                    );
                } else if (line.startsWith('### ')) {
                    sections.push(
                        new Paragraph({
                            text: line.substring(4),
                            heading: HeadingLevel.HEADING_3
                        })
                    );
                } else if (line.startsWith('- ') || line.startsWith('* ')) {
                    // Bullet points
                    sections.push(
                        new Paragraph({
                            text: line.substring(2),
                            bullet: {
                                level: 0
                            }
                        })
                    );
                } else if (/^\d+\.\s/.test(line)) {
                    // Numbered lists
                    sections.push(
                        new Paragraph({
                            text: line.replace(/^\d+\.\s/, ''),
                            numbering: {
                                reference: 'default-numbering',
                                level: 0
                            }
                        })
                    );
                } else {
                    // Parse inline formatting (bold, italic)
                    const runs = this.parseInlineFormatting(line);
                    sections.push(new Paragraph({ children: runs }));
                }
            }

            // Add footer
            sections.push(new Paragraph({ text: '' }));
            sections.push(
                new Paragraph({
                    text: `Généré par Lucide - ${new Date().toLocaleDateString('fr-FR')}`,
                    alignment: AlignmentType.CENTER,
                    italics: true
                })
            );

            // Create document
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: sections
                }]
            });

            // Generate buffer
            const buffer = await Packer.toBuffer(doc);

            // Write to file
            await fs.writeFile(filePath, buffer);

            console.log(`[DocumentExportService] DOCX exported successfully: ${filePath}`);

            return {
                success: true,
                filePath,
                filename,
                format: 'docx'
            };
        } catch (error) {
            console.error('[DocumentExportService] Error exporting to DOCX:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Parse inline formatting (bold, italic) for DOCX
     */
    parseInlineFormatting(text) {
        const { TextRun } = require('docx');
        const runs = [];
        let currentText = '';
        let i = 0;

        while (i < text.length) {
            // Bold: **text**
            if (text.substring(i, i + 2) === '**') {
                if (currentText) {
                    runs.push(new TextRun({ text: currentText }));
                    currentText = '';
                }
                const endIndex = text.indexOf('**', i + 2);
                if (endIndex !== -1) {
                    const boldText = text.substring(i + 2, endIndex);
                    runs.push(new TextRun({ text: boldText, bold: true }));
                    i = endIndex + 2;
                    continue;
                }
            }

            // Italic: *text*
            if (text[i] === '*' && text[i + 1] !== '*') {
                if (currentText) {
                    runs.push(new TextRun({ text: currentText }));
                    currentText = '';
                }
                const endIndex = text.indexOf('*', i + 1);
                if (endIndex !== -1) {
                    const italicText = text.substring(i + 1, endIndex);
                    runs.push(new TextRun({ text: italicText, italics: true }));
                    i = endIndex + 1;
                    continue;
                }
            }

            currentText += text[i];
            i++;
        }

        if (currentText) {
            runs.push(new TextRun({ text: currentText }));
        }

        return runs.length > 0 ? runs : [new TextRun({ text })];
    }

    /**
     * Export document to Markdown (native)
     */
    async exportToMarkdown(documentData) {
        try {
            const { title, content, type } = documentData;

            await this.ensureExportDirectory();
            const filename = this.generateFilename(title, 'md');
            const filePath = path.join(this.exportDir, filename);

            console.log(`[DocumentExportService] Exporting to Markdown: ${filePath}`);

            // Build markdown content
            let markdown = '';

            // Add title
            markdown += `# ${title || 'Document'}\n\n`;

            // Add metadata
            if (type) {
                markdown += `**Type:** ${type}\n\n`;
            }
            markdown += `**Généré le:** ${new Date().toLocaleDateString('fr-FR')}\n\n`;
            markdown += `---\n\n`;

            // Add content (already in markdown format)
            markdown += content;

            // Add footer
            markdown += `\n\n---\n\n`;
            markdown += `*Généré par Lucide*\n`;

            // Write to file
            await fs.writeFile(filePath, markdown, 'utf-8');

            console.log(`[DocumentExportService] Markdown exported successfully: ${filePath}`);

            return {
                success: true,
                filePath,
                filename,
                format: 'md'
            };
        } catch (error) {
            console.error('[DocumentExportService] Error exporting to Markdown:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Main export function - routes to appropriate export method
     */
    async exportDocument(documentData, format) {
        console.log(`[DocumentExportService] Exporting document to ${format.toUpperCase()}`);

        try {
            let result;

            switch (format.toLowerCase()) {
                case 'pdf':
                    result = await this.exportToPDF(documentData);
                    break;
                case 'docx':
                    result = await this.exportToDOCX(documentData);
                    break;
                case 'md':
                case 'markdown':
                    result = await this.exportToMarkdown(documentData);
                    break;
                default:
                    throw new Error(`Unsupported export format: ${format}`);
            }

            return result;
        } catch (error) {
            console.error('[DocumentExportService] Export error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Open export directory in file explorer
     */
    async openExportDirectory() {
        try {
            await this.ensureExportDirectory();
            const { shell } = require('electron');
            await shell.openPath(this.exportDir);
            return { success: true, path: this.exportDir };
        } catch (error) {
            console.error('[DocumentExportService] Error opening export directory:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new DocumentExportService();
