import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';
import { UtilsService } from "../../services/utils.service";

export class NewsVeinteMinutosEntity implements NewsSourceInterface {
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

        const newsNodes: Node[] = this.newstrackerService.findNodesWithTag(node, 'article');

        newsNodes.forEach((_newsNode, idx) => {

            let title = '';
            let newsDate: Date = new Date();
            let content = '';
            let tags: string[] = [];
            let imageUrl = '';
            let url = '';
            
            // Title
            let titleLinks: Node[] = this.newstrackerService.findNodesWithClassAttr(_newsNode, 'c-article__title');
            if (titleLinks.length>0) {
                titleLinks = this.newstrackerService.findNodesWithTag(titleLinks[0], 'a');
                if (titleLinks.length>0) {
                    const titleLink: Node = titleLinks[0];
                    if (titleLink.children && titleLink.children.length>0) {
                        titleLink.children.forEach((_titlePart) => {
                            if(typeof _titlePart==='string') {
                                title += ((title.length>0?' ':'')+_titlePart);
                            } else if (_titlePart.children && _titlePart.children.length>0) {
                                title += ((title.length>0?' ':'') + (_titlePart.children[0] as string));
                            }
                        });
                        url = 'https://' + this.url + '/' + this.newstrackerService.getNodeAttr(titleLink, 'href');
                    }
                }
            }
            
            // Image
            let imageNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'img');
            if (imageNodes.length>0) {
                const imageNode: Node = imageNodes[0];
                if (this.newstrackerService.nodeHasAttribute(imageNode, 'src')) {
                    imageUrl = this.newstrackerService.getNodeAttr(imageNode, 'src');
                } else {
                    imageUrl = `./assets/img/newspaper${UtilsService.getRandomInt(2)}.png`;
                }
            } else {
                imageUrl = `./assets/img/newspaper${UtilsService.getRandomInt(2)}.png`;
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