import type {Html} from "./html-templates.js"
import type React from "react"
import {isValidElement} from "react"
import {renderToStaticMarkup} from "react-dom/server"
import {JSDOM} from "jsdom"

let jsdom = new JSDOM()
const DOMParser = jsdom.window.DOMParser

// Vendored from https://github.com/luontola/html-utils

export function visualizeHtml(html: string | null | undefined | Html | React.ReactElement): string {
    if (!html) {
        return ""
    }
    if (typeof html !== "string") {
        // support our HTML templates
        if ("html" in html) {
            return visualizeHtml(html.html)
        }
        // support React
        if (isValidElement(html)) {
            return visualizeHtml(renderToStaticMarkup(html))
        }
        throw new TypeError() // should be unreachable
    }
    const document = new DOMParser().parseFromString(html, "text/html")

    // custom visualization using data-test-icon attribute
    document.querySelectorAll("[data-test-icon]").forEach(el => {
        el.before(` ${el.getAttribute("data-test-icon")} `)
    })

    // hidden elements
    document.querySelectorAll("style").forEach(el => {
        el.remove()
    })
    iterateComments(document, node => node.remove())

    html = document.documentElement.outerHTML

    // strip all HTML tags
    html = html.replace(/<\/?(a|abbr|b|big|cite|code|em|i|small|span|strong|tt)\b.*?>/sg, "") // inline elements
        .replace(/<[^>]*>/g, " ")  // block elements

    // replace HTML character entities
    html = html.replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<") // must be after stripping HTML tags, to avoid creating accidental elements
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&apos;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&") // must be last, to avoid creating accidental character entities

    return normalizeWhitespace(html)
}

function iterateComments(document: Document, callback: (node: Comment) => void) {
    const nodeIterator = document.createNodeIterator(document, jsdom.window.NodeFilter.SHOW_COMMENT)
    let currentNode: Node | null = null
    while ((currentNode = nodeIterator.nextNode())) {
        callback(currentNode as Comment)
    }
}

export function normalizeWhitespace(s: string): string {
    return s.replace(/\s+/g, " ").trim()
}
