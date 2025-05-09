import type {Html} from "./html-templates.js"
import type React from "react"
import {isValidElement} from "react"
import {renderToStaticMarkup} from "react-dom/server"

// Vendored from https://github.com/luontola/html-utils

export function visualizeHtml(html: string | null | undefined | Element | Html | React.ReactElement): string {
    if (!html) {
        return ""
    }
    // support raw HTML strings
    if (typeof html === "string") {
        return visualizeHtmlString(html)
    }
    // support DOM elements
    if (html instanceof Element) {
        // safe copy, because visualizeHtmlElement is destructive
        return visualizeHtmlElement(html.cloneNode(true) as Element)
    }
    // support our HTML templates
    if ("html" in html) {
        return visualizeHtmlString(html.html)
    }
    // support React
    if (isValidElement(html)) {
        return visualizeHtmlString(renderToStaticMarkup(html))
    }
    throw new TypeError() // should be unreachable
}

function visualizeHtmlString(html: string) {
    const element = new DOMParser().parseFromString("<body>" + html, "text/html").documentElement
    return visualizeHtmlElement(element)
}

function visualizeHtmlElement(element__willBeMutated: Element) {
    // the data-test-icon visualization is added before the element, so we need a wrapper element to contain it
    const wrapper = window.document.createElement("div")
    wrapper.append(element__willBeMutated)
    // the element must be rendered (by adding it to the DOM), or HTMLElement.innerText will return the same as textContent
    window.document.body.append(wrapper)

    // custom visualization using data-test-icon attribute
    wrapper.querySelectorAll("[data-test-icon]").forEach(el => {
        el.before(` ${el.getAttribute("data-test-icon")} `)
    })

    // custom visualization using data-test-content attribute
    wrapper.querySelectorAll("[data-test-content]").forEach(el => {
        // HTMLElement.innerText doesn't show the textContent of e.g. textarea elements,
        // so we must replace the element with one that will always be visible
        const inline = getComputedStyle(el).display.startsWith("inline")
        const wrapper = window.document.createElement(inline ? "span" : "div")
        wrapper.textContent = el.getAttribute("data-test-content")
        el.replaceWith(wrapper)
    })

    const html = wrapper.innerText
    wrapper.remove()
    return normalizeWhitespace(html)
}

export function normalizeWhitespace(s: string): string {
    return s.replace(/\s+/g, " ").trim()
}
