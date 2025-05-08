# Esko's HTML Utils

This project contains a couple of utilities for writing and testing HTML in JavaScript/Node.js.
They can also be ported to other languages relatively easily.

These utilities are not available on npm, but they are meant to be copy-pasted into your project. They come complete
with unit tests, so they can be evolved to fit your project's needs.

## HTML Templating

There is a `html` tag function for writing tagged templates, to produce HTML without a heavy framework like React.

The placeholders are automatically escaped to avoid XSS vulnerabilities.

```js
const input = "<script>alert(1)</script>"
const output = html`<p>Hello ${input}</p>`
expect(output.html).toBe("<p>Hello &lt;script&gt;alert(1)&lt;/script&gt;</p>")
```

### Components

You can create components using plain old functions. Works great with [htmx](https://htmx.org/).

```js
function homePage() {
    return html`
        <h1>Welcome</h1>
        <p>${clickerButton()}</p>
    `
}

function clickerButton(counter: number = 0) {
    return html`
        <button hx-get="/clicker?counter=${counter + 1}"
                hx-target="this"
                hx-swap="outerHTML">
            Clicked ${counter} times
        </button>
    `
}
```

### Attributes

If you need to only parameterize the value of an attribute, the `html` template is enough on its own.

But if you need to also toggle attributes at runtime, there is an optional `attrs` helper function.

```js
const name = "fruits"
const value = "banana"
const currentValue = "banana"
expect(html`
    <input type="radio" ${attrs({name, value, checked: currentValue === value})}>
`.html).toBe(`<input type="radio" name="fruits" value="banana" checked>`)
```

It has some convenience features for toggling CSS classes and writing inline styles.

```js
const toggle = false
expect(html`
    <p ${attrs({
    class: ["foo", "bar", toggle && "gazonk"],
    style: {
        border: "1px solid blue",
        "background-color": "red",
    },
})}></p>
`.html).toBe(`<p class="foo bar" style="border: 1px solid blue; background-color: red"></p>`)
```

Read the tests to learn more what this templating library can do.

See [html-templates.ts](src/html-templates.ts) and [html-templates.test.ts](src/html-templates.test.ts)

## Unit Testing the UI

There is a `visualizeHtml` function for extracting the visible text from HTML, to easily unit test HTML templates.

The components mentioned in the previous section could be unit tested like this:

```js
expect(visualizeHtml(homePage())).toBe(normalizeWhitespace(`
        Welcome
        Clicked 0 times`))

const button = clickerButton(5)
expect(visualizeHtml(button)).toBe("Clicked 5 times")
expect(button.html).toContain(`hx-get="/clicker?counter=6"`)
```

By default `visualizeHtml` strips all HTML tags.
But if you add a `data-test-icon` attribute, its value will be shown in front of the element.
This enables [stringly asserted](https://martinfowler.com/articles/tdd-html-templates.html#BonusLevelStringlyAsserted)
testing to assert non-textual information.

```js
expect(visualizeHtml("<p>one</p><p>two</p>")).toBe("one two")
expect(visualizeHtml(`<label><input type="checkbox" checked data-test-icon="☑️"> Toggle</label>`))
    .toBe("☑️ Toggle")
```

In addition to DOM elements, HTML strings and [our HTML templates](#html-templating), `visualizeHtml` works also for
React elements.
If you use only one templating library, you can delete a few lines from `visualizeHtml` to remove the other dependency.

See [html-testing.ts](src/html-testing.ts) and [html-testing.test.ts](src/html-testing.test.ts)

### Advanced Implementation

The previous `visualizeHtml` is implemented using just regular expressions.
Regular expressions are fast and portable, but they have limited expressiveness.
In [html-testing2.ts](src/html-testing2.ts) there is a more flexible parser-based implementation of `visualizeHtml`.

It adds support for a `data-test-content` attribute that will replace the element's content with a custom visualization.
(The `data-test-icon` only *adds* text in front of the element.)
This makes it capable of visualizing e.g. `<textarea>` and `<select>` elements.

```js
expect(visualizeHtml2(`<textarea data-test-content="[foo]">foo</textarea>`)).toBe("[foo]")
expect(visualizeHtml2(`
   <select name="pets" data-test-content="[Cats]">
       <option value=""></option>
       <option value="cats" selected>Cats</option>
       <option value="dogs">Dogs</option>
   </select>
`)).toBe("[Cats]")
```

This is the most extensible implementation.
The parser-based approach makes it easy to e.g. implement default visualizations for form elements (left as an exercise
for the reader), so that you don't need to sprinkle `data-test-content` attributes as much.

See [html-testing2.ts](src/html-testing2.ts) and [html-testing2.test.ts](src/html-testing2.test.ts)

### Browser-rendered Implementation

If the tests are run using a web browser instead of Node.js, we can also implement `visualizeHtml` by relying on
`HTMLElement.innerText` which is aware of the rendered appearance of the text content.

Using a browser will enable CSS, so that you can hide elements with `display: none`.
Otherwise, this implementation works the same as the previous advanced implementation.

See [html-testing3.ts](src/html-testing3.ts) and [html-testing3.test.ts](src/html-testing3.test.ts)

## Installing

To use this library, download it to be part of your project.
In particular, the testing library often benefits from project-specific customizations.

This library is [finished software](https://josem.co/the-beauty-of-finished-software/), so there is no need to get
constant updates to it.
No new features is a feature in itself.
You wouldn't want to be [left-padded](https://en.wikipedia.org/wiki/Npm_left-pad_incident) because of just 50 lines of
code, would you?

### Templating Library

```shell
wget https://raw.githubusercontent.com/luontola/html-utils/refs/heads/main/src/html-templates.ts
wget https://raw.githubusercontent.com/luontola/html-utils/refs/heads/main/src/html-templates.test.ts
```

### Basic Testing Library

Regex-based implementation.
Can be easily ported to any language.

```shell
wget https://raw.githubusercontent.com/luontola/html-utils/refs/heads/main/src/html-testing.ts
wget https://raw.githubusercontent.com/luontola/html-utils/refs/heads/main/src/html-testing.test.ts
```

### Advanced Testing Library

Parser-based implementation.
Requires a web browser, [jsdom](https://github.com/jsdom/jsdom) or similar.
Porting to other languages requires an HTML parser.

```shell
wget https://raw.githubusercontent.com/luontola/html-utils/refs/heads/main/src/html-testing2.ts
wget https://raw.githubusercontent.com/luontola/html-utils/refs/heads/main/src/html-testing2.test.ts
```

### Browser-rendered Testing Library

Requires a web browser.

```shell
wget https://raw.githubusercontent.com/luontola/html-utils/refs/heads/main/src/html-testing3.ts
wget https://raw.githubusercontent.com/luontola/html-utils/refs/heads/main/src/html-testing3.test.ts
```
