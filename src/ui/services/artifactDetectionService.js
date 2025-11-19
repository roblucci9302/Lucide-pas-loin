/**
 * Artifact Detection Service
 *
 * Detects and extracts artifacts (code blocks, documents, etc.) from messages
 *
 * Artifact types:
 * - code: Programming language code blocks
 * - html: HTML documents
 * - react: React components
 * - svg: SVG graphics
 * - markdown: Markdown documents
 * - json: JSON data
 * - diagram: Mermaid/PlantUML diagrams
 */

class ArtifactDetectionService {
    /**
     * Detect all artifacts in a message
     * @param {string} content - Message content
     * @returns {Array} Array of detected artifacts
     */
    detectArtifacts(content) {
        if (!content || typeof content !== 'string') {
            return [];
        }

        const artifacts = [];

        // Detect code blocks (```language\ncode\n```)
        const codeBlocks = this._extractCodeBlocks(content);
        artifacts.push(...codeBlocks);

        // Detect XML/HTML artifacts in <artifact> tags (Claude.ai format)
        const xmlArtifacts = this._extractXMLArtifacts(content);
        artifacts.push(...xmlArtifacts);

        return artifacts;
    }

    /**
     * Extract code blocks from markdown-style ```code``` blocks
     * @private
     */
    _extractCodeBlocks(content) {
        const artifacts = [];
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let match;
        let index = 0;

        while ((match = codeBlockRegex.exec(content)) !== null) {
            const language = match[1] || 'text';
            const code = match[2].trim();

            if (code) {
                const type = this._determineArtifactType(language, code);

                artifacts.push({
                    id: `artifact-${Date.now()}-${index++}`,
                    type: type,
                    language: language.toLowerCase(),
                    title: this._generateTitle(type, language),
                    content: code,
                    start: match.index,
                    end: match.index + match[0].length,
                });
            }
        }

        return artifacts;
    }

    /**
     * Extract artifacts from XML-style <artifact> tags
     * Claude.ai uses this format for artifacts
     * @private
     */
    _extractXMLArtifacts(content) {
        const artifacts = [];
        const artifactRegex = /<artifact\s+([^>]*)>([\s\S]*?)<\/artifact>/g;
        let match;
        let index = 0;

        while ((match = artifactRegex.exec(content)) !== null) {
            const attributes = this._parseAttributes(match[1]);
            const artifactContent = match[2].trim();

            if (artifactContent) {
                artifacts.push({
                    id: attributes.identifier || `artifact-xml-${Date.now()}-${index++}`,
                    type: attributes.type || 'code',
                    language: attributes.language || 'text',
                    title: attributes.title || this._generateTitle(attributes.type, attributes.language),
                    content: artifactContent,
                    start: match.index,
                    end: match.index + match[0].length,
                });
            }
        }

        return artifacts;
    }

    /**
     * Parse XML attributes from string
     * @private
     */
    _parseAttributes(attrString) {
        const attrs = {};
        const attrRegex = /(\w+)="([^"]*)"/g;
        let match;

        while ((match = attrRegex.exec(attrString)) !== null) {
            attrs[match[1]] = match[2];
        }

        return attrs;
    }

    /**
     * Determine artifact type from language and content
     * @private
     */
    _determineArtifactType(language, content) {
        const lang = language.toLowerCase();

        // HTML/React
        if (lang === 'html' || content.trim().startsWith('<!DOCTYPE html') || content.trim().startsWith('<html')) {
            return 'html';
        }

        if (lang === 'jsx' || lang === 'tsx' || (lang === 'javascript' && content.includes('React'))) {
            return 'react';
        }

        // SVG
        if (lang === 'svg' || content.trim().startsWith('<svg')) {
            return 'svg';
        }

        // Markdown
        if (lang === 'markdown' || lang === 'md') {
            return 'markdown';
        }

        // JSON
        if (lang === 'json') {
            return 'json';
        }

        // Diagrams
        if (lang === 'mermaid' || lang === 'plantuml') {
            return 'diagram';
        }

        // Default to code
        return 'code';
    }

    /**
     * Generate a title for an artifact
     * @private
     */
    _generateTitle(type, language) {
        const titles = {
            html: 'Document HTML',
            react: 'Composant React',
            svg: 'Graphique SVG',
            markdown: 'Document Markdown',
            json: 'Données JSON',
            diagram: 'Diagramme',
            code: `Code ${this._getLanguageName(language)}`,
        };

        return titles[type] || 'Artifact';
    }

    /**
     * Get display name for a programming language
     * @private
     */
    _getLanguageName(lang) {
        const names = {
            js: 'JavaScript',
            javascript: 'JavaScript',
            ts: 'TypeScript',
            typescript: 'TypeScript',
            py: 'Python',
            python: 'Python',
            java: 'Java',
            cpp: 'C++',
            c: 'C',
            cs: 'C#',
            csharp: 'C#',
            rb: 'Ruby',
            ruby: 'Ruby',
            go: 'Go',
            rust: 'Rust',
            php: 'PHP',
            swift: 'Swift',
            kotlin: 'Kotlin',
            scala: 'Scala',
            bash: 'Bash',
            sh: 'Shell',
            sql: 'SQL',
            html: 'HTML',
            css: 'CSS',
            scss: 'SCSS',
            xml: 'XML',
            yaml: 'YAML',
            yml: 'YAML',
            json: 'JSON',
            md: 'Markdown',
            markdown: 'Markdown',
        };

        return names[lang?.toLowerCase()] || lang?.toUpperCase() || '';
    }

    /**
     * Check if content has any artifacts
     * @param {string} content - Message content
     * @returns {boolean}
     */
    hasArtifacts(content) {
        if (!content || typeof content !== 'string') {
            return false;
        }

        // Quick check for code blocks or artifact tags
        return /```[\s\S]*?```/.test(content) || /<artifact[\s\S]*?<\/artifact>/.test(content);
    }

    /**
     * Get the first (primary) artifact from content
     * @param {string} content - Message content
     * @returns {Object|null} First artifact or null
     */
    getPrimaryArtifact(content) {
        const artifacts = this.detectArtifacts(content);
        return artifacts.length > 0 ? artifacts[0] : null;
    }

    /**
     * Remove artifact markup from content (for clean text display)
     * @param {string} content - Message content
     * @returns {string} Content without artifact markup
     */
    stripArtifacts(content) {
        if (!content || typeof content !== 'string') {
            return '';
        }

        let stripped = content;

        // Remove code blocks
        stripped = stripped.replace(/```[\w]*\n[\s\S]*?```/g, '[Code Block]');

        // Remove artifact tags
        stripped = stripped.replace(/<artifact[\s\S]*?<\/artifact>/g, '[Artifact]');

        return stripped.trim();
    }

    /**
     * Get artifact statistics from content
     * @param {string} content - Message content
     * @returns {Object} Statistics
     */
    getArtifactStats(content) {
        const artifacts = this.detectArtifacts(content);

        const stats = {
            total: artifacts.length,
            byType: {},
            byLanguage: {},
        };

        artifacts.forEach(artifact => {
            // Count by type
            stats.byType[artifact.type] = (stats.byType[artifact.type] || 0) + 1;

            // Count by language
            if (artifact.language) {
                stats.byLanguage[artifact.language] = (stats.byLanguage[artifact.language] || 0) + 1;
            }
        });

        return stats;
    }
}

// Export singleton instance
export const artifactDetectionService = new ArtifactDetectionService();
