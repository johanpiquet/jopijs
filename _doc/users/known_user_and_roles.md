# Knowing the user and their roles

## Server-side

The `req.user_getUserInfos` function allows you to obtain basic information about the currently logged-in user. It operates by decoding the JWT token received from the caller, after verifying its authenticity.

**Example onGET.ts***
```typescript
import {JopiRequest} from "jopijs";  
  
export default async function(req: JopiRequest) {  
    let userInfos = req.user_getUserInfos();  
  
    if (userInfos) {  
        console.log("User infos:", userInfos);  
    }  
  
    return req.res_jsonResponse(userInfos);  
}
```

## React-side

A React component can use the `useUserInfos` hook to obtain a `UiUserInfos` object. This works both in the browser and on the server-side (React SSR).

```typescript
import {useUserInfos} from "jopijs/uikit";  
  
export default async function() {  
    const user = useUserInfos();  
      
    if (user) {  
        return <div>  
            <div>Hello {user.name}</div>  
            <div>Your roles: {user.roles?.join(", ")}</div>  
        </div>;  
    }  
    else {  
        console.log("not connected");  
    }  
}
```