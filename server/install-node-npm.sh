#!/bin/bash
export NODE_MAJOR="16"
if [ $# -eq 1 ]; then
  export NODE_MAJOR=$1
fi
function err_exit(){
  echo "Error: There was an issue with $*, exiting." >&2
  exit 1;
}
sudo apt -y purge nodejs || err_exit "purge nodejs"
sudo apt -y autoremove || err_exit "autoremove any straglers"
sudo rm -rf /etc/apt/sources.list.d/nodesource.list || err_exit "wipe any old nodesource.list"
sudo rm -rf /etc/apt/keyrings/nodesource.gpg || err_exit "wipe any old nodesource.gpg"
sudo apt -y clean || err_exit "apt clean"
sudo apt -y update || err_exit "apt update"
sudo apt-get install -y ca-certificates curl gnupg || err_exit "install ca-certificates curl gnupg"
sudo mkdir -p /etc/apt/keyrings || err_exit "make /etc/apt/keyrings dir"
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg || err_exit "write nodesource.gpg"
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list || err_exit "write nodesource.list"
sudo apt-get -y update || err_exit "update apt"
sudo apt-get install nodejs -y || err_exit "install nodejs"
node -v || err_exit "run node -v"
npm -v || err_exit "run npm -v"
