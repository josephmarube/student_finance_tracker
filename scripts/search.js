/*
Compile a search string into a RegExp.
Always case-insensitive.
search is always "i" per requirements).
Returns null if input is empty or regex is invalid.
*/
export function compileRegex(input) {
    if (!input || !input.trim()) return null;
    try {
        return new RegExp(input.trim(), "i");   // always case-insensitive
    } catch {
        return null;
    }
}

/*
Wrap matched portions of text in <mark> tags.
Safe against XSS — only wraps already-escaped plain text.
*/
export function highlight(text, re) {
    if (!re) return escapeHtml(text);
    return escapeHtml(text).replace(
        new RegExp(re.source, re.flags),
        m => `<mark>${m}</mark>`
    );
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
