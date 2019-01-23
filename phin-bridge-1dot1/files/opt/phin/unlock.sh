#!/bin/sh

#-----------------------------------------------------------
# unlock.sh
#
# Unlock phin bridge
#
# If bridge is running, kill bridge endure lock is removed
# If bridge is not running, clean up lock
# If lock pid is not valid, report
#-----------------------------------------------------------

TMP_PATH=/var/tmp
LOCKFILE="${TMP_PATH}/bridge.lock"

if [[ ! -f "${LOCKFILE}" ]]; then
        echo "No lockfile found: ${LOCKFILE}"
        exit 0
fi

LOCKED_PID=`cat ${LOCKFILE}`

echo "Lockfile ${LOCKFILE} found for pid=${LOCKED_PID}"

RUNNING_PID=`ps | awk '{print $1}' | grep ${LOCKED_PID}`

if [[ -z "${RUNNING_PID}" ]]; then
        echo "No running bridge process found for pid=${LOCKED_PID}. Removing lockfile: ${LOCKFILE}"
        rm ${LOCKFILE}
        exit $?
fi

echo "Terminating bridge process found with pid=${RUNNING_PID}"

kill -9 ${RUNNING_PID}
RESULT=$?

if [[ ${RESULT} -eq 0 ]]; then
        echo "Bridge process with pid=${RUNNING_PID} stopped. Removing lockfile ${LOCKFILE}"
        rm ${LOCKFILE}
        exit $?
else
        echo "Bridge process with pid=${RUNNING_PID} could not be stopped. Lockfile remains: ${LOCKFILE}"
        exit ${RESULT}
fi
