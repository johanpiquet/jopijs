# Replace an existing route

A module can define an already existing route. In that case, the new declaration overwrites the previous declaration. If you declare a page using a `page.tsx` file then it overwrites the previous one if it already existed. The same applies for `onPOST.ts`, `onPUT.ts`, ...

The problem is the order in which modules are evaluated. Who will overwrite whom?

That is why a priority mechanism allows stating which one is more prioritized.

```
|- mod_moduleA
   |- @routes/product/listing/
   	   |- default.priority           < Is automatically created if no priority
	   |- page.tsx
       |- onPOST.ts
|- mod_moduleB
   |- @routes/product/listing/
   	   |- high.priority              < Priority is higher
       |- page.tsx                   < ... that's why it will replace the page
       |- onPUT.ts                   < onPUT is added (+ the old onPOST)
```

The different priority levels are:
* verylow.priority
* low.priority
* default.priority
* high.priority
* veryhigh.priority

The point of the verylow and low levels is that an item without a priority, which means a default level priority, will automatically overwrite the existing one. Using verylow and low is therefore a way to define a default value for an item.
