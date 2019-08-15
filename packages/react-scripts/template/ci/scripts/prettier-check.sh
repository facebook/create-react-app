#!/bin/bash
printf "Running prettier --list-different\n\n"
if ! ./node_modules/.bin/prettier --list-different '{,!(tmp)/**/}*.{js,json}'; then
  printf "\nUnformatted files found by Prettier. Please run 'npm run format' and commit the changes.\n\n"
  exit 1
else
  printf "No improperly formatted files found by Prettier.\n"
fi
