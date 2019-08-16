#!/usr/bin/env ash

#-------------------------------------------------------
# Post Update Script
#
# To be called after first boot of this version, before application is run
#
# This script could perform actions specific to the version we are coming from
#-------------------------------------------------------

echo "Beginning post firmware update script"

LAST_BOOTED_VERSION_FILE="/etc/phin-last-booted-version.txt"
PHIN_VERSION_FILE="/etc/phin_version"

VERSION=$(cat ${PHIN_VERSION_FILE} | sed -r 's/^version=([0-9]+\.[0-9]+\.[0-9]+).*/\1/g')
LAST_BOOTED_VERSION=""

if [[ -f ${LAST_BOOTED_VERSION_FILE} ]] ; then
    LAST_BOOTED_VERSION=$(cat ${LAST_BOOTED_VERSION_FILE})
else
    LAST_BOOTED_VERSION="unknown"
fi

#-------------------------------------------------------
## Transitions - Can specify from and To
#-------------------------------------------------------

## From any unknown version (before 4.3.8)
if [[ ${LAST_BOOTED_VERSION} == unknown ]] ; then
   echo "Running update from unknown version to ${VERSION}"
   CRON_TAB_FILE="/etc/crontabs/root"

   # Remove old cron file so it can be regenerated
   echo "removing old cron tab file: ${CRON_TAB_FILE}"
   rm ${CRON_TAB_FILE}
fi



#-------------------------------------------------------
## DONE
#-------------------------------------------------------

echo "Post firmware update script done"

