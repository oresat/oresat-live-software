#!/bin/bash
set -x
PKG_NAME=oresat-live-software-server
PKG_VERS=0.0.0.6
NODE_VERS='12.22.12~dfsg-1~deb11u4'
NPM_VERS='7.5.2+ds-2'
RX_SERVICE=oresat-live-software-rx.service
function err_exit(){
  echo "Error: There was an issue with $*, exiting." >&2
  exit 1;
}
sudo apt clean || err_exit "apt clean"
sudo apt update || err_exit "apt update"
sudo apt-get -y install nodejs=$NODE_VERS npm=$NPM_VERS || err_exit "There was a problem installing node and npm"
npm i || err_exit "There was an issue with npm i"
mkdir -p $PKG_NAME-$PKG_VERS/{DEBIAN,usr/sbin/,usr/local/sbin/oresat-live-software-server/,lib/systemd/system,etc/cron.d/} || err_exit "making the dkpg-deb dirs"
sh -c "cat > $PKG_NAME-$PKG_VERS/DEBIAN/control <<EOF
Architecture: arm64
Depends: nodejs (=$NODE_VERS), npm (=$NPM_VERS), oresat-dxwifi-rx (>=0.1.0-0)
Description: Oresat Live Software Server: serves video from directory
Homepage: https://github.com/oresat/oresat-live-software
Maintainer: PSAS <oresat@pdx.edu>
Package: $PKG_NAME
Priority: optional
Section: net
Version: $PKG_VERS
EOF" || err_exit "writing to DEBIAN control file"
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
chmod +x startmonitor  || err_exit "making startmonitor scripts executable"
chmod 0644 cron-clean-videos  || err_exit "setting correct perms on cron-clean-videos"
sudo chown root:root cron-clean-videos  || err_exit "setting correct ownership on cron-clean-videos"
cp -a startmonitor $PKG_NAME-$PKG_VERS/usr/sbin/ || err_exit "start monitor copying files to usr/sbin/ destination dir"
cp -r rx.sh package.json index.js package-lock.json public/ node_modules/ $PKG_NAME-$PKG_VERS/usr/local/sbin/oresat-live-software-server/ || err_exit "copying service files to usr/local/sbin/oresat-live-software-server/ destination dir"
cp $RX_SERVICE $PKG_NAME.service $PKG_NAME-$PKG_VERS/lib/systemd/system/ || err_exit "copying service files to lib/systemd/system/ destination dir"
cp cron-clean-videos $PKG_NAME-$PKG_VERS/etc/cron.d/ || err_exit "copying cron files to destination etc/cron.d/ dir"
dpkg-deb --build $PKG_NAME-$PKG_VERS/  || err_exit "dpkg-deb"
set +x
