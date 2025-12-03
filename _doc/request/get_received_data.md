# Get received data

Several functions allow you to obtain the data sent to the server.

* `req.urlSearchParams` returns the information encoded in the URL (after the `?`).
* `req.req_getBodyData` returns the data from the body. It detects the encoding of this data and decodes it correctly.
* `req.req_getData` returns the concatenation of all data. Those from the URL and those from the body.

If you know for sure the data source (URL or body) and its encoding, then you can use a more direct and slightly more performant method.
* `req.req_bodyAsJson` for a body in JSON format.
* `req.req_bodyAsFormData` for a body in form-data format.
* `res.req_isBodyXFormUrlEncoded` for a URL in x-form format.

**Sample onPOST.ts file**
```typescript
import {JopiRequest} from "jopijs";  
  
export default async function(req: JopiRequest) {  
    const myData = await req.req_getBodyData();  
    return req.res_jsonResponse(myData);  
}
```