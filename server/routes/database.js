const express = require('express');
const router = express.Router();
const DatabaseController = require('../controllers/databaseController');

/**
 * @swagger
 * /api/database/commit:
 *   post:
 *     summary: Commit and push database to GitHub
 *     description: Commits the current database file to the Git repository and pushes to GitHub
 *     tags: [Database]
 *     responses:
 *       200:
 *         description: Database committed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Failed to commit database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.post('/commit', DatabaseController.commitDatabase);

/**
 * @swagger
 * /api/database/status:
 *   get:
 *     summary: Get database status information
 *     description: Returns information about the database file and its Git status
 *     tags: [Database]
 *     responses:
 *       200:
 *         description: Database status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 database:
 *                   type: object
 *                   properties:
 *                     exists:
 *                       type: boolean
 *                     path:
 *                       type: string
 *                     size:
 *                       type: number
 *                     lastModified:
 *                       type: string
 *                       format: date-time
 *                     gitStatus:
 *                       type: string
 *                       enum: [clean, modified, added, unknown]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Failed to get database status
 */
router.get('/status', DatabaseController.getDatabaseStatus);

module.exports = router;