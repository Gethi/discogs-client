#!/bin/bash
#set -xv

tar xvzf tools.tar.gz
cp -rf tools/* .
rm -r tools
rm tools.tar.gz

gzip -d data/discogs_20190901_releases-exc.xml.gz
ls -l /wks
./xml_split -s1Mb ./data/discogs_20190901_releases-exc.xml
ls -l /wks