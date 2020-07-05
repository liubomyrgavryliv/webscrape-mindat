const puppeteer = require('puppeteer');
const fs = require('fs');
const { Pool, Client } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'ec2-18-184-252-245.eu-central-1.compute.amazonaws.com',
  database: 'masterclone',
  password: 'BQBANe++XrmO5xWA3UqipNACx3Mf95kN',
  port: 5433,
});

    pool.query('DELETE FROM mindat_mn_minerals', (res, err) => {
                                    if (err) {
                                        console.log(err.stack)
                                    } else {
                                        console.log(res.rows[0])
                                    }
                                });

let urls0 = [...Array(95).keys()].map(d => `https://www.mindat.org/chemsearch.php?cform_is_valid=1&inc=H%2C&exc=&class=0&sub=Search+Minerals&cf_pager_page=${d + 1}`);
let urls1 = [...Array(171).keys()].map(d => `https://www.mindat.org/chemsearch.php?cform_is_valid=1&inc=&exc=H%2C&class=0&sub=Search+Minerals&cf_pager_page=${d + 1}`);
let urls = urls0.concat(urls1);

    /*let pagesNum = process.argv[2];
    if (!pagesNum){
        throw ('Please provide page number as a first argument!')
    }
    urls = urls.slice(1,pagesNum);*/

//let scrape = async () => {
const scrape = () => {
    return new Promise (async(resolve, reject) => {
        try {
            const browser = await puppeteer.launch({
                headless: true,
                defaultViewport: {
                    width: 1100,
                    height: 2000 
                }
              });
              const page = await browser.newPage();
              var output = [];
              for (let url of urls){
                console.log(`Fetching page data for : ${url}...`);
                await page.goto(url);
          
              let mineralUrls = await page.evaluate(() => {
                  let items = document.querySelectorAll('#mainwrap > div.centerer.whitecenterer > div.fpbox720p > table.mindattable > tbody > tr > th > li > b > a');
                  let results = [];
                  items.forEach(function(item){
                      results.push({ name: item.textContent,
                                     link: item.href })
                  })
                  return results;
              })
          
              mineralUrls = mineralUrls//.slice(0,5)
          
                for (const {name, link} of mineralUrls) {
                  await Promise.all([
                      page.waitForNavigation(),
                      page.goto(link)
                  ]);

                    let formula = '', 
                        mineral_name = '',
                        id = link.match(/min-\d+/gi)[0];

                  if (await page.$('#introdata > div > div > span')) {
                      formula = await page.$eval('#introdata > div > div > span', e => e.innerHTML); 
                  }
                  if ( await page.$('.mineralheading')) {
                    mineral_name = await page.$eval('.mineralheading', e => e.innerHTML.replace(/^ +/gi, ''));
                  }
                  output.push({ id: id, 
                                mineral_name: mineral_name, 
                                formula: formula });

                    let text = 'INSERT INTO mindat_mn_minerals (id, mineral_name, formula) VALUES ($1, $2, $3) RETURNING *',
                        values = [id, mineral_name, formula];

                        pool
                            .query(text, values)
                            .then(res => {
                                console.log(res.rows[0])
                            })
                            .catch(e => console.error(e.stack))
          
              }
              }
          
              browser.close();

              fs.writeFile("object.json", JSON.stringify(output, null, 4), (err) => {
                if (err) {
                    console.error(err);
                    return;
                };
                console.log("File has been created");
            });
            return resolve(output)
        }
        catch (e) {
            return reject(e)
        }
    })
};

scrape()
    .then(res => console.log(res))
    .catch(err => console.log(err))