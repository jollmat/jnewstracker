import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsVilawebEntity implements NewsSourceInterface {
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
            const linkNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'a');
            if (linkNodes.length===1) {
                const linkNode: Node = linkNodes[0];
                url = this.newstrackerService.getNodeAttr(linkNode, 'href');

                const titleNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'h3');
                if (titleNodes[0].children && titleNodes[0].children.length>0) {
                    title = titleNodes[0].children[0] as string;
                }

                // Content
                const contentNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'p');
                if (contentNodes.length>0 && contentNodes[0].children && contentNodes[0].children.length>0) {
                    content = contentNodes[0].children[0] as string;
                }

                // Image
                let imageNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'img');
                if (imageNodes && imageNodes.length>0) {
                    imageUrl = this.newstrackerService.getNodeAttr(imageNodes[0], 'src');
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