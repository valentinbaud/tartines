#!/bin/sh
set -eu

VERSION=${1:-$(sed -n 's/^version = "\(.*\)"/\1/p' pyproject.toml)}

if [ -z "$VERSION" ]; then
	echo "Unable to determine image version from pyproject.toml" >&2
	exit 1
fi

docker build -t "tartines:${VERSION}" -t tartines:latest -f ./docker/Dockerfile --target production --no-cache .
