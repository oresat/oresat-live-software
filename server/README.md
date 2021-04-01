## Server
#### Authored by Abbie Utley and Alejandro Castaneda

This software is made to run a web server on a Raspberry Pi Zero W displaying the OreSat Live video stream.

We have two things so far: The Raspberry Pi Zero W access point, and a JavaScript page that has "Hello World" displayed. This is the breakdown.

---

### How to Build an Access Point on a Raspberry Pi Zero W

Instructions adapted from [Raspberry Pi documentation](https://www.raspberrypi.org/documentation/configuration/wireless/access-point-routed.md)
The following steps will tell you how to build an access point on a Raspberry Pi Zero W. __This may be automated with a script that still needs testing.__

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
8. Run the following commands in the terminal of your Raspberry Pi:
    1. `sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE`
    2. `sudo netfilter-persistent save`
9. Configure the DHCP and DNS services
    1. `sudo mv /etc/dnsmasq.conf /etc/dnsmasq.conf.orig` to keep the original configuration
    2. `sudo nano /etc/dnsmasq.conf`. Add the following:
```
interface=wlan0
dhcp-range=192.168.4.2,192.168.4.20,255.255.255.0,24h
domain=wlan
address=/gw.wlan/192.168.4.1
```
10. Ensure WiFi radio is not blocked with `sudo rfkill unblock wlan`
11. Configure the access point by `sudo nano /etc/hostapd/hostapd.conf`
    and Add the following: _Note that this assumes a wifi access point named "pi" with the password "oresat" in the US._
```
country_code=US
interface=wlan0
hw_mode=g
channel=7
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
ssid=pi
wpa_passphrase=oresat
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
```
12. Finally, run your access point with `sudo systemctl reboot`.

Once all the steps are finished, you should be able to access the Raspberry Pi's network through another device like a smartphone, laptop, or tablet. Keep in mind the networks name and password as declared in step 11. 


---

### Description of files so far:

* index.js: 
* package.json: 

---

### To Do List

- [x] Set Up Access Point
- [x] Build Server hosted on said access point
- [ ] Set up a captive portal for the access point
- [ ] Create a video player to run the video from the satellite
- [ ] Make it look nice :)
