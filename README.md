# Introduction
This project is used purely as an educational material to teach and demonstrate in practice the following topics:

- How to cover the full software development lifecycle in a cloud including deployment of the final product.
- What GitHub offers for achieving the above objective (Git repository, Codespaces, Actions, etc.).
- The benefits of using an AI pair programming technique with GitHub Copilot.
- What is a mashup (a.k.a. application hybrid) and ways to leverage myriad of freely available services in a cloud.
- Basics of the following technologies:
    - React based web application in JavaScript
    - Azure Static Web Apps service
    - Public OpenAI service to analyze and generate text in any natural language.
- How to utilize [GitHub Dependabot](https://github.com/skills/secure-repository-supply-chain) to receive notifications and pull requests regarding version updates and vulnerabilities. 
- How to properly manage secrets in an application.
- The importance of properly separating UI styles from rest of the application logic.
- How to utilize batch processing to combat API rate limits.
- What is web scraping and how to use it to acquire text input.
- How to overcome the CORS limitations when accessing a third party site.

# Usage
The user interface is rudimentary to keep things simple. The *Aggregate* button will trigger the collection of comments from the specified URL and their analysis. 
The summary of comments will show up in the lower part of the UI in English (see the screenshot below).
Using OpenAI to perform translation on-the-fly is an extra feature by which anybody can easily understand what is written in foreign articles.
Finally, it is possible to ask OpenAI to return the summary nicely formatted in HTML, which is useful when the summary is to be published on a website.
This is known as [prompt engineering](https://aws.amazon.com/what-is/prompt-engineering/).

To demonstrate how easy it is to switch to any language, the comments are picked up from the [B92 news site](https://www.b92.net) (in Serbian). This site traditionally has very active comments sections.
All comments are essentially anonymous, as they are associated with arbitrary nicknames chosen by users.
Nonetheless, even these nicknames are removed before processing data via OpenAI.

It is assumed that the user will enter a URL that points to comments section on this site. 
Furthermore, to achieve best results, only sports related articles should be used. 
For example, [this article](https://www.b92.net/sport/komentari.php?nav_id=2097932) is a good candidate. The reason is that such comments are usually short and to the point.

> In order to avoid hitting the OpenAI API rate limit, the application will make a random sample of 50 comments (if there are more than 50 comments). 
> These are later grouped into batches of 20 to decrease the number of calls. These parameters are fixed in this educational project, but they can be easily made configurable.

If the application detects that not all secrets were provided as environment variables, then it will simply print a short message at the screen. A new version will need to be deployed having all these secrets specified.

![Screenshot of the UI](./screenshot-ui.jpg)

> Observe that hitting the *Aggregate* button in succession will produce different responses. This is because the OpenAI service is not deterministic.

# Architecture
The [article](https://httptoolkit.com/blog/cors-proxies/) about CORS proxying is helpful to understand the overall architecture of this application.
It also drives attention to many security concerns that must be addressed when using such a technique.
This application uses an internal CORS server listening at port 8080. The server has a dedicated endpoint
`/api/forward` to proxy GET requests toward any site passed inside the `url` query parameter.
For each site, you also need a separate module that implements the web scraping logic and extracts comments (see the [b92-comments-extractor.js](src/b92-comments-extractor.js) file).

## Web Scraping
The B92 site has no API to access it's content. Therefore, a web scraping technique is used to extract the text from the HTML page. The [cheerio](https://cheerio.js.org/) library is used for this purpose.
To figure out the structure of the HTML page, the _InspectElement_ browser feature was used. The following screenshot shows the HTML structure of the comments section on the B92 site.
To get this structure, right-click on the page where the element of interest is displayed and select _InspectElement_ (or similar) from the context menu.

![Screenshot of the HTML structure](./html-structure.jpg)

All comments are inside the `div` section with an `id="tab-comments-h-tab"` (denotes the tab that lists comments in chronological order).
Each comment is inside a list item of the `div` section with a `class="comments"`. One concrete comment is shown inside a green rectangle.

Web scraping is a very brittle technique. Any change in the HTML structure of the page will break the scraping logic. One way to remedy this problem is make scraping rules external and configurable. This is not done in this project to keep things simple.

> You must ensure that the web scraping logic is not used to extract data from a site that explicitly forbids such a practice. This is usually stated in the site's terms of use.

## Scaling the Application to Handle Large Number of Comments
The OpenAI service has different rate limits depending on the subscription level. The free tier cannot be used to handle large volume of comments.
Besides switching to a paid subscription, the application can be scaled by employing the [MapReduce](https://en.wikipedia.org/wiki/MapReduce) programming model in multiple stages. Namely,
each stage would perform a summarization of a subset of comments. Gradually summaries of summaries would be produced. 
The final stage would aggregate the results from all previous stages.

> Again, any such scaling technique must be used in accordance with the target site's terms of use! This approach is only mentioned for educational purposes.

# Development
This application can be further developed and run either using GitHub Codespaces or using a local IDE and pushing
changes back into the repo. Any change in the `main` branch triggers a GitHub Action to execute a workflow for deploying a new
application using the Azure Static Web Apps service. This process expects a set of secrets,
as described below (see also the [devcontainer.json](.devcontainer/devcontainer.json) file).

## Codespaces 
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/evarga/comments-aggregator)

Wait until the container is fully setup; the last step installs dependencies as specified in the package descriptor. The application should be started from the Terminal window by summoning `npm start`.

> Codespaces leverages the [development containers](https://containers.dev) open standard as a way to boost containers with development related content and settings.  

## Continuous Deployment
First, a new Azure static web application resource must be created, using the Azure Portal or CLI, and its deployment token copied. The [GitHub workflow file](https://github.com/evarga/ai-imager/blob/main/.github/workflows/azure-static-web-apps.yml) should serve as a guidance what [repository secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) must be created (see the `env:` section) including the previously mentioned deployment token (see `COMMENTS_AGGREGATOR_DEPLOYMENT_TOKEN`).

Once the above preconditions are met the system is ready to automatically deploy a new version of this application in Azure. This will happen, for example, on every push into this repository.
