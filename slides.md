---
# You can also start simply with 'default'
theme: ./theme
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
# some information about your slides (markdown enabled)
title: Welcome to Slidev
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
# apply unocss classes to the current slide
class: text-center
# https://sli.dev/features/drawing
drawings:
  persist: false
# slide transition: https://sli.dev/guide/animations.html#slide-transitions
transition: none
# enable MDC Syntax: https://sli.dev/features/mdc
mdc: true
---

# Neodrag: The rewrite

## By: Puru Vijayvargia

<!--
Today I am going to introduce to you Neodrag, and the recent rewrite I did to make it faster, extensible and a lot more powerful. 
-->

---
layout: two-cols
---

<br><br>

<img src="/profile-hooman.png" width="400px" />

::right::

<br><br><br>

# Puru Vijayvargia

## @puruvjdev

<br>

- ai slop solver
- svelte website team
- open sourceror
- performance freak
- ...and everything else

<style>
  img {
    border-radius: 50%;
  }
</style>

<!--
HI everyone, I am Puru, I come from Jaipur, Rajasthan, which is in the desert of India, so, no camel jokes please. I'm a fullstack developer with over 10 years in the field, an open sourceror, absolute performance freak and a self-titled Bundle Compressionista.
-->

---

## What is Neodrag?

- tiny draggable library (<2KB min+br)
- svelte, vue, react, solid-js, vanilla
- Highly reactive
- Lean core, minimal adapters

<br><br>

<v-click>

### Shortcomings

- Not extensible
- No fine-grained control
- Any option change causes unnecessary object creation
- 3x event listeners

</v-click>

<!--
I would like to introduce you to Neodrag. It's a tiny draggable library, that is highly reactive, and has adapters for svelte, vue, react, solid-js and vanilla. It is quite small, at around 1.7KB min+br for the svelte version, and has a lean core with minimal adapters.

[click] However, it has some shortcomings. It is not extensible, meaning you cannot add your own plugins or customize the behavior beyond the options provided. It also does not have fine-grained control, meaning any option change causes unnecessary object creation and garbage collection. And finally, it attaches 3 event listeners to each draggable element, which can be a performance issue if you have a lot of draggables on the page.
-->

---

## Neodrag v2

````md magic-move
```svelte
<script>
  import { draggable } from '@neodrag/svelte';
</script>

<div 
  use:draggable={{
    axis: 'both',
    handle: '.handle',
    defaultPosition: { x: 0, y: 0 },
    bounds: 'parent',
    onDrag: (event) => {
      console.log('Dragging', event);
    }
  }}
>
  Drag me
</div>
```

```svelte
<script>
  import { draggable } from '@neodrag/svelte';

  let position = { x: 0, y: 0 };
</script>

<div 
  use:draggable={{
    position,
    axis: 'both',
    handle: '.handle',
    defaultPosition: { x: 0, y: 0 },
    bounds: 'parent',
    onDrag: (event) => {
      position = { x: event.offsetX, y: event.offsetY };
    }
  }}
>
  Drag me
</div>
```
````

<!--
Since this is This week in Svelte, I am going to focus more on the svelte side of things. So, what you see here, is the API design of the previous neodrag v2. Pretty simple, intuitive, just works, no issues in general. And this is really tiny! Only 1.7KB for the svelte version. 

[click] And you can do this nice thing where you pass reactive position to it, and it'll move around based on the variable, not just the user interaction. This pattern is quite useful, for when you want to do stuff like store the position as it is moving, and then animate it back with style, with maybe spring animations or something. This is quite nice, but it has a big issue.
-->

---

## Svelte Actions are not fine-grained

```ts
export function draggable(node, options) {
  // ... setup logic
  node.addEventListener('mousedown', onMouseDown);
  
  return {
    update(newOptions) {
      // This is not fine-grained, it recreates the entire newOptions object including
      // all objects, and callbacks in it
      options = newOptions;
    },
  };
}
```

<!--
This example above, what happens is, that anytime you drag, it changes position variable. And when that happens, svelte actions's update methods recieves an entirely new object.
-->

---

## Neodrag v2


