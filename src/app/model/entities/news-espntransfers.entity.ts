import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';
import moment from 'moment';

export class NewsEspnTransfersEntity implements NewsSourceInterface {
    id: string;
    name: string;
    url: string;
    active: boolean;
    error?: boolean | undefined;
    loaded?: boolean | undefined;
    news: NewsItemInterface[];

    maxItems = 100;

    constructor({id, name, url, active, error, loaded, news}: Partial<NewsSourceInterface>, private newstrackerService: NewstrackerService) {
        this.id = id || '';
        this.name = name || '';
        this.url = url || '';
        this.active = active || false;
        this.error = error || false;
        this.loaded = loaded || false;
        this.news = news || [];
    }

    getImageUrl(): string {
        const randomInt = Math.floor(Math.random() * 6);
        return `./assets/img/football${randomInt}.png`;
    }

    loadNews(node: Node): void {
        this.news = [];
        const newsNodes: Node[] = this.newstrackerService.findNodesWithClassAttr(node, 'Table__TR');

        newsNodes.forEach((_newsNode, idx) => {

            let title = '';
            let newsDate: Date | undefined = undefined;
            let content = '';
            let tags: string[] = [];
            let imageUrl = '';
            let url = '';

            if (_newsNode.children && _newsNode.children.length>0 && (_newsNode.children[0] as Node).tag==='td') {

                const cells: Node[] =  _newsNode.children as Node[];
                const dateCells: Node[] = this.newstrackerService.findNodesWithTag(cells[0], 'span');
                if (dateCells.length>0) {
                    const dateCell: Node = dateCells[0] as Node;
                    if (dateCell.children) {
                        const currentYear = new Date().getFullYear();
                        const dateItem = moment(`${(dateCell.children[0] as string)} ${currentYear}`, 'MMM D YYYY');
                        newsDate = dateItem.toDate();
                    }
                }
                const playerCells: Node[] = this.newstrackerService.findNodesWithTag(cells[1], 'a');
                if (playerCells.length>0) {
                    const playerCell: Node = playerCells[0] as Node;
                    if (playerCell.children && playerCell.children.length>0) {
                        title = `<span class="text-info">${playerCell.children[0] as string}</span>`;
                    }
                }
                const fromCells: Node[] = this.newstrackerService.findNodesWithTag(cells[2], 'span');
                if (fromCells.length>0) {
                    const fromCell: Node = fromCells[1] as Node;
                    if (fromCell.children && fromCell.children.length>0) {
                        title+=` from ${fromCell.children[0] as string}`;
                    }
                }
                const toCells: Node[] = this.newstrackerService.findNodesWithTag(cells[4], 'span');
                if (toCells.length>0) {
                    const toCell: Node = toCells[1] as Node;
                    if (toCell.children && toCell.children.length>0) {
                        title+=` to ${toCell.children[0] as string}`;
                    }
                }
                const costCells: Node[] = this.newstrackerService.findNodesWithTag(cells[5], 'span');
                if (costCells.length>0) {
                    const costCell: Node = costCells[0] as Node;
                    if (costCell.children && costCell.children.length>0) {
                        title+=` [${costCell.children[0] as string}]`;
                    }
                }
                imageUrl = this.getImageUrl()
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

        this.news = this.news.filter((item, index, self) =>
            index === self.findIndex(t => t.title === item.title && t.content === item.content)
          ).slice(0, this.maxItems);
    }
}