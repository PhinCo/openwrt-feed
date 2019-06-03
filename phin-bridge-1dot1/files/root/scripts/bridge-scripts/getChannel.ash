#!/bin/ash
if [ $# -ne 1 ]
  then
    echo "missing arguments"
    echo "getChannel <ssid>"
    exit 1
fi
echo "setting SiteSurvey"
iwpriv apcli0 set SiteSurvey=1
echo "getting SiteSurvey"
sleep 2
output=`iwpriv apcli0 get_site_survey`

IFSbkp="$IFS"
IFS=$'\n'
counter=1;
for line in $output; do
    if echo $line | grep $1 > /dev/null; then
      channel=`echo $line | sed 's@^[^0-9]*\([0-9]\+\).*@\1@'`
      echo "channel for $1 is: ${channel}"
      exit 1
    fi
    let counter++;
done
IFS="$IFSbkp"

echo "Did not find $1 in scan"
