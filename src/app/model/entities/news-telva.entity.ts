import { NewstrackerService } from "../../services/newstracker.service";
import { UtilsService } from "../../services/utils.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsTelvaEntity implements NewsSourceInterface {
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
        const newsNodes: Node[] = this.newstrackerService.findNodesWithTag(node, 'article');

        newsNodes.forEach((_newsNode, idx) => {

            let title = '';
            let newsDate: Date | undefined = undefined;
            let dateStr: string | undefined = undefined;
            let content = '';
            let tags: string[] = [];
            let imageUrl = '';
            let url = '';
            
            // Title
            let linkNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'a');
            let titleNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'h2');
            let imageNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'img');

            if (titleNodes.length>0) {
                const titleNode: Node = titleNodes[0];
                if (titleNode.children && titleNode.children.length>0) {
                    title = titleNode.children[0] as string;
                    // title = UtilsService.fromIso885915ToUtf8(titleNode.children[0] as string);
                    // title = UtilsService.fromLatin1ToUtf8(title);
                }
            }
            if (linkNodes.length>0) {
                const linkNode: Node = linkNodes[0];
                if (linkNode.children && linkNode.children.length>0) {
                    url = this.newstrackerService.getNodeAttr(linkNode, 'href');
                }
                if (!url.startsWith('https://')) {
                    url = `https://${this.url}${this.newstrackerService.getNodeAttr(linkNode, 'href')}`;
                }
            }
            if (imageNodes.length>0) {
                const imageNode: Node = imageNodes[0];
                imageUrl = this.newstrackerService.getNodeAttr(imageNode, 'src');
            } else {
                imageNodes = this.newstrackerService.findNodesWithTag(_newsNode, 'picture');
                if (this.newstrackerService.findNodesWithTag(imageNodes[0], 'noscript').length>0) {
                    const noscriptNodes: Node[] = this.newstrackerService.findNodesWithTag(imageNodes[0], 'noscript');
                    if (noscriptNodes.length>0) {
                        const noscriptNode: Node = noscriptNodes[0];
                        if (noscriptNode.children && noscriptNode.children.length>0) {
                            imageUrl = UtilsService.getAttributeValuesFromHtml(noscriptNode.children[0] as string, 'srcSet');
                        }
                    }
                } else {
                    imageUrl = idx===0? `./assets/img/${this.id}1.png` : `./assets/img/${this.id}2.png`;
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