# Fix ssl bug
export NODE_OPTIONS=--openssl-legacy-provider

# Build production
echo 'Start build'
npm run build

current_date=`date +%Y%m%d`
filename=stt_webdemo_staging_${current_date}.zip

# zip ./dist/
echo Zip file to ${filename}
zip -r ${filename} ./dist

# move zip file to release
echo Move zip file to ./release/
mv ${filename} ./release/

#EOF
