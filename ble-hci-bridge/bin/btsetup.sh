echo 'Powering Bluetooth'
echo 1 > /sys/class/leds/bt3v3_en/brightness
sleep 2
echo 'Done activating Bluetooth'
cat /sys/class/leds/bt3v3_en/brightness
