import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsNacioDigitalEntity implements NewsSourceInterface {
    id: string;
    name: string;
    url: string;
    active: boolean;
    error?: boolean | undefined;
    loaded?: boolean | undefined;
    news: NewsItemInterface[];

    maxItems = 15;

    constructor({id, name, url, active, error, loaded, news}: Partial<NewsSourceInterface>, private newstrackerService: NewstrackerService) {
        this.id = id || '';
        this.name = name || '';
        this.url = url || '';
        this.active = active || false;
        this.error = error || false;
        this.loaded = loaded || false;
        this.news = news || [];
    }

    loadNews(node: Node): void {
        this.news = [];
        const newsNodes: Node[] = this.newstrackerService.findNodesWithTag(node, 'article');

        newsNodes.forEach((_newsNode, idx) => {

            //console.log(_newsNode);

            let title = '';
            let newsDate: Date | undefined = undefined;
            let dateStr: string | undefined = undefined;
            let content = '';
            let tags: string[] = [];
            let imageUrl = '';
            let url = '';
            
            // Title
            const linkNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'a');
            const imageNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'img');
            if (linkNodes.length>0 && imageNodes.length>0) {
                title = this.newstrackerService.getNodeAttr((linkNodes[0] as Node), 'title') || '';
                url = this.newstrackerService.getNodeAttr((linkNodes[0] as Node), 'href');
                if (this.newstrackerService.getNodeAttr((imageNodes[0] as Node), 'src').startsWith('https:')) {
                    imageUrl = `${this.newstrackerService.getNodeAttr((imageNodes[0] as Node), 'src')}`;
                } else {
                    imageUrl = `https:${this.newstrackerService.getNodeAttr((imageNodes[0] as Node), 'src')}`;
                }
            }
            
            if (title.length>0) {
                this.news.push({
                    title,
                    content,
                    date: newsDate,
                    dateStr: dateStr,
                    source: {id: this.id, name: this.name, url: this.url, active: this.active, error: this.error, loaded: this.loaded} as NewsSourceInterface,
                    imageUrl,
                    url,
                    tags
                });
            }
        });

        this.news = this.news.filter((item, index, self) =>
            index === self.findIndex(t => t.title === item.title && t.content === item.content)
          ).slice(0, this.maxItems);
    }
}