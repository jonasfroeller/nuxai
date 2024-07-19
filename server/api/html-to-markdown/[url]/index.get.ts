import rehypeParse from 'rehype-parse'; // parse HTML
import rehypeRemark from 'rehype-remark'; // HTML => Markdown
import remarkGfm from 'remark-gfm'; // support for GitHub Flavored Markdown
import remarkStringify from 'remark-stringify'; // stringify Markdown
import { fetch } from 'undici';
import { unified } from 'unified'; // HTML and Markdown Utilities

export default defineEventHandler(async (event) => {
  const urlToFetch = getRouterParam(event, 'url'); // encodedURIComponent

  if (!urlToFetch)
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: 'Bad Request' }),
    );

  const decodedUrl = decodeURIComponent(urlToFetch);
  const url = new URL(decodedUrl);

  const markdown = await fetch(url)
    .then((res) => {
      return res.text();
    })
    .then(async (html) => {
      let markdown;

      try {
        const file = await unified()
          .use(rehypeParse, { emitParseErrors: false })
          .use(rehypeRemark)
          .use(remarkGfm)
          .use(remarkStringify)
          .process(html);

        markdown = String(file);
      } catch (error: any) {
        console.error('Failed to parse HTML:', error?.message);
        markdown = `Failed to parse HTML: ${error?.message}`;
      }

      return markdown;
    })
    .catch((err) => {
      console.error(err);
      return 'FAILED';
    });

  if (markdown === 'FAILED')
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: markdown,
      }),
    );

  return markdown;
});
