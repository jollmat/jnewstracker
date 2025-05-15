import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsSportEntity implements NewsSourceInterface {
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
            let newsDate: Date | undefined = undefined;
            let content = '';
            let tags: string[] = [];
            let imageUrl = '';
            let url = '';
            
            // Title
            
            const titleNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'h2');
            if (titleNodes.length>0) {
                let titleNode: Node = titleNodes[0];
                if (titleNode.children) {
                    titleNode = titleNode.children[0] as Node;
                    title = titleNode.children ? titleNode.children[0] as string : '';
                }               
            }

            // Link
            const linkNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'a');
            if (linkNodes.length>0) {
                let linkNode: Node = linkNodes[0];
                url = this.newstrackerService.getNodeAttr(linkNode, 'href');
                if (!url.startsWith('https://')) {
                    url = `https://${this.url.replace('/es','')}${url}`;
                }
            }

            // Image
            let imageNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'img');
            if (imageNodes.length>0) {
                imageUrl = this.newstrackerService.getNodeAttr(imageNodes[0], 'src');
                if (imageUrl.startsWith('data:image')) {
                    imageNodes = this.newstrackerService.findNodesWithTag(_newsNode, 'picture');
                    if (imageNodes.length>0) {
                        imageNodes = this.newstrackerService.findNodesWithTag(imageNodes[0], 'img');
                        imageUrl = imageNodes.length>0? this.newstrackerService.getNodeAttr(imageNodes[0], 'src') : '';
                    }
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