```svelte
<script>
  import { draggable } from '@neodrag/svelte';

  let position = { x: 0, y: 0 };
</script>

<div 
  use:draggable={{
    position,
    axis: 'both',
    handle: '.handle',
    defaultPosition: { x: 0, y: 0 },
    bounds: 'parent',
    onDrag: (event) => {
      position = { x: event.offsetX, y: event.offsetY };
    }
  }}
>
  Drag me
</div>
```

<!--
So here, every dragmove, so basically anytime ur mouse moves, it changes the position variable, and that causes the update method to be called, which then creates a new options object. Usually it wouldn't be a problem, but here, this object creation, garbage collection, recreation is happening every single time u drag, which could be 100s of times per second, and that is a lot of overhead. And this is not just for the svelte version, this is for all the versions of neodrag, because it uses the same API design. These are the performance issues. There is a much bigger glaring problem.
-->

---

## Unextendable, unhackable

- Piled up feature requests
- No way to customize behavior
<!-- - Hacking = double independant states -->

<!--
I was getting a lot of feature requests. Like, for a dropzone feature, drag and drop, magnetic behavior, smart crazy grids etc etc. I could add a few of them, but that's a lot of extra bytes that everyone have to pay for whether they are using it or not.

On top of that, you couldn't customize anything here beyond the options provided, and even then it kind of sucked some of the times.
-->

---

### Source

```ts
export type DragBounds =
	| HTMLElement
	| Partial<DragBoundsCoords>
	| 'parent'
	| 'body'
	| (string & Record<never, never>);
```

### Usage

```ts
bounds: 'parent'
bounds: 'body'
bounds: { top: 0, left: 0, right: 100, bottom: 100 }
bounds: document.querySelector('.container')
```

<!-- For example, look at how the bounds option's types look. The flexibility while using is nice, but the types are just superbly awkward. Moresoever, you couldn't provide a padding on body or parent or the element, only through viewport -->

---

## Unextendable, unhackable

- Piled up feature requests
- No way to customize behavior
- Hacking = double independant states

<!-- And lastly, you couldn't just hack it work properly. The library has its own internal state system, which means for any sort of real customisation, you have to mirror and manage your own state alongside it. Which is not desirable at all. It's like having to keep tabs on how svelte's signal implementation works down to the smallest detail. It sucks -->

---

## Neodrag v3

- Modular
- Extensible
- Fine-grained reactivity
- Stateless core
- Performant
- Event delegation

<!-- This is a complete rewrite of the library from the ground up. The goal is to address all the issues mentioned previously and provide a more flexible, performant, and customizable solution. This is now more modular, more extensible and has fine-grained reactivity. Not to mention, a helleuva lot faster also. -->

---
layout: two-cols
---

```svelte
<script>
  import { draggable } from '@neodrag/svelte';
</script>

<div 
  use:draggable={{
    axis: 'x',
    handle: '.handle',
    defaultPosition: { x: 0, y: 0 },
    bounds: 'parent',
    onDrag: (event) => {
      console.log('Dragging', event);
    }
  }}
>
  Drag me
</div>
```

::right::

```svelte
<script>
  import { draggable, axis, controls, ControlFrom, position, bounds, BoundsFrom, events } from '@neodrag/svelte';
</script>

<div 
  {@attach draggable([
    axis('x'),
    controls({ allow: ControlFrom.selector('.handle') }),
    position({ default: { x: 0, y: 0 } }),
    bounds(BoundsFrom.parent()),
    events({
      onDrag: (event) => {
        console.log('Dragging', event);
      }
    })
  ])}
>
  Drag me
</div>
```

<!--
As you can see, the options are gone! They're now replaced with an array in which you pass certain functions. These functions are a new concept in Neodrag, and they're called plugins. These plugins are small, composable functions that can be used to extend the functionality of the draggable ayyacj,emt. They can be used to add new features, customize behavior, or even replace existing functionality.
-->

---

## BoundsFrom

````md magic-move
```ts
export type DragBounds =
	| HTMLElement
	| Partial<DragBoundsCoords>
	| 'parent'
	| 'body'
	| (string & Record<never, never>);
```

```ts
type BoundFromFunction = (data: {
	root_node: HTMLElement | SVGElement;
}) => [[x1: number, y1: number], [x2: number, y2: number]];

const BoundsFrom: {
  element(element: HTMLElement, padding?: Padding): BoundFromFunction;
  selector(selector: string, padding?: Padding, root?: HTMLElement): BoundFromFunction;
  viewport(padding?: Padding): BoundFromFunction;
  parent(padding?: Padding): BoundFromFunction;
};
```
````

