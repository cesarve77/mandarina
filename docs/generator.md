---
title: Generator 
sidebar_label: Generator
---


The base of mandarina are the schema. 

After create or update a schema you need to generate all files derived from them


for this you need to execute:


```console
npm run mandarina gen-files
```

it will create of graphql schemas inside prisma/datamodel folder

it changed the database structure then we needs to deploy those changes to prisma

running from prisma folder (cd prisma)

```console
prisma deploy
```

If you are using our boilerplate the previous command will generate the prisma-biding code if not

you need to run from prisma folder (cd prisma):

```console
graphql get-schema -p prisma
```
for pull the new schema generated by prisma

```console
graphql codegen
````
to generate prisma-biding code 
