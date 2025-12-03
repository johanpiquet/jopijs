# Inter-module communication

## The principle of event-based communication

Modules are strongly decoupled from each other, which reduces their dependencies and allows for a more easily maintainable application. They can share elements, but sometimes they need to be able to communicate with each other more directly.

This is where a mechanism comes into play where one module can notify other modules that an event is occurring, while transmitting information. It's like having a loudspeaker and speaking into it: who hears? We don't know, but what is said is heard and causes reactions.

For example, an event can indicate that the user has just logged in: with the consequence that the module managing the UI will request to refresh the content of the menus to reflect the fact that the user is no longer an anonymous user.

## The problem with events

The proposed communication mechanism is therefore an event-based one. The problem with such a mechanism is that it is incompatible with bundlers (Vite.js / WebPack / ...), and internally Jopi also uses a bundler. If you try to set up such a mechanism, you will notice apparently inconsistent behaviors, due to side effects of the systems that take the javascript to create a bundle.

The reason for these side effects is that bundlers perform a static analysis: they do not execute the code to know who is listening for an event. Then they perform pruning: they remove the code that seems to be unattached to the rest of the system, in order to generate much smaller javascript files.

This issue is the reason why Jopi requires that events be declared statically, so that they can be analyzed by the bundler and the javascript code is correctly included.

## Listening to an event

Events are declared statically, so that the internal bundler can understand that our module is listening to certain elements.

**Example of adding listeners**

```
|- mod_moduleA/
 |- @alias/
  |- events/                 < Where our module events are declared
   |- myEventName            < The name for this event
	  |- listenerA           < Names determine the event order (sorted ASC)
	     |- index.ts         < Who listen to this event
    |- mySecondListener
    |- myThirdListener
```

Each listener has a name. The purpose of this name is to indicate its priority order in the event call list. These names are sorted alphabetically (ASC), which makes it possible to know who should be called before or after whom.

Here the `index.ts` file exposes a default function that is called when the event is triggered. This function must be synchronous (no `async` / `Promise`). The reason is that in practice most events are called from synchronous functions, so if the events were asynchronous, there would be an incompatibility.

**index.ts file**
```typescript
export default function(eventData: any, eventName: string) {
  console.log(`Event ${eventName} received with data`, eventData);
}
```

## Emitting an event

Here is an example showing how to emit an event.

```typescript
import myEventName from "@/events/myEventName";
await myEventName.send({hello: "world"});
```

The only constraint here is that the event must exist. It is therefore necessary to create an event declaration, even if it has no listener.

**Declaration of an event without listeners**
```
|- mod_moduleB/
  |  @alias/
     |- events/ 
        |- myEventB    < There is no listener, but now the event exists
```

Another method for calling events is the direct use of `jk_events`. This method exists, but it is not recommended on the UI side for the reasons explained regarding the bundler. That is why it is mentioned here, but not recommended.

```typescript
import * as jk_events from "jopi-toolkit/jk_events";
jk_events.sendAsyncEvent("@myEventName", entry);
```