import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsMundoDeportivoEntity implements NewsSourceInterface {
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
            let titleLinks: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'h2');
            if (titleLinks && titleLinks.length>0 && titleLinks[0].children) {
                const titleNode: Node = titleLinks[0].children[0] as Node;
                title = (titleNode.children) ? titleNode.children[0].toString() : '';
                url = `https://${this.url}` + this.newstrackerService.getNodeAttr(this.newstrackerService.findNodesWithTag(_newsNode, 'a')[0], 'href');
            }
            // Image
            const imageNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'img');
            if (imageNodes.length>0) {
                imageUrl = `` + this.newstrackerService.getNodeAttr(imageNodes[0], 'data-src');
                if (imageUrl.startsWith('/files')) {
                    imageUrl = `https://${this.url}` + imageUrl;
                }
            }

            if (title.length>0) {
                this.news.push({
                    title,
                    content,
                    date: newsDate,
                    source: {id: this.id, name: this.name, url: this.url, active: this.active, error: this.error, loaded: this.loaded} as NewsSourceInterface,
                    imageUrl,
                    url,
                    tags
                });
            }
            
        });

        this.news = this.news.filter((item, index, self) =>
            index === self.findIndex(t => t.title === item.title)
          ).slice(0, this.maxItems);
    }
}