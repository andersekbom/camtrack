const { exec } = require('child_process');
const path = require('path');

class DatabaseController {
  /**
   * Commit and push the database file to GitHub
   */
  static async commitDatabase(req, res) {
    try {
      console.log('📦 Starting database commit process...');

      // Define the database file path
      const dbPath = path.join(__dirname, '../database/cameras.db');
      
      // Git commands to commit and push the database
      const gitCommands = [
        'git add database/cameras.db',
        'git commit -m "Update database with latest changes\n\n🤖 Generated with [Claude Code](https://claude.ai/code)\n\nCo-Authored-By: Claude <noreply@anthropic.com>"',
        'git push origin master'
      ];

      // Execute git commands sequentially
      for (const command of gitCommands) {
        await new Promise((resolve, reject) => {
          exec(command, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
            if (error) {
              console.error(`Git command failed: ${command}`, error);
              // If the commit fails because there are no changes, that's okay
              if (error.message.includes('nothing to commit')) {
                console.log('📋 Database is already up to date');
                resolve(stdout);
                return;
              }
              reject(error);
              return;
            }
            console.log(`✅ Command executed: ${command}`);
            if (stdout) console.log(stdout);
            if (stderr) console.log('stderr:', stderr);
            resolve(stdout);
          });
        });
      }

      console.log('🎉 Database commit completed successfully');

      res.json({
        success: true,
        message: 'Database committed and pushed to GitHub successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Database commit failed:', error);
      
      // Provide more helpful error messages
      let errorMessage = error.message;
      if (error.message.includes('not a git repository')) {
        errorMessage = 'Git repository not found. Make sure this is a git repository.';
      } else if (error.message.includes('nothing to commit')) {
        errorMessage = 'Database is already up to date with the latest changes.';
      } else if (error.message.includes('Permission denied')) {
        errorMessage = 'Permission denied. Check Git credentials and repository access.';
      }

      res.status(500).json({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get database status and information
   */
  static async getDatabaseStatus(req, res) {
    try {
      const dbPath = path.join(__dirname, '../database/cameras.db');
      const fs = require('fs');
      
      // Check if database file exists
      const dbExists = fs.existsSync(dbPath);
      const dbStats = dbExists ? fs.statSync(dbPath) : null;

      // Get git status for the database file
      const gitStatus = await new Promise((resolve, reject) => {
        exec('git status --porcelain database/cameras.db', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
          if (error) {
            resolve('unknown');
            return;
          }
          
          const status = stdout.trim();
          if (!status) {
            resolve('clean');
          } else if (status.includes('M')) {
            resolve('modified');
          } else if (status.includes('A')) {
            resolve('added');
          } else {
            resolve('unknown');
          }
        });
      });

      res.json({
        success: true,
        database: {
          exists: dbExists,
          path: dbPath,
          size: dbStats ? dbStats.size : 0,
          lastModified: dbStats ? dbStats.mtime : null,
          gitStatus: gitStatus
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Failed to get database status:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

module.exports = DatabaseController;