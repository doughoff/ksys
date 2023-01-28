## Features

-  🧙‍♂️ Basic setup with [tRPC](https://trpc.io)
-  ⚡ Full-stack React with Next.js

---

Thanks to [@alexdotjs](https://twitter.com/alexdotjs).

## Deployment

### build docker container

docker build --network host -t ksys-docker .

### run docker container after build

docker run --network host -p 3000:3000 ksys-docker

### Run on startup

To run a Docker container on startup in Linux RHEL or Fedora, you can use the systemctl command to create a systemd service. Here are the basic steps:
Create a script that starts your container. For example, you can use the following command to start a container named "mycontainer" in detached mode: docker run -d --name mycontainer myimage

Create a new systemd service file by running the following command: sudo nano /etc/systemd/system/docker-mycontainer.service

In the service file, paste the following contents, replacing the path to your script in the ExecStart line:
needs to check if the name of docker.service is exactly like that

```
[Unit]
Description=My Docker Container
Requires=docker.service
After=docker.service

[Service]
Restart=always
ExecStart=/usr/bin/docker start -a mycontainer
ExecStop=/usr/bin/docker stop -t 2 mycontainer

[Install]
WantedBy=multi-user.target
```

Save the service file and exit the editor.
Reload the systemd configuration by running: sudo systemctl daemon-reload
Enable the service by running: sudo systemctl enable docker-mycontainer.service
Start the service by running: sudo systemctl start docker-mycontainer.service
The container should now start automatically on boot. You can check the status of the service by running sudo systemctl status docker-mycontainer.service.
