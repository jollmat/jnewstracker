import { HttpClient } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../src/environments/environment';
import { Node } from '../model/interfaces/node.interface';

@Injectable({
  providedIn: 'root'
})
export class NewstrackerService {

  constructor(
    private readonly http: HttpClient
  ) { }

  scrapUrl(url: string): Observable<{html: Node}> {
    const safeUrl = encodeURIComponent(url);
    return this.http.get<{html: Node}>(`${environment.scrapApi}/scrape/${safeUrl}`);
  }

  nodeHasClass(node: Node, className: string) {
    return this.getNodeClass(node).indexOf(className)>=0;
  }
  getNodeClass(node: Node): string {
    if (node.attrs!==undefined && node.attrs['class']) {
      return node.attrs['class'] || '';
    }
    return '';
  }
  getNodeAttr(node: Node, attr: string): string {
    if (node.attrs) {
      return node.attrs[attr];
    }
    return '';
  }

  findNodesWithTag(node: Node, tagValue: string, results: Node[] = []): Node[] {
    if (node.tag===tagValue) {
      results.push(node);
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        if (typeof child === 'object') {
          this.findNodesWithTag(child, tagValue, results);
        }
      }
    }
    return results;
  }

  findNodesWithClassAttr(node: Node, classValue: string, results: Node[] = []): Node[] {
    if (node.attrs && node.attrs['class'] && (node.attrs['class']===classValue || node.attrs['class'].split(' ').includes(classValue))) {
      results.push(node);
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        if (typeof child === 'object') {
          this.findNodesWithClassAttr(child, classValue, results);
        }
      }
    }
    return results;
  }
}
