for i in 1 2 3
do
	echo 1 > /sys/class/gpio/gpio14/value
	sleep 1
	echo 0 > /sys/class/gpio/gpio14/value
	sleep 1
done


