import sanitizeHtml from 'sanitize-html';

export function sanitizePublication(html) {
  return sanitizeHtml(html || '', {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'video', 'source', 'iframe', 'u', 's'],
    allowedAttributes: {
      '*': ['style'],
      a: ['href', 'title'],
      img: ['src', 'alt', 'width', 'height', 'class'],
      iframe: ['src', 'width', 'height', 'title', 'allowfullscreen'],
      video: ['src', 'controls', 'width', 'height', 'poster'],
      source: ['src', 'type'],
      td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan']
    },
    allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'],
    allowIframeRelativeUrls: false,
    allowedClasses: { img: ['img-responsive','img-float-left','img-float-right','img-center','img-inline'] },
    allowedStyles: { '*': {
      'text-align': [/^(left|right|center|justify)$/],
      'color': [/^(#[0-9a-f]{3,8}|[a-z]+|rgba?\([\d., %]+\))$/i],
      'background-color': [/^(#[0-9a-f]{3,8}|[a-z]+|rgba?\([\d., %]+\))$/i],
      'font-size': [/^\d+(\.\d+)?(px|pt|em|rem|%)$/],
      'font-family': [/^[a-zA-Z ,"'-]+$/],
      'text-decoration': [/^(underline|line-through)$/]
    } },
    allowedSchemes: ['https', 'http', 'mailto'], allowProtocolRelative: false
  });
}
