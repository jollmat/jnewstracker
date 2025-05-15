import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsLaCiutatEntity implements NewsSourceInterface {
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

            // Categories
            const categoriesNodes: Node[] = this.newstrackerService.findNodesWithClassAttr(_newsNode, 'post-categories');
            if (categoriesNodes.length===1) {
                const categoriesNode: Node = categoriesNodes[0];
                if (categoriesNode.children && categoriesNode.children.length>0) {
                    title+='['
                    categoriesNode.children.forEach((_catItem) => {
                        let listItemNode: Node = _catItem as Node;
                        if (listItemNode.children) {
                            listItemNode = listItemNode.children[0] as Node;
                            if (listItemNode.children) {
                                if (title.length>1) {
                                    title+=', ';
                                }
                                title+=(listItemNode.children[0] as string);
                            }
                        }
                    });
                    title+='] - ';
                }
            }

            // Title
            let titleLinks: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'h2');
            if (titleLinks.length>0) {
                titleLinks = this.newstrackerService.findNodesWithTag(titleLinks[0], 'a');
                if (titleLinks.length>0) {
                    const titleLink: Node = titleLinks[0];
                    title += (titleLink.children)? titleLink.children[0] as string : '';
                    url = this.newstrackerService.getNodeAttr(titleLink, 'href');
                }
            }
            
            // Image
            let imageNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'img');
            if (imageNodes.length) {
                imageUrl = this.newstrackerService.getNodeAttr(imageNodes[0], 'data-src');
            }

            // URL
            const linkNodes: Node[] = this.newstrackerService.findNodesWithClassAttr(_newsNode, 'post-card-content-link');
            if (linkNodes.length>0) {
                const linkNode: Node = linkNodes[0];
                url = `https://${this.url}${this.newstrackerService.getNodeAttr(linkNode,'href')}`;
            }

            // Content
            const contentNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'p');
            if (contentNodes.length>0) {
                const contentNode: Node = contentNodes[0];
                content = contentNode.children && contentNode.children.length>0? contentNode.children[0] as string : '';
            }

            if (title.length>0) {
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