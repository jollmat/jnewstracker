import { UtilsService } from "../../services/utils.service";
import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsElEconomistaEntity implements NewsSourceInterface {
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
            let titleNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'header');
            if (titleNodes.length>0) {
                let titleNode: Node = titleNodes[0];
                if (titleNode.children && titleNode.children.length>0) {
                    titleNodes = this.newstrackerService.findNodesWithTag(titleNode, 'a');
                    if (titleNodes.length>0) {
                        titleNode = titleNodes[0];
                        if (titleNode.children && titleNode.children.length>0) {
                            titleNode.children.forEach((_child) => {
                                if (typeof _child === 'string') {
                                    title = _child as string;
                                }
                            });
                        }
                        if (title.length===0) {
                            titleNodes = this.newstrackerService.findNodesWithTag(titleNode, 'h2');
                            if (titleNodes.length>0) {
                                titleNode = titleNodes[0];
                                if (titleNode.children && titleNode.children.length>0) {
                                    title = titleNode.children[0] as string;
                                }
                            }
                        }
                    }
                }
            }

            // Content
            const contentNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'p');
            if (contentNodes.length>0) {
                const contentNode: Node = contentNodes[0];
                if (contentNode.children && contentNode.children.length>0) {
                    content = contentNode.children[0] as string;
                }
            }

            // Link
            let linkNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'a');
            if (linkNodes.length>0) {
                let linkNode: Node = linkNodes[0];
                url = this.newstrackerService.getNodeAttr(linkNode, 'href');
            }

            // Image
            const imageNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'img');
            if (imageNodes.length>0) {
                imageUrl = this.newstrackerService.getNodeAttr(imageNodes[0], 'src');
            } else {
                imageUrl = `./assets/img/financial${UtilsService.getRandomInt(3)}.png`;
            }

            if (title && title.length>0) {
                console.log({imageNodes});
                console.log({title, content, url, imageUrl});
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