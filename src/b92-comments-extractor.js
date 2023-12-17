import { TextDecoder } from 'text-encoding';
import { load } from 'cheerio';

// The B92 site's encoding is specified in the meta tag located inside the head tag.
const encoding = "windows-1250";

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
    try {
        // We need to chop off the "https://www.b92.net" substring from the URL.
        const response = await fetch(`http://localhost:8080/b92/${url.substring(20)}`);
        if (response.ok) {
            const payload = await response.arrayBuffer();
            const decoder = new TextDecoder(encoding);
            const decodedText = decoder.decode(payload);
            const $ = load(decodedText);
            /*
                Web scraping is inherently brittle, so this might break if the site changes!
                The rule is to find the container that contains comments in a chronological
                order and then traverse the child elements that contain comments.
             */
            const commentNodes = $("#tab-comments-h-tab > div.comments > ol > li");
            return commentNodes
                .map((_, element) => {
                    const childNodes = $(element).contents();
                    // Filter the child nodes by nodeType (3) to get only the text nodes.
                    const textNodes = childNodes.filter((_, node) => node.nodeType === 3);
                    const comment = textNodes.text().replace(/[\t,\n]/g, '');
                    // We need to cut off the "(, )" substring from the end of the comment string.
                    return comment.substring(0, comment.length - 4);
                })
                .get();
        } else
            console.error("Status code: " + response.status);
    } catch (error) {
        console.error(error);
    }
}