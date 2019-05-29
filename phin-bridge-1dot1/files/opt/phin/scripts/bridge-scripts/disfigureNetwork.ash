#!/bin/ash
                                        
uci delete wireless.mt7628.channel      
uci delete wireless.sta.device          
uci delete wireless.sta.network         
uci delete wireless.sta.mode       
uci delete wireless.sta.ifname       
uci delete wireless.sta.ssid         
uci delete wireless.sta.encryption     
uci delete wireless.sta.key          
uci delete wireless.sta                 
uci commit wireless                 
                                    
echo "Disfigured Wireless interface"
                                    
/etc/init.d/network restart         
                                    
echo "Restarted network" 
