import escapeHtml from "lodash/escape.js"

// Vendored from https://github.com/luontola/html-utils

export interface Html {
    html: string;
}

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

export function rawHtml(html: string): Html {
    return {html}
}
