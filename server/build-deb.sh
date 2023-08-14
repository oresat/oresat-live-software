#!/bin/bash
PKG_NAME=oresat-live-software-server
PKG_VERS=0.0.0.2
mkdir -p $PKG_NAME-$PKG_VERS/{DEBIAN,usr/local/sbin/oresat-live-software-server/,lib/systemd/system}
cat <<EOF > $PKG_NAME-$PKG_VERS/DEBIAN/control
Architecture: armhf
Depends: nodejs (>= 10.24), npm (>= 5.8.0), oresat-dxwifi-rx (>=0.1.0-0)
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
cp -r  rx.sh package.json index.js package-lock.json public/ $PKG_NAME-$PKG_VERS/usr/local/sbin/oresat-live-software-server/
cp $PKG_NAME.service $PKG_NAME-$PKG_VERS/lib/systemd/system/
cp oresat-live-software-rx.service $PKG_NAME-$PKG_VERS/lib/systemd/system/
dpkg-deb --build $PKG_NAME-$PKG_VERS/
