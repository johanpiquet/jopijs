The folder '/public' is where you can put the files and resources to serve.

```
|- package.json
|- public/                < The public dir
   |- myImage.png         < Url: /myImage.png
   |- avatars             
      |- avatarA.jpg      < Url: /avatars/avatarA.jpg
```

You have to know that:
* When importing an image (ex: `import img from "myImage.png"`) you don't have to add this image to the public dir.
* Same for CSS: all what is imported, is automatically handled.

