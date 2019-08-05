#!/bin/bash

####################
# Configuration
####################

SSH_DEST="YOUR_ADMIN_USERNAME_HERE@webpub-dev.autodesk.com"
LOCAL_BACKEND_PATH="/Users/magonie/git/draftr/php/service.php"

# You probably don't need to change these
DEST_PATH="/var/www/html/draftr/"
BACKUP_PATH="/var/www/html/draftr/service.php"
#######################################################

SCRIPT_NAME=$(basename "$0")
ERROR_STRING=$'Usage: '$SCRIPT_NAME$' [test|deploy]\n  1. Run \"npm run build\"\n  2. Use \"./'$SCRIPT_NAME$' test\" to be sure no wanted files will be deleted.\n  3. \"./'$SCRIPT_NAME$' deploy\" to deploy'
DATETIME=$(date '+%Y%m%d-%H%M%S')

if [[ $# -eq 0 ]]
    then
        echo "$ERROR_STRING"
elif [[ "$1" == "test" ]]
    then
        echo "Dry run of deploy backend to $SSH_DEST:$DEST_PATH ..."
        rsync -vzcrh --exclude=.DS_Store --dry-run "$LOCAL_BACKEND_PATH" -e ssh "$SSH_DEST":"$DEST_PATH"
elif [[ "$1" == "deploy" ]]
    then
        echo "DEPLOYING BACKEND TO $SSH_DEST:$DEST_PATH ..."
        sleep 5
        ssh "$SSH_DEST" "cp -r $BACKUP_PATH $BACKUP_PATH-backup-$DATETIME"
        rsync -vzcrh --exclude=.DS_Store "$LOCAL_BACKEND_PATH" -e ssh "$SSH_DEST":"$DEST_PATH"
else
    echo "$ERROR_STRING"
fi
