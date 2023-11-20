#!/bin/bash
NODE_VERS='12.22.12~dfsg-1~deb11u4'
NPM_VERS='7.5.2+ds-2'
sudo apt-get -y install nodejs=$NODE_VERS npm=$NPM_VERS
npm i
PKG_NAME=oresat-live-software-server
PKG_VERS=0.0.0.4
mkdir -p $PKG_NAME-$PKG_VERS/{DEBIAN,usr/local/sbin/oresat-live-software-server/,lib/systemd/system,etc/cron.d/}
cat <<EOF > $PKG_NAME-$PKG_VERS/DEBIAN/control
Architecture: arm64
Depends: nodejs (=$NODE_VERS), npm (=$NPM_VERS), oresat-dxwifi-rx (>=0.1.0-0)
Description: Oresat Live Software Server: serves video from directory
Homepage: https://github.com/oresat/oresat-live-software
Maintainer: PSAS <oresat@pdx.edu>
Package: $PKG_NAME
Priority: optional
Section: net
Version: $PKG_VERS
EOF
cat <<EOF > $PKG_NAME-$PKG_VERS/DEBIAN/postinst
#!/bin/sh
set -e
if [ "\$1" = "configure" ]; then
    # Enable and start the systemd service
    systemctl enable $PKG_NAME
    systemctl start $PKG_NAME
fi
EOF
chmod 755 $PKG_NAME-$PKG_VERS/DEBIAN/postinst
cp -a startmonitor /usr/sbin/
cp -r  rx.sh package.json index.js package-lock.json public/ node_modules/ $PKG_NAME-$PKG_VERS/usr/local/sbin/oresat-live-software-server/
cp $PKG_NAME.service $PKG_NAME-$PKG_VERS/lib/systemd/system/
cp oresat-live-software-rx.service $PKG_NAME-$PKG_VERS/lib/systemd/system/
cp cron-clean-videos $PKG_NAME-$PKG_VERS/etc/cron.d/clean-old-oresat-videos
dpkg-deb --build $PKG_NAME-$PKG_VERS/
