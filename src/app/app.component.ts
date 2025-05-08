import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NewstrackerService } from './services/newstracker.service';
import { NewsSourceInterface } from './model/interfaces/news-source.interface';
import { Node } from './model/interfaces/node.interface';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { HighlightPipe } from './pipes/highlight.pipe';
import { NewsItemInterface } from './model/interfaces/news-item.interface';
import { NewsEfeEntity } from './model/entities/news-efe.entity';
import { NewsElPaisEntity } from './model/entities/news-elpais.entity';
import { NewsEixDiariEntity } from './model/entities/news-eixdiari.entity';
import { NewsAcnEntity } from './model/entities/news-acn.entity';
import { NewsMundoDeportivoEntity } from './model/entities/news-mundodeportivo.entity';
import { NewsEcoDeSitgesEntity } from './model/entities/news-ecodesitges.entity';
import { NewsMirrorEntity } from './model/entities/news-mirror.entity';
import { NewsMuyInteresanteEntity } from './model/entities/news-muyinteresante.entity';
import { NewsSapiensEntity } from './model/entities/news-sapiens.entity';
import { NewsHobbyConsolasEntity } from './model/entities/news-hobbyconsolas.entity';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, HighlightPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'newstracker';

  deviceType!: string;
  isMobile!: boolean;
  isTablet!: boolean;
  isDesktop!: boolean;

  sources: NewsSourceInterface[] = [
    { id: 'efe', name: 'Agencia EFE', url: 'efe.com/espana/', active: false, news: [] },
    { id: 'elpais', name: 'El Pais', url: 'elpais.com', active: false, news: [] },
    { id: 'eixdiari', name: 'Eix Diari', url: 'eixdiari.cat', active: false, news: [] },
    { id: 'acn', name: 'ACN', url: 'acn.cat', active: false, news: [] },
    { id: 'mundodeportivo', name: 'Mundo Deportivo', url: 'mundodeportivo.com', active: false, news: [] },
    { id: 'ecodesitges', name: 'L\'Eco de Sitges', url: 'lecodesitges.cat/sitges-hora-a-hora/', active: false, news: [] },
    { id: 'mirror', name: 'Mirror', url: 'mirror.co.uk', active: false, news: [] },
    { id: 'muyinteresante', name: 'Muy interesante', url: 'muyinteresante.com/', active: false, news: [] },
    { id: 'sapiens', name: 'Sapiens', url: 'sapiens.cat', active: false, news: [] },
    { id: 'hobbyconsolas', name: 'Hobby Consolas', url: 'hobbyconsolas.com/videojuegos/ps5', active: false, news: [] }
  ].map((_source) => {
    _source.active = false;
    return _source;
  }).sort((a, b) => {
    return a.name>b.name ? 1 : -1;
  });

  newsAll: NewsItemInterface[] = [];
  news: NewsItemInterface[] = [];

  displayMode: 'GRID' | 'LIST' = 'LIST';

  searchText$ = new Subject<string>();
  searchText = '';

  showSources = false; // Used for mobile only

  constructor(
    private readonly newstrackerService: NewstrackerService,
    private deviceService: DeviceDetectorService
  ) {

    // Decive config
    this.deviceType = this.deviceService.getDeviceInfo().deviceType;
    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();
    this.isDesktop = this.deviceService.isDesktop();

    // Search text change event config
    this.searchText$
      .pipe(debounceTime(300))
      .subscribe(value => this.doSearch());
  }

  onSearchTextChange(value: string) {
    this.searchText$.next(value.trim());
    this.searchText = value.trim();
  }

  doSearch() {
    console.log('doSearch()', this.searchText);
    this.news = this.newsAll.filter((_newsItem) => {
      return this.searchText.length===0 || 
      _newsItem.title.toLowerCase().indexOf(this.searchText.toLowerCase())>=0 || 
      _newsItem.content.toLowerCase().indexOf(this.searchText.toLowerCase())>=0;
    });
  }

  get activeSources(): number {
    return this.sources.filter((_source) => _source.active).length;
  }

  checkLoadSource(source: NewsSourceInterface) {
    if (source.active) {
      this.loadSourceNews(source);
    } else {
      this.removeSourceNews(source);
    }
  }

  removeSourceNews(source: NewsSourceInterface) {
    this.newsAll = this.news.filter((_newsItem) => {
      return _newsItem.source.id!==source.id;
    });
    this.news = this.newsAll.filter((_newsItem) => {
      return _newsItem.source.id!==source.id;
    });
  }

  timeInformed(date: Date) {
    return date.getHours()>0 && date.getMinutes()>0;
  }

  buildNews(source: NewsSourceInterface, rootNode: Node) {
    // Remove previous loaded news from this source
    this.removeSourceNews(source);

    switch(source.id) {
      case 'efe': 
        const sourceEfeEntity: NewsEfeEntity = new NewsEfeEntity(source, this.newstrackerService);
        sourceEfeEntity.loadNews(rootNode);
        // Add new news from this source
        this.newsAll = this.newsAll.concat(sourceEfeEntity.news).sort(() => Math.random() - 0.5);;
        source.news = sourceEfeEntity.news;
        break;
      case 'elpais': 
        const sourceElPaisEntity: NewsElPaisEntity = new NewsElPaisEntity(source, this.newstrackerService);
        sourceElPaisEntity.loadNews(rootNode);
        // Add new news from this source
        this.newsAll = this.newsAll.concat(sourceElPaisEntity.news).sort(() => Math.random() - 0.5);;
        source.news = sourceElPaisEntity.news;
        break;
      case 'eixdiari': 
        const sourceEixDiariEntity: NewsEixDiariEntity = new NewsEixDiariEntity(source, this.newstrackerService);
        sourceEixDiariEntity.loadNews(rootNode);
        // Add new news from this source
        this.newsAll = this.newsAll.concat(sourceEixDiariEntity.news).sort(() => Math.random() - 0.5);
        source.news = sourceEixDiariEntity.news;
        break;
      case 'acn': 
        const sourceAcnEntity: NewsAcnEntity = new NewsAcnEntity(source, this.newstrackerService);
        sourceAcnEntity.loadNews(rootNode);
        // Add new news from this source
        this.newsAll = this.newsAll.concat(sourceAcnEntity.news).sort(() => Math.random() - 0.5);
        source.news = sourceAcnEntity.news;
        break;
      case 'mundodeportivo': 
        const sourceMendoDeportivoEntity: NewsMundoDeportivoEntity = new NewsMundoDeportivoEntity(source, this.newstrackerService);
        sourceMendoDeportivoEntity.loadNews(rootNode);
        // Add new news from this source
        this.newsAll = this.newsAll.concat(sourceMendoDeportivoEntity.news).sort(() => Math.random() - 0.5);
        source.news = sourceMendoDeportivoEntity.news;
        break;
      case 'ecodesitges': 
        const sourceEcoDeSitgesEntity: NewsEcoDeSitgesEntity = new NewsEcoDeSitgesEntity(source, this.newstrackerService);
        sourceEcoDeSitgesEntity.loadNews(rootNode);
        // Add new news from this source
        this.newsAll = this.newsAll.concat(sourceEcoDeSitgesEntity.news).sort(() => Math.random() - 0.5);
        source.news = sourceEcoDeSitgesEntity.news;
        break;
      case 'mirror': 
        const sourceMirrorEntity: NewsMirrorEntity = new NewsMirrorEntity(source, this.newstrackerService);
        sourceMirrorEntity.loadNews(rootNode);
        // Add new news from this source
        this.newsAll = this.newsAll.concat(sourceMirrorEntity.news).sort(() => Math.random() - 0.5);
        source.news = sourceMirrorEntity.news;
        break;
      case 'muyinteresante': 
        const sourceMuyInteresanteEntity: NewsMuyInteresanteEntity = new NewsMuyInteresanteEntity(source, this.newstrackerService);
        sourceMuyInteresanteEntity.loadNews(rootNode);
        // Add new news from this source
        this.newsAll = this.newsAll.concat(sourceMuyInteresanteEntity.news).sort(() => Math.random() - 0.5);
        source.news = sourceMuyInteresanteEntity.news;
        break;
      case 'sapiens': 
        const sourceSapiensEntity: NewsSapiensEntity = new NewsSapiensEntity(source, this.newstrackerService);
        sourceSapiensEntity.loadNews(rootNode);
        // Add new news from this source
        this.newsAll = this.newsAll.concat(sourceSapiensEntity.news).sort(() => Math.random() - 0.5);
        source.news = sourceSapiensEntity.news;
        break;
      case 'hobbyconsolas': 
        const sourceHobbyConsolasEntity: NewsHobbyConsolasEntity = new NewsHobbyConsolasEntity(source, this.newstrackerService);
        sourceHobbyConsolasEntity.loadNews(rootNode);
        // Add new news from this source
        this.newsAll = this.newsAll.concat(sourceHobbyConsolasEntity.news).sort(() => Math.random() - 0.5);
        source.news = sourceHobbyConsolasEntity.news;
        break;
    }
    this.doSearch();
  }

  loadSourceNews(source: NewsSourceInterface) {
    source.error = false;
    source.loaded = false;
    this.newstrackerService.scrapUrl(source.url).subscribe({
      next: (_res) => {
        source.loaded = true;
        source.error = false;
        this.buildNews(source, _res.html);
      },
      error: (_err) => {
        source.loaded = true;
        source.error = true;
        console.log({error: _err});
      }
    });
  }

  ngOnInit(): void {

    this.sources.filter((_source) => _source.active).forEach((_source) => {
      this.loadSourceNews(_source);
    });

  }
}
