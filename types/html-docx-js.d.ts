declare module 'html-docx-js/dist/html-docx' {
  interface HtmlDocxOptions {
    orientation?: string;
    margins?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
      header?: number;
      footer?: number;
      gutter?: number;
    };
  }

  const htmlDocx: {
    asBlob(html: string, options?: HtmlDocxOptions): Blob;
    asBlob(html: string, options?: HtmlDocxOptions): Promise<Blob>;
    asBlob(html: string, options?: HtmlDocxOptions): any;
    asBlob(html: string, options?: HtmlDocxOptions): any;
  };

  export = htmlDocx;
}