<template v-if="$clicks > 0">

```ts
bounds(BoundsFrom.parent())
bounds(BoundsFrom.element(document.querySelector('.container')))
bounds(BoundsFrom.selector('.container', { top: 10, left: 10 }))
bounds(BoundsFrom.viewport({ top: 10, left: 10 }))
```

</template>

<!--
[click] Oh and remember the bounds options I showed you before with the convoluted typing? It becomes muchh simpler! Now there's a BoundsFrom object that has methods to get the bounds from an element, a selector, the viewport or the parent. And you can even provide padding to these methods. This is much more flexible and easier to use than before. Heck, infact you don't even have to use BoundsFrom, you can just pass a function which return an array of initial and final coordinates of bounds. Super simple
-->

---

## Smart dumb core

```ts {all|5}
const DEFAULT_PLUGINS = [
  ignoreMultitouch(),
  stateMarker(),
  applyUserSelectHack(),
  transform(),
  threshold(),
  touchAction(),
]

const factory = new DraggableFactory({
  plugins: DEFAULT_PLUGINS,
  // ... other options
});

export const draggable = svelteWrapper(factory);
```

<!--
Something that is very fascinating about the core library now, is that its not even a draggable library now. As in, it'll maintain all the state required to make a draggable, but just the core library won't do anything. it won't move the box with the draggable attachmemt on its own, nope!

Instead, even the moving part is now a plugin What you see abobe is the list of plugins included by default in every draggable instance. 

[click] And you can see, there's the transform plugin. This is the one doing the actual DOM transformation to move the element. All it does is receive the state from the core library, and apply the transform to the element. This is a very smart design, because now you can just remove this plugin, and the draggable will not move at all, but still be draggable. You can then add your own plugin that does something else with the state, like animating it with a spring or something.
-->

---

## Neodrag unchained

- `[magnetic()]`
- `[superGrid()]`
- `[dropzone()]`
- `[syncToLocalStorage()]`

<!--
You can even write your own plugins. If you want magnetic snap, you can have that. If you don't like how the existing grid plugin works, write your own superGrid(). If you wish to make a drag and drop library on top of neodrag, just write your own dropzone plugin. It's as easy as that now
-->

---

## Writing a plugin

```ts {all|16-18}
export const stateMarker = unstable_definePlugin(() => ({
	name: 'neodrag:stateMarker',
	cancelable: false,

	setup(ctx) {
		set_node_dataset(ctx.rootNode, 'neodrag', '');
		set_node_dataset(ctx.rootNode, 'neodrag-state', 'idle');
		set_node_dataset(ctx.rootNode, 'neodrag-count', '0');

		return {
			count: 0,
		};
	},

	start(ctx) {
		ctx.effect.paint(() => {
			set_node_dataset(ctx.rootNode, 'neodrag-state', 'dragging');
		});
	},

	end(ctx, state) {
		set_node_dataset(ctx.rootNode, 'neodrag-state', 'idle');
		set_node_dataset(ctx.rootNode, 'neodrag-count', ++state.count);
	},
}));
```

<!--
This is the example of the stateMarker plugin, which just attaches data-neodrag attributes on the root node. It's a non-cancelable plugin, which means even when another plugins cancels the drag, this plugin will still run.

There's the setup lifecycle, which is run when the plugin is first attached to the draggable. This is where you can do any initial setup, like attaching event listeners or setting up state. This is also run when this plugin is updated. More on that later

Then there's the start lifecycle, which is run when the drag starts. This is where you can do any setup that needs to happen when the drag starts, like adding classes or styles.

Finally, there's the end lifecycle, which is run when the drag ends. This is where you can do any cleanup that needs to happen when the drag ends, like removing classes or styles.

[click] And, if you look at this line, here's a neodrag-specific function, called effect.paint(). Any side effects are done in this effect lifecycle, and it is scheduled to be run in the next frame, minimizing layout thrashing. Another advantage is that it is cancellable! Means if any other plugin down the line cancels the drag operation, this effect is not run. This is useful to avoid having to reverse changes.
-->

