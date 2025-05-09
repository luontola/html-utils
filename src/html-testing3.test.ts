import {describe, expect, test} from "vitest"
import {normalizeWhitespace, visualizeHtml} from "./html-testing3.js"
import {html} from "./html-templates.js"
import React from "react"
import {renderToStaticMarkup} from "react-dom/server"

// Vendored from https://github.com/luontola/html-utils

describe("visualizeHtml", () => {

    test("empty input", () => {
        expect(visualizeHtml("")).toBe("")
        expect(visualizeHtml(null)).toBe("")
        expect(visualizeHtml(undefined)).toBe("")
    })

    test("normalizes whitespace", () => {
        expect(visualizeHtml(" a\n\t\rb    c ")).toBe("a b c")
    })

    test("replaces HTML tags with whitespace", () => {
        expect(visualizeHtml("<p>one</p><p>two</p>")).toBe("one two")
    })

    test("inline elements will not add spacing to text", () => {
        expect(visualizeHtml("x<a>y</a>z")).toBe("xyz")
        expect(visualizeHtml("x<a><abbr><b><big><cite><code><em><i><small><span><strong><tt>y</tt></strong></span></small></i></em></code></cite></big></b></abbr></a>z")).toBe("xyz")
        expect(visualizeHtml(`x<a\nhref=""\n>y</a>z`), "works with newlines between attributes").toBe("xyz")
    })

    test("elements can be hidden with CSS", () => {
        expect(visualizeHtml(`<p style="display: none">foo</p>`)).toBe("")
    })

    test("hides style elements", () => {
        expect(visualizeHtml(`
            <style>
                p { color: red; }
            </style>`)).toBe("")
        expect(visualizeHtml(`
            <style type="text/css">
                p { color: red; }
            </style>`), "with type attribute").toBe("")
    })

    test("hides script elements", () => {
        expect(visualizeHtml(`<script>foo()</script>`)).toBe("")
    })

    test("hides noscript elements", () => {
        expect(visualizeHtml(`<noscript>foo</noscript>`)).toBe("")
    })

    test("hides comments", () => {
        expect(visualizeHtml("<!-- foo -->")).toBe("")
        expect(visualizeHtml("foo<!-- 666 -->bar")).toBe("foobar")
        expect(visualizeHtml("<!-- > -->"), "matches until the end of comment, instead of the first > character").toBe("")
        expect(visualizeHtml("<!--\n>\n-->"), "works with newlines in the comment").toBe("")
    })

    test("replaces HTML character entities", () => {
        expect(visualizeHtml("1&nbsp;000")).toBe("1 000")
        expect(visualizeHtml("&lt;")).toBe("<")
        expect(visualizeHtml("&gt;")).toBe(">")
        expect(visualizeHtml("&amp;")).toBe("&")
        expect(visualizeHtml("&quot;")).toBe("\"")
        expect(visualizeHtml("&apos;")).toBe("'")
        expect(visualizeHtml("&#39;")).toBe("'")
    })

    test("data-test-icon attribute is shown before the element", () => {
        expect(visualizeHtml(`<input type="checkbox" data-test-icon="☑️" checked value="true">`)).toBe("☑️")
        expect(visualizeHtml(`x<div data-test-icon="🟢">y</div>z`), "spacing, block elements").toBe("x 🟢 y z")
        expect(visualizeHtml(`x<span data-test-icon="🟢">y</span>z`), "spacing, inline elements").toBe("x 🟢 yz")
        expect(visualizeHtml(`<div\ndata-test-icon="🟢"\n></div>`), "works with newlines between attributes").toBe("🟢")
    })

    test("data-test-content attribute replaces the element's content", () => {
        expect(visualizeHtml(`<textarea data-test-content="[foo]">foo</textarea>`)).toBe("[foo]")
        expect(visualizeHtml(`x<div data-test-content="🟢">y</div>z`), "spacing, block elements").toBe("x 🟢 z")
        expect(visualizeHtml(`x<span data-test-content="🟢">y</span>z`), "spacing, inline elements").toBe("x🟢z")
        expect(visualizeHtml(`x<span data-test-content="">y</span>z`), "empty value hides the element content").toBe("xz")
    })

    test("data-test-icon and data-test-content can coexist", () => {
        expect(visualizeHtml(`x<div data-test-icon="A" data-test-content="B">y</div>z`), "spacing, block elements").toBe("x A B z")
        expect(visualizeHtml(`x<span data-test-icon="A" data-test-content="B">y</span>z`), "spacing, inline elements").toBe("x A Bz")
    })

    test("works for DOM elements", () => {
        const a = document.createElement("p")
        a.textContent = "foo"
        expect(visualizeHtml(a)).toBe("foo")

        a.setAttribute("data-test-icon", "🟢")
        expect(visualizeHtml(a), "uses the element's outerHTML").toBe("🟢 foo")
    })

    test("will not change the DOM element", () => {
        const a = document.createElement("p")
        a.setAttribute("data-test-icon", "A")
        a.setAttribute("data-test-content", "B")
        a.textContent = "C"
        document.body.append(a)
        const originalParent = a.parentNode
        visualizeHtml(a)

        expect(a.outerHTML, "won't change the element")
            .toBe(`<p data-test-icon="A" data-test-content="B">C</p>`)
        expect(a.parentNode, "won't move the element").toBe(originalParent)
        expect(normalizeWhitespace(document.body.outerHTML), "won't leave temp elements in the DOM")
            .toBe(`<body> <p data-test-icon="A" data-test-content="B">C</p></body>`)
    })

    test("works for our HTML templates without unwrapping", () => {
        const a = html`<p>foo</p>`
        expect(visualizeHtml(a)).toBe("foo")
    })

    test("works for React elements", () => {
        const a = React.createElement("p", null, "foo")
        expect(renderToStaticMarkup(a)).toBe("<p>foo</p>")
        expect(visualizeHtml(a)).toBe("foo")
    })
})
