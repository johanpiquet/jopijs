# Manage received files

The `req.getBodyData` function allows decoding the received data, with the advantage of automatically handling the case of multi-part forms transmitting files. The client sends these files from a FormData object, or an HTML form.

**File onPOST.ts**
```typescript
import {JopiRequest} from "jopijs";  
  
export default async function(req: JopiRequest) {  
    const data = await req.req_getBodyData<FormValues>();  
  
    console.log("Server received:", data);  
  
    let photo = data.photo;  
    //  
    if (photo instanceof File) {  
        console.log("My file:", await photo.bytes());  
    }  

    return req.res_returnResultMessage(true);  
}
```