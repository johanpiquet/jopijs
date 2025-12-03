# Importing a CSS

In a `page.tsx` route file, when you import a CSS or SCSS (Sass) file, that CSS file is included in the page's HTML after being minified.

```
import "./mystyle-1.css";  
import "./mystyle-2.scss";
```

The referenced CSS is only included by the pages that import it: there is no global bundle. If you want to create one, you just need to have a common file that imports several CSS files.
