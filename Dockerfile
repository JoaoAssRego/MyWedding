FROM ruby:4.0.7-slim

WORKDIR /MyWedding

RUN apt-get update \
&& apt-get install -y --no-install-recommends \
build-essential \
git \
libpq-dev \
libyaml-dev \
&& rm -rf /var/lib/apt/lists/*