---

## More about a plugin

```ts
type Plugin<State> = {
  name: string;
	priority?: number;
	liveUpdate?: boolean;
	cancelable?: boolean;
	setup?: (ctx: PluginContext) => State;
	shouldStart?: (ctx: PluginContext, state: State, event: PointerEvent) => boolean;
	start?: (ctx: PluginContext, state: State, event: PointerEvent) => void;
	drag?: (ctx: PluginContext, state: State, event: PointerEvent) => void;
	end?: (ctx: PluginContext, state: State, event: PointerEvent) => void;
	cleanup?: (ctx: PluginContext, state: State) => void;
}
```

<!--
setup, start and end are not the only hooks you have access to. You can tell if the plugin can update live, as in during dragging itself(Will touch on this more), you can set its prioritity, of when it shud run in the whole plugin chain, and then there are the methods: shouldStart, drag and cleanup.

shouldStart allows any plugin to cancel the drag operation, and not let it start at all. This is useful for plugins that want to do some pre-checks before allowing the drag to start, like checking if the element is in certain bounds or not. drag is run every single pointermove, and allows you to do any updates to the state during the drag operation. This is useful for plugins that want to update the state based on the pointer position or other factors. And finally, cleanup is run when the plugin is removed from the draggable. Great for cleaning up any dangling state or event listeners.
-->

---

## Fine-grained reactivity

```svelte
<script>
  import { draggable } from '@neodrag/svelte';

  let position = { x: 0, y: 0 };
</script>

<div 
  use:draggable={{
    position,
    axis: 'both',
    handle: '.handle',
    defaultPosition: { x: 0, y: 0 },
    bounds: 'parent',
    onDrag: (event) => {
      position = { x: event.offsetX, y: event.offsetY };
    }
  }}
>
  Drag me
</div>
```

<!--
Let's talk about fine-grained reactivity. Now, this is not the fine-grained reactivity that svelte has, but rather it's specific to neodrag. Let's look at this example. As we discussed before, position being udpates recreates the entire object passed to draggable. Now, if something like this were to be done to the new architecture. FOr eg, this
-->

---

## Fine-grained reactivity

```svelte
<script>
  import { draggable, axis, controls, ControlFrom, position, bounds, BoundsFrom, events } from '@neodrag/svelte';

  let position = $state({ x: 0, y: 0 });
</script>

<div 
  {@attach draggable([
    axis('x'),
    controls({ allow: ControlFrom.selector('.handle') }),
    position({ current: position }),
    bounds(BoundsFrom.parent()),
    events({
      onDrag: ({ offset }) => {
        position = { x: offset.x, y: offset.y };
      }
    })
  ])}
>
  Drag me
</div>
```

<!--
Could work the same as before, the only difference is that all the plugins will be recreated again and again on any position change. And this time it'll be a much bigger GC penalty than before, not to mention, now it needs to run the update and setup lifecycle of every plugin again and again. This is not good, and this is not what we want. So, automatic reactvity is now disabled in neodrag. Which means the example I showed above, does not actually work. It will recreate the objects again and again but will not update the draggable attachment. 

Instead, Neodrag v3 comes with the concept of Compartments.
-->

---

## Compartments

````md magic-move
```svelte {all|12}
<script>
  import { draggable, Compartment, events, position } from '@neodrag/svelte';

  const position_compartment = new Compartment(() => position({ current: { x: 0, y: 0 } }));
</script>

<div 
  {@attach draggable(() => [
    position_compartment
    events({
      onDrag: ({ offset }) => {
        position_compartment.current = position({ current: offset });
      }
    })
  ])}
>
  Drag me
</div>
```

```svelte {all|5,9}
<script>
  import { draggable, Compartment, events, position } from '@neodrag/svelte';

  let pos = $state({ x: 0, y: 0 });
  const position_compartment = new Compartment(() => position({ current: $state.snapshot(pos) }));

  // Get it in sync
  $effect(() => {
    position_compartment.current = position({ current: $state.snapshot(pos) });
  });
</script>

<div 
  {@attach draggable(() => [
    position_compartment
    events({
      onDrag: ({ offset }) => {
        pos.x = offset.x;
        pos.y = offset.y;
      }
    })
  ])}
>
  Drag me
</div>
```

