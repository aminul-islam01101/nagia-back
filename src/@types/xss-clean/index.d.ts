declare module "xss-clean";

declare function xssClean(data: any, options?: xssClean.Options): any;

declare namespace xssClean {
  interface Options {
    whiteList?: Record<string, string[]>;
    stripIgnoreTag?: boolean;
    stripIgnoreTagBody?: string;
  }
}
