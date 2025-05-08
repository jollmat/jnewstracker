import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';
import moment from 'moment';

export class NewsEcoDeSitgesEntity implements NewsSourceInterface {
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
        const newsNodes: Node[] = this.newstrackerService.findNodesWithClassAttr(node, 'td-cpt-hora_a_hora').slice(0, this.maxItems);

        newsNodes.forEach((_newsNode) => {
            let title = '';
            let newsDate: Date | undefined = undefined;
            let content = '';
            let tags: string[] = [];
            let url = '';
            let imageUrl = '';
            // Title
            let titleLinks: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'a');
            if (titleLinks.length>0) {
                const titleNode: Node = titleLinks[0];
                url = this.newstrackerService.getNodeAttr(titleNode, 'href');
                title = titleNode.children? (titleNode.children[0] as string).replace(/^.*?h\. ?/, '').trim() : '';
            }
            // Date
            const timeNodes = this.newstrackerService.findNodesWithTag(_newsNode, 'time');
            if (timeNodes.length===1) {
                const timeNode = timeNodes[0];
                if (timeNode.children && timeNode.children.length>0) {
                    const dateStr: string = timeNode.children[0] as string;
                    newsDate = moment(dateStr, 'DD/MM/YYYY').toDate();
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
        console.log(this.news);
    }
}