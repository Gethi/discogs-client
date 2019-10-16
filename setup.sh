#!/bin/bash
#set -xv

cd /wks
git clone -b feature/refactor https://github.com/Gethi/discogs-client.git tmp
mv tmp/* tmp/.git* .
rm -rf tmp

#tmp
mv discogs_20190901_releases-exc.xml.gz data/XML/

yarn install

gzip -d data/XML/discogs_20190901_releases-exc.xml.gz
cd tools
./xml_split -s1Mb ../data/XML/discogs_20190901_releases-exc.xml
cd ..
ls -l data/XML

node index.js

ls -l data/JSON