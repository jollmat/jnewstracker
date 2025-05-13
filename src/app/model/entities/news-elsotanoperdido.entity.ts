import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsElSotanoPerdidoEntity implements NewsSourceInterface {
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
        const newsNodes: Node[] = this.newstrackerService.findNodesWithClassAttr(node, 'itemContainer');

        newsNodes.forEach((_newsNode) => {
            let title = '';
            let newsDate: Date | undefined = undefined;
            let content = '';
            let tags: string[] = [];
            let imageUrl = '';
            let url = '';
            // Title
            const titleNodes: Node[] = this.newstrackerService.findNodesWithClassAttr(_newsNode, 'catItemTitle');
            if (titleNodes && titleNodes.length>0) {
                const titleNode: Node = titleNodes[0];
                const linkNodes: Node[] = this.newstrackerService.findNodesWithTag(titleNode, 'a');
                if (linkNodes && linkNodes.length>0) {
                    const linkNode: Node = linkNodes[0];
                    title = (linkNode.children && linkNode.children.length>0)? linkNode.children[0] as string : '';
                    url = `https://www.elsotanoperdido.com/${this.newstrackerService.getNodeAttr(linkNode, 'href')}`;

                    let imageNodes: Node[] =  this.newstrackerService.findNodesWithClassAttr(_newsNode, 'catItemImage');
                    if (imageNodes.length>0) {
                        imageNodes = this.newstrackerService.findNodesWithTag(imageNodes[0], 'img');
                        if (imageNodes.length>0) {
                            const imageNode: Node = imageNodes[0];
                            imageUrl = `https://www.elsotanoperdido.com/${this.newstrackerService.getNodeAttr(imageNode, 'src')}`;
                        }
                    }
                }
                /*
                const linkNode: Node = titleNodes[0];
                title = titleNode.children && titleNode.children.length>0 ? titleNode.children[0] as string : '';
                */
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