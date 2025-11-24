/**
 * Workflow Document Enhancer
 *
 * Enhances workflow prompts to generate structured documents
 * that can be automatically displayed and exported.
 *
 * Phase 4: Integration with DocumentPreview
 */

class WorkflowDocumentEnhancer {
    constructor() {
        // Document types that should generate structured documents
        this.documentWorkflows = {
            // HR workflows
            'create_job_posting': { type: 'offre', defaultTitle: 'Offre d\'Emploi' },
            'onboarding_plan': { type: 'plan', defaultTitle: 'Plan d\'Onboarding' },
            'performance_review': { type: 'rapport', defaultTitle: 'Évaluation de Performance' },

            // CEO workflows
            'strategic_plan': { type: 'plan', defaultTitle: 'Plan Stratégique' },
            'quarterly_report': { type: 'rapport', defaultTitle: 'Rapport Trimestriel' },
            'board_presentation': { type: 'presentation', defaultTitle: 'Présentation au Conseil' },

            // IT workflows
            'technical_spec': { type: 'specification', defaultTitle: 'Spécification Technique' },
            'incident_report': { type: 'rapport', defaultTitle: 'Rapport d\'Incident' },
            'architecture_doc': { type: 'documentation', defaultTitle: 'Documentation d\'Architecture' },

            // Marketing workflows
            'content_calendar': { type: 'plan', defaultTitle: 'Calendrier de Contenu' },
            'campaign_brief': { type: 'brief', defaultTitle: 'Brief de Campagne' },
            'marketing_report': { type: 'rapport', defaultTitle: 'Rapport Marketing' },

            // Sales workflows
            'sales_proposal': { type: 'proposition', defaultTitle: 'Proposition Commerciale' },
            'sales_report': { type: 'rapport', defaultTitle: 'Rapport des Ventes' },

            // Manager workflows
            'team_report': { type: 'rapport', defaultTitle: 'Rapport d\'Équipe' },
            'project_plan': { type: 'plan', defaultTitle: 'Plan de Projet' },
            'meeting_minutes': { type: 'compte-rendu', defaultTitle: 'Compte-rendu de Réunion' },

            // Student workflows
            'essay': { type: 'essai', defaultTitle: 'Dissertation' },
            'research_paper': { type: 'article', defaultTitle: 'Article de Recherche' },
            'study_guide': { type: 'guide', defaultTitle: 'Guide d\'Étude' },

            // Researcher workflows
            'research_proposal': { type: 'proposition', defaultTitle: 'Proposition de Recherche' },
            'literature_review': { type: 'revue', defaultTitle: 'Revue de Littérature' },
            'research_report': { type: 'rapport', defaultTitle: 'Rapport de Recherche' }
        };
    }

    /**
     * Check if a workflow should generate a structured document
     * @param {string} workflowId - Workflow ID
     * @returns {boolean}
     */
    shouldGenerateDocument(workflowId) {
        return workflowId in this.documentWorkflows;
    }

    /**
     * Get document configuration for a workflow
     * @param {string} workflowId - Workflow ID
     * @returns {Object|null} - { type, defaultTitle }
     */
    getDocumentConfig(workflowId) {
        return this.documentWorkflows[workflowId] || null;
    }

    /**
     * Enhance a workflow prompt to generate a structured document
     * @param {string} workflowId - Workflow ID
     * @param {string} originalPrompt - Original workflow prompt
     * @param {Object} formData - Form data with user inputs (optional)
     * @returns {string} - Enhanced prompt
     */
    enhancePrompt(workflowId, originalPrompt, formData = {}) {
        const docConfig = this.getDocumentConfig(workflowId);

        if (!docConfig) {
            // Not a document-generating workflow
            return originalPrompt;
        }

        // Extract title from form data or use default
        const title = this.extractTitleFromFormData(formData, docConfig.defaultTitle);

        // Add document generation instructions
        const enhancedPrompt = `${originalPrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 IMPORTANT - FORMAT DE RÉPONSE STRUCTURÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Génère ta réponse sous forme de document structuré en utilisant ce format:

<<DOCUMENT:${docConfig.type}>>
title: ${title}
---
# Ton contenu ici en markdown

Utilise un formatage markdown professionnel:
- Headers: # ## ###
- Listes: - ou 1. 2. 3.
- Gras: **texte**
- Italique: *texte*
- Citations: > texte
- Tableaux si approprié

Ce format permettra au document d'être affiché professionnellement
et exporté en PDF, DOCX ou Markdown.

<</DOCUMENT>>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

        return enhancedPrompt;
    }

    /**
     * Extract title from form data
     * @param {Object} formData - Form data
     * @param {string} defaultTitle - Default title
     * @returns {string} - Document title
     */
    extractTitleFromFormData(formData, defaultTitle) {
        // Common field names that could contain the title
        const titleFields = [
            'jobTitle', 'title', 'name', 'projectName', 'position',
            'topic', 'subject', 'campaignName', 'productName'
        ];

        for (const field of titleFields) {
            if (formData[field] && typeof formData[field] === 'string') {
                return formData[field];
            }
        }

        // If no title found, use default
        return defaultTitle;
    }

    /**
     * Generate document instructions for AI
     * @param {string} type - Document type
     * @param {string} title - Document title
     * @returns {string} - Instructions string
     */
    generateInstructions(type, title) {
        return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 GÉNÉRATION DE DOCUMENT STRUCTURÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Formate ta réponse comme un document professionnel:

<<DOCUMENT:${type}>>
title: ${title}
---
# [Titre Principal]

## [Section 1]
Contenu...

## [Section 2]
Contenu...

<</DOCUMENT>>

Utilise du markdown pour le formatage (headers, listes, gras, italique).
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    }

    /**
     * Get all workflow IDs that support document generation
     * @returns {Array<string>} - Array of workflow IDs
     */
    getDocumentWorkflowIds() {
        return Object.keys(this.documentWorkflows);
    }

    /**
     * Get document type for a workflow
     * @param {string} workflowId - Workflow ID
     * @returns {string|null} - Document type or null
     */
    getDocumentType(workflowId) {
        const config = this.getDocumentConfig(workflowId);
        return config ? config.type : null;
    }

    /**
     * Get statistics about document-enabled workflows
     * @returns {Object} - Stats object
     */
    getStats() {
        const workflowIds = this.getDocumentWorkflowIds();
        const types = [...new Set(Object.values(this.documentWorkflows).map(c => c.type))];

        return {
            totalWorkflows: workflowIds.length,
            documentTypes: types.length,
            types: types,
            workflowsByType: this.groupWorkflowsByType()
        };
    }

    /**
     * Group workflows by document type
     * @returns {Object} - Grouped workflows
     */
    groupWorkflowsByType() {
        const grouped = {};

        for (const [workflowId, config] of Object.entries(this.documentWorkflows)) {
            if (!grouped[config.type]) {
                grouped[config.type] = [];
            }
            grouped[config.type].push(workflowId);
        }

        return grouped;
    }
}

// Export singleton instance
module.exports = new WorkflowDocumentEnhancer();
