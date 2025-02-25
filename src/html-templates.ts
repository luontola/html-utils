import escapeHtml from "lodash/escape.js"

interface Html {
    html: string;
}

export function html(htmlFragments: TemplateStringsArray, ...placeholders: any[]): Html {
    let html = ""
    for (let i = 0; i < htmlFragments.length; i++) {
        html += htmlFragments[i]
        html += placeholderToHtmlString(placeholders[i])
    }
    return rawHtml(html)
}

function placeholderToHtmlString(placeholder: any): string {
    if (!placeholder) {
        return ""
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