```svelte
<script>
  import { draggable, Compartment, events, position } from '@neodrag/svelte';

  let pos = $state({ x: 0, y: 0 });
  const position_compartment = Compartment.of(() => position({ current: $state.snapshot(pos) }));
</script>

<div 
  {@attach draggable(() => [
    position_compartment
    events({
      onDrag: ({ offset }) => {
        pos.x = offset.x;
        pos.y = offset.y;
      }
    })
  ])}
>
  Drag me
</div>
```
````

<!--
Compartments are a way to hold a plugin instance. compartments must be updated manually whenever the state change should affect neodrag. They are quite powerful. You can set them to null or undefined, and it'll almost be like the plugin got removed from neodrag, with its cleanup method running.

In the code above, you can see that position is passed as a function to the compartment. And later

[click] it is updated to a new position plugin instance. Neodrag will take care of the rest, and udpate the draggable with the new plugin instance. Another thing to notice, is that instead of an array of plugins, we're actually passing a function that returns an array of plugins. This ensures that the plugins array is never recreated, making this a reference stable value. This is important for performance, as it avoids unnecessary updates to the draggable attachment, and no more GC. With this compartment approach, only the bits are recreated that are actually important.

But at the same time, this is not a very practical example. You almost always a state variable, which is the source of truth. So that would make the code look somewhat like this:

[click] This is a bit better, we only have a single source of truth variable now, and the compartment is updated to the value changes in the effect. However, it's still not so good

[click] There's still duplication here. If a component gets really complex, you might forget to update the plugin in one place and itll be hard to trace. So ofc, there's a lot more idiomatic way of doing this!

[click] Thanks to svelte 5 runes, this becomes a one liner! Compartment.of() takes a function which is run in an effect scope. Means whenever pos variable changes, the compartment is updated automatically. This is the most idiomatic way of using compartments in svelte, and it works really well.
-->

---

### Svelte

```js
let pos = $state({ x: 0, y: 0 });
Compartment.of(() => position({ current: $state.snapshot(pos) }));
```

### React

```jsx
const [pos, setPos] = useState({ x: 0, y: 0 });
useCompartment(() => position({ current: pos }), [pos]) // Like a useMemo
```

### Solid

```jsx
const [pos, setPos] = createSignal({ x: 0, y: 0 });
createCompartment(() => position({ current: pos() }))
```

### Vue

```js
const pos = ref({ x: 0, y: 0 });
useCompartment(() => position({ current: pos.value }))
```

### Vanilla

```js
const pos = { x: 0, y: 0 };
const positionCompartment = new Compartment(() => position({ current: pos }));
positionCompartment.current = position({ current: pos });
```

<!--
And there are compartments adapter for the other frameworks as well. Vanilla ofc doesn't have a state management system, so you can just use a simple object to hold the state. And then you can use the compartment to update the position plugin instance whenever the state changes. This is quite powerful, and allows you to have fine-grained control over the state of the draggable attachment. And it is idiomatic to all the frameworks shown above.
-->

---

## Extensibility

```ts
import { DEFAULTS, DraggableFactory } from '@neodrag/core';
import type { PluginInput } from '@neodrag/core/plugins';
import type { Attachment } from 'svelte/attachments';

const factory = new DraggableFactory(DEFAULTS);

export const wrapper = (factory: DraggableFactory) => {
	return (plugins?: PluginInput | undefined): Attachment<HTMLElement> =>
		(element) =>
			factory.draggable(element, plugins);
};

export const draggable = wrapper(factory);
```

<!--
Now, let's talk about extensibility and wrappers. If you import draggable directly from @neodrag/svelte, it comes preloaded with certain plugins, delegates and other configurations. Off course, sometimes you would like to remove these plugins, or change the delegate. In that case, its very easy to do so! create your DraggableFactory with the options you want, and write a wrapper that takes advantage of factory.draggable. That's it. Infact what you see above is the exact code of @neodrag/svelte, minus the reactive Compartment stuff. That's how simple it is.
-->

---

## Vue adapter

```vue
<div v-draggable="[axis('y')]">Drag me</div>
```

