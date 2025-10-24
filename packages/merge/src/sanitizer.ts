import DOMPurify from 'isomorphic-dompurify';

/**
 * Maximum allowed content length (1MB)
 * Prevents DoS attacks via extremely large content
 */
const MAX_CONTENT_LENGTH = 1024 * 1024; // 1MB

/**
 * Configuration for DOMPurify sanitization
 * Uses a whitelist approach - only explicitly allowed elements/attributes pass through
 */
const SANITIZE_CONFIG: DOMPurify.Config = {
  // Allowed HTML tags - only safe, semantic elements
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'b',
    'i',
    's',
    'del',
    'ins',
    'mark',
    'small',
    'sub',
    'sup',
    'a',
    'ul',
    'ol',
    'li',
    'dl',
    'dt',
    'dd',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'code',
    'pre',
    'span',
    'div',
    'section',
    'article',
    'header',
    'footer',
    'aside',
    'nav',
    'main',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    'caption',
    'figure',
    'figcaption',
    'hr',
    'abbr',
    'cite',
    'q',
    'time',
  ],

  // Allowed attributes - only safe attributes that don't execute code
  ALLOWED_ATTR: [
    'href',
    'title',
    'class',
    'id',
    'aria-label',
    'aria-describedby',
    'aria-hidden',
    'role',
    'lang',
    'dir',
    'datetime',
    'cite',
    'abbr',
  ],

  // Explicitly forbid dangerous tags (defense in depth)
  FORBID_TAGS: [
    'script',
    'iframe',
    'embed',
    'object',
    'applet',
    'style',
    'link',
    'meta',
    'base',
    'form',
    'input',
    'button',
    'textarea',
    'select',
    'option',
    'frame',
    'frameset',
    'svg',
    'math',
    'video',
    'audio',
    'canvas',
  ],

  // Forbid all event handler attributes
  FORBID_ATTR: [
    'onclick',
    'ondblclick',
    'onmousedown',
    'onmouseup',
    'onmouseover',
    'onmousemove',
    'onmouseout',
    'onmouseenter',
    'onmouseleave',
    'onkeydown',
    'onkeypress',
    'onkeyup',
    'onload',
    'onerror',
    'onabort',
    'onblur',
    'onchange',
    'onfocus',
    'oninput',
    'oninvalid',
    'onreset',
    'onselect',
    'onsubmit',
    'onscroll',
    'onwheel',
    'oncopy',
    'oncut',
    'onpaste',
    'ondrag',
    'ondragend',
    'ondragenter',
    'ondragleave',
    'ondragover',
    'ondragstart',
    'ondrop',
    'ontouchstart',
    'ontouchmove',
    'ontouchend',
    'ontouchcancel',
    'onanimationstart',
    'onanimationend',
    'onanimationiteration',
    'ontransitionend',
    'onpointerdown',
    'onpointerup',
    'onpointercancel',
    'onpointermove',
    'onpointerover',
    'onpointerout',
    'onpointerenter',
    'onpointerleave',
    'ongotpointercapture',
    'onlostpointercapture',
  ],

  // Only allow http, https, and mailto URLs
  ALLOWED_URI_REGEXP:
    /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,

  // Keep text content of forbidden elements (safer than removing completely)
  KEEP_CONTENT: true,

  // Return a DOM element instead of string for better performance
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,

  // Additional safety options
  SAFE_FOR_TEMPLATES: true,
  WHOLE_DOCUMENT: false,
  FORCE_BODY: false,
};

/**
 * Sanitization result with metadata about what was blocked
 */
export interface SanitizationResult {
  /** Sanitized HTML content safe for insertion */
  html: string;
  /** Whether any dangerous content was removed */
  hadDangerousContent: boolean;
  /** Human-readable warning message if content was sanitized */
  warning?: string;
}

/**
 * List of dangerous HTML tags that should be encoded rather than stripped
 * This preserves the content when LLM is trying to show examples
 */
