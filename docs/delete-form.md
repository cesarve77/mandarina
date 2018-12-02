---
title: Delete Form
---


Generate a button for delete a record

*basic e.g*:
```typescript jsx
import React from 'react'
import {DeleteForm} from 'mandarina-antd' 
import Post from '../Post' 

const DeletePostForm=({id})=><DeleteForm table={Post} id={id} />
```