import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsMuyInteresanteEntity implements NewsSourceInterface {
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
            let imageUrl = '';
            let url = '';
            // Title
            const titleLinks: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'a');
            if (titleLinks.length>0) {
                const titleNode: Node = titleLinks[0];
                title = (titleNode.children && titleNode.children.length>0)? titleNode.children[0] as string : '';
                url = this.newstrackerService.getNodeAttr(titleNode, 'href');
            }
            // Date
            const newsDates: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'time');
            if (newsDates.length===1) {
                //newsDate = new Date(this.newstrackerService.getNodeAttr(newsDates[0], 'datetime'));
            }
            // Content
            const summaryNodes: Node[] = this.newstrackerService.findNodesWithClassAttr(_newsNode, 'entry-summary');
            if (summaryNodes.length===1 && summaryNodes[0].children && summaryNodes[0].children.length>0) {
                
            }
            // Image
            let imageNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'img');
            if (imageNodes.length>0) {
                imageUrl = this.newstrackerService.getNodeAttr(imageNodes[0], 'src');
            } else {
                imageNodes = this.newstrackerService.findNodesWithTag(_newsNode, 'amp-img');
                if (imageNodes.length>0) {
                    imageUrl = this.newstrackerService.getNodeAttr(imageNodes[0], 'src');
                }
            }
            
            // Tags
            const tagNodes: Node[] = this.newstrackerService.findNodesWithClassAttr(_newsNode, 'cat-links').concat(this.newstrackerService.findNodesWithClassAttr(_newsNode, 'tags-links'));
            tagNodes.forEach((_tagNode) => {
                if (_tagNode.children) {
                    _tagNode.children.forEach((_tagNodeChild) => {
                        if (typeof _tagNodeChild === 'object' && 'tag' in _tagNodeChild && _tagNodeChild['tag']==='a' && _tagNodeChild.children) {
                            tags.push(_tagNodeChild.children[0].toString());
                        }
                    });

                }
            });
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