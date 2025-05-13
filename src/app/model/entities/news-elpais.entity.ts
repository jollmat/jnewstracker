import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsElPaisEntity implements NewsSourceInterface {
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
            let title = '';
            let newsDate: Date = new Date();
            let content = '';
            let tags: string[] = [];
            let imageUrl = '';
            let url = '';
            // Title
            const titleLinks: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'h2');

            if (titleLinks.length===1) {
                const titleNode: Node = titleLinks[0];
                const linkNodes: Node[] = this.newstrackerService.findNodesWithTag(titleNode, 'a');
                if (linkNodes.length>0) {
                    const linkNode: Node = linkNodes[0];
                    if (linkNode.children) {
                        const titleIndex = linkNode.children.findIndex((_child) => typeof _child==='string');
                        title = linkNode.children[titleIndex] as string;
                        url = this.newstrackerService.getNodeAttr(linkNode, 'href');
                    }
                    
                }
            }
            // Content
            const summaryNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'p');
            if (summaryNodes.length===1 && summaryNodes[0].children && summaryNodes[0].children.length>0) {
                if (summaryNodes[0].children) {
                    content = summaryNodes[0].children[0].toString() + '...';
                }
            }
            // Image
            const imageNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'img');
            if (imageNodes.length>0) {
                imageUrl = this.newstrackerService.getNodeAttr(imageNodes[0], 'src');
            }

            if (title.length>0 && (content.length>0 || imageUrl.length>0)) {
                this.news.push({
                    title,
                    content,
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