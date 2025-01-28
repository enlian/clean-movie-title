const fs = require('fs');
const path = require('path');

//文件名恢复功能：改错文件名能够进行恢复

const targetDirectory = 'E:/影视';
const logFile = 'rename-log-latest.txt'; // 替换为日志文件

function restoreFileNames(directory, logFile) {
    fs.readFile(logFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading log file:', err);
            return;
        }

        const renameMap = {};
        const lines = data.split('\n');
        lines.forEach(line => {
            const match = line.match(/Renamed: (.+?) -> (.+)/);
            if (match) {
                renameMap[match[2].trim()] = match[1].trim();
            }
        });

        fs.readdir(directory, (err, files) => {
            if (err) {
                console.error('Error reading directory:', err);
                return;
            }

            files.forEach(file => {
                if (renameMap[file]) {
                    const oldPath = path.join(directory, file);
                    const newPath = path.join(directory, renameMap[file]);

                    fs.rename(oldPath, newPath, (err) => {
                        if (err) {
                            console.error(`Error renaming file ${file}:`, err);
                        } else {
                            console.log(`Restored: ${file} -> ${renameMap[file]}`);
                        }
                    });
                }
            });
        });
    });
}


restoreFileNames(targetDirectory, logFile);
