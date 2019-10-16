FROM amazonlinux:latest
RUN yum -y install which gzip aws-cli gcc-c++ make curl perl tar perl-XML-Parser git
RUN curl -sL https://rpm.nodesource.com/setup_10.x | bash -
RUN yum -y install nodejs
RUN curl -sL https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
RUN rpm --import https://dl.yarnpkg.com/rpm/pubkey.gpg
RUN yum -y install yarn
RUN mkdir /wks
RUN mkdir /wks/data
RUN mkdir /wks/data/XML
COPY setup.sh /
COPY discogs_20190901_releases-exc.xml.gz /wks/data/XML
WORKDIR /
ENTRYPOINT ["/setup.sh"]