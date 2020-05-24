const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://names-dashboard.herokuapp.com/';

(async function savePDF(){

    const browser = await puppeteer.launch({
        headless: false, 
        defaultViewport: {
            width: 1100,
            height: 2000
        }
    });

    const page = await browser.newPage();
    await page.goto(url, {waitUntil: 'load'})
    await page.emulateMediaType('screen');

    const pdf = await page.pdf({path: 'some.pdf'});
 
    await browser.close();
    return pdf
})();
