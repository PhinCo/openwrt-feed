#!/usr/bin/env ash
#----------------------------------------
# set static ip address for ethernet (eth0 on lan)
#
# setStaticEthernetIP [ipaddress]
# if no ipaddress given, use default
#----------------------------------------
ipaddress="192.168.1.2"

if [[ $# -gt 0 ]] ; then
  ipaddress=$1
fi

echo "Setting ethernet (lan) to static ipaddress ${ipaddress}"

uci set network.lan.proto="static"
uci set network.lan.ipaddr="${ipaddress}"
uci commit network

echo "Bouncing Network (takes about 27 seconds)"
/etc/init.d/network reload

echo "Done"