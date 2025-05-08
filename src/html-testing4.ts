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
        return visualizeHtmlElement(html)
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
    const element = new DOMParser().parseFromString(html, "text/html").documentElement
    return visualizeHtmlElement(element)
}

function visualizeHtmlElement(element: Element) {
    const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
    let result = ""

    function visit(node: Node) {
        if (node.nodeType == Node.TEXT_NODE) {
            result += node.textContent
        } else if (node.nodeType == Node.ELEMENT_NODE) {
            const el = node as Element
            if (HIDDEN_TAGS.has(el.tagName)) {
                return
            }

            // custom visualization using data-test-icon attribute
            const testIcon = el.getAttribute("data-test-icon")
            if (testIcon) {
                result += " " + testIcon + " "
            }

            const isBlock = !INLINE_TAGS.has(el.tagName)
            if (isBlock) {
                result += " "
            }

            // custom visualization using data-test-content attribute
            const testContent = el.getAttribute("data-test-content")
            if (testContent !== null) {
                result += testContent
            } else {
                for (let child = el.firstChild; child; child = child.nextSibling) {
                    visit(child)
                }
            }

            if (isBlock) {
                result += " "
            }
        }
    }

    visit(walker.root)
    return normalizeWhitespace(result)
}

const HIDDEN_TAGS = new Set(["STYLE", "SCRIPT", "NOSCRIPT"])
const INLINE_TAGS = new Set(["A", "ABBR", "B", "BIG", "CITE", "CODE", "EM", "I", "SMALL", "SPAN", "STRONG", "TT"])

export function normalizeWhitespace(s: string): string {
    return s.replace(/\s+/g, " ").trim()
}
