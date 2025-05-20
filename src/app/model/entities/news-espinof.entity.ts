import { NewstrackerService } from "../../services/newstracker.service";
import { UtilsService } from "../../services/utils.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsEspinofEntity implements NewsSourceInterface {
    id: string;
    name: string;
    url: string;
    active: boolean;
    error?: boolean | undefined;
    loaded?: boolean | undefined;
    news: NewsItemInterface[];

    maxItems = 25;

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

            let title = '';
            let newsDate: Date | undefined = undefined;
            let dateStr: string | undefined = undefined;
            let content = '';
            let tags: string[] = [];
            let imageUrl = '';
            let url = '';
            
            // Title
            let titleNodes: Node[] = this.newstrackerService.findNodesWithClassAttr(_newsNode, 'abstract-title');
            let imageNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'img');

            if (titleNodes.length>0) {
                titleNodes = this.newstrackerService.findNodesWithTag(titleNodes[0], 'a');
                if (titleNodes.length) {
                    const titleNode: Node = titleNodes[0];
                    title = titleNode.children && titleNode.children.length>0 ? (titleNode.children[0] as string) : '';
                    url = this.newstrackerService.getNodeAttr(titleNode, 'href');
                }
            }
            if (imageNodes.length>0) {
                const imageNode: Node = imageNodes[0];
                imageUrl = this.newstrackerService.getNodeAttr(imageNode, 'src');
            } else {
                imageUrl = (idx%2===0) ? './assets/img/cinema1.png' : './assets/img/cinema2.png';
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