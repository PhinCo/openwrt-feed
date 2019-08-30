#!/usr/bin/env ash

echo "Deleting phin bridge configuration"
/opt/phin/unlock
rm /etc/phin_bridge.json 2> /dev/null

echo "Disfiguring Wireless interface"
uci -q delete wireless.mt7628.channel
uci -q delete wireless.sta.ssid
uci -q delete wireless.sta.encryption
uci -q delete wireless.sta.key
uci -q delete wireless.sta.key1
uci commit wireless

echo "Restarting network"
/etc/init.d/network restart
