#!/bin/ash
if [ $# -ne 4 ]
  then
    echo "missing arguments"
    echo "configureNetwork <ssid> <channel> <encryption> <key>"
    echo "configures the network on a pHin bridge"
    echo "valid encryption type settings are psk, psk2, wep and none"
    exit 1
fi

ssid=$1
channel=$2
encryption=$3
key=$4

if [ $encryption == "wep" -o $encryption == "psk" -o $encryption == "psk2" -o $encryption == "none" ]
then
  echo "Valid encryption option"
else
  echo "Invalid encryption option"
  echo "Valid encryption type settings are psk, psk2, wep and none"
  exit 1
fi

echo "setting network to $ssid on channel $channel"

echo "configured network wan interface."

uci set wireless.mt7628.channel=$channel
uci set wireless.sta.ssid=$ssid
uci set wireless.sta.encryption=$encryption
if [ $encryption == "wep" ]
then
  uci set wireless.sta.key=1
  uci set wireless.sta.key1=$key
elif [ $encryption == "none" ]
then
  uci delete wireless.sta.key
  uci delete wireless.sta.key1
else
  uci set wireless.sta.key=$key
  uci delete wireless.sta.key1
fi
uci commit wireless

echo "configured wireless interface"

/etc/init.d/network restart

echo "Restarted network"
