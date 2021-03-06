const files = require('../../files');
const yaml = require('js-yaml');
const chalk = require('chalk-next');


module.exports = class DefinitionStore {
    #data = null;

    constructor({ options }) {
        this.options = options;
    }

    async init() {
        await this.get();
    }

    async get() {
        if (this.#data != null)
            return this.#data;
        
        console.info();

        this.#data = [];
        if (!await files.exists(this.options.definitionsFile)) {
            console.info(chalk.yellow(`no definition file found.`));
            return this.#data;
        }

        const content = await files.readFileAsString(this.options.definitionsFile);
        this.#data = yaml.load(content);
        console.info(chalk.yellow(`${this.#data.length} definitions found.`));
        return this.#data;
    }
}