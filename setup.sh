#!/bin/bash
#set -xv

git clone https://github.com/Gethi/discogs-client.git /wks
cd /wks

tar xvzf tools.tar.gz
#cp -rf tools/* .
#rm -r tools
#rm tools.tar.gz

yarn install

gzip -d data/XML/discogs_20190901_releases-exc.xml.gz
ls -l
ls -l data
./tools/xml_split -s1Mb ./data/XML/discogs_20190901_releases-exc.xml
ls -l data/XML