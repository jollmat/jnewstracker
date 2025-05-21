import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsEixDiariEntity implements NewsSourceInterface {
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
        
        newsNodes.forEach((_newsNode) => {
            let title = '';
            let newsDate: Date | undefined = undefined;
            let content = '';
            let tags: string[] = [];
            let url = '';
            let imageUrl = '';
            // Title
            let titleLinks: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'h2');
            if (titleLinks.length===0) {
                titleLinks = this.newstrackerService.findNodesWithTag(_newsNode, 'h4');
            }
            if (titleLinks.length>0 && this.newstrackerService.findNodesWithTag(titleLinks[0], 'a').length>0) {
                url = `https://${this.url}` + this.newstrackerService.getNodeAttr(this.newstrackerService.findNodesWithTag(titleLinks[0], 'a')[0], 'href');
            }
            if (titleLinks.length>0) {
                let isPubli = false;
                if (titleLinks.length===1 && titleLinks[0].children && titleLinks[0].children.length>0) {
                    const titleNode: Node = (titleLinks[0].children[0]) as Node;
                    title = titleNode.children? titleNode.children.toString() : '';
                }
                // Content
                const summaryNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'p');
                if (summaryNodes.length===1 && summaryNodes[0].children && summaryNodes[0].children.length>0) {
                    if (summaryNodes[0].children && typeof summaryNodes[0].children[0]==='string') {
                        content = summaryNodes[0].children[0].toString() + '...';
                    } else {
                        isPubli = true;
                    }
                }
                // Image
                const imageNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'img');
                if (imageNodes.length>0) {
                    imageUrl = `https://${this.url}` + this.newstrackerService.getNodeAttr(imageNodes[0], 'src');
                } else if (this.newstrackerService.getNodeAttr(_newsNode, 'style')!==undefined && typeof this.newstrackerService.getNodeAttr(_newsNode, 'style')==='string') {
                    const imageUrlValue: string[] | null = this.newstrackerService.getNodeAttr(_newsNode, 'style').match(/background-image:\s*url\(([^)]+)\)/);
                    if (imageUrlValue!=null) {
                        imageUrl = `https://${this.url}` + imageUrlValue[1];
                    }
                }

                if (!isPubli && title.length>0) {
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
                
            }
            
        });

        this.news = this.news.filter((item, index, self) =>
            index === self.findIndex(t => t.title === item.title)
          ).slice(0, this.maxItems);
    }
}