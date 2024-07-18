import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import { fetch } from 'undici'
import { unified } from 'unified'

export default defineCachedEventHandler(async (event) => {
    const urlToFetch = getRouterParam(event, 'url'); // encodedURIComponent

    if (!urlToFetch) return sendError(event, createError({ statusCode: 400, statusMessage: 'Bad Request' }));

    const decodedUrl = decodeURIComponent(urlToFetch);
    const url = new URL(decodedUrl);

    const markdown = await fetch(url)
        .then(res => {
            return res.text();
        })
        .then(async (html) => {
            let markdown;

            try {
                const file = await unified()
                    .use(rehypeParse, { emitParseErrors: false })
                    .use(rehypeRemark)
                    .use(remarkStringify)
                    .process(html) // TODO: fix `ERROR  Cannot handle unknown node table`

                markdown = String(file);
            } catch (error: any) {
                console.error("Failed to parse HTML:", error?.message);
                markdown = `Failed to parse HTML: ${error?.message}`;
            }

            return markdown;
        })
        .catch((err) => {
            console.error(err);
            return "FAILED";
        })

    // console.info("Markdown:", markdown);

    if (markdown === "FAILED") return sendError(event, createError({ statusCode: 400, statusMessage: 'Bad Request', data: markdown }));

    // console.info("FILE: ", String(markdown));

    return markdown;
})
