import {describe, expect, test} from "vitest"
import {normalizeWhitespace, visualizeHtml} from "./html-testing.js"
import {attrs, html} from "./html-templates.js"

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

describe("examples", () => {

    test("XSS protection", () => {
        const input = "<script>alert(1)</script>"
        const output = html`<p>Hello ${input}</p>`
        expect(output.html).toBe("<p>Hello &lt;script&gt;alert(1)&lt;/script&gt;</p>")
    })

    test("attrs helper", () => {
        const name = "fruits"
        const value = "banana"
        const currentValue = "banana"
        expect(html`
            <input type="radio" ${attrs({name, value, checked: currentValue === value})}>
        `.html).toBe(`<input type="radio" name="fruits" value="banana" checked>`)

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
    })

    test("testing components", () => {
        expect(visualizeHtml(homePage())).toBe(normalizeWhitespace(`
                Welcome
                Clicked 0 times`))

        const button = clickerButton(5)
        expect(visualizeHtml(button)).toBe("Clicked 5 times")
        expect(button.html).toContain(`hx-get="/clicker?counter=6"`)
    })

    test("visualizeHtml and data-test-icon", () => {
        expect(visualizeHtml("<p>one</p><p>two</p>")).toBe("one two")
        expect(visualizeHtml(`<input type="checkbox" checked data-test-icon="☑️">`)).toBe("☑️")
    })
})
