const chalk = require('chalk-next');

const HtmlParser = require('../html-parser');

module.exports = class FullscreenHtmlParser extends HtmlParser {
    constructor({ fullscreenComponent }) { 
        super();

        this.component = fullscreenComponent
    }

    async parse(element) {
        Array.from(element.querySelectorAll('code')).forEach(e => e.parentNode.setAttribute('fullscreen', 'fullscreen'));
        
        const elements = element.querySelectorAll('[fullscreen]');

        if (elements.length === 0) {
            console.info(chalk.green(`\t* html contains no fullscreen elements`));
            return;
        }

        console.info(chalk.green(`\t* parsing ${elements.length} fullscreen elements:`));

        for (const element of elements) {
            element.removeAttribute('fullscreen');
            console.info(chalk.green(`\t\t* parsing ${element.nodeName}`));

            const html = this.component.render({
                html: element.outerHTML
            });
            
            this._replace(element, html);
        }
    }
}