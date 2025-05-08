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
        const newsNodes: Node[] = this.newstrackerService.findNodesWithTag(node, 'article').slice(0, this.maxItems);
        newsNodes.forEach((_newsNode) => {
            let title = '';
            let newsDate: Date = new Date();
            let content = '';
            let tags: string[] = [];
            let imageUrl = '';
            let url = '';
            // Title
            const titleLinks: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'header');
            if (titleLinks.length===1) {
                if (this.newstrackerService.findNodesWithTag(titleLinks[0], 'h2').length===1 && this.newstrackerService.findNodesWithTag(titleLinks[0], 'h2')[0].children) {
                    const titleNodes: (string | Node)[] | undefined = this.newstrackerService.findNodesWithTag(titleLinks[0], 'h2')[0].children;
                    if (titleNodes && titleNodes.length===1) {
                        const titleNode = titleNodes[0] as Node;
                        if (titleNode && titleNode.children) {
                            url = this.newstrackerService.getNodeAttr(titleNode, 'href');
                            titleNode.children.forEach((tnChild) => {
                                if (typeof tnChild === 'string') {
                                    title = tnChild;
                                }
                            });
                        }
                        
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

            if (content.length>0 && imageUrl.length>0) {
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
    }
}