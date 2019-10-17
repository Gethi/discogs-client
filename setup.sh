#!/bin/bash
#set -xv

yum -y install gcc-c++ make git
curl -sL https://rpm.nodesource.com/setup_10.x | bash -
yum -y install nodejs
curl -sL https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
rpm --import https://dl.yarnpkg.com/rpm/pubkey.gpg
yum -y install yarn

cd /scratch
git clone -b feature/refactor https://github.com/Gethi/discogs-client.git tmp
mv tmp/* tmp/.git* .
rm -rf tmp

##tmp
mv /discogs_20190901_releases-exc.xml.gz /scratch/data/XML/

yarn install

gzip -d data/XML/discogs_20190901_releases-exc.xml.gz
cd tools
./xml_split -s1Mb ../data/XML/discogs_20190901_releases-exc.xml
cd ..

node index.js

ls -l data/JSON