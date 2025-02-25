import escapeHtml from "lodash/escape.js"

interface Html {
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
    if (Array.isArray(placeholder)) {
        let html = ""
        for (const item of placeholder) {
            html += placeholderToHtmlString(item)
        }
        return html
    }
    if (typeof placeholder === "object") {
        if (typeof placeholder.html === "string") {
            return placeholder.html
        } else {
            return JSON.stringify(placeholder)
        }
    }
    return escapeHtml(placeholder)
}

export function rawHtml(html: string): Html {
    return {html}
}
