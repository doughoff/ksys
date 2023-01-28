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
