#! /bin/sh
echo 'backup of package.json is being kept  incase required as before running npm audir fix --force ( or yarn audit fix --force) as these commands may change package.json '  
node -e "require('fs').copyFileSync('package.json','package.json.bak')"
if [ $? -eq 0 ]; then 
  echo " backup of package.json done to package,json.bak "
else
  echo "backup of package.json failed " >&2 
  exit 1
fi
  
    
