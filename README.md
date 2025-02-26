# HTML Utilities for Node.js

This project contains a couple utilities for writing and testing HTML.

These utilities are not available on npm, but they are meant to be copy-pasted into your project. They come complete
with unit tests, so they can be evolved to fit your project's needs.

## HTML Templating

There is a tag function for writing tagged templates, to produce HTML without a heavy framework like React.

The placeholders are automatically escaped to avoid XSS vulnerabilities.

```js
const input = "<script>alert(1)</script>"
const output = html`<p>Hello ${input}</p>`
expect(output.html).toBe("<p>Hello &lt;script&gt;alert(1)&lt;/script&gt;</p>")
```

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

See [html-templates.ts](src/html-templates.ts) and [html-templates.test.ts](test/html-templates.test.ts)

## Unit Testing the UI

There is a helper function for extracting the visible text from HTML, to easily unit test HTML templates.

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
But if you add a `data-test-icon` attribute to an element, the element will be replaced with its value.
This enables [stringly asserted](https://martinfowler.com/articles/tdd-html-templates.html#BonusLevelStringlyAsserted)
testing to assert non-textual information.

```js
expect(visualizeHtml("<p>one</p><p>two</p>")).toBe("one two")
expect(visualizeHtml(`<input type="checkbox" checked data-test-icon="☑️">`)).toBe("☑️")
```

See [html-testing.ts](src/html-testing.ts) and [html-testing.test.ts](test/html-testing.test.ts)

## Installing

To use this library, download it to be part of your project:

```
wget https://raw.githubusercontent.com/luontola/html-utils/refs/heads/main/src/html-templates.ts
wget https://raw.githubusercontent.com/luontola/html-utils/refs/heads/main/test/html-templates.test.ts
wget https://raw.githubusercontent.com/luontola/html-utils/refs/heads/main/src/html-testing.ts
wget https://raw.githubusercontent.com/luontola/html-utils/refs/heads/main/test/html-testing.test.ts
```

In particular, the testing library often benefits from project-specific customizations.
Also, you wouldn't want to be [left-padded](https://en.wikipedia.org/wiki/Npm_left-pad_incident) because of just 50
lines of code, would you?
