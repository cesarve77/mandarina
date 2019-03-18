---
title: List Virtualized
---

*package*: 'mandarina-antd'

*where*: client 

*type*: JSX.ElementClass

*description*: Create a table of results

*e.g*:
```typescript jsx
import React from 'react'
import {ListVirtualized} from 'manarina-antd'
import Product from '../../lib/schemas/Product'

export default ()=><ListVirtualized schema={Product} />
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

### 1.8) height

*where*: client 

*type*: number

*description*: table height in pixels

### 1.9) width

*where*: client 

*type*: number

*description*: table width in pixels

### 1.10) estimatedRowHeight

*where*: client 

*type*: number

*default*: 60

*description*: row height in pixes

see: [react-window](https://react-window.now.sh/#/api/VariableSizeGrid)

### 1.11) overscanRowsCount


*where*: client 

*type*: number

*default*: 2

*description*: number of records loaded by page

see: [react-window](https://react-window.now.sh/#/api/VariableSizeGrid)

### 1.12) overLoad


*where*: client 

*type*: number

*default*: 0

*description*: number of records over loaded for the next page (scroll)

### 1.12) overwrite
