import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsFranceFootballEntity implements NewsSourceInterface {
    id: string;
    name: string;
    url: string;
    active: boolean;
    error?: boolean | undefined;
    loaded?: boolean | undefined;
    news: NewsItemInterface[];

    maxItems = 12;

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
            let imageUrl = '';
            let url = '';
            // Title
            const titleNodes: Node[] = this.newstrackerService.findNodesWithClassAttr(_newsNode, 'ColeaderWidget__title');
            if (titleNodes && titleNodes.length>0) {
                console.log({titleNodes});
                const titleNode: Node = titleNodes[0];
                title = titleNode.children && titleNode.children.length>0 ? titleNode.children[0] as string : '';
            }
            // Link
            const linkNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'a');
            if (linkNodes.length>0) {
                let linkNode: Node = linkNodes[0];
                if (linkNode.attrs && linkNode.attrs) {
                    url = this.newstrackerService.getNodeAttr(linkNode, 'href');
                }
            }
            // Image
            let imageNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'img');
            if (imageNodes.length>0) {
                imageUrl = this.newstrackerService.getNodeAttr(imageNodes[0], 'src');
            }
            //if (title.length>0) {
                this.news.push({
                    title,
                    content,
                    date: newsDate,
                    source: {id: this.id, name: this.name, url: this.url, active: this.active, error: this.error, loaded: this.loaded} as NewsSourceInterface,
                    imageUrl,
                    url,
                    tags
                });
            //}
        });

        this.news = this.news.filter((item, index, self) =>
            index === self.findIndex(t => t.title === item.title)
          ).slice(0, this.maxItems);
    }
}