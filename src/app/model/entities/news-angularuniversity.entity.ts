import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsAngularUniversityEntity implements NewsSourceInterface {
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
            // Title
            let titleLinks: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'h2');
            if (titleLinks.length>0) {
                const titleLink: Node = titleLinks[0];
                title = (titleLink.children)? titleLink.children[0] as string : '';
                url = this.newstrackerService.getNodeAttr(titleLink, 'href');
            }
            
            // Image
            imageUrl = './assets/img/angularuniversity.png';

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