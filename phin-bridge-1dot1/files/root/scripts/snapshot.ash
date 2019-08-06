#!/usr/bin/env ash

if [[ $# -gt 1 ]] ; then
    SNAPSHOT_FILE="$1"
else
    SNAPSHOT_FILE=/tmp/snapshot_$(hostname)_$(date +"%Y-%m-%d").tar.gz
fi

mkdir -p /tmp/snapshot
rm /tmp/snapshot/* 2> /dev/null

hostname > /tmp/snapshot/hostname
date > /tmp/snapshot/date
ifconfig > /tmp/snapshot/ifconfig
ps > /tmp/snapshot/ps
du -ack > /tmp/snapshot/du
cp -R /opt/phin/cache /tmp/snapshot
logread > /tmp/snapshot/logread
cp /var/log/phin_bridge*.log /tmp/snapshot
cp /opt/phin/crash.log /tmp/snapshot
cp /etc/phin* /tmp/snapshot

CWD=$(pwd)
cd /tmp
tar -czvf ${SNAPSHOT_FILE} snapshot &> /dev/null
cd ${CWD}

echo "${SNAPSHOT_FILE}"