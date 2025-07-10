declare module 'markdown-it' {
  interface MarkdownItOptions {
    html?: boolean;
    linkify?: boolean;
    typographer?: boolean;
  }

  class MarkdownIt {
    constructor(options?: MarkdownItOptions);
    render(text: string): string;
  }

  export = MarkdownIt;
}
