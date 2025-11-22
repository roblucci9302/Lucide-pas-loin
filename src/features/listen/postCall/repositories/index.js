/**
 * Post-Call Repositories Index
 * Central export for meeting notes and tasks repositories
 */

const meetingNotesRepository = require('./meetingNotes.repository');
const meetingTasksRepository = require('./meetingTasks.repository');

module.exports = {
    meetingNotesRepository,
    meetingTasksRepository
};
