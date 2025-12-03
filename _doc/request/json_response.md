# Create a JSON response

Jopi exposes the `res_jsonResponse` function to help you easily return a JSON response.

**File onPOST.ts**
```typescript
import {JopiRequest, type LoginPassword} from "jopijs";  
  
export default async function(req: JopiRequest) {  
	const myJson = {isOk: true};
	
	// Is equivalent to:
	// return new Response(JSON.stringify(myJson), {  
	//    status: 200,
	//    headers: {"content-type": "application/json;charset=utf-8"}  
    // });
	//
	req.res_jsonResponse(myJson);  
}
```

The `res_jsonStringResponse` function is similar, but receives a JSON already encoded as a string.

**File onPOST.ts**
```typescript
import {JopiRequest, type LoginPassword} from "jopijs";  
  
export default async function(req: JopiRequest) {  
	const myJsonString = readTextFile("./data.json");
	
	// Is equivalent to:
	// return new Response(myJsonString, {  
	//    status: 200,
	//    headers: {"content-type": "application/json;charset=utf-8"}  
    // });
	//
	req.res_jsonStringResponse(myJsonString);  
}
```

> In addition, the `req.res_returnResultMessage` function can be useful for returning a json response of type `{isOk: true, message: myValue}`.