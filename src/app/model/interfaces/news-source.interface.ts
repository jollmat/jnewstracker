import { NewsItemInterface } from "./news-item.interface";
import { Node } from "./node.interface";

export interface NewsSourceInterface {
    id: string,
    name: string,
    url: string,
    active: boolean,
    loaded?: boolean,
    error?: boolean,
    news: NewsItemInterface[],
    loadNews?: (node: Node) => void
}