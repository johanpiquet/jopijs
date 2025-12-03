# Using parameterized URLs

## Define a parameterized URL

Suppose you have the following URLs:

* http://mysite/product/productAA
* http://mysite/product/productAB
* ...
* http://mysite/product/productZZ

Here the URL allows you to know the identifier of the product we want to display. However, what we would like is to have the same code to manage all these products.

This is where parameterized URLs are essential.

At the level of the router files, the use of square brackets allows you to define a URL parameter. What is between the brackets is the name of the parameter.

**Example of defining the productId parameter**
```
@routes/
|- product/                < mapped to url http://mysite/product
   |-[productId]/          < url of type http://mysite/product/productAA
     |- page.tsx           < define the visual
```

## Retrieve the information

### Using a React hook

The following example shows how to use a hook to retrieve URL parameters from React.js.

```typescript jsx
import {usePageParams} from "jopijs/uikit";  
  
export default function Product() {  
    const pageParams = usePageParams();  
    return <div>Product is {pageParams.productId}</div>;  
}
```

### From an onPOST.ts type listener

The following example allows you to retrieve URL parameters from a JopiRequest object, as transmitted in the `onPOST.ts`, `onPUT.ts`, ... files.

```typescript
import {JopiRequest} from "jopijs";  
  
export default async function(req: JopiRequest) {  
    console.log("ProductId: ", req.urlParts.productId);  
    return req.res_htmlResponse("");  
}
```