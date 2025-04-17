import escapeHtml from "lodash/escape.js"

// Vendored from https://github.com/luontola/html-utils

export interface Html {
    html: string;
}

/**
 * Generates an HTML string. Escapes HTML special characters in string placeholders.
 */
export function html(htmlFragments: readonly string[], ...placeholders: any[]): Html {
    let html = ""
    htmlFragments = stripIndent(htmlFragments)
    for (let i = 0; i < htmlFragments.length; i++) {
        html += htmlFragments[i]
        html += placeholderToHtmlString(placeholders[i])
    }
    return rawHtml(html)
}

function stripIndent(htmlFragments: readonly string[]): readonly string[] {
    if (!htmlFragments[0].startsWith("\n")) {
        return htmlFragments
    }
    const match = htmlFragments[0].match(/^\s+/)
    if (!match) {
        return htmlFragments
    }
    const indent = match[0]
    const fragments = htmlFragments.map(fragment => fragment.replaceAll(indent, "\n"))
    fragments[0] = fragments[0].trimStart()
    fragments[fragments.length - 1] = fragments[fragments.length - 1].trimEnd()
    return fragments
}

function placeholderToHtmlString(placeholder: any): string {
    if (placeholder === null) {
        return ""
    }
    if (typeof placeholder === "object") {
        if (typeof placeholder.html === "string") {
            return placeholder.html
        }
        if (Array.isArray(placeholder)) {
            return placeholder.map(placeholderToHtmlString).join("")
        }
        return escapeHtml(JSON.stringify(placeholder))
    }
    return escapeHtml(placeholder)
}

/**
 * Generates an HTML attribute list.
 */
export function attrs(params: { [k: string]: any } | Map<string, any>): Html {
    let html = ""
    for (const [key, value] of mapEntries(params)) {
        if (!visibleAttr(value)) {
            continue
        }
        if (html.length > 0) {
            html += " "
        }
        html += escapeHtml(key)
        if (value !== true) {
            html += `="`
            if (Array.isArray(value)) {
                html += value.filter(visibleAttr).map(escapeHtml).join(" ")
            } else if (typeof value === "object") {
                if (key === "style") {
                    html += inlineStyle(value)
                } else {
                    html += escapeHtml(JSON.stringify(value))
                }
            } else {
                html += escapeHtml(value)
            }
            html += `"`
        }
    }
    return rawHtml(html)
}

function visibleAttr(value: any): boolean {
    return value !== false && value !== null && value !== undefined
}

function inlineStyle(m: { [p: string]: any } | Map<string, any>): string {
    let html = ""
    for (const [key, value] of mapEntries(m)) {
        if (html.length > 0) {
            html += "; "
        }
        html += `${escapeHtml(key)}: ${escapeHtml(value)}`
    }
    return html
}

function mapEntries(m: { [p: string]: any } | Map<string, any>) {
    return m instanceof Map
        ? m.entries()
        : Object.entries(m)
}

/**
 * Generates an HTML string without escaping HTML special characters.
 */
export function rawHtml(html: string): Html {
    return {html}
}
