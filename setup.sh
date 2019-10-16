#!/bin/bash
#set -xv

cd /wks
git clone -b feature/refactor https://github.com/Gethi/discogs-client.git tmp
mv tmp/* tmp/.git* .
#rmdir tmp
ls -l

#tar xvzf tools.tar.gz
#cp -rf tools/* .
#rm -r tools
#rm tools.tar.gz

yarn install

gzip -d data/XML/discogs_20190901_releases-exc.xml.gz
ls -l
ls -l data
cd tools
./xml_split -s1Mb ../data/XML/discogs_20190901_releases-exc.xml
cd ..
ls -l data/XML