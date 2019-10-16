FROM amazonlinux:latest
RUN yum -y install which unzip aws-cli
COPY get_latest_dumps.sh /
WORKDIR /
USER nobody
ENTRYPOINT ["/get_latest_dumps.sh"]