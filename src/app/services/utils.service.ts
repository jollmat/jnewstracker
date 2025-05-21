import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  // Returns a random number from 0 to max
  static getRandomInt(max = 100): number {
    return Math.floor(Math.random() * max);
  }

  // Merges only object2 values matching attributes in the object1
  static mergeMatching<T extends Record<string, any>>(obj1: T, obj2: Partial<T>): T {
    const result: T = { ...obj1 };
    for (const key in obj1) {
      if (Object.prototype.hasOwnProperty.call(obj2, key)) {
        if (
          typeof obj1[key] === "object" &&
          obj1[key] !== null &&
          typeof obj2[key] === "object" &&
          obj2[key] !== null &&
          !Array.isArray(obj1[key])
        ) {
          // Recursively merge nested objects
          result[key] = UtilsService.mergeMatching(obj1[key], obj2[key] as Partial<T[typeof key]>);
        } else {
          // Assign only if the key exists in obj2
          result[key] = obj2[key] as T[typeof key];
        }
      }
    }
    return result;
  }

  static getAttributeValuesFromHtml(htmlString: string, attributeName: string): string {
    const container = document.createElement('div');
    container.innerHTML = htmlString;
  
    const elements = container.querySelectorAll('*');
    let value = '';
  
    elements.forEach(el => {
      if (el.hasAttribute(attributeName)) {
        value = el.getAttribute(attributeName) as string;
      }
    });
  
    return value;
  }

  // From Latin-1 to UTF-8
  static fromLatin1ToUtf8(str: string): string {
    // Step 1: convert broken UTF-16 string to bytes as if it were Latin-1
    const bytes = new Uint8Array([...str].map(char => char.charCodeAt(0)));
    
    // Step 2: decode those bytes correctly as UTF-8
    return new TextDecoder('utf-8').decode(bytes);
  }

  static fromIso885915ToUtf8(str: string): string {
    const bytes = new Uint8Array([...str].map(c => c.charCodeAt(0)));
    return new TextDecoder('iso-8859-15').decode(bytes);
  }

}
