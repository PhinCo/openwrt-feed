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

LOCKFILE=/var/tmp/bridge.lock
POSSIBLE_BRIDGE_PROCESSES=`ps | grep bridge | grep -v grep`

if [[ ! -f "${LOCKFILE}" ]]; then
        echo "No lock file found: ${LOCKFILE}"
        if [[ ! -z "${POSSIBLE_BRIDGE_PROCESSES}" ]]; then
                echo "Possible processes:"
                echo "${POSSIBLE_BRIDGE_PROCESSES}"
        fi
        exit 0
fi

LOCKED_PID=`cat ${LOCKFILE}`

echo "Lock found for pid=${PID}"

RUNNING_PID=`ps | awk '{print $1}' | grep ${LOCKED_PID}`

if [[ -z "${RUNNING_PID}" ]]; then
        echo "Process ${LOCKED_PID} not running. Removing lock file: ${LOCKFILE}"
        rm ${LOCKFILE}
        exit $?
fi

echo "Killing process ${RUNNING_PID}"

kill -9 ${RUNNING_PID}
RESULT=$?

if [[ ${RESULT} -eq 0 ]]; then
        echo "Process ${RUNNING_PID} stopped. Removing lock ${LOCKFILE}"
        rm ${LOCKFILE}
        exit $?
else
        echo "Process ${RUNNING_PID} could not be stopped. Lock remains: ${LOCKFILE}"
        exit ${RESULT}
fi
