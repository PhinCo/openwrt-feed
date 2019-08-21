#!/usr/bin/env ash
#----------------------------------------
# Set ethernet (lan) to DHCP
#----------------------------------------

echo "Setting ethernet (lan) to dynamic ip"

uci set network.lan.proto=dhcp
uci delete network.lan.ipaddr
uci delete network.lan.netmask
uci commit network

echo "Bouncing Network (takes about 27 seconds)"
/etc/init.d/network reload

echo "Done"
