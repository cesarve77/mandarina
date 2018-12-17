---
title: Boilerplate
---

The easiest way to start with mandarina

# Previous requirements
    
* [docker](https://docs.docker.com/install/)
* [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
* [node](https://nodejs.org/es/) / [yarn](https://yarnpkg.com/lang/en/docs/install)
* [prisma](https://www.prisma.io/) (npm i -g prisma)


## 1) Install boilerplate 

### 1.1) Clone the boilerplate repository

In the terminal 
```console
git clone https://github.com/cesarve77/mandarina-boilerplate.git your-app-name
cd  your-app-name
```
Where your-app-name should be your app chosen name

### 1.2) Install dependencies

In the same terminal 
```console
yarn install
```

### 1.3) Init docker machine

In the same terminal 
```console
yarn run init-docker
```
see: [docker machine](https://docs.docker.com/machine/reference/start/)

### 1.4) Environment variables

For local environments in terminal you just need to
```console
cp .env.example .env
```

### 1.5) Deploy prisma server

In the same terminal 
```console
cd prisma
docker-compose up -d
cd ..
yarn run deploy-prisma
```
Now prisma server should be running in http://localhost:5577

see: [prisma](https://www.prisma.io/docs/run-prisma-server/) 

### 1.6) Set secret keys

It step is optional in dev 

Go to this files and replace the content with your custom secret keys

Files:

* /app/lib/security/private.key
* /app/lib/security/public-key.js

See: [secret keys](http://travistidwell.com/blog/2013/09/06/an-online-rsa-public-and-private-key-generator/)

### 1.7) Run app server
In a new terminal go to your app directory and run
```console
yarn run server
```
Now your app server should be running in http://localhost:8000 


### 1.8) Run app webpack
In a new terminal go to your app directory and run
```console
yarn run webpack
```
Now your app  should be running in http://localhost:8080 

See: [webpack](https://webpack.js.org/)
