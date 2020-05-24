const fs = require('fs');

var obj = JSON.parse(fs.readFileSync('object.json', 'utf8'));

let output = [];
for (let subarr of obj){
    output = output.concat(subarr)
}

console.log(output.length)


let writeStream = fs.createWriteStream('mindat.csv')

output.forEach((data, index) => {     
    let newLine = []
    newLine.push(data.name)
    newLine.push(data.formula)
    newLine.push(data.link)

    writeStream.write(newLine.join(',')+ '\n', () => {
        // a line was written to stream
    })
})

writeStream.end()

writeStream.on('finish', () => {
    console.log('finish write stream, moving along')
}).on('error', (err) => {
    console.log(err)
})
