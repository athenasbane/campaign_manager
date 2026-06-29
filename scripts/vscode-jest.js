'use strict';

const defaultArgs = [
  '--transformIgnorePatterns',
  'node_modules/(?!@codemirror)/',
  '--watchAll=false',
];

process.argv.splice(2, 0, ...defaultArgs);

require('./test');
