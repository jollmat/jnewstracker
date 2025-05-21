import { UtilsService } from "../../services/utils.service";
import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsAbcEntity implements NewsSourceInterface {
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
            let url = '';
            let imageUrl = '';
            // Title
            let titleLinks: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'h2');
            if (titleLinks.length>0) {
                let titleLink: Node = titleLinks[0];
                titleLinks = this.newstrackerService.findNodesWithTag(titleLink, 'a');
                if (titleLinks && titleLinks.length>0) {
                    const titleLink: Node = titleLinks[0];
                    if (titleLink.children && titleLink.children.length>0) {
                        if (typeof titleLink.children[0] === 'string') {
                            title = titleLink.children && titleLink.children.length>0? titleLink.children[0] as string : '';
                        } else if (this.newstrackerService.findNodesWithTag(titleLink, 'strong').length>0) {
                            const titleNode: Node = this.newstrackerService.findNodesWithTag(titleLink, 'strong')[0];
                            title = (titleNode.children)? titleNode.children[0] as string : '';
                            title += ` ${titleLink.children[1]}`;
                        }
                        url = this.newstrackerService.getNodeAttr(titleLink, 'href');
                    }
                }
            }
            // Image
            let imageLinks: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'img');
            if (imageLinks.length>0) {
                const imageLink: Node = imageLinks[0];
                imageUrl = this.newstrackerService.getNodeAttr(imageLink, 'src');
            } else {
                imageUrl = `./assets/img/newspaper${UtilsService.getRandomInt(2)}.png`;
            }
            
            this.news.push({
                title,
                content,
                date: newsDate,
                source: {id: this.id, name: this.name, url: this.url, active: this.active, error: this.error, loaded: this.loaded} as NewsSourceInterface,
                imageUrl,
                url,
                tags
            });
            
        });

        this.news = this.news.filter((item, index, self) =>
            index === self.findIndex(t => t.title === item.title)
          ).slice(0, this.maxItems);
    }
}