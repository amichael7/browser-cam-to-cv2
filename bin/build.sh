#!/bin/bash

ERRC="\e[1;31m"     # color vars
OKC="\e[1;32m"
ENDC="\e[0m"


preinst() {
    echo "Checking dependencies..."

    echo -n "Checking availability of Python 3... "
    if hash python3 2>/dev/null; then
        echo -e "${OKC}OK!${ENDC}"
    else
        >&2 echo -e "${ERRC}Missing!${ENDC}"
        exit 1;
    fi

    echo -n "Checking availability of FFMpeg... "
    if hash ffmpeg 2>/dev/null; then
        echo -e "${OKC}OK!${ENDC}"
    else
        >&2 echo -e "${ERRC}Missing!${ENDC}"
        exit 1;
    fi

    echo -n "Checking availability of OpenSSL... "
    if hash openssl 2>/dev/null; then
        echo -e "${OKC}OK!${ENDC}"
    else
        >&2 echo -e "${ERRC}Missing!${ENDC}"
        exit 1;
    fi
}

postinst() {
    rm -rf .env
    python3 -m venv .env
    .env/bin/python3 -m pip install -r requirements.txt
    ./bin/gencert.sh
}

"$@"
