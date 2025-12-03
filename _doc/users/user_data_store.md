# Create a user store

Jopi offers a basic mechanism for managing application users:

*   Authentication management, by verifying a login/password (or a password hash).
*   Connection token management, using JWT (Json Web Token) technology.
*   Management of obtaining user information, at the server API level, or from React.js code (server and browser).

Here we use the JWT format for connection tokens. These tokens are transmitted to the server along with calls from the browser, thanks to a cookie. JWT tokens have two special features:

*   They encode public information about the user. They can be decoded on the server side as well as on the browser side, without an encryption key.
*   These tokens include a proof, which allows verifying if this data is authentic and not tampered with. This is based on a private encryption key, stored on the server side.

JWT activation is done from the `src/index.ts` file, as in the following example.

**File src/index.ts**
```typescript
import {jopiApp} from "jopijs";  
import myUsers from "./myUsers.json" with { type: "json" };  
  
jopiApp.startApp(import.meta, jopiEasy => {  
    jopiEasy.create_webSiteServer()
        // Tips: you can also use 'fastConfigure_jwtTokenAuth' for a one line configuration.

        .configure_jwtTokenAuth()  
            // WARNING: you must change this key!  
            .step_setPrivateKey("my-private-key")  
            
            .step_setUserStore()  
                .use_simpleLoginPassword()  
                    .addMany(myUsers)  
                    .DONE_use_simpleLoginPassword()  
                .DONE_setUserStore()  
            .DONE_configure_jwtTokenAuth()  
    });
```

Here we have enabled JWT, and defined a user store that we have populated using a JSON file.

**File myUsers.json**
```json
[  
  {  
    "login": "johan@mymail.com",  
    "password": "mypassword",  
    "userInfos": {  
      "id": "johan",  
      "fullName": "Johan P",  
      "email": "johan@mymail.com",  
      "roles": ["admin", "writer"]  
    }  
  }  
]
```

Here the `login` and `password` information is what is used to authenticate the user. While the `userInfos` information contains information about the user.