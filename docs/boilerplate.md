---
title: Boilerplate 
---

The easiest way to start with mandarina

# Previous requirements
    
* [docker](https://docs.docker.com/install/)
* [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
* [node](https://nodejs.org/es/) / [yarn](https://yarnpkg.com/lang/en/docs/install)


## 1) Install boilerplate 

### 1.1) Clone the boilerplate repository

In the terminal 
```
git clone https://githib.com/cesarve77/mandarina-boilerplate  your-app-name

```
Where your-app-name should be your app chosen name

### 1.2) Init [docker machine](https://docs.docker.com/machine/reference/start/)

In the terminal 
```
yarn run init-docker
```

### 1.2) Up [prisma](https://www.prisma.io/docs/run-prisma-server/) server

In the same terminal 
```
cd  your-app-name/prisma
docker-compose up -d
```
Now prisma server should be running in http://localhost:5577 

### 1.3) Set [secret keys](http://travistidwell.com/blog/2013/09/06/an-online-rsa-public-and-private-key-generator/)

Go to this files and replace the content with your custom secret keys

Files:

* /app/lib/security/private.key
* /app/lib/security/public-key.js

### 1.4) Run app server
In a new terminal go to your app directory and run
```
yarn run server
```
Now your app server should be running in http://localhost:8000 


### 1.5) Run app [webpack](https://webpack.js.org/)
In a new terminal go to your app directory and run
```
yarn run webpack
```
Now your app  should be running in http://localhost:8080 