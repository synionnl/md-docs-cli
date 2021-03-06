const chalk = require('chalk-next');
const jsdom = require('jsdom');
const path = require('path');

const HtmlParser = require('../html-parser');

module.exports = class MenuHtmlParser extends HtmlParser {
    constructor({ options, menu, menuComponent, locale, relative, hosting, gitInfo }) { 
        super();

        this.options = options;
        this.menu = menu;
        this.component = menuComponent;
        this.locale = locale;
        this.relative = relative;
        this.hosting = hosting;
        this.gitInfo = gitInfo;
    }

    async parse(element, file) {
        if (!showMenu(file))
            return;

        console.info(chalk.green(`\t* parsing menu`));

        const locale = await this.locale.get();
        const menuItems = await this.menu.items();
        const toc = parseTOC(element);
        const currentUrl = `${path.relative(this.options.dst, file).slice(0, -3)}.html`;
        let root = this.relative.get().root;
        if (this.hosting.rewrite(currentUrl)) {
            root = `/${this.gitInfo.branch.path}`;
        }

        const menu = this.component.render({
            root: root,
            locale: locale,
            menu: menuItems,
            toc: toc,
            currentUrl: currentUrl
        });

        element.prepend(jsdom.JSDOM.fragment(menu));
    }
}

parseTOC = function (element) {
    const toc = element.querySelector('.table-of-contents');
    if (!toc)
        return null;
    
    const html = toc.querySelector('ol').outerHTML;
    toc.parentNode.removeChild(toc);
    return html;
}

function showMenu(file) {
    if (file.endsWith('401.md') || file.endsWith('403.md'))
        return false;
    
    return true;
}