import { TextDecoder } from 'text-encoding';
import { load } from 'cheerio';

// The B92 site's encoding is specified in the meta tag located inside the head tag.
const encoding = "UTF-8";
// The API to retrieve comments from the B92 site in HTML format (this needs to be additionally scraped).
const commentsRetrievalAPI = "https://www.b92.net/ajax/get_comments";

function extractLastPathSection(url) {
    const urlObj = new URL(url);
    const pathSections = urlObj.pathname.split('/');
    return pathSections.pop();
}

/**
 * This function extracts comments from the B92 site given the URL of the article's comments
 * and returns them as a list of strings. It can be called as follows:
 * getComments(url).then((comments) => {
 *     // Do something with comments
 * });
 *
 * @param {URL | string | Request} url
 * @returns {Promise<string[]>}
 */
export async function getComments(url) {
    const articleId = extractLastPathSection(url);
    const targetUrl = commentsRetrievalAPI + "?article_id=" + articleId + "&order=time&site_id=3"
    try {
        const response = await fetch(`http://localhost:8080/api/forward?url=${encodeURIComponent(targetUrl)}`);
        if (response.ok) {
            const payload = await response.arrayBuffer();
            const decoder = new TextDecoder(encoding);
            const decodedText = decoder.decode(payload);
            const $ = load(decodedText);
            /*
                Web scraping is inherently brittle, so this might break if the site changes!
                The rule is to find the container that contains comments in a chronological
                order and then extract the text located inside the child paragraph element.
             */
            const commentNodes = $("div.comment-content p");
            return commentNodes
                .map((_, element) => {
                    return $(element).text().replace(/[\t,\n]/g, '');
                })
                .get();
        } else
            console.error("Status code: " + response.status);
    } catch (error) {
        console.error(error);
    }
}