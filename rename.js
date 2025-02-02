const fs = require('fs');
const path = require('path');

function cleanMovieTitle(filename) {
    const invalidPatterns = [
        /\b(The|A|An)\.(?=[A-Z])/gi, // 替换 "The." -> "The "
        /[\s._-]+(1080p|720p|RARBG|JPN|x265|LAMA|NaNi|10bit|2160p|4K|8K|HD|WEBRip|WEB-DL|BluRay|BDRip|H\.264|H\.265|x264|x265|HDR|SDR|HEVC|DDP[\.\d]*|AAC|DTS|DTS-HD|TrueHD|Atmos|MA|AC3|Dual|CHS|ENG|GERMAN|HINDI|MULTi|JAPANESE|KOREAN|RARBG|YTS|AMZN|NF|AppleTV|B4E|ETHEL|TUDHER|BDE4|WEB|BD|PROPER|REPACK|IMAX|UNCUT|EXTENDED|Remux|HDTV|CAM|TS|SCR|DVDSCR|DVDRip|TC|HDTS|HDTC)(?=[\s._-]|$)/gi, '' // 删除无意义标记
    ];

    const removeWords = [
        '特效', '中英字幕', '中字', '国语', '粤语', '配音', '双字', '高清', '完整版', '特别版', '修复版', 
        '官方字幕', '电影版', '剧场版', 'TV版', 'BD', 'DVD', '4K修复', 'HDR版', '蓝光', '蓝光版', '蓝光修复',
        '中英双字', '中英双字幕', '中英字幕', '中英双语', '中英双语字幕', '中英双语字幕版', '中英双语版', '中英双语修复版', '中英双语修复', '中英'
    ];

    const specialCharacters = ['-', '_', '/', ':', '：']; // 特殊字符数组，可扩展

    let cleanedName = filename;

    // 删除无意义标记
    invalidPatterns.forEach(pattern => {
        cleanedName = cleanedName.replace(pattern, '');
    });

    // 删除无意义中文
    removeWords.forEach(word => {
        cleanedName = cleanedName.replace(new RegExp(`(?:^|\s|[-_/])${word}(?:\s|[-_/]|$)`, 'gi'), '');
    });

    // 删除特殊字符
    specialCharacters.forEach(char => {
        cleanedName = cleanedName.replace(new RegExp(`\${char}`, 'g'), ' ');
    });

    cleanedName = cleanedName.replace(/(?<!\.)\.(?!\w{2,4}$)/g, ' '); // 替换所有点为空格，但保留扩展名前的点
    cleanedName = cleanedName.replace(/\s+([\p{Script=Han}])/gu, '$1'); // 修复删除汉字后前面多出的空格
    cleanedName = cleanedName.replace(/\.\s/g, ' '); // 删除点后多余的空格
    cleanedName = cleanedName.replace(/\.{2,}/g, '.'); // 合并多余的点
    cleanedName = cleanedName.replace(/\s{2,}/g, ' ').trim(); // 合并多余空格

    // 修复中文与英文之间没有空格的问题
    cleanedName = cleanedName.replace(/([\p{Script=Han}])([A-Za-z])/gu, '$1 $2');
    cleanedName = cleanedName.replace(/([A-Za-z])([\p{Script=Han}])/gu, '$1 $2');

    // 确保标题保留最小长度
    const minLength = 5;
    return cleanedName.length >= minLength ? cleanedName : filename;
}

function renameFiles(directory) {
    const logEntries = [];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = `rename-log-${timestamp}.txt`;

    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        let processedFiles = 0;

        files.forEach(file => {
            const oldPath = path.join(directory, file);
            const ext = path.extname(file);
            const baseName = path.basename(file, ext);
            const newFileName = cleanMovieTitle(baseName).trim() + ext;
            const newPath = path.join(directory, newFileName);

            if (oldPath !== newPath) {
                fs.rename(oldPath, newPath, (err) => {
                    processedFiles++;

                    if (err) {
                        console.error(`Error renaming file ${file}:`, err);
                    } else {
                        logEntries.push(`Renamed: ${file} -> ${newFileName}`);
                        console.log(`Renamed: ${file} -> ${newFileName}`);
                    }

                    if (processedFiles === files.length) {
                        fs.writeFile(logFile, logEntries.join('\n'), (err) => {
                            if (err) {
                                console.error('Error writing log file:', err);
                            } else {
                                console.log(`Log file created: ${logFile}`);
                            }
                        });
                    }
                });
            } else {
                processedFiles++;

                if (processedFiles === files.length) {
                    fs.writeFile(logFile, logEntries.join('\n'), (err) => {
                        if (err) {
                            console.error('Error writing log file:', err);
                        } else {
                            console.log(`Log file created: ${logFile}`);
                        }
                    });
                }
            }
        });
    });
}

const targetDirectory = 'D:/下载';
renameFiles(targetDirectory);
