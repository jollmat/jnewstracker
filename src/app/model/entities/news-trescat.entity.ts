import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsTresCatEntity implements NewsSourceInterface {
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
        const newsNodes: Node[] = this.newstrackerService.findNodesWithClassAttr(node, 'la-une').concat(this.newstrackerService.findNodesWithClassAttr(node, 'sensePunt'));

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
            if (linkNodes.length>0) {
                const titleNode: Node = linkNodes[1];
                if (titleNode && titleNode.children) {
                    title = titleNode.children[0] as string;
                    url = this.newstrackerService.getNodeAttr(titleNode, 'href');
                }
            }

            // Content
            const dateNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'p');
            if (dateNodes.length>0 && dateNodes[0].children && dateNodes[0].children.length>0) {
                dateStr = dateNodes[0].children[0] as string;
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