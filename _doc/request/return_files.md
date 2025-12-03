# Returning files

You have three options for returning files:
* Use `req.file_returnFile` to return the content of a specific file.
* Use `req.file_serveFromDir` to serve a directory.
* Create a file server, where URLs / pages / APIs are mixed.

## The "req.returnFile" function

The `req.file_returnFile` function allows you to return a file. This function is optimized for speed, however it does not support the `range` header which allows pausing/resuming a large download, or seeking in a video file.

```typescript
import {JopiRequest} from "jopijs";  
  
export default async function(req: JopiRequest) {  
    const myFilePath = "./logo.png";  
    return req.file_returnFile(myFilePath)  
}
```

## The "req.file_serveFromDir" function

The `req.file_serveFromDir` function allows you to expose a directory. It should be used with catch-all routes, allowing you to capture all calls from an entry point.

**Where to bind the route**
```
|- @routes
   |- public/
      |- [...]/        < catch-all after http://mysite/public/
         |- onGET.ts
```

**File onGET.ts**
```typescript
import {JopiRequest} from "jopijs";  
  
export default async function(req: JopiRequest) {  
    const publicDirPath = "./www";  
    return req.file_serveFromDir(publicDirPath)  
}
```

## Create a file server

In your application's initialization file `index.ts`, the first lines look like this:

**File src/index.ts**
```typescript
import {jopiApp} from "jopijs";  
import myUsers from "./myUsers.json" with { type: "json" };  
  
jopiApp.startApp(import.meta, jopiEasy => {  
    jopiEasy.create_webSiteServer();
    //...
});
```

Here we are creating a simple website as a starting point. Jopi offers other options, allowing you to create specialized servers. Including the `create_fileServer` function.

**File src/index.ts**
```typescript
import {jopiApp} from "jopijs";  
import myUsers from "./myUsers.json" with { type: "json" };  
  
jopiApp.startApp(import.meta, jopiEasy => {  
	jopiEasy.create_fileServer()  
	    // The directory with our public files  
	    .set_rootDir("./public")  
	    .DONE_create_fileServer()   
	    
	    // --> After DONE_new_fileServer the methods
	    // exposed are the same as what you get with
	    // create_webSiteServer
});
```

In this example we have created a file server exposing the `public` directory. Although it is a file server, the routing system applies, making this server also an application server.