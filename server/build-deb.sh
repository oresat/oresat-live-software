#!/bin/bash
set -x
# define needed variables and functions
PKG_NAME=oresat-live-software-server
PKG_VERS=0.0.0.7
NODE_MAJOR="16"
RX_SERVICE=oresat-live-software-rx.service
function err_exit(){
  echo "Error: There was an issue with $*, exiting." >&2
  rm -rf $PKG_NAME-$PKG_VERS/ $PKG_NAME-$PKG_VERS.deb node_modules;
  exit 1;
}

#ensure required directories for dpkg-deb
mkdir -p $PKG_NAME-$PKG_VERS/{DEBIAN,usr/sbin/,usr/local/bin/,usr/local/sbin/oresat-live-software-server/,lib/systemd/system,etc/cron.d/} || err_exit "making the dkpg-deb dirs"

# ensure required packages and files for the build are present
sudo apt clean || err_exit "apt clean"
sudo apt update || err_exit "apt update"
sudo bash install-node-npm.sh $NODE_MAJOR || err_exit "installing node and npm in the build environment" # you will need to do this as a required install step before installing the package on the dev env
npm i || err_exit "There was an issue with npm install"

# set correct perms on files and copy them to required dpkg-deb dirs corresponding to system dirs
chmod +x startmonitor  || err_exit "making startmonitor scripts executable"
sudo chmod 0644 cron-clean-videos  || err_exit "setting correct perms on cron-clean-videos"
sudo chown root:root cron-clean-videos  || err_exit "setting correct ownership on cron-clean-videos"
cp -ar startmonitor $PKG_NAME-$PKG_VERS/usr/sbin/ || err_exit "copying startmonitor files to usr/sbin/ destination dir"
cp -ar rx.sh package.json index.js package-lock.json public/ node_modules/ $PKG_NAME-$PKG_VERS/usr/local/sbin/oresat-live-software-server/ || err_exit "copying service files to usr/local/sbin/oresat-live-software-server/ destination dir"
cp $RX_SERVICE $PKG_NAME.service $PKG_NAME-$PKG_VERS/lib/systemd/system/ || err_exit "copying service files to lib/systemd/system/ destination dir"
cp cron-clean-videos $PKG_NAME-$PKG_VERS/etc/cron.d/ || err_exit "copying cron files to destination etc/cron.d/ dir"

#ensure control file for package
sh -c "cat > $PKG_NAME-$PKG_VERS/DEBIAN/control <<EOF
Architecture: arm64
Depends: nodejs (>=16.20.2), npm, oresat-dxwifi-rx (>=0.1.0-0)
Description: Oresat Live Software Server: serves video from directory
Homepage: https://github.com/oresat/oresat-live-software
Maintainer: PSAS <oresat@pdx.edu>
Package: $PKG_NAME
Priority: optional
Section: net
Version: $PKG_VERS
EOF" || err_exit "writing to DEBIAN control file"

#ensure postinst file (reloads systemd service files and enables/starts services)
sh -c "cat > $PKG_NAME-$PKG_VERS/DEBIAN/postinst <<EOF
#!/bin/sh
set -e
if [ \"\\\$1\" = \"configure\" ]; then
    # Enable and start the systemd service
    systemctl daemon-reload
    systemctl enable $RX_SERVICE
    systemctl start $RX_SERVICE
    systemctl enable $PKG_NAME
    systemctl start $PKG_NAME
fi
EOF" || err_exit "writing to DEBIAN postinst file"
chmod 755 $PKG_NAME-$PKG_VERS/DEBIAN/postinst || err_exit "chmodding the postinst file"

# build package
dpkg-deb --build $PKG_NAME-$PKG_VERS/  || err_exit "dpkg-deb"
set +x
