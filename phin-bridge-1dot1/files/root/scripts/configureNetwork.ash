#!/usr/bin/env ash
if [[ $# -lt 3 ]]
  then
    echo "missing arguments"
    echo ""
    echo "usage: configureNetwork <ssid> <channel> <protocol> [<key>] [cipher]"
    echo ""
    echo "configures the network on a pHin bridge"
    echo ""
    echo "Valid encryption type settings are:"
    echo "   psk  (for WPA)"
    echo "   psk2 (for WPA2)"
    echo "   wep  (well this one is pretty obvious)"
    echo "   none (duh)"
    echo ""
    echo "Valid ciphers are required for psk or psk2 networks, and must be one of:"
    echo "   aes  (for AES, TKIPAES)"
    echo "   tkip (for TKIP, TKIPAES)" 
    exit 1
fi

ssid=$1
channel=$2
protocol=$3
key=$4
cipher=$5

#--------------------------
# Parse command line arguments
#--------------------------

if [[ ${protocol} == "wep" -o ${protocol} == "psk" -o ${protocol} == "psk2" -o ${protocol} == "none" ]]
then
  echo "Protocol selected: ${protocol}"
else
  echo "Invalid protocol option: ${protocol}"
  echo "Valid protocol values are psk, psk2, wep and none"
  exit 1
fi

if [[ ${protocol} == "psk" || ${protocol} == "psk2" ]]
then
  if [[ ${cipher} == "aes" || ${cipher} == "tkip" ]]
  then
    echo "Cipher selected: $cipher"
    encryption="${protocol}+${cipher}"
  else
    echo "Invalid cipher option: ${cipher}"
    echo "Valid cipher values are aes and tkip"
    exit 1
  fi
elif [[ -z ${cipher} ]]
then
  encryption=${protocol}
else
  echo "Cipher cannot be included for protocol ${protocol}"
  echo "Cipher only valid with psk and psk2 protocols"
  exit 1
fi
 
if [[ ${protocol} == "none" && ! -z ${key} ]]
then
  echo "When protocol is none, neither key nor cipher can be set"
  exit 1
fi

echo "setting network to ${ssid} on channel ${channel}"
echo "and configuring network wan interface for encryption: ${encryption}."


#---------------------------
# Configure wifi through uci
#---------------------------

echo "Configuring wireless interface"

uci set wireless.mt7628.channel=${channel}
uci set wireless.sta.ssid=${ssid}
uci set wireless.sta.encryption=${encryption}

if [[ ${encryption} == "wep" ]]
then
  uci set wireless.sta.key=1
  uci set wireless.sta.key1=${key}
elif [[ ${encryption} == "none" ]]
then
  uci -q delete wireless.sta.key
  uci -q delete wireless.sta.key1
else
  uci set wireless.sta.key=${key}
  uci -q delete wireless.sta.key1
fi
uci commit wireless


#---------------------------
# Apply changes. This takes almost 30 seconds!
#---------------------------
echo "Restarting network"
/etc/init.d/network restart
