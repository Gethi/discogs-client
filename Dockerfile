FROM amazonlinux:latest
RUN yum -y install gzip aws-cli gcc-c++ make curl perl perl-XML-Parser git
RUN curl -sL https://rpm.nodesource.com/setup_10.x | bash -
RUN yum -y install nodejs
RUN curl -sL https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
RUN rpm --import https://dl.yarnpkg.com/rpm/pubkey.gpg
RUN yum -y install yarn
RUN mkdir /wks
COPY setup.sh /
#tmp
COPY discogs_20190901_releases-exc.xml.gz /wks
WORKDIR /
ENTRYPOINT ["/setup.sh"]