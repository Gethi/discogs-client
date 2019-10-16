FROM amazonlinux:latest
RUN yum -y install which gzip aws-cli gcc-c++ make curl perl tar perl-XML-Parser
RUN curl -sL https://rpm.nodesource.com/setup_10.x | bash -
RUN yum -y install nodejs
RUN mkdir /wks
RUN mkdir /wks/data
COPY setup.sh /wks
COPY tools.tar.gz /wks
COPY discogs_20190901_releases-exc.xml.gz /wks/data
WORKDIR /wks
ENTRYPOINT ["/wks/setup.sh"]