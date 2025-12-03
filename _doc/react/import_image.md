# Importing an image

In a `page.tsx` route file, you can directly import an image.

```typescript jsx
import logo from "./bun.png";  
  
console.log(logo);  
  
export default function () {  
    return <img src={logo} alt="" />;  
}
```


Here the `logo` variable contains either the URL of the image or a data-url: which is a character string encoding the binary of the image, allowing it to be included directly in the generated HTML, without dependency on an external file.

URL or data-url, the choice is made automatically based on the size of the image. Below 3KB the image is transformed into a data-url, otherwise you just get its URL. The image file is then automatically exposed, you don't have to do anything special.

The size limit (3kb) can be configured via the `package.json` file.

**Configuration example in package.json**
```json
{
	"jopi": {  
	  "inlineMaxSize_ko": 10  
	}
}
```