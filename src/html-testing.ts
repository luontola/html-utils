import type {Html} from "./html-templates.js"

export function visualizeHtml(html: string | null | undefined | Html): string {
    if (!html) {
        return ""
    }
    if (typeof html !== "string") {
        return visualizeHtml(html.html)
    }
    // custom visualization using data-test-icon attribute
    html = html.replace(/<[^<>]+\bdata-test-icon="(.*?)".*?>/g, " $1 ")
    // strip all HTML tags
    html = html.replace(/<\/?(a|abbr|b|big|cite|code|em|i|small|span|strong|tt)\b.*?>/g, "") // inline elements
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
