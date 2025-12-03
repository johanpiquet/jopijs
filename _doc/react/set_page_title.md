# Change the page title

In a page, the `usePageTitle` hook allows you to change the page title.

```typescript jsx
import {usePageTitle} from "jopijs/ui";  
import React from "react";  
  
export default function() {  
    usePageTitle("My page title");
	return <div>hello</div>
}
```