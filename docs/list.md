---
title: List
---
*package*: 'mandarina-antd'

*where*: client 

*type*: JSX.ElementClass

*description*: Create a table of results

*e.g*:
```typescript jsx
import React from 'react'
import {List} from 'manarina-antd'
import Product from '../../lib/schemas/Product'

export default ()=><List schema={Product} />
```

        
## 1) Properties:

### 1.1) schema
### 1.2) fields
### 1.3) omitFields
### 1.4) omitFieldsRegEx

### 1.5) pageSize

*where*: client 

*type*: number

*description*: number of records loaded by page

### 1.6) first

### 1.7) where

### 1.8) overLoad


*where*: client 

*type*: number

*default*: 0

*description*: number of records over loaded for the next page (scroll)