const DANGEROUS_TAGS = [
  'script',
  'iframe',
  'embed',
  'object',
  'applet',
  'style',
  'link',
  'meta',
  'base',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
];

/**
 * Encodes dangerous HTML tags to HTML entities
 * This preserves the content visually while preventing execution
 * Example: <script> becomes &lt;script&gt;
 */
function encodeDangerousTags(html: string): string {
  let encoded = html;

  // Encode each dangerous tag (both opening and closing)
  DANGEROUS_TAGS.forEach((tag) => {
    // Match opening tags: <tag...> or <tag ...>
    const openingRegex = new RegExp(`<${tag}([\\s>])`, 'gi');
    encoded = encoded.replace(openingRegex, `&lt;${tag}$1`);

    // Match closing tags: </tag>
    const closingRegex = new RegExp(`</${tag}>`, 'gi');
    encoded = encoded.replace(closingRegex, `&lt;/${tag}&gt;`);
  });

  return encoded;
}

/**
 * Detects if HTML contains potentially dangerous elements before sanitization
 * Used to provide user warnings
 */
function detectDangerousContent(html: string): boolean {
  const dangerousPatterns = [
    /<script[\s>]/i,
    /<iframe[\s>]/i,
    /<embed[\s>]/i,
    /<object[\s>]/i,
    /\son\w+\s*=/i, // Event handlers like onclick=
    /javascript:/i,
    /data:text\/html/i,
    /vbscript:/i,
  ];

  return dangerousPatterns.some((pattern) => pattern.test(html));
}

/**
 * Sanitizes HTML content using DOMPurify
 * Removes all dangerous elements and attributes while preserving safe content
 *
 * @param html - Raw HTML content from LLM
 * @returns Sanitization result with safe HTML and warning information
 * @throws Error if content exceeds size limit or sanitization fails
 */
export function sanitizeHTML(html: string): SanitizationResult {
  // Input validation
  if (typeof html !== 'string') {
    throw new Error('Invalid input: HTML must be a string');
  }

  // Check content length to prevent DoS
  if (html.length > MAX_CONTENT_LENGTH) {
    throw new Error(
      `Content too large: ${html.length} bytes (max: ${MAX_CONTENT_LENGTH})`,
    );
  }

  // Check for dangerous content before sanitization
  const hadDangerousContent = detectDangerousContent(html);

  try {
    // First, encode dangerous tags to HTML entities
    // This preserves them as visible text rather than stripping them
    const encoded = encodeDangerousTags(html);

    // Then sanitize the HTML
    const sanitized = DOMPurify.sanitize(encoded, SANITIZE_CONFIG);

    // Additional validation: ensure we got a string back
    if (typeof sanitized !== 'string') {
      throw new Error('Sanitization failed: unexpected return type');
    }

    const result: SanitizationResult = {
      html: sanitized,
      hadDangerousContent,
    };

    // Add warning if dangerous content was detected
    if (hadDangerousContent) {
      result.warning =
        'Potentially unsafe content was detected and encoded (script tags, iframes, etc. are now displayed as text)';
    }

    return result;
  } catch (error) {
    // Log error for debugging but don't expose details to user
    console.error('Sanitization error:', error);
    throw new Error('Failed to sanitize HTML content');
  }
}

/**
 * Sanitizes HTML with fallback to plain text if sanitization fails
 * This provides graceful degradation for corrupted or invalid HTML
 *
 * @param html - Raw HTML content from LLM
 * @returns Sanitization result, or plain text version if sanitization fails
 */
export function sanitizeHTMLSafe(html: string): SanitizationResult {
  try {
    return sanitizeHTML(html);
  } catch (error) {
    console.error('Sanitization failed, falling back to plain text:', error);

    // Extract text content only as safe fallback
    const textOnly = html.replace(/<[^>]*>/g, '');

    return {
      html: textOnly,
      hadDangerousContent: true,
      warning:
        'Content could not be safely sanitized. Displaying as plain text.',
    };
  }
}
