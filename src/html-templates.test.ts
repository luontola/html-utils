import {describe, expect, test} from "vitest"
import {attrs, html, rawHtml} from "./html-templates.js"

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

describe("attrs helper", () => {

    test("converts objects to an attribute list", () => {
        expect(html`<p ${attrs({class: "foo"})}></p>`).toStrictEqual({html: `<p class="foo"></p>`})
    })

    test("converts maps to an attribute list", () => {
        const m = new Map()
        m.set("class", "foo")
        expect(html`<p ${attrs(m)}></p>`).toStrictEqual({html: `<p class="foo"></p>`})
    })

    test("escapes HTML special characters in keys and values", () => {
        const a = "<>&'\""
        expect(attrs({[a]: a})).toStrictEqual({html: `&lt;&gt;&amp;&#39;&quot;="&lt;&gt;&amp;&#39;&quot;"`})
        expect(attrs({class: [a]})).toStrictEqual({html: `class="&lt;&gt;&amp;&#39;&quot;"`})
        expect(attrs({style: {[a]: a}})).toStrictEqual({html: `style="&lt;&gt;&amp;&#39;&quot;: &lt;&gt;&amp;&#39;&quot;"`})
    })

    test("supports multiple attributes", () => {
        expect(attrs({foo: "1", bar: "2"})).toStrictEqual({html: `foo="1" bar="2"`})
    })

    test("supports boolean attributes", () => {
        expect(attrs({checked: true}), "true").toStrictEqual({html: `checked`})
        expect(attrs({checked: false}), "false").toStrictEqual({html: ``})
    })

    test("hides null and undefined attributes", () => {
        expect(attrs({foo: null}), "null").toStrictEqual({html: ``})
        expect(attrs({foo: undefined}), "undefined").toStrictEqual({html: ``})
    })

    test("CSS classes can be put in an array", () => {
        expect(attrs({class: ["foo", "bar", "gazonk"]})).toStrictEqual({html: `class="foo bar gazonk"`})

        const toggle = true
        expect(attrs({
            class: [
                toggle && "foo",
                !toggle && "bar",
                null,
                undefined,
                "gazonk"],
        }), "dynamically toggled classes").toStrictEqual({html: `class="foo gazonk"`})

        expect(attrs({"aria-labelledby": ["foo", "bar"]}), "other properties are also supported")
            .toStrictEqual({html: `aria-labelledby="foo bar"`})
    })

    test("CSS inline styles can be put in an object", () => {
        expect(attrs({
            style: {
                border: "1px solid red",
                "background-color": "blue",
            },
        })).toStrictEqual({html: `style="border: 1px solid red; background-color: blue"`})

        const m = new Map()
        m.set("border", "1px solid red")
        expect(attrs({style: {border: "1px solid red"}}), "maps are also supported")
            .toStrictEqual({html: `style="border: 1px solid red"`})

        expect(attrs({
            style: {
                // The following values can be used to toggle a CSS property
                a: null,
                b: undefined,
                c: false,
                // Though true and numbers are implicitly converted to a string,
                // it's recommended to use only string values
                d: true,
                e: 1,
            },
        }), "dynamically toggled properties").toStrictEqual({html: `style="d: true; e: 1"`})
    })

    test("for other properties, objects are encoded as JSON", () => {
        expect(attrs({
            "hx-headers": {
                "x-csrf-token": "abc123",
            },
        })).toStrictEqual({html: `hx-headers="{&quot;x-csrf-token&quot;:&quot;abc123&quot;}"`})
    })
})
