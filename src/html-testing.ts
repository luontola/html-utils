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
        return visualizeHtmlString(html.outerHTML)
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
    // custom visualization using data-test-icon attribute
    html = html.replace(/<[^<>]+\bdata-test-icon="(.*?)".*?>/sg, " $1 ")

    // hidden elements
    html = html.replace(/<style\b.*?>.*?<\/style>/sg, "")
    html = html.replace(/<!--.*?-->/sg, "")

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

export function normalizeWhitespace(s: string): string {
    return s.replace(/\s+/g, " ").trim()
}
