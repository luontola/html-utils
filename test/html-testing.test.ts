import {describe, expect, test} from "vitest"
import {visualizeHtml} from "../src/html-testing.js"
import {html} from "../src/html-templates.js"
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

    test("elements with the data-test-icon attribute are replaced with its value", () => {
        expect(visualizeHtml(`<input type="checkbox" data-test-icon="☑️" checked value="true">`)).toBe("☑️")
        expect(visualizeHtml(`x<div data-test-icon="🟢">y</div>z`), "adds spacing before, inside and after an element").toBe("x 🟢 y z")
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
