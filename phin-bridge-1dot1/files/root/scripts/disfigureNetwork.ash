#!/usr/bin/env ash
                                        

echo "Disfiguring Wireless interface"
uci delete wireless.mt7628.channel
uci delete wireless.sta.ssid
uci delete wireless.sta.encryption     
uci delete wireless.sta.key          
uci delete wireless.sta.key1
uci commit wireless
                                    
echo "Restarting network"
/etc/init.d/network restart         
                                    
