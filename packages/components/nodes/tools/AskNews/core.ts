import { AskNewsSDK } from '@emergentmethods/asknews-typescript-sdk'
import { Tool } from '@langchain/core/tools'

export const desc = `A portal to the internet. Use this when you need to get specific content from a website. 
Input should be a  url (i.e. https://api.asknews.app/v1/news/search). The output will be the text response of the GET request.`

export interface Headers {
    [key: string]: string
}

export interface RequestParameters {
    headers?: Headers
    url?: string
    description?: string
    maxOutputLength?: number
}

export class RequestsGetTool extends Tool {
    name = 'requests_get'
    url = ''
    description = desc
    maxOutputLength = 2000
    headers: any = {}
    ask: any = {}

    constructor(args?: RequestParameters) {
        super()
        this.url = args?.url ?? this.url
        this.headers = args?.headers ?? this.headers
        this.description = args?.description ?? this.description
        this.maxOutputLength = args?.maxOutputLength ?? this.maxOutputLength

        this.ask = new AskNewsSDK({
            clientId: this.headers.client_id,
            clientSecret: this.headers.client_secret,
            scopes: ['news']
        })
    }

    getQueryParameter = (url: string, parameterName: string): string | null => {
        const urlObj = new URL(url)
        const params = new URLSearchParams(urlObj.search)
        return params.get(parameterName)
    }

    /** @ignore */
    async _call(input: string) {
        const inputUrl = !this.url ? input : this.url

        if (process.env.DEBUG === 'true') console.info(`Making GET API call to ${inputUrl}`)
        let query_str = this.getQueryParameter(input, 'q')
        const response = await this.ask.news.searchNews({
            query: query_str,
            nArticles: 10, // control the number of articles to include in the context
            returnType: 'string', // you can also ask for "dicts" if you want more information
            method: 'both', // use "nl" for natural language for your search, or "kw" for keyword search
            strategy: 'news knowledge' // Strategy to use for searching.
        })

        const res = response.asString

        return res.slice(0, this.maxOutputLength)
    }
}
