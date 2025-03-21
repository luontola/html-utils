import {describe, expect, test} from "vitest"
import {html, rawHtml} from "../src/html-templates.js"

// Vendored from https://github.com/luontola/html-utils

describe("html templates", () => {

    test("static html", () => {
        expect(html`<p>foo</p>`).toStrictEqual({html: "<p>foo</p>"})
    })

    test("html with placeholders", () => {
        const a = "foo"
        const b = "bar"
        const c = "gazonk"
        expect(html`${a}<span>${b}</span>${c}`).toStrictEqual({html: "foo<span>bar</span>gazonk"})
    })

    test("escapes HTML special characters in string placeholders", () => {
        const a = "<>&'\""
        expect(html`${a}`).toStrictEqual({html: "&lt;&gt;&amp;&#39;&quot;"})
    })

    test("escapes HTML special characters in array placeholders", () => {
        const a = ["<>&'\""]
        expect(html`${a}`).toStrictEqual({html: "&lt;&gt;&amp;&#39;&quot;"})
    })

    test("escape hatch for avoiding HTML escaping", () => {
        const a = rawHtml("<span>foo</span>")
        expect(html`<p>${a}</p>`).toStrictEqual({html: "<p><span>foo</span></p>"})
    })

    test("inserts HTML placeholders as-is", () => {
        const a = html`<span>foo</span>`
        expect(html`<p>${a}</p>`).toStrictEqual({html: "<p><span>foo</span></p>"})
    })

    test("encodes object placeholders to JSON", () => {
        const a = {foo: 123}
        expect(html`<p>${a}</p>`).toStrictEqual({html: "<p>{&quot;foo&quot;:123}</p>"})
    })

    test("concatenates the elements of array placeholders", () => {
        const a = ["a", "b", "c"]
        expect(html`<p>${a}</p>`).toStrictEqual({html: "<p>abc</p>"})
    })

    test("null and undefined are same as empty string", () => {
        const a = null
        const b = undefined
        const c = [null, undefined]
        expect(html`<p>${a}${b}${c}</p>`).toStrictEqual({html: "<p></p>"})
    })

    test("other types are converted to string", () => {
        const a = 1.23
        const b = true
        const c = false
        expect(html`<p>${a} ${b} ${c}</p>`).toStrictEqual({html: "<p>1.23 true false</p>"})
    })

    test("strips indent if the markup starts on a new line", () => {
        expect(html`
            <p>
                ${"hello"}
            </p>
        `).toStrictEqual({html: "<p>\n    hello\n</p>"})
    })

    test("keeps whitespace if the markup is not indented", () => {
        expect(html`  <p>hello</p>  `).toStrictEqual({html: "  <p>hello</p>  "})
    })
})
