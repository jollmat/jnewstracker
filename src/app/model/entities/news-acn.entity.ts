import { NewstrackerService } from "../../services/newstracker.service";
import { NewsItemInterface } from "../interfaces/news-item.interface";
import { NewsSourceInterface } from "../interfaces/news-source.interface";
import { Node } from '../interfaces/node.interface';

export class NewsAcnEntity implements NewsSourceInterface {
    id: string;
    name: string;
    url: string;
    active: boolean;
    error?: boolean | undefined;
    loaded?: boolean | undefined;
    news: NewsItemInterface[];

    maxItems = 9;

    constructor({id, name, url, active, error, loaded, news}: Partial<NewsSourceInterface>, private newstrackerService: NewstrackerService) {
        this.id = id || '';
        this.name = name || '';
        this.url = url || '';
        this.active = active || false;
        this.error = error || false;
        this.loaded = loaded || false;
        this.news = news || [];
    }

    base64ToBlob(base64: string, mimeType: any): Blob {
        const byteCharacters = atob(base64); // decode base64
        const byteArrays = [];
      
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArrays.push(byteCharacters.charCodeAt(i));
        }
      
        const byteArray = new Uint8Array(byteArrays);
        return new Blob([byteArray], { type: mimeType });
    }
      

    loadNews(node: Node): void {
        this.news = [];
        const newsNodes: Node[] = this.newstrackerService.findNodesWithTag(node, 'article').slice(0, this.maxItems);
        
        newsNodes.forEach((_newsNode) => {
            let title = '';
            let newsDate: Date | undefined = undefined;
            let content = '';
            let tags: string[] = [];
            let url = '';
            let imageUrl = '';
            // Title
            let titleLinks: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'h3');
            if (titleLinks && titleLinks.length>0 && titleLinks[0].children) {
                title = titleLinks[0].children[0] as string;
                url = `https://${this.url}` + this.newstrackerService.getNodeAttr(this.newstrackerService.findNodesWithTag(_newsNode, 'a')[0], 'href');
            }
            // Image
            const imageNodes: Node[] = this.newstrackerService.findNodesWithTag(_newsNode, 'img');
            if (imageNodes.length>0) {
                /*
                const imageNode: Node = imageNodes[0];
                const encodedImageUrl: string = this.newstrackerService.getNodeAttr(imageNode, 'src');
                const base64 = encodedImageUrl.split(',')[1]; // get only the Base64 part
                console.log(encodedImageUrl);
                const matchesArray: RegExpMatchArray | null = encodedImageUrl.match(/^data:(image\/[^;]+);/);
                if (matchesArray!=null) {
                    const mimeType = matchesArray[1];
                    const blob = this.base64ToBlob(base64, mimeType);
                    imageUrl = URL.createObjectURL(blob);
                    console.log(imageUrl);
                }
                */
               imageUrl = './assets/img/no-image.png';
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
    }
}