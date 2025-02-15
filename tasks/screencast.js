#!/usr/bin/env node

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// Import necessary modules
const fs = require('fs');
const path = require('path');
const execa = require('execa');
const tempy = require('tempy');

main();// Execute the main function

function main() {
  const previous = process.cwd();// Store the current working directory
  const cwd = tempy.directory();// Create a temporary directory for the screencast

  const cast = path.join(cwd, 'screencast.json');// Path for the screencast JSON file
  const script = path.join(__dirname, 'screencast.sh');// Path for the shell script to run
  const out = path.join(previous, 'screencast.svg'); // Path for the output SVG file

    // Define functions to identify specific lines in the output
  const resolveLine = l => l.indexOf('🔍  Resolving packages...') > -1;
  const fetchLine = l => l.indexOf('🚚  Fetching packages...') > -1;
  const countLine = l => l.match(/Saved [0-9]+ new dependencies/);
  const doneLine = l => l.indexOf('✨  Done in') > -1;

  try {
    process.chdir(cwd);// Change to the temporary directory
    console.log(`Recording screencast ...`);// Log the recording start message
    // Execute the 'asciinema' command to record the output of the shell script
    execa.sync('asciinema', ['rec', '--command', `sh ${script}`, cast], {
      cwd,
      stdio: 'inherit',// Inherit stdio to see the output
    });

    console.log('Cleaning data ...');// Log the data cleaning start message
    const data = require(cast); // Load the recorded screencast data

     // Cut the recorded frames to keep only relevant parts
    cut(data.stdout, { start: resolveLine, end: fetchLine });
    cut(data.stdout, { start: countLine, end: doneLine });
    // Replace the current working directory in the frames with '~' for privacy
    replace(data.stdout, [{ in: cwd, out: '~' }]);

    // Write the cleaned data back to the screencast JSON file
    fs.writeFileSync(cast, JSON.stringify(data, null, '  '));

    console.log('Rendering SVG ...');// Log the SVG rendering start message
       // Execute the 'svg-term' command to render the screencast into an SVG file
    execa.sync('svg-term', ['--window', '--in', cast, '--out', out]);

    // Log success messages for both the recorded screencast and rendered SVG
    console.log(`Recorded screencast to ${cast}`);
    console.log(`Rendered SVG to ${out}`);
  } finally {
    process.chdir(previous);// Ensure the working directory is restored
  }
}

// Function to cut the frames based on specified start and end conditions
function cut(frames, { start, end }) {
  const si = frames.findIndex(([, l]) => start(l)); // Find the start index
  const ei = frames.findIndex(([, l]) => end(l));// Find the end index

   // If either index is not found, exit the function
  if (si === -1 || ei === -1) {
    return;
  }

    // Remove the frames between the start and end indices
  frames.splice(si + 1, ei - si - 1);
}
// Function to replace specified strings in the frames
function replace(frames, replacements) {
  frames.forEach(frame => {
    replacements.forEach(r => (frame[1] = frame[1].split(r.in).join(r.out)));// Replace occurrences of 'in' with 'out'
  });
}
