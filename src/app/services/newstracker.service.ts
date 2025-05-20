import { HttpClient } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../src/environments/environment';
import { Node } from '../model/interfaces/node.interface';

import { NewsSourceInterface } from '../model/interfaces/news-source.interface';
import { NewsSourceGroupInterface } from '../model/interfaces/news-source-group.interface';

@Injectable({
  providedIn: 'root'
})
export class NewstrackerService {

  APP_STORED_NEWS_SOURCES = 'APP_STORED_NEWS_SOURCES';

  constructor(
    private readonly http: HttpClient
  ) { }

  scrapUrl(url: string): Observable<{html: Node}> {
    const safeUrl = encodeURIComponent(url);
    return this.http.get<{html: Node}>(`${environment.scrapApi}/scrape/${safeUrl}`);
  }

  nodeHasAttribute(node: Node, attrName: string) {
    return node.attrs && node.attrs[attrName]!==undefined;
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

  findNodesWithAttributeValue(node: Node, attributeName: string, attributeValue: string, results: Node[] = []): Node[] {
    if (node.attrs && node.attrs[attributeName] && node.attrs[attributeName]===attributeValue) {
      results.push(node);
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        if (typeof child === 'object') {
          this.findNodesWithAttributeValue(child, attributeName, attributeValue, results);
        }
      }
    }
    return results;
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

  saveSources(sources: NewsSourceInterface[]): void {
    localStorage.setItem(this.APP_STORED_NEWS_SOURCES, JSON.stringify(sources));
  }

  getDefaultImage(): string {
    const randomInt = Math.floor(Math.random() * 27);
    return `assets/img/default${randomInt}.png`;
  }

  getSources(): NewsSourceInterface[] {

    const defaultSources: NewsSourceInterface[] = [
      { id: 'efe', name: 'Agencia EFE', url: 'efe.com/espana/', active: false, news: [] },
      { id: 'elpais', name: 'El Pais', url: 'elpais.com', active: false, news: [] },
      { id: 'eixdiari', name: 'Eix Diari', url: 'eixdiari.cat', active: false, news: [] },
      { id: 'acn', name: 'ACN', url: 'acn.cat', active: false, news: [] },
      { id: 'mundodeportivo', name: 'Mundo Deportivo', url: 'mundodeportivo.com', active: false, news: [] },
      { id: 'ecodesitges', name: 'L\'Eco de Sitges', url: 'lecodesitges.cat/sitges-hora-a-hora/', active: false, news: [] },
      { id: 'mirror', name: 'Mirror', url: 'mirror.co.uk', active: false, news: [] },
      { id: 'muyinteresante', name: 'Muy interesante', url: 'muyinteresante.com/', active: false, news: [] },
      { id: 'sapiens', name: 'Sapiens', url: 'sapiens.cat', active: false, news: [] },
      { id: 'hobbyconsolas', name: 'Hobby Consolas', url: 'hobbyconsolas.com/videojuegos/ps5', active: false, news: [] },
      { id: 'diarioas', name: 'Diario AS', url: 'as.com', active: false, news: [] },
      { id: 'francefootball', name: 'France Football', url: 'francefootball.fr', active: false, news: [] },
      { id: 'elsotanoperdido', name: 'El Sótano Perdido', url: 'elsotanoperdido.com/noticias/Tracks/ps5', active: false, news: [] },
      { id: 'computerhoy', name: 'Computer Hoy', url: 'computerhoy.20minutos.es/', active: false, news: [] },
      { id: 'abc', name: 'ABC', url: 'abc.es', active: false, news: [] },
      { id: 'lavanguardia', name: 'La Vanguardia', url: 'lavanguardia.com', active: false, news: [] },
      { id: 'guerinsportivo', name: 'Guerin Sportivo', url: 'guerinsportivo.it', active: false, news: [] },
      { id: 'thetimes', name: 'The Times', url: 'thetimes.com', active: false, news: [] },
      { id: 'veinteminutos', name: '20 minutos', url: '20minutos.es', active: false, news: [] },
      { id: 'xataka', name: 'Xataka', url: 'xataka.com', active: false, news: [] },
      { id: 'cuerpomente', name: 'Cuerpomente', url: 'cuerpomente.com', active: false, news: [] },
      { id: 'sabervivir', name: 'Saber Vivir', url: 'sabervivirtv.com', active: false, news: [] },
      { id: 'nationalgeographic', name: 'National Geographic', url: 'nationalgeographic.com.es/', active: false, news: [] },
      { id: 'revistagadget', name: 'Revista Gadget', url: 'revista-gadget.es/', active: false, news: [] },
      { id: 'quo', name: 'Quo', url: 'quo.eldiario.es/', active: false, news: [] },
      { id: 'espaciomisterio', name: 'Espacio Misterio', url: 'espaciomisterio.com/', active: false, news: [] },
      { id: 'angularuniversity', name: 'Angular University', url: 'blog.angular-university.io/', active: false, news: [] },
      { id: 'laciutat', name: 'La Ciutat (Garraf)', url: 'laciutat.cat/es/laciutatdelgarraf-es', active: false, news: [] },
      { id: 'marca', name: 'Marca', url: 'marca.com', active: false, news: [] },
      { id: 'sport', name: 'Sport', url: 'sport.es/es/', active: false, news: [] },
      { id: 'fourfourtwo', name: 'Four Four Two (Transfers)', url: 'fourfourtwo.com/transfer-news', active: false, news: [] },
      { id: 'fourfourtwo-premier', name: 'Four Four Two (Premier)', url: 'fourfourtwo.com/premier-league', active: false, news: [] },
      { id: 'fourfourtwo-laliga', name: 'Four Four Two (La Liga)', url: 'fourfourtwo.com/la-liga', active: false, news: [] },
      { id: 'transfermarkt', name: 'Transfermarkt', url: 'transfermarkt.es', active: false, news: [] },
      { id: 'onze', name: 'Onze', url: 'onzemondial.com/', active: false, news: [] },
      { id: 'espntransfers', name: 'ESPN Transfers', url: 'espn.com/soccer/transfers', active: false, news: [] },
      { id: 'angularlove', name: 'Angular.love', url: 'angular.love/news', active: false, news: [] },
      { id: 'trescat', name: '3Cat', url: '3cat.cat/324/ultimes-noticies/', active: false, news: [] },
      { id: 'vilaweb', name: 'VilaWeb', url: 'vilaweb.cat/categoria/pais/principat/', active: false, news: [] },
      { id: 'naciodigital', name: 'Nació Digital', url: 'naciodigital.cat/', active: false, news: [] },
      { id: 'visitsitges', name: 'Visit Sitges', url: 'visitsitges.com/ca/noticies/', active: false, news: [] },
      { id: 'vogue', name: 'Vogue', url: 'vogue.es/', active: false, news: [] },
      { id: 'glamour', name: 'Glamour', url: 'glamour.es', active: false, news: [] },
      { id: 'telva', name: 'Telva', url: 'telva.com', active: false, news: [] },
      { id: 'elle', name: 'Elle', url: 'elle.com/es/', active: false, news: [] },
      { id: 'fotogramas', name: 'Fotogramas', url: 'fotogramas.es', active: false, news: [] },
      { id: 'espinof', name: 'Espinof', url: 'espinof.com/categoria/estrenos', active: false, news: [] }
    ];

    const removableSources: string[] = ['canalblau', 'infosalus', 'lastminute'];
    const storedSourcesStr: string | null = localStorage.getItem(this.APP_STORED_NEWS_SOURCES);

    if(storedSourcesStr && storedSourcesStr!=null) {
      let storedSources: NewsSourceInterface[] = JSON.parse(storedSourcesStr) as NewsSourceInterface[];

      if (removableSources.length>0) {
        storedSources = storedSources.filter((_storedSource) => {
          return !removableSources.some((_removableSourceId) => _removableSourceId===_storedSource.id);
        });
      }

      // Overwrite stored source attributes from defaults
      storedSources.forEach((_storedSource) => {
        const defaultSource: NewsSourceInterface | undefined = defaultSources.find((_defaultSource) => _defaultSource.id===_storedSource.id);
        if (defaultSource) {
          _storedSource.url = defaultSource.url;
          _storedSource.name = defaultSource.name;
        }
      });

      const newSources: NewsSourceInterface[] = defaultSources.filter(
        defaultSource => !storedSources.some(storedSource => storedSource.id === defaultSource.id)
      );
      return storedSources.concat(newSources);
    } else {
      this.saveSources(defaultSources);
    }
    return defaultSources;
  }

  getSourceGroups(): NewsSourceGroupInterface[] {
    const defaultSourceGroups: NewsSourceGroupInterface[] = [
      { 
        name: 'Sports', 
        sources: ['mundodeportivo', 'francefootball', 'guerinsportivo', 'marca', 'sport', 'diarioas', 'fourfourtwo', 'fourfourtwo-premier', 'fourfourtwo-laliga', 'transfermarkt', 'onze', 'espntransfers']
      },
      { 
        name: 'Local News', 
        sources: ['eixdiari', 'ecodesitges', 'laciutat', 'trescat', 'acn', 'vilaweb', 'naciodigital', 'visitsitges'] 
      },
      { 
        name: 'Generic News', 
        sources: ['efe', 'elpais', 'acn', 'mirror', 'abc', 'lavanguardia', 'thetimes', 'veinteminutos', 'trescat'] 
      },
      { 
        name: 'Health', 
        sources: ['cuerpomente', 'sabervivir'] 
      },
      { 
        name: 'Tech & Gaming', 
        sources: ['hobbyconsolas', 'elsotanoperdido', 'computerhoy', 'xataka', 'revistagadget'] 
      },
      { 
        name: 'Science', 
        sources: ['muyinteresante', 'sapiens', 'nationalgeographic', 'quo', 'espaciomisterio'] 
      },
      { 
        name: 'Programmimg', 
        sources: ['angularuniversity', 'angularlove'] 
      },
      { 
        name: 'Fashion', 
        sources: ['vogue', 'glamour', 'telva', 'elle'] 
      },
      { 
        name: 'Cinema', 
        sources: ['fotogramas', 'espinof'] 
      }
    ];
    return defaultSourceGroups;
  }

}
