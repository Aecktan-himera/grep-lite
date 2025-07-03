#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Парсинг аргументов командной строки
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};

  for (const arg of args) {
    if (arg.startsWith('--file=')) {
      params.file = arg.split('=')[1];
    } else if (arg.startsWith('--search=')) {
      params.search = arg.split('=')[1];
    } else if (arg === '--ignore-case') {
      params.ignoreCase = true;
    }
  }

  return params;
}

// Основная функция поиска
function grep(filePath, searchStr, options = {}) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const searchRegex = options.ignoreCase 
      ? new RegExp(searchStr, 'gi') 
      : new RegExp(searchStr, 'g');

    let hasMatches = false;

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const match = searchRegex.test(line);
      
      // Сброс lastIndex для повторного использования регулярного выражения
      searchRegex.lastIndex = 0;

      if (match) {
        hasMatches = true;
        // Подсветка найденной подстроки
        const highlightedLine = line.replace(
          searchRegex, 
          match => `\x1b[31m${match}\x1b[0m`
        );
        console.log(`[Line ${lineNumber}]: ${highlightedLine}`);
      }
    });

    if (!hasMatches) {
      console.log(`No matches found for "${searchStr}" in ${filePath}`);
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`Error: File not found - ${filePath}`);
      process.exit(1);
    } else {
      console.error(`Error reading file: ${err.message}`);
      process.exit(1);
    }
  }
}

// Основная логика программы
function main() {
  const params = parseArgs();

  if (!params.file || !params.search) {
    console.log('Usage: node grep-lite.js --file=<path> --search=<string> [--ignore-case]');
    process.exit(1);
  }

  // Проверка существования файла
  if (!fs.existsSync(params.file)) {
    console.error(`Error: File not found - ${params.file}`);
    process.exit(1);
  }

  grep(params.file, params.search, {
    ignoreCase: params.ignoreCase
  });
}

main();