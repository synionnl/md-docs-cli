const chalk = require('chalk-next');
const ImageComponent = require('../../components/image-component');
const HtmlParser = require('../html-parser');

module.exports = class ImageHtmlParser extends HtmlParser {
    constructor(options) { 
        super();

        this.component = new ImageComponent(options?.template);
    }

    async parse(element) {
        const elements = element.querySelectorAll('img');

        if (elements.length === 0) {
            console.info(chalk.green(`\t* html contains no image elements`));
            return;
        }

        console.info(chalk.green(`\t* parsing ${elements.length} elements:`));

        for (const element of elements) {
            console.info(chalk.green(`\t\t* parsing ${element.nodeName}`));

            const html = this.component.render({
                html: element.outerHTML
            });
            
            this._replace(element, html);
        }
    }
}