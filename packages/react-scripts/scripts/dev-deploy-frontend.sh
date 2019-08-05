#!/bin/bash

####################
# Configuration
####################

SSH_DEST="singhsuadmin@webpub-dev.autodesk.com"
LOCAL_BUILD_PATH="/c/wamp/www/draftr-editor-ui/build/"

# Careful, orphaned files in the DEST_PATH will be deleted. Use "./dev-deploy.sh test" to be sure no wanted files will be deleted
# You probably don't need to change this
DEST_PATH="/var/www/html/draftr/editor-new/"
#######################################################

SCRIPT_NAME=$(basename "$0")
ERROR_STRING=$'Usage: '$SCRIPT_NAME$' [test|deploy]\n  1. Run \"npm run build\"\n  2. Use \"./'$SCRIPT_NAME$' test\" to be sure no wanted files will be deleted.\n  3. \"./'$SCRIPT_NAME$' deploy\" to deploy'

if [[ $# -eq 0 ]]
    then
        echo "$ERROR_STRING"
elif [[ "$1" == "test" ]]
    then
        echo "Dry run of deploy to $SSH_DEST:$DEST_PATH ..."
        rsync -vzcrh --delete --exclude=.DS_Store --dry-run "$LOCAL_BUILD_PATH" -e ssh "$SSH_DEST":"$DEST_PATH"
elif [[ "$1" == "deploy" ]]
    then
        echo "DEPLOYING TO $SSH_DEST:$DEST_PATH ..."
        sleep 5
        rsync -vzcrh --delete --exclude=.DS_Store "$LOCAL_BUILD_PATH" -e ssh "$SSH_DEST":"$DEST_PATH"
        ssh "$SSH_DEST" "find $DEST_PATH -type d -exec chmod 775 {} \;"
        ssh "$SSH_DEST" "find $DEST_PATH -type f -exec chmod 664 {} \;"
else
    echo "$ERROR_STRING"
fi
