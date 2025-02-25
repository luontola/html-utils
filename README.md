# HTML Utilities for Node.js

This project contains a couple utilities for writing and testing HTML.

These utilities are not available on npm, but they are meant to be copy-pasted into your project. They come complete
with unit tests, so they can be evolved to fit your project's needs.

## HTML Templates

There is a tag function for tagged templates, to produce HTML without a heavy framework like React. The placeholders are
automatically escaped to avoid XSS vulnerabilities:

```js
const input = "<script>alert(1)</script>"
const output = html`<p>Hello ${input}</p>`
console.log(output.html)
```

The above example will output `"<p>Hello &lt;script&gt;alert(1)&lt;/script&gt;</p>"`

See [html-templates.ts](src/html-templates.ts) and [html-templates.test.ts](test/html-templates.test.ts)

## Testing Tools

There is a helper function for extracting the visible text from HTML, to easily unit test HTML templates. If you add the
`data-test-icon` attribute to an element, the element will be replaced with its value. This enables testing non-textual
information using
the [stringly asserted](https://martinfowler.com/articles/tdd-html-templates.html#BonusLevelStringlyAsserted) style.

```js
expect(visualizeHtml("<p>one</p><p>two</p>")).toBe("one two")
expect(visualizeHtml(`<input type="checkbox" data-test-icon="☑️" checked>`)).toBe("☑️")
```

See [html-testing.ts](src/html-testing.ts) and [html-testing.test.ts](test/html-testing.test.ts)
