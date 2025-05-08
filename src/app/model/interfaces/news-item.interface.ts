import { NewsSourceInterface } from "./news-source.interface";

export interface NewsItemInterface {
    date?: Date,
    title: string,
    content: string,
    source: NewsSourceInterface,
    imageUrl?: string,
    url?: string,
    tags?: string[]
}