# Authenticate a user

Jopi automatically handles a whole set of things. However, you will need to add a login screen and an endpoint to verify the login/password yourself.

The following example shows how to authenticate the user on the server side. It is called when the user enters their login/password from a login form (login and password text fields).

**Example of login/password processing**
```typescript
import {JopiRequest, type LoginPassword} from "jopijs";  
  
export default async function(req: JopiRequest) {  
    const data = await req.req_getBodyData();  
    const authResult = await req.user_tryAuthWithJWT(data as LoginPassword);  
  
    if (!authResult.isOk) console.log("Auth failed");  
  
    // Will automatically set a cookie containing information.  
    // That's why we don't return this information here.    
    return req.res_jsonResponse({isOk: authResult.isOk});  
}
```

When authentication is successful, Jopi automatically enriches the response with a cookie containing the JWT token.

If your application is a SPA (Single Page Application), the browser-side code will need to use the `useUserStateRefresh` hook to notify the system that the authentication cookie has changed and that it needs to update its internal state.

**React-side example***
```typescript
// Here we are inside a React component.

// Calling declareUserStateChange allows refreshing the auth state.
const declareUserStateChange = useUserStateRefresh();  
  
// useFormSubmit is a form helper function.
const [submitForm, _] = useFormSubmit((res) => {  
	// Auth success?
    if (res.isOk) { 
	    // Then update the state. 
        declareUserStateChange();
    }  
});
```