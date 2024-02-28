import { JSDOM } from "jsdom";
export const htmlstr2body = (h: string) => new JSDOM(h).window.document.body;
