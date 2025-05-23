import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';
import { UtilsService } from "../../services/utils.service";

export class NewsAcnEntity implements NewsSourceInterface {
    id: string;
    name: string;
    url: string;
    active: boolean;
    error?: boolean | undefined;
    loaded?: boolean | undefined;
    news: NewsItemInterface[];

    maxItems = 9;

    constructor({id, name, url, active, error, loaded, news}: Partial<NewsSourceInterface>, private newstrackerService: NewstrackerService) {
        this.id = id || '';
        this.name = name || '';
        this.url = url || '';
        this.active = active || false;
        this.error = error || false;
        this.loaded = loaded || false;
        this.news = news || [];
    }

    base64ToBlob(base64: string, mimeType: any): Blob {
        const byteCharacters = atob(base64); // decode base64
        const byteArrays = [];
      
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArrays.push(byteCharacters.charCodeAt(i));
        }
      
        const byteArray = new Uint8Array(byteArrays);
        return new Blob([byteArray], { type: mimeType });
    }
      

    loadNews(node: Node): void {
        this.news = [];
        const newsNodes: Node[] = this.newstrackerService.findNodesWithTag(node, 'article');
        
        newsNodes.forEach((_newsNode) => {
            let title = '';
            let newsDate: Date | undefined = undefined;
            let content = '';
            let tags: string[] = [];
            let url = '';
            let imageUrl = '';
            // Title
            let titleLinks: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'h3');
            if (titleLinks && titleLinks.length>0 && titleLinks[0].children) {
                title = titleLinks[0].children[0] as string;
                url = `https://${this.url}` + this.newstrackerService.getNodeAttr(this.newstrackerService.findNodesWithTag(_newsNode, 'a')[0], 'href');
            }
            imageUrl = `./assets/img/newspaper${UtilsService.getRandomInt(2)}.png`;

            this.news.push({
                title,
                content,
                date: newsDate,
                source: {id: this.id, name: this.name, url: this.url, active: this.active, error: this.error, loaded: this.loaded} as NewsSourceInterface,
                imageUrl,
                url,
                tags
            });
            
        });

        this.news = this.news.filter((item, index, self) =>
            index === self.findIndex(t => t.title === item.title)
          ).slice(0, this.maxItems);
    }
}