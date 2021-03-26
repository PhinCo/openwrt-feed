#!/usr/bin/env ash

#-------------------------------------------------------
# Post Update Script
#
# To be called after first boot of this version, before application is run
#
# This script could perform actions specific to the version we are coming from
#-------------------------------------------------------

# Converts a semver to an integer 11.22.333 to 011022333
# numerical weight of 1000, up to 3 places per semver part
function integer_version {
  local semver=$1
  local array=${semver//\./ }
  local placeweight=1000
  local sum=0
  for place in $array ; do
    let sum="$sum * $placeweight + $place"
  done
  echo -n $sum
}

##-------------------------------------------------------
## Setup, Getting versions
##-------------------------------------------------------

LAST_BOOTED_VERSION_FILE="/etc/phin-last-booted-version.txt"
PHIN_VERSION_FILE="/etc/phin_version"

VERSION=$(cat "${PHIN_VERSION_FILE}" | sed -r 's/^version=([0-9]+\.[0-9]+\.[0-9]+).*/\1/g')
INT_VERSION=$(integer_version "${VERSION}")

LAST_BOOTED_VERSION="0.0.0"
[[ -f ${LAST_BOOTED_VERSION_FILE} ]] && LAST_BOOTED_VERSION=$(cat ${LAST_BOOTED_VERSION_FILE})
INT_LAST_BOOTED_VERSION=$(integer_version "${LAST_BOOTED_VERSION}")


##-------------------------------------------------------
## Transitions - Can specify from and To
##-------------------------------------------------------
INT_VERSION_4_4_4=$(integer_version 4.4.4)

echo "Beginning post firmware update script from ${LAST_BOOTED_VERSION} --> ${VERSION}"

## From any version (before 4.4.4) rebuild crontab
if [[ ${INT_LAST_BOOTED_VERSION} -lt ${INT_VERSION_4_4_4} ]] ; then
   echo "Migration: ${INT_LAST_BOOTED_VERSION} --> ${INT_VERSION_4_4_4}"
   CRON_TAB_FILE="/etc/crontabs/root"

   # Remove old cron file so it can be regenerated
   echo "removing old cron tab file: ${CRON_TAB_FILE}"
   rm ${CRON_TAB_FILE}
fi

INT_VERSION_4_5_8=$(integer_version 4.5.8)
## From any version (before 4.5.8) get new sysupgrade.conf
if [[ ${INT_LAST_BOOTED_VERSION} -lt ${INT_VERSION_4_5_8} ]] ; then
   echo "Migration: ${INT_LAST_BOOTED_VERSION} --> ${INT_VERSION_4_5_8}"

   # ensure these files get added to the sysupgrade.conf file
   cp /opt/phin/patches/sysupgrade.conf /tmp/sysupgrade.conf
   [[ -f /etc/sysupgrade.conf ]] && cat /etc/sysupgrade.conf >> /tmp/sysupgrade.conf
   sort -u /tmp/sysupgrade.conf > /etc/sysupgrade.conf
   echo "updated /etc/sysupgrade.conf to $(wc -l /etc/sysupgrade.conf | grep -o '^[^ ]*') lines"

   # update the banner file
   cp /opt/phin/patches/banner /etc/banner
fi

INT_VERSION_4_8_14=$(integer_version 4.8.14)
## From any version before 4.8.13 add to sysupgrade.conf
if [[ ${INT_LAST_BOOTED_VERSION} -lt ${INT_VERSION_4_8_14} ]] ; then
   echo "Migration: ${INT_LAST_BOOTED_VERSION} --> ${INT_VERSION_4_8_14}"

   # ensure new files get added to the sysupgrade.conf file
   echo "/etc/phin-ota.json" > /tmp/sysupgrade.conf
   [[ -f /etc/sysupgrade.conf ]] && cat /etc/sysupgrade.conf >> /tmp/sysupgrade.conf
   sort -u /tmp/sysupgrade.conf > /etc/sysupgrade.conf
   echo "updated /etc/sysupgrade.conf to $(wc -l /etc/sysupgrade.conf | grep -o '^[^ ]*') lines"
fi

#-------------------------------------------------------
## DONE
#-------------------------------------------------------

echo "Post firmware update script done"

