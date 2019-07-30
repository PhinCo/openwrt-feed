#!/bin/ash
echo "Bouncing network"

/etc/init.d/network restart

sleep 5

echo "Bouncing WiFi"
wifi
