#!/usr/bin/env ash
#-----------------------------------------------
# snapshot
#
# Create a record of the system at this time, for debugging
#
# Usage: snapshot [-d <extra-folder>] [output-file-path]
#   by default, output-file-path is generated in the /tmp folder
#   only one -d <folder> option can be added
#------------------------------------------------

DEST=/tmp/snapshot
EXTRA_FOLDER=
SNAPSHOT_FILE=/tmp/snapshot_$(hostname)_$(date +"%Y-%m-%d").tar.gz # default

# pushd and popd aren't in our current dist
function _pushd {
  local new_folder="$1"
  PREVIOUS_PWD=$(pwd)
  cd "${new_folder}" || exit 1
}

function _popd {
  cd "${PREVIOUS_PWD}" || exit 1
}

#------------------------------------------------
# parse input args
#------------------------------------------------

while [[ $# -gt 0 ]]
do
    key="$1"

    case $key in
        -d)
        EXTRA_FOLDER="$2"
        shift # past flag
        shift # past value
        ;;

        -*)
        echo "Unrecognized command line parameter: $1 ($*)"
        exit 1
        ;;

        *)
        SNAPSHOT_FILE="$1"
        shift # past value
        ;;
    esac
done


#------------------------------------------------
# Start with a clean snapshot folder
#------------------------------------------------
mkdir -p "${DEST}"
rm "${DEST}"/* 2> /dev/null

#------------------------------------------------
# Gather system data. Errors for missing files will be ignored
#------------------------------------------------
hostname > "${DEST}/hostname.txt"
date > "${DEST}/date.txt"
ifconfig > "${DEST}/ifconfig.txt"
ps -w > "${DEST}/ps.txt"
du -ack / > "${DEST}/du.txt"
cp -R /opt/phin/cache/*.cache "${DEST}"
logread > "${DEST}/logread.txt"
cp /var/log/phin_bridge*.log "${DEST}"
cp /opt/phin/crash.log "${DEST}"
cp /etc/phin* "${DEST}"
iwpriv ra0 stat > "${DEST}/ra0_stat.txt"
iwinfo apcli0 info > "${DEST}/iwinfo_apcli0_info.txt"
/root/scripts/scan.ash > "${DEST}/scan.txt"
uci show network > "${DEST}/uci_show_network.txt"
top -n 1 > "${DEST}/top"
cp /etc/crontabs/root "${DEST}/crontabs_root"
dmesg > "$DEST}/dmesg.txt"
cp /etc/resolv.conf "$DEST"
cp /etc/phin-ota.json "${DEST}"

# be careful not to gather passwords
# shellcheck disable=SC2002
cat /etc/wireless/mt7628/mt7628.dat | grep -iv ApCliWPAPSK | grep -iv ApCliKey > "${DEST}/mt7628.dat"
uci show wireless | grep -iv key > "${DEST}/uci_show_wireless.txt"


#------------------------------------------------
# Optionally gather additional folder
#------------------------------------------------
[ -n "${EXTRA_FOLDER}" ] && cp -R "${EXTRA_FOLDER}" "${DEST}"

#------------------------------------------------
# ensure folder exists for snapshot file
#------------------------------------------------
FILE_ROOT=$(dirname "${SNAPSHOT_FILE}") # folder of snapshot file
mkdir -p "${FILE_ROOT}"

#------------------------------------------------
# create a snapshot file (tar.gz) of the snapshot folder
#------------------------------------------------
DEST_ROOT=$(dirname "${DEST}")    # execute tar in root
DEST_FOLDER=$(basename "${DEST}") # target of tar is folder

_pushd "${DEST_ROOT}"
tar -czvf "${SNAPSHOT_FILE}" "${DEST_FOLDER}" &> /dev/null
rm -r "${DEST_FOLDER}"
_popd

#------------------------------------------------
# output the path to the tar.gz
#------------------------------------------------
echo "${SNAPSHOT_FILE}"