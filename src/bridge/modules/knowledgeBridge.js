/**
 * Knowledge Bridge - IPC handlers for workflows, documents, and RAG (Phase 3 & 4)
 */
const { ipcMain, dialog } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const authService = require('../../features/common/services/authService');
const workflowService = require('../../features/common/services/workflowService');
const documentService = require('../../features/common/services/documentService');
const indexingService = require('../../features/common/services/indexingService');
const ragService = require('../../features/common/services/ragService');
const firebaseKnowledgeSync = require('../../features/knowledge/services/firebaseKnowledgeSync');

module.exports = {
    initialize() {
        // Workflows (Phase 3)
        ipcMain.handle('workflows:get-current-profile-workflows', () => {
            return workflowService.getCurrentProfileWorkflows();
        });
        ipcMain.handle('workflows:get-workflows-metadata', (event, profileId) => {
            return workflowService.getProfileWorkflowsMetadata(profileId);
        });
        ipcMain.handle('workflows:get-workflow', (event, profileId, workflowId) => {
            return workflowService.getWorkflow(profileId, workflowId);
        });
        ipcMain.handle('workflows:build-prompt', (event, profileId, workflowId, formData) => {
            return workflowService.buildPrompt(profileId, workflowId, formData);
        });
        ipcMain.handle('workflows:get-form-fields', (event, profileId, workflowId) => {
            return workflowService.getWorkflowFormFields(profileId, workflowId);
        });
        ipcMain.handle('workflows:validate-form', (event, profileId, workflowId, formData) => {
            return workflowService.validateFormData(profileId, workflowId, formData);
        });

        // Knowledge Base - Documents (Phase 4)
        ipcMain.handle('documents:get-all', async () => {
            const userId = authService.getCurrentUserId();
            return await documentService.getAllDocuments(userId);
        });
        ipcMain.handle('documents:search', async (event, query, filters) => {
            const userId = authService.getCurrentUserId();
            return await documentService.searchDocuments(userId, query, filters);
        });
        ipcMain.handle('documents:get-stats', async () => {
            const userId = authService.getCurrentUserId();
            return await documentService.getDocumentStats(userId);
        });
        ipcMain.handle('documents:delete', async (event, documentId) => {
            return await documentService.deleteDocument(documentId);
        });
        ipcMain.handle('documents:upload', async () => {
            try {
                const userId = authService.getCurrentUserId();
                if (!userId) {
                    throw new Error('User not authenticated');
                }

                // Open file picker dialog
                const result = await dialog.showOpenDialog({
                    title: 'Upload Document',
                    properties: ['openFile'],
                    filters: [
                        { name: 'Documents', extensions: ['txt', 'md', 'pdf', 'docx'] },
                        { name: 'Text Files', extensions: ['txt', 'md'] },
                        { name: 'PDF Files', extensions: ['pdf'] },
                        { name: 'Word Documents', extensions: ['docx'] },
                        { name: 'All Files', extensions: ['*'] }
                    ]
                });

                if (result.canceled || result.filePaths.length === 0) {
                    return { success: false, cancelled: true };
                }

                const filePath = result.filePaths[0];
                const filename = path.basename(filePath);

                // Check file size before reading (prevent DoS)
                const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
                const stats = await fs.stat(filePath);

                if (stats.size > MAX_FILE_SIZE) {
                    console.warn(`[KnowledgeBridge] File too large: ${stats.size} bytes (max: ${MAX_FILE_SIZE})`);
                    return {
                        success: false,
                        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
                    };
                }

                // Read file buffer
                const buffer = await fs.readFile(filePath);

                console.log(`[KnowledgeBridge] Uploading document: ${filename} (${buffer.length} bytes)`);

                // Upload document
                const document = await documentService.uploadDocument(userId, {
                    filename,
                    filepath: filePath,
                    buffer
                });

                // Index document for semantic search
                try {
                    console.log(`[KnowledgeBridge] Indexing document: ${document.id}`);
                    const indexResult = await indexingService.indexDocument(
                        document.id,
                        document.content,
                        { generateEmbeddings: true }
                    );

                    // Update document indexed status
                    await documentService.updateDocument(document.id, {
                        chunk_count: indexResult.chunk_count,
                        indexed: 1
                    });

                    console.log(`[KnowledgeBridge] Document indexed: ${indexResult.chunk_count} chunks`);
                } catch (indexError) {
                    console.error('[KnowledgeBridge] Error indexing document:', indexError);
                    // Continue even if indexing fails
                }

                return {
                    success: true,
                    document: {
                        id: document.id,
                        title: document.title,
                        filename: document.filename
                    }
                };
            } catch (error) {
                console.error('[KnowledgeBridge] Error uploading document:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        });

        // Document analysis for conversation (Phase: Document Upload in Chat)
        ipcMain.handle('documents:analyze-file', async (event, fileData) => {
            try {
                const { filename, buffer } = fileData;

                if (!filename || !buffer) {
                    throw new Error('Missing filename or buffer');
                }

                console.log(`[KnowledgeBridge] Analyzing file for conversation: ${filename}`);

                // Check file size
                const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
                if (buffer.length > MAX_FILE_SIZE) {
                    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
                }

                // Extract text content only (no DB storage)
                const bufferObj = Buffer.from(buffer);
                const fileType = filename.split('.').pop().toLowerCase();

                let extractedText = '';

                // Use documentService private methods via reflection
                // Or create a dedicated method for extraction only
                if (fileType === 'txt' || fileType === 'md') {
                    extractedText = bufferObj.toString('utf-8');
                } else if (fileType === 'pdf') {
                    const pdfParse = require('pdf-parse');
                    const data = await pdfParse(bufferObj);
                    extractedText = data.text;
                } else if (fileType === 'docx') {
                    const mammoth = require('mammoth');
                    const result = await mammoth.extractRawText({ buffer: bufferObj });
                    extractedText = result.value;
                } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
                    // OCR for images (Phase 3)
                    try {
                        const { createWorker } = require('tesseract.js');

                        console.log(`[KnowledgeBridge] Starting OCR for ${filename}...`);

                        const worker = await createWorker('fra+eng', 1, {
                            logger: (m) => {
                                if (m.status === 'recognizing text') {
                                    console.log(`[KnowledgeBridge] OCR Progress: ${Math.round(m.progress * 100)}%`);
                                }
                            }
                        });

                        const { data: { text } } = await worker.recognize(bufferObj);
                        await worker.terminate();

                        extractedText = text;
                        console.log(`[KnowledgeBridge] OCR completed: ${extractedText.length} characters extracted`);

                        if (!extractedText || extractedText.trim().length === 0) {
                            throw new Error('No text could be extracted from the image. The image may be blank or contain no readable text.');
                        }
                    } catch (ocrError) {
                        console.error('[KnowledgeBridge] OCR Error:', ocrError);

                        // Check if tesseract.js is not installed
                        if (ocrError.code === 'MODULE_NOT_FOUND') {
                            throw new Error('OCR support not available. Please ensure tesseract.js is installed (npm install).');
                        }

                        throw new Error(`OCR failed: ${ocrError.message}`);
                    }
                } else {
                    throw new Error(`Unsupported file type: ${fileType}`);
                }

                console.log(`[KnowledgeBridge] Text extracted: ${extractedText.length} characters`);

                return {
                    success: true,
                    filename,
                    fileType,
                    extractedText,
                    size: buffer.length
                };
            } catch (error) {
                console.error('[KnowledgeBridge] Error analyzing file:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        });

        // RAG (Phase 4)
        ipcMain.handle('rag:retrieve-context', async (event, query, options) => {
            return await ragService.retrieveContext(query, options);
        });
        ipcMain.handle('rag:get-session-citations', async (event, sessionId) => {
            return await ragService.getSessionCitations(sessionId);
        });

        // Knowledge Base Sync (Firebase)
        ipcMain.handle('knowledge:get-status', async () => {
            try {
                const userId = authService.getCurrentUserId();
                if (!userId) {
                    return { status: 'inactive', name: '', documentCount: 0 };
                }

                await firebaseKnowledgeSync.initialize();
                const status = await firebaseKnowledgeSync.getStatus(userId);
                return status;
            } catch (error) {
                console.error('[KnowledgeBridge] Error getting knowledge base status:', error);
                return { status: 'inactive', name: '', documentCount: 0, error: error.message };
            }
        });

        ipcMain.handle('knowledge:create-personal-db', async () => {
            try {
                const userId = authService.getCurrentUserId();
                if (!userId) {
                    throw new Error('User not authenticated');
                }

                console.log('[KnowledgeBridge] Creating personal knowledge base for user:', userId);

                await firebaseKnowledgeSync.initialize();
                const result = await firebaseKnowledgeSync.createPersonalKnowledgeBase(userId);

                if (result.success) {
                    // Setup real-time sync
                    firebaseKnowledgeSync.setupRealtimeSync(userId);
                }

                return result;
            } catch (error) {
                console.error('[KnowledgeBridge] Error creating personal knowledge base:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        });

        ipcMain.handle('knowledge:connect-external-db', async () => {
            try {
                const userId = authService.getCurrentUserId();
                if (!userId) {
                    throw new Error('User not authenticated');
                }

                console.log('[KnowledgeBridge] Connecting to external knowledge base');

                // Show dialog to get Firebase config
                const result = await dialog.showMessageBox({
                    type: 'question',
                    title: 'Connecter une Base Externe',
                    message: 'Voulez-vous entrer la configuration Firebase manuellement ?',
                    buttons: ['Annuler', 'Entrer la Configuration'],
                    defaultId: 1,
                    cancelId: 0
                });

                if (result.response === 0) {
                    return { success: false, cancelled: true };
                }

                // For now, return success with placeholder
                // In a full implementation, you'd show a custom dialog to collect Firebase config
                console.log('[KnowledgeBridge] External database connection not fully implemented yet');

                return {
                    success: true,
                    name: 'Base Externe',
                    documentCount: 0,
                    message: 'Fonctionnalité en cours de développement'
                };
            } catch (error) {
                console.error('[KnowledgeBridge] Error connecting to external database:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        });

        ipcMain.handle('knowledge:sync-now', async () => {
            try {
                const userId = authService.getCurrentUserId();
                if (!userId) {
                    throw new Error('User not authenticated');
                }

                console.log('[KnowledgeBridge] Starting knowledge base sync');

                await firebaseKnowledgeSync.initialize();
                const result = await firebaseKnowledgeSync.syncToFirebase(userId);

                return result;
            } catch (error) {
                console.error('[KnowledgeBridge] Error syncing knowledge base:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        });

        ipcMain.handle('knowledge:open-manager', async () => {
            try {
                console.log('[KnowledgeBridge] Opening knowledge base manager');

                // For now, just show a message
                // In a full implementation, you'd open a new window or navigate to the KB manager view
                await dialog.showMessageBox({
                    type: 'info',
                    title: 'Gestionnaire de Knowledge Base',
                    message: 'Le gestionnaire de documents sera bientôt disponible dans une future mise à jour.',
                    buttons: ['OK']
                });

                return { success: true };
            } catch (error) {
                console.error('[KnowledgeBridge] Error opening knowledge base manager:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        });

        // Document Export (Phase 4)
        const documentExportService = require('../../features/common/services/documentExportService');

        ipcMain.handle('documents:export', async (event, documentData) => {
            try {
                const { title, content, type, format } = documentData;

                if (!title || !content || !format) {
                    throw new Error('Missing required fields: title, content, or format');
                }

                console.log(`[KnowledgeBridge] Exporting document "${title}" to ${format.toUpperCase()}`);

                const result = await documentExportService.exportDocument({
                    title,
                    content,
                    type: type || 'document'
                }, format);

                return result;
            } catch (error) {
                console.error('[KnowledgeBridge] Error exporting document:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        });

        ipcMain.handle('documents:open-export-folder', async () => {
            try {
                return await documentExportService.openExportDirectory();
            } catch (error) {
                console.error('[KnowledgeBridge] Error opening export folder:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        });

        console.log('[KnowledgeBridge] Initialized');
    }
};
