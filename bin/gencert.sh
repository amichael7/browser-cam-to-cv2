#!/bin/sh

mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -sha256 -days 365 -nodes -subj '/CN=localhost'