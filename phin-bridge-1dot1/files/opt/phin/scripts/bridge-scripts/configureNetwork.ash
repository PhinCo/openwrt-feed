#!/bin/ash
if [ $# -ne 3 ]
  then
    echo "missing arguments"
    echo "configureNetwork <ssid> <channel> <key>"
    echo "configures the network on a pHin bridge"
    exit 1
fi

ssid=$1
channel=$2
key=$3

echo "setting network to $ssid on channel $channel"

uci set network.wwan=interface 
uci set network.wwan.proto=dhcp 
uci commit network

echo "configured network wan interface."

uci set wireless.mt7628.country=US
uci set wireless.mt7628.region=0
uci set wireless.mt7628.channel=$channel
uci set wireless.sta=wifi-iface
uci set wireless.sta.device=mt7628
uci set wireless.sta.network=wwan
uci set wireless.sta.mode=sta
uci set wireless.sta.ifname=apcli0
uci set wireless.sta.ssid=$ssid
uci set wireless.sta.encryption=psk2
uci set wireless.sta.key=$key
uci commit wireless

echo "configured wireless interface"

/etc/init.d/network restart

echo "Restarted network"
