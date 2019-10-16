FROM amazonlinux:latest
RUN yum -y install which gzip aws-cli gcc-c++ make curl perl tar perl-XML-Parser git yarn
RUN curl -sL https://rpm.nodesource.com/setup_10.x | bash -
RUN yum -y install nodejs
RUN mkdir /wks
RUN mkdir /wks/data
RUN mkdir /wks/data/XML
RUN mkdir /wks/data/JSON
COPY setup.sh /
COPY discogs_20190901_releases-exc.xml.gz /wks/data/XML
WORKDIR /
ENTRYPOINT ["/setup.sh"]