import {describe, expect, test} from 'vitest'
import {html} from "../src/html-templates.js"

describe('html templates', () => {

    test('static html', () => {
        expect(html`<p>foo</p>`).toStrictEqual({html: "<p>foo</p>"})
    })

    test('html with placeholders', () => {
        const a = "foo"
        const b = "bar"
        const c = "gazonk"
        expect(html`${a}<span>${b}</span>${c}`).toStrictEqual({html: "foo<span>bar</span>gazonk"})
    })

    test('escapes HTML special characters in string placeholders', () => {
        const a = "<>&'\""
        expect(html`${a}`).toStrictEqual({html: "&lt;&gt;&amp;&#39;&quot;"})
    })

    test('inserts HTML placeholders as-is', () => {
        const a = html`<span>foo</span>`
        expect(html`<p>${a}</p>`).toStrictEqual({html: "<p><span>foo</span></p>"})
    })

    test('encodes object placeholders to JSON', () => {
        const a = {foo: 123}
        expect(html`<p>${a}</p>`).toStrictEqual({html: '<p>{"foo":123}</p>'})
    })
})
