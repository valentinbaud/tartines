#/bin/sh

docker build -t tartines -f ./docker/Dockerfile --target production --no-cache .