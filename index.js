const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

let urls0 = [...Array(95).keys()].map(d => `https://www.mindat.org/chemsearch.php?cform_is_valid=1&inc=H%2C&exc=&class=0&sub=Search+Minerals&cf_pager_page=${d}`);
let urls1 = [...Array(170).keys()].map(d => `https://www.mindat.org/chemsearch.php?cform_is_valid=1&inc=&exc=H%2C&class=0&sub=Search+Minerals&cf_pager_page=${d}`);
let urls = urls0.concat(urls1);

    let pagesNum = process.argv[2];
    if (!pagesNum){
        throw ('Please provide page number as a first argument!')
    }
    urls = urls.slice(1,pagesNum);

//let scrape = async () => {
const scrape = () => {
    return new Promise (async(resolve, reject) => {
        try {
            const browser = await puppeteer.launch({
                headless: false,
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
          
              mineralUrls = mineralUrls.slice(0,5)
          
                for (const {name, link} of mineralUrls) {
                  await Promise.all([
                      page.waitForNavigation(),
                      page.goto(link)
                  ]);
          
                  if (await page.$('#introdata > div > div > span')) {
                      let formula = await page.$eval('#introdata > div > div > span', e => e.innerHTML);
                      output.push({ formula: formula })
                  }
          
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
    
//     const browser = await puppeteer.launch({
//       headless: false,
//       defaultViewport: {
//           width: 1100,
//           height: 2000
//       }
//     });
//     const page = await browser.newPage();
//     var output = [];
//     for (let url of urls){
//       console.log(`Fetching page data for : ${url}...`);
//       await page.goto(url);

//     let mineralUrls = await page.evaluate(() => {
//         let items = document.querySelectorAll('#mainwrap > div.centerer.whitecenterer > div.fpbox720p > table.mindattable > tbody > tr > th > li > b > a');
//         let results = [];
//         items.forEach(function(item){
//             results.push({ name: item.textContent,
//                            link: item.href })
//         })
//         return results;
//     })

//     //output.push(nameLinkList)
//     mineralUrls = mineralUrls.slice(0,5)


//       for (const {name, link} of mineralUrls) {
//         await Promise.all([
//             page.waitForNavigation(),
//             page.goto(link)
//             //page.waitForSelector('#introdata > div > div'), 
//         ]);

//         if (await page.$('#introdata > div > div > span')) {
//             let formula = await page.$eval('#introdata > div > div > span', e => e.innerHTML);
//             output.push({ formula: formula })
//         }

//     }
//     }

//     console.log(output)
//     browser.close();
//     fs.writeFile("object.json", JSON.stringify(output, null, 4), (err) => {
//       if (err) {
//           console.error(err);
//           return;
//       };
//       console.log("File has been created");
//   });
};

scrape()
    .then(res => console.log(res))
    .catch(err => console.log(err))