```ts
import { DEFAULTS, DraggableFactory } from '@neodrag/core';
import type { PluginInput } from '@neodrag/core/plugins';
import type { Directive } from 'vue';

const factory = new DraggableFactory(DEFAULTS);
const CLEANUP = Symbol();

export const wrapper = (
	factory: DraggableFactory,
): Directive<HTMLElement | SVGElement, PluginInput | undefined> => {
	return {
		mounted: (el, { value }) => {
			el[CLEANUP] = factory.draggable(el, value);
		},

		unmounted: (el) => el[CLEANUP](),
	};
};

export const vDraggable = wrapper(factory)
```

<!--
And it's not simple just for the svelte adapter cases. It's simple even for the Vue version which is a vue directive.
-->

---
layout: quote
---

# Bundle size?

<!--
So, let's talk about the bundle size. I've been talking about removing the functionality from core out into plugins, so surely that must have decreased the bundle size, right? I'm afraid that's not the case here. All the extra logic to be a mini-framework takes up space, so the size has gone up. However, I am happy to say that it's still really small compared to most of the competitors out there, which are single-framework only.
-->

---

# 3.46KB

<SlidevVideo style="border-radius: 6px" src="/size-demo.mp4" autoplay loop autoreset="slide">
</SlidevVideo>

<!--
The new size, if you import draggable as is, and dont add or remove anything is 3.46KB. Then as you add plugins, the size increases, but the maximum it reaches is 5.08KB. So only 1.6KB more than the default version. While this is a 100% size increase from before, I believe it pales in comparison to the 1000% improvement to the library because of the new changes.

As for the video you see here, it's on the homepage of the new site, next.neodrag.dev, feel free to check it out.
-->

---
layout: quote
---

# Fascinating Refactors

<!--
This was all about how the library looks, how it works. I would just love to show some of the internal improvements that happened, that I think are quite fascinating
-->

---

## Event delegation

Before: 600 listeners
```svelte
{#each {length: 200} as _, i}
  <div use:draggable>
    Item {i}
  </div>
{/each}
```

<br><br>

<v-click>

After: 3 listeners
```svelte
{#each {length: 200} as _, i}
  <div {@attach draggable()}>
    Item {i}
  </div>
{/each}
```

</v-click>

<!--
Previously, neodrag used to attach 3 event listeners to the element, pointerdown, pointermove and pointerup. This was not slow at all, but it was not the best either. The example above actually creates 600 event listeners by just existing. That is 600 entire function objects, their internal variables and memory. quite a lot, and not so performant.

[click] However, Inspired from Svelte 5, Neodrag v3 has event delegation. Which means, now it attaches a singler event listener to document.documentElement for each of the pointerdown,move and up events, and then uses the event.target to figure out which element was actually dragged. This is a lot more performant, and also reduces memory usage by a lot. The example above now only creates 3 event listeners, one for each event, and no extra memory is used for the function objects. You could create 10,000 draggables and it would still only have 3 event listeners, thats it!
-->

---

## It's a mini-framework

- Lean core unaware of plugins
- Plugins have own states
- (Reversible) Side-effects
- Effect Scheduling 

<!--
The beauty of the new architecture is that it doesn't know what plugins its gonna get. There is no line in the core which says, if plugin.name === 'neodrag:position', do something. Nope, it doesn't care, it doesn't know the plugins names even. All plugins are same to it, and it just runs them in the order of their priority. This is a mini-framework, where it doesn't know the state or components its gonna get.

Combine that with plugins returning state objects in setup, the core library stores the state of each plugins, and provide it back to the plugin while its different hooks are run. Frameworks deal with states

And if you remember from before the effect.paint(), that is there not only for schedulign things to run performantly, but its actually to store the callback, run all the plugins, make sure no cancellations or errors happened, and then run the callbacks. Svelte, React and Preact do pretty much a similar thing combined with Error boundaries, and this is not much different.
-->

---

## Try it out!

Docs: [next.neodrag.dev](https://next.neodrag.dev)

```sh
npm i @neodrag/core@next @neodrag/svelte@next
```

```sh
npm i @neodrag/core@next @neodrag/react@next
```

```sh
npm i @neodrag/core@next @neodrag/vue@next
```

```sh
npm i @neodrag/core@next @neodrag/solid@next
```

```sh
npm i @neodrag/core@next @neodrag/vanilla@next
```
---
layout: center
---

# Thank you!


<ConfettiEnd />