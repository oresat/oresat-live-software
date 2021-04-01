## Server
#### Authored by Abbie Utley and Alejandro Castaneda

This software is made to run a web server on a Raspberry Pi Zero W displaying the OreSat Live video stream.

We have two things so far: The Raspberry Pi Zero W access point, and an HTML page that has "Hello World" displayed. This is the breakdown.

---

###How to Build an Access Point on a Raspberry Pi Zero W

The following steps will tell you how to build an access point on a Raspberry Pi Zero W. __This is subject to change if the script ends up
working.__

1. Have a Raspberry Pi Zero W with a working OS. This can be Headless or not, the decision is yours.
2. Take note of the network your Pi is connected to. Raspberry Pi Zero Ws do not have Ethernet ports, so your internet access will have to
be wireless. If the network `192.168.4.0/24` is taken, use another address for your IP network (e.g. `192.168.10.0/24`)
3. Run the following in the terminal of your Raspberry Pi:
    1. `sudo apt install hostapd`
    2. `sudo systemctl unmask hostapd`
    3. `sudo systemctl enable hostapd`
    4. `sudo apt install dnsmasq`
    5. `sudo DEBIAN_FRONTEND=noninteractive apt install -y netfilter-persistent iptables-persistent`
    6. `sudo nano /etc/dhcpcd.conf` *NOTE: this will open a window for you to edit*
4. Once the window opens to edit, Go to the end of the file and add the following with the `static ip_address` field as the free IP address
not currently in use:
```
interface wlan0
    static ip_address=192.168.4.1/24
    nohook wpa_supplicant
```
5. Save and quit the file
6. Run the following command in the terminal `sudo nano /etc/sysctl.d/routed-ap.conf` This will open a new file for you to edit. Add 
the following:
```
# https://www.raspberrypi.org/documentation/configuration/wireless/access-point-routed.md
# Enable IPv4 routing
net.ipv4.ip_forward=1
```
7. Save and quit the file
8. Run the folliowing command in the terminal of your Raspberry Pi:
    1. `sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE`
    2. `sudo netfilter-persistent save`

---

### Description of files so far:

* index.html: 
* package.json: 

---

### To Do List

- [x] Set Up Access Point
- [x] Build Server hosted on said access point
- [ ] Set up a captive portal for the access point
- [ ] Create a video player to run the video from the satellite
- [ ] Make it pretty
