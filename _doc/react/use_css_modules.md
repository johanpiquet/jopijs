# Using a CSS module

A CSS module is a piece of CSS whose names are automatically renamed to avoid conflicts. This is the first advantage of CSS modules.

Their second advantage is that the content of CSS modules is directly integrated into the generated HTML, without using an external file. Whereas if the component including the CSS module is not used, then the CSS content is not integrated: only what is used is included.

Suppose we have this CSS file, named `mystyle.module.css` (the `module.css` part is important here).

```css
.myText {  
    color: blue;  
    font-size: 40px;  
}  
  
.myButton {  
    border: 1px solid red;  
}
```

In this file, the class names are simple and easily prone to conflict. This is not a problem because they will be renamed to unique names.

For this, we need one thing: a table to know the new name. In the following example, this is what we get in the `nameMap` variable.

```typescript jsx
// When importing a CSS module, we get an object
// allowing us to know the final name of our class.
import nameMap from "./mystyle.module.css";

import {useCssModule} from "jopijs/ui";  
  
export default function() {  
    // Allow embedding the CSS rules into the HTML.
    useCssModule(nameMap);  
    
    // Here nameMap.myButton returns the translated name.
    // Same for nameMap.myText.
    return <>  
        <div className={nameMap.myButton}>  
            <div className={nameMap.myText}>Test CSS Module</div>  
        </div>    
	</>;
}
```