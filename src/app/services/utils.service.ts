import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

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

}
