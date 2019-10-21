#!/bin/bash
#set -xv

yum -y install gcc-c++ make git wget epel-release
curl -sL https://rpm.nodesource.com/setup_10.x | bash -
yum -y install nodejs
curl -sL https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
rpm --import https://dl.yarnpkg.com/rpm/pubkey.gpg
yum -y install yarn
yum -y install aria2

cd /scratch
git clone -b feature/refactor https://github.com/Gethi/discogs-client.git tmp
mv tmp/* tmp/.git* .
rm -rf tmp

yarn install

clear

./run.sh