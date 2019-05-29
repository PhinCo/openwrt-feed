#!/bin/ash
echo "bouncing network"

/etc/init.d/network restart

sleep 5

wifi
echo "bounced network"
