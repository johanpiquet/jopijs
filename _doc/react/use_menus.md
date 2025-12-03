# Using menus

A website, or an application, very often uses menus. These menus are often conditioned by the user's roles: depending on their rights, the menu will show or hide certain entries.

This menu mechanism is already integrated into Jopi to save you time. It allows you to define menus, customize them according to user roles, and obtain the data that forms these menus.

The declaration of menus is done in the `uiInit.tsx` file located at the root of a module. Each module has such a file, which is called when a page is displayed in order to be able to customize its information.

**Example of a menu declaration**
```typescript jsx
import {UiKitModule, MenuName} from "jopijs/uikit";  
  
export default function(myModule: UiKitModule) {
	// Allow accessing the menus.
    const menuManager = myModule.getMenuManager();  
  
	// Set a function which is called when
	// the menu is asked for the first time.
	//
	// Here the target is the menu shown at the left-side
	// of our application / website. The MenuName object
	// is only a helper for common menu names.
	//
    menuManager.addMenuBuilder(MenuName.LEFT_MENU, (leftMenu) => {
		// Here we select the menu "Users" and the sub-menu "List users".
		// They are created if missing.
		//
		leftMenu.selectItem(["Users", "List users"])
					// We set the url to call when clicking
					// the menu entry. Other properties
					// can be set, like the menu title
					// and an icon.
					//
		            .value = {url: "/users/list"};  
	
		// ifUserHasRoles calls its function if the
		// user has all the roles (here admin + useradmin).
		//
        myModule.ifUserHasRoles(["admin", "useradmin"], () => {  
            leftMenu.selectItem(["Users", "Add user"])
	            .value = {url: "/users/add"};  
        });  
    }); 
}
```

The `useMenu` hook allows you to obtain the data describing a menu from a React component. The `useMatchingMenuItem` hook allows you to obtain a reference to the menu item pointing to the current URL. So the one we just clicked on.

**Example of using a menu**
```typescript tsx
import {useMatchingMenuItem, useMenu} from "jopijs/uikit";

export default function() {
	const items = useMenu(MenuName.LEFT_MENU);
	const current = useMatchingMenuItem();
	
	return <div>{JSON.stringify(items)}</div>
}
```