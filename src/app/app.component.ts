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
import { NewsDiarioAsEntity } from './model/entities/news-diarioas.entity';
import { NewsFranceFootballEntity } from './model/entities/news-francefootball.entity';
import { NewsElSotanoPerdidoEntity } from './model/entities/news-elsotanoperdido.entity';
import { NewsComputerHoyEntity } from './model/entities/news-computerhoy.entity';
import { NewsAbcEntity } from './model/entities/news-abc.entity';
import { NewsLaVanguardiaEntity } from './model/entities/news-lavanguardia.entity';
import { NewsGuerinSportivoEntity } from './model/entities/news-guerinsportivo.entity';
import { NewsTheTimesEntity } from './model/entities/news-thetimes.entity';
import { NewsVeinteMinutosEntity } from './model/entities/news-veinteminutos';
import { NewsXatakaEntity } from './model/entities/news-xataka.entity';
import { NewsCuerpomenteEntity } from './model/entities/news-cuerpomente.entity';
import { NewsSaberVivirEntity } from './model/entities/news-sabervivir.entity';

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

  sources: NewsSourceInterface[] = [];

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
    this.news = this.newsAll.filter((_newsItem) => {
      return this.searchText.length===0 || 
      _newsItem.title.toLowerCase().indexOf(this.searchText.toLowerCase())>=0 || 
      _newsItem.content.toLowerCase().indexOf(this.searchText.toLowerCase())>=0;
    }).map((_newsItem) => {
      if (!_newsItem.imageUrl || _newsItem.imageUrl.trim().length===0) {
        _newsItem.imageUrl = 'assets/img/no-image.png';
      }
      return _newsItem;
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
    this.saveSources();
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

    if (source.active) {
      switch(source.id) {
        case 'efe': 
          const sourceEfeEntity: NewsEfeEntity = new NewsEfeEntity(source, this.newstrackerService);
          sourceEfeEntity.loadNews(rootNode);
          this.newsAll = sourceEfeEntity.news.concat(this.newsAll);
          source.news = sourceEfeEntity.news;
          break;
        case 'elpais': 
          const sourceElPaisEntity: NewsElPaisEntity = new NewsElPaisEntity(source, this.newstrackerService);
          sourceElPaisEntity.loadNews(rootNode);
          this.newsAll = sourceElPaisEntity.news.concat(this.newsAll);
          source.news = sourceElPaisEntity.news;
          break;
        case 'eixdiari': 
          const sourceEixDiariEntity: NewsEixDiariEntity = new NewsEixDiariEntity(source, this.newstrackerService);
          sourceEixDiariEntity.loadNews(rootNode);
          this.newsAll = sourceEixDiariEntity.news.concat(this.newsAll);
          source.news = sourceEixDiariEntity.news;
          break;
        case 'acn': 
          const sourceAcnEntity: NewsAcnEntity = new NewsAcnEntity(source, this.newstrackerService);
          sourceAcnEntity.loadNews(rootNode);
          this.newsAll = sourceAcnEntity.news.concat(this.newsAll);
          source.news = sourceAcnEntity.news;
          break;
        case 'mundodeportivo': 
          const sourceMendoDeportivoEntity: NewsMundoDeportivoEntity = new NewsMundoDeportivoEntity(source, this.newstrackerService);
          sourceMendoDeportivoEntity.loadNews(rootNode);
          this.newsAll = sourceMendoDeportivoEntity.news.concat(this.newsAll);
          source.news = sourceMendoDeportivoEntity.news;
          break;
        case 'ecodesitges': 
          const sourceEcoDeSitgesEntity: NewsEcoDeSitgesEntity = new NewsEcoDeSitgesEntity(source, this.newstrackerService);
          sourceEcoDeSitgesEntity.loadNews(rootNode);
          this.newsAll = sourceEcoDeSitgesEntity.news.concat(this.newsAll);
          source.news = sourceEcoDeSitgesEntity.news;
          break;
        case 'mirror': 
          const sourceMirrorEntity: NewsMirrorEntity = new NewsMirrorEntity(source, this.newstrackerService);
          sourceMirrorEntity.loadNews(rootNode);
          this.newsAll = sourceMirrorEntity.news.concat(this.newsAll);
          source.news = sourceMirrorEntity.news;
          break;
        case 'muyinteresante': 
          const sourceMuyInteresanteEntity: NewsMuyInteresanteEntity = new NewsMuyInteresanteEntity(source, this.newstrackerService);
          sourceMuyInteresanteEntity.loadNews(rootNode);
          this.newsAll = sourceMuyInteresanteEntity.news.concat(this.newsAll);
          source.news = sourceMuyInteresanteEntity.news;
          break;
        case 'sapiens': 
          const sourceSapiensEntity: NewsSapiensEntity = new NewsSapiensEntity(source, this.newstrackerService);
          sourceSapiensEntity.loadNews(rootNode);
          this.newsAll = sourceSapiensEntity.news.concat(this.newsAll);
          source.news = sourceSapiensEntity.news;
          break;
        case 'hobbyconsolas': 
          const sourceHobbyConsolasEntity: NewsHobbyConsolasEntity = new NewsHobbyConsolasEntity(source, this.newstrackerService);
          sourceHobbyConsolasEntity.loadNews(rootNode);
          this.newsAll = sourceHobbyConsolasEntity.news.concat(this.newsAll);
          source.news = sourceHobbyConsolasEntity.news;
          break;
        case 'diarioas': 
          const sourceDiarioAsEntity: NewsDiarioAsEntity = new NewsDiarioAsEntity(source, this.newstrackerService);
          sourceDiarioAsEntity.loadNews(rootNode);
          this.newsAll = sourceDiarioAsEntity.news.concat(this.newsAll);
          source.news = sourceDiarioAsEntity.news;
          break;
        case 'francefootball': 
          const sourceFranceFootballEntity: NewsFranceFootballEntity = new NewsFranceFootballEntity(source, this.newstrackerService);
          sourceFranceFootballEntity.loadNews(rootNode);
          this.newsAll = sourceFranceFootballEntity.news.concat(this.newsAll);
          source.news = sourceFranceFootballEntity.news;
          break;
        case 'elsotanoperdido': 
          const sourceElSotanoPerdidoEntity: NewsElSotanoPerdidoEntity = new NewsElSotanoPerdidoEntity(source, this.newstrackerService);
          sourceElSotanoPerdidoEntity.loadNews(rootNode);
          this.newsAll = sourceElSotanoPerdidoEntity.news.concat(this.newsAll);
          source.news = sourceElSotanoPerdidoEntity.news;
          break;
        case 'computerhoy': 
          const sourceComputerHoyEntity: NewsComputerHoyEntity = new NewsComputerHoyEntity(source, this.newstrackerService);
          sourceComputerHoyEntity.loadNews(rootNode);
          this.newsAll = sourceComputerHoyEntity.news.concat(this.newsAll);
          source.news = sourceComputerHoyEntity.news;
          break;
        case 'abc': 
          const sourceAbcEntity: NewsAbcEntity = new NewsAbcEntity(source, this.newstrackerService);
          sourceAbcEntity.loadNews(rootNode);
          this.newsAll = sourceAbcEntity.news.concat(this.newsAll);
          source.news = sourceAbcEntity.news;
          break;
        case 'lavanguardia': 
          const sourceLaVanguardiaEntity: NewsLaVanguardiaEntity = new NewsLaVanguardiaEntity(source, this.newstrackerService);
          sourceLaVanguardiaEntity.loadNews(rootNode);
          this.newsAll = sourceLaVanguardiaEntity.news.concat(this.newsAll);
          source.news = sourceLaVanguardiaEntity.news;
          break;
        case 'guerinsportivo': 
          const sourceGuerinSportivoEntity: NewsGuerinSportivoEntity = new NewsGuerinSportivoEntity(source, this.newstrackerService);
          sourceGuerinSportivoEntity.loadNews(rootNode);
          this.newsAll = sourceGuerinSportivoEntity.news.concat(this.newsAll);
          source.news = sourceGuerinSportivoEntity.news;
          break;
        case 'thetimes': 
          const sourceTheTimesEntity: NewsTheTimesEntity = new NewsTheTimesEntity(source, this.newstrackerService);
          sourceTheTimesEntity.loadNews(rootNode);
          this.newsAll = sourceTheTimesEntity.news.concat(this.newsAll);
          source.news = sourceTheTimesEntity.news;
          break;
        case 'veinteminutos': 
          const sourceVeinteMinutosEntity: NewsVeinteMinutosEntity = new NewsVeinteMinutosEntity(source, this.newstrackerService);
          sourceVeinteMinutosEntity.loadNews(rootNode);
          this.newsAll = sourceVeinteMinutosEntity.news.concat(this.newsAll);
          source.news = sourceVeinteMinutosEntity.news;
          break;
        case 'xataka': 
          const sourceXatakaEntity: NewsXatakaEntity = new NewsXatakaEntity(source, this.newstrackerService);
          sourceXatakaEntity.loadNews(rootNode);
          this.newsAll = sourceXatakaEntity.news.concat(this.newsAll);
          source.news = sourceXatakaEntity.news;
          break;
        case 'cuerpomente': 
          const sourceCuerpomenteEntity: NewsCuerpomenteEntity = new NewsCuerpomenteEntity(source, this.newstrackerService);
          sourceCuerpomenteEntity.loadNews(rootNode);
          this.newsAll = sourceCuerpomenteEntity.news.concat(this.newsAll);
          source.news = sourceCuerpomenteEntity.news;
          break;
        case 'sabervivir': 
          const sourceSaberVivirEntity: NewsSaberVivirEntity = new NewsSaberVivirEntity(source, this.newstrackerService);
          sourceSaberVivirEntity.loadNews(rootNode);
          this.newsAll = sourceSaberVivirEntity.news.concat(this.newsAll);
          source.news = sourceSaberVivirEntity.news;
          break;
      }
      if (this.sources.filter((_source) => _source.active && !_source.loaded).length===0) {
        this.showSources = false;
      }
      this.doSearch();
    }
    
  }

  saveSources() {
    this.newstrackerService.saveSources(this.sources);
  }

  loadSourceNews(source: NewsSourceInterface) {
    this.saveSources();
    source.error = false;
    source.loaded = false;
    this.newstrackerService.scrapUrl(source.url).subscribe({
      next: (_res) => {
        source.loaded = true;
        source.error = false;
        if (source.active) {
          this.buildNews(source, _res.html);
        }
      },
      error: (_err) => {
        source.loaded = true;
        source.error = true;
        console.log({error: _err});
      }
    });
  }

  getNewsBgImageStyle(newsItem: NewsItemInterface): string {
    if (!newsItem.imageUrl || newsItem.imageUrl.trim().length===0) {
      return '';
    }
    if (this.isMobile && newsItem.imageUrl.endsWith('no-image.png')) {
      return `background-image: url(\'${newsItem.imageUrl}\');background-repeat: no-repeat;background-size: 135px;background-position: top;background-position-y: 10px;`;
    }
    return `background-image: url(\'${newsItem.imageUrl}\'); height: 300px; background-size: cover;`;
  }

  ngOnInit(): void {

    // Load sources
    this.sources = this.newstrackerService.getSources().sort((a, b) => {
      return a.name>b.name ? 1 : -1;
    }).map((_source) => {
      _source.error = false;
      _source.loaded = false;
      _source.news = [];
      return _source;
    });

    console.log('sources', this.sources);


    // Load sources news
    this.sources.filter((_source) => _source.active).forEach((_source) => {
      this.loadSourceNews(_source);
    });

  }
}
