import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsOnzeEntity implements NewsSourceInterface {
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
        const newsNodes: Node[] = this.newstrackerService.findNodesWithClassAttr(node, 'la-une').concat(this.newstrackerService.findNodesWithClassAttr(node, 'rubrique-item'));

        newsNodes.forEach((_newsNode, idx) => {

            let title = '';
            let newsDate: Date | undefined = undefined;
            let content = '';
            let tags: string[] = [];
            let imageUrl = '';
            let url = '';
            
            // Title
            const linkNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'a');
            if (linkNodes.length>0) {
                let linkNode: Node = linkNodes[1];
                let titleNodes: Node[] = this.newstrackerService.findNodesWithClassAttr(_newsNode, 'titre');
                if (titleNodes.length===0) {
                    titleNodes = this.newstrackerService.findNodesWithClassAttr(_newsNode, 'title-article');
                }
                if (titleNodes.length>0) {
                    titleNodes = this.newstrackerService.findNodesWithTag(linkNode, 'a');
                    if (titleNodes.length>0) {
                        const titleNode: Node = titleNodes[0];
                        if (titleNode && titleNode.children && titleNode.children.length>0) {
                            title = titleNode.children[0] as string;
                            url = `${this.newstrackerService.getNodeAttr(titleNode, 'href')}`;
                        }
                    }
                }
            }

            // Link
            if (linkNodes.length>0) {
                let linkNode: Node = linkNodes[0];
                url = this.newstrackerService.getNodeAttr(linkNode, 'href');
                if (!url.startsWith('https://')) {
                    url = `https://${this.url.replace('/es','')}${url}`;
                }
            }

            // Content
            const contentNodes: Node[] = this.newstrackerService.findNodesWithClassAttr(_newsNode, 'synopsis');
            if (contentNodes.length>0 && contentNodes[0].children && contentNodes[0].children.length>0) {
                content = contentNodes[0].children[0] as string;
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
            index === self.findIndex(t => t.title === item.title && t.content === item.content)
          ).slice(0, this.maxItems);
    }
}