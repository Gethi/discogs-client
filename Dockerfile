FROM amazonlinux:latest
RUN yum -y install gzip aws-cli curl perl perl-XML-Parser
COPY setup.sh /
WORKDIR /
ENTRYPOINT ["/setup.sh"]