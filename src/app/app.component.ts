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
import { NewsSourceGroupInterface } from './model/interfaces/news-source-group.interface';
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
import { NewsNationalGeographicEntity } from './model/entities/news-nationalgeographic.entity';
import { NewsRevistaGadgetEntity } from './model/entities/news-revistagadget.entity';
import { NewsQuoEntity } from './model/entities/news-quo.entity';
import { NewsEspacioMisterioEntity } from './model/entities/news-espaciomisterio.entity';
import { NewsAngularUniversityEntity } from './model/entities/news-angularuniversity.entity';
import { NewsLaCiutatEntity } from './model/entities/news-laciutat.entity';
import { NewsMarcaEntity } from './model/entities/news-marca.entity';
import { NewsSportEntity } from './model/entities/news-sport.entity';
import { NewsFourFourTwoEntity } from './model/entities/news-fourfourtwo.entity';
import { NewsTransferMarktEntity } from './model/entities/news-transfermarkt.entity';
import { NewsOnzeEntity } from './model/entities/news-onze.entity';
import { NewsEspnTransfersEntity } from './model/entities/news-espntransfers.entity';
import { NewsAngularLoveEntity } from './model/entities/news-angularlove.entity';
import { NewsTresCatEntity } from './model/entities/news-trescat.entity'; 

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
  sourceGroups: NewsSourceGroupInterface[] = [];

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
    this.isMobile = this.deviceService.isMobile() && this.isMobileScreen();
    this.isTablet = this.deviceService.isTablet() || this.isTabletScreen();
    this.isDesktop = this.deviceService.isDesktop() && this.isDesktopScreen();

    /*
    console.group('Device info');
    console.log('userAgent', navigator.userAgent);
    console.log('deviceType', this.deviceType);
    console.log('width', window.innerWidth);
    console.log('isMobile', this.isMobile);
    console.log('isTablet', this.isTablet);
    console.log('isDesktop', this.isDesktop);
    console.groupEnd();
    */

    // Search text change event config
    this.searchText$
      .pipe(debounceTime(300))
      .subscribe(value => this.doSearch());
  }

  get numActiveSources(): number {
    return this.sources.filter((_source) => _source.active).length;
  }
  get activeSources(): NewsSourceInterface[] {
    return this.sources.filter((_source) => _source.active);
  }
  get inactiveSources(): NewsSourceInterface[] {
    return this.sources.filter((_source) => !_source.active);
  }

  isTabletScreen(): boolean {
    const width = window.innerWidth;
    return width >= 768 && width <1200;
  }

  isMobileScreen(): boolean {
    return window.innerWidth <= 767;
  }

  isDesktopScreen(): boolean {
    return window.innerWidth >= 1200;
  }

  onSearchTextChange(value: string) {
    this.searchText$.next(value.trim());
    this.searchText = value.trim();
  }

  timeInformed(date: Date) {
    return date.getHours()>0 && date.getMinutes()>0;
  }

  /* Sources & news */
  doSearch() {
    this.news = this.newsAll.filter((_newsItem) => {
      return this.searchText.length===0 || 
      _newsItem.title.toLowerCase().indexOf(this.searchText.toLowerCase())>=0 || 
      _newsItem.content.toLowerCase().indexOf(this.searchText.toLowerCase())>=0;
    }).map((_newsItem) => {
      if (!_newsItem.imageUrl || _newsItem.imageUrl.trim().length===0) {
        _newsItem.imageUrl = this.newstrackerService.getDefaultImage();
      }
      return _newsItem;
    });
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
        case 'nationalgeographic': 
          const sourceNationalGeographicEntity: NewsNationalGeographicEntity = new NewsNationalGeographicEntity(source, this.newstrackerService);
          sourceNationalGeographicEntity.loadNews(rootNode);
          this.newsAll = sourceNationalGeographicEntity.news.concat(this.newsAll);
          source.news = sourceNationalGeographicEntity.news;
          break;
        case 'revistagadget': 
          const sourceRevistaGadgetEntity: NewsRevistaGadgetEntity = new NewsRevistaGadgetEntity(source, this.newstrackerService);
          sourceRevistaGadgetEntity.loadNews(rootNode);
          this.newsAll = sourceRevistaGadgetEntity.news.concat(this.newsAll);
          source.news = sourceRevistaGadgetEntity.news;
          break;
        case 'quo': 
          const sourceQuoEntity: NewsQuoEntity = new NewsQuoEntity(source, this.newstrackerService);
          sourceQuoEntity.loadNews(rootNode);
          this.newsAll = sourceQuoEntity.news.concat(this.newsAll);
          source.news = sourceQuoEntity.news;
          break;
        case 'espaciomisterio': 
          const sourceEspacioMisterioEntity: NewsEspacioMisterioEntity = new NewsEspacioMisterioEntity(source, this.newstrackerService);
          sourceEspacioMisterioEntity.loadNews(rootNode);
          this.newsAll = sourceEspacioMisterioEntity.news.concat(this.newsAll);
          source.news = sourceEspacioMisterioEntity.news;
          break;
        case 'angularuniversity': 
          const sourceAngularUniversityEntity: NewsAngularUniversityEntity = new NewsAngularUniversityEntity(source, this.newstrackerService);
          sourceAngularUniversityEntity.loadNews(rootNode);
          this.newsAll = sourceAngularUniversityEntity.news.concat(this.newsAll);
          source.news = sourceAngularUniversityEntity.news;
          break;
        case 'laciutat': 
          const sourceLaCiutatEntity: NewsLaCiutatEntity = new NewsLaCiutatEntity(source, this.newstrackerService);
          sourceLaCiutatEntity.loadNews(rootNode);
          this.newsAll = sourceLaCiutatEntity.news.concat(this.newsAll);
          source.news = sourceLaCiutatEntity.news;
          break;
        case 'marca': 
          const sourceMarcaEntity: NewsMarcaEntity = new NewsMarcaEntity(source, this.newstrackerService);
          sourceMarcaEntity.loadNews(rootNode);
          this.newsAll = sourceMarcaEntity.news.concat(this.newsAll);
          source.news = sourceMarcaEntity.news;
          break;
        case 'sport': 
          const sourceSportEntity: NewsSportEntity = new NewsSportEntity(source, this.newstrackerService);
          sourceSportEntity.loadNews(rootNode);
          this.newsAll = sourceSportEntity.news.concat(this.newsAll);
          source.news = sourceSportEntity.news;
          break;
        case 'fourfourtwo': 
          const sourceFourFourTwoEntity: NewsFourFourTwoEntity = new NewsFourFourTwoEntity(source, this.newstrackerService);
          sourceFourFourTwoEntity.loadNews(rootNode);
          this.newsAll = sourceFourFourTwoEntity.news.concat(this.newsAll);
          source.news = sourceFourFourTwoEntity.news;
          break;
        case 'fourfourtwo-premier': 
          const sourceFourFourTwoPremierEntity: NewsFourFourTwoEntity = new NewsFourFourTwoEntity(source, this.newstrackerService);
          sourceFourFourTwoPremierEntity.loadNews(rootNode);
          this.newsAll = sourceFourFourTwoPremierEntity.news.concat(this.newsAll);
          source.news = sourceFourFourTwoPremierEntity.news;
          break;
        case 'fourfourtwo-laliga': 
          const sourceFourFourTwoLaLigaEntity: NewsFourFourTwoEntity = new NewsFourFourTwoEntity(source, this.newstrackerService);
          sourceFourFourTwoLaLigaEntity.loadNews(rootNode);
          this.newsAll = sourceFourFourTwoLaLigaEntity.news.concat(this.newsAll);
          source.news = sourceFourFourTwoLaLigaEntity.news;
          break;
        case 'transfermarkt': 
          const sourceTransferMarktEntity: NewsTransferMarktEntity = new NewsTransferMarktEntity(source, this.newstrackerService);
          sourceTransferMarktEntity.loadNews(rootNode);
          this.newsAll = sourceTransferMarktEntity.news.concat(this.newsAll);
          source.news = sourceTransferMarktEntity.news;
          break;
        case 'onze': 
          const sourceOnzeEntity: NewsOnzeEntity = new NewsOnzeEntity(source, this.newstrackerService);
          sourceOnzeEntity.loadNews(rootNode);
          this.newsAll = sourceOnzeEntity.news.concat(this.newsAll);
          source.news = sourceOnzeEntity.news;
          break;
        case 'espntransfers': 
          const sourceEspnTransfersEntity: NewsEspnTransfersEntity = new NewsEspnTransfersEntity(source, this.newstrackerService);
          sourceEspnTransfersEntity.loadNews(rootNode);
          this.newsAll = sourceEspnTransfersEntity.news.concat(this.newsAll);
          source.news = sourceEspnTransfersEntity.news;
          break;
        case 'angularlove': 
          const sourceAngularLoveEntity: NewsAngularLoveEntity = new NewsAngularLoveEntity(source, this.newstrackerService);
          sourceAngularLoveEntity.loadNews(rootNode);
          this.newsAll = sourceAngularLoveEntity.news.concat(this.newsAll);
          source.news = sourceAngularLoveEntity.news;
          break;
        case 'trescat': 
          const sourceTresCatEntity: NewsTresCatEntity = new NewsTresCatEntity(source, this.newstrackerService);
          sourceTresCatEntity.loadNews(rootNode);
          this.newsAll = sourceTresCatEntity.news.concat(this.newsAll);
          source.news = sourceTresCatEntity.news;
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

  /* Source groups */
  loadSourceGroups() {
    this.sourceGroups = this.newstrackerService.getSourceGroups().sort((a, b) => {
      return a.name>b.name? 1 : -1;
    });
  }
  toggleSourceGroup(sourceGroup: NewsSourceGroupInterface) {
    if (this.isSourceGroupSelected(sourceGroup)) {
      this.unselectSourceGroup(sourceGroup);
    } else {
      this.selectSourceGroup(sourceGroup);
    }
  }
  isSourceGroupSelected(sourceGroup: NewsSourceGroupInterface): boolean {
    return sourceGroup.sources.length === this.sources.filter((_source) => {
      return _source.active && sourceGroup.sources.includes(_source.id);
    }).length;
  }
  selectSourceGroup(sourceGroup: NewsSourceGroupInterface) {
    this.sources.forEach((_source) => {
      if (sourceGroup.sources.includes(_source.id)) {
        if (!_source.active) {
          _source.active = true;
          this.checkLoadSource(_source);
        }
      }
    });
  }
  unselectSourceGroup(sourceGroup: NewsSourceGroupInterface) {
    this.sources.forEach((_source) => {
      if (sourceGroup.sources.includes(_source.id)) {
        if (_source.active) {
          _source.active = false;
          this.checkLoadSource(_source);
        }
      }
    });
  }

  getNewsBgImageStyle(newsItem: NewsItemInterface): string {
    if (!newsItem.imageUrl || newsItem.imageUrl.trim().length===0) {
      return '';
    }
    return `background-image: url(\'${newsItem.imageUrl}\'); height: 300px; background-size: cover;`;
  }

  getDefaultImage(): string {
    return this.newstrackerService.getDefaultImage();
  }

  getDarkHexColor(): string {
    const r = Math.floor(Math.random() * 128); // 0–127
    const g = Math.floor(Math.random() * 128);
    const b = Math.floor(Math.random() * 128);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  generateBgStyle(): string {
    function getRandomHexColor() {
      return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    }
    function getRandomGradient() {
      const color1 = getRandomHexColor();
      const color2 = getRandomHexColor();
      const angle = Math.floor(Math.random() * 360);
      return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    }
    return getRandomGradient();
  }

  ngOnInit(): void {

    // Load sources
    this.sources = this.newstrackerService.getSources().sort((a, b) => {
      return a.name>b.name ? 1 : -1;
    }).map((_source) => {
      _source.error = false;
      _source.loaded = false;
      _source.news = [];
      if (!_source.active || !_source.bgStyle) {
        _source.bgStyle = this.generateBgStyle();
      }
      return _source;
    });

    // Load sources news
    this.sources.filter((_source) => _source.active).forEach((_source) => {
      this.loadSourceNews(_source);
    });

    // Source groups
    this.loadSourceGroups();

    const sourcesWithNoGroup: NewsSourceInterface[] = this.sources.filter((_source) => {
      return !this.sourceGroups.some((_sourceGroup) => {
        return _sourceGroup.sources.includes(_source.id);
      });
    });
    if (sourcesWithNoGroup.length>0) {
      console.warn('Sources with no group', sourcesWithNoGroup);
    }
  }
}
