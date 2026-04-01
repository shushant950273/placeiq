'use strict';

const fs = require('fs');
const path = require('path');

// Class token → its dark variant pairing
const replacements = [
  // Text
  ['text-gray-900', 'dark:text-[#E6EDF3]'],
  ['text-gray-800', 'dark:text-[#E6EDF3]'],
  ['text-gray-700', 'dark:text-[#C9D1D9]'],
  ['text-gray-600', 'dark:text-[#C9D1D9]'],
  ['text-gray-500', 'dark:text-[#8B949E]'],
  ['text-gray-400', 'dark:text-[#8B949E]'],
  ['text-slate-900', 'dark:text-[#E6EDF3]'],
  ['text-slate-800', 'dark:text-[#E6EDF3]'],
  ['text-slate-700', 'dark:text-[#C9D1D9]'],
  ['text-slate-600', 'dark:text-[#C9D1D9]'],
  ['text-slate-500', 'dark:text-[#8B949E]'],
  ['text-slate-400', 'dark:text-[#8B949E]'],
  // Backgrounds
  ['bg-white', 'dark:bg-[#161B22]'],
  ['bg-gray-50', 'dark:bg-[#0D1117]'],
  ['bg-gray-100', 'dark:bg-[#161B22]'],
  ['bg-gray-200', 'dark:bg-[#21262D]'],
  ['bg-slate-50', 'dark:bg-[#0D1117]'],
  ['bg-slate-100', 'dark:bg-[#161B22]'],
  ['bg-slate-200', 'dark:bg-[#21262D]'],
  // Borders
  ['border-gray-100', 'dark:border-[#21262D]'],
  ['border-gray-200', 'dark:border-[#30363D]'],
  ['border-gray-300', 'dark:border-[#30363D]'],
  ['border-slate-100', 'dark:border-[#21262D]'],
  ['border-slate-200', 'dark:border-[#30363D]'],
  ['border-slate-300', 'dark:border-[#30363D]'],
  // Divide
  ['divide-gray-100', 'dark:divide-[#21262D]'],
  ['divide-gray-200', 'dark:divide-[#30363D]'],
  ['divide-slate-100', 'dark:divide-[#21262D]'],
  ['divide-slate-200', 'dark:divide-[#30363D]'],
  // Hover backgrounds
  ['hover:bg-gray-50', 'dark:hover:bg-[#21262D]'],
  ['hover:bg-gray-100', 'dark:hover:bg-[#21262D]'],
  ['hover:bg-slate-50', 'dark:hover:bg-[#21262D]'],
  ['hover:bg-slate-100', 'dark:hover:bg-[#21262D]'],
];

function walkDir(dir, list) {
  list = list || [];
  var entries = fs.readdirSync(dir);
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var full = path.join(dir, entry);
    var stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (entry !== 'node_modules' && entry !== '.git' && entry !== 'dist') {
        walkDir(full, list);
      }
    } else if (entry.endsWith('.jsx')) {
      list.push(full);
    }
  }
  return list;
}

// Process a className attribute value string
// For each "find" token that exists but whose "dark:X" does NOT, append dark:X after it
function patchClassString(str) {
  for (var i = 0; i < replacements.length; i++) {
    var find = replacements[i][0];
    var darkVariant = replacements[i][1];
    
    // Build boundary regex: word must be delimited by space, " ' ` or start/end
    var boundaryBefore = '(?:^|[\\s"\',`({])';
    var boundaryAfter = '(?=[\\s"\',`)}]|$)';
    var re = new RegExp(boundaryBefore + '(' + escRe(find) + ')' + boundaryAfter, 'g');
    
    str = str.replace(re, function(match, token, offset) {
      // Check if darkVariant is already in the string nearby (within 200 chars)
      var nearby = str.substring(Math.max(0, offset - 10), offset + 200);
      if (nearby.indexOf(darkVariant) !== -1) return match;
      // Append the dark variant right after the token
      return match + ' ' + darkVariant;
    });
  }
  return str;
}

function escRe(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

var srcDir = path.join(__dirname, 'src');
var files = walkDir(srcDir);
var changed = [];

for (var f = 0; f < files.length; f++) {
  var file = files[f];
  var original = fs.readFileSync(file, 'utf8');
  
  // Only operate inside className="..." or className={`...`} or className={'...'} blocks
  var patched = original.replace(/(className=["'`{][\s\S]*?["'`}])/g, function(classBlock) {
    return patchClassString(classBlock);
  });
  
  if (patched !== original) {
    fs.writeFileSync(file, patched, 'utf8');
    changed.push(file.replace(__dirname + path.sep, ''));
    console.log('Fixed: ' + file.replace(__dirname + path.sep, ''));
  }
}

console.log('\nDone! Patched ' + changed.length + ' files.');
