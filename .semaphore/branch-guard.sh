if [ "$SEMAPHORE_GIT_BRANCH" = $1 ];
then
    echo "Branch matches $1"
    exit 0;
else
    echo "Branch $SEMAPHORE_GIT_BRANCH does not match $1"
    exit 1
fi
