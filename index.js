const fs = require('fs');
const pdf = require('html-pdf');
const express = require("express");
const pug = require('pug');
const PugHelper = require('./pugHelper');


const app = express()
const port = process.env.PORT || 3000;


let printHtmlCode = fs.readFileSync("./index.html", 'utf-8');
const base64Logo = fs.readFileSync('./logo.base64', 'utf-8');
printHtmlCode = printHtmlCode.replace('__REPLACE_LOGO_B64__', base64Logo);

const acceleratorTableHeaders = [
    'Accelerator:',
    '3 Years:',
    '5 Years:',
    '10 Years:'
];

const costSavingsHeaders = [
    'Time:',
    'Savings:'
];


PugHelper.costSavingsTableFunction = pug.compile(fs.readFileSync("./tables/costSavingsTable.pug", 'utf-8'), {});
PugHelper.acceleratorTableFunction = pug.compile(fs.readFileSync("./tables/accelerator.pug", 'utf-8'), {});


function checkValidityOfData(acceleratorData, costSavingsData){

    if(!acceleratorData.length || !costSavingsData.length){
        return "Invalid length"
    }

    if(acceleratorData.find(element => (
        (element.length !== acceleratorTableHeaders.length)
    ))){
        return "There is an invalid acceleratorData item."
    }
    
    if(costSavingsData.find(element => (
        (element.length !== costSavingsHeaders.length)
    ))){
        return "There is an invalid cost savings data"
    }
}

app.get('/', (req, apiRes) => {

    //console.log(req.query);
    let {acceleratorData, costSavingsData} = req.query || {};
    let validationError;
    

    if(!acceleratorData || !costSavingsData){
        validationError = "No data detected";
    }

    try{
        if(validationError){
            return apiRes.status(400).send(validationError);
        }
        acceleratorData = acceleratorData.replace(/'/g, '');
        acceleratorData = JSON.parse(acceleratorData);

        costSavingsData = costSavingsData.replace(/'/g, '');
        costSavingsData = JSON.parse(costSavingsData);

        const vvv = checkValidityOfData(acceleratorData, costSavingsData);

        validationError = checkValidityOfData(acceleratorData, costSavingsData) || validationError;

        if(validationError){
            return apiRes.status(400).send(validationError || error);
        }
    }catch(e){
        console.log({e});
        validationError = "Invalid json";
    }

    if(validationError){
        return apiRes.status(400).send(validationError);
    }

    var html = printHtmlCode;

    console.time("pugCompilation");
    try{
        html = printHtmlCode.replace("<!--_pug_replace_accelerator_table-->", PugHelper.acceleratorTableFunction({acceleratorData, acceleratorTableHeaders}));
        html = html.replace("<!--_pug_replace_costs_savings_table-->", PugHelper.costSavingsTableFunction({costSavingsHeaders, costSavingsData}));
    }catch(e){
        console.log("Error parsing...",{e});
    }
    console.timeEnd("pugCompilation");

    pdf.create(html, { 
        format: 'Letter',
        orientation: "Portrait",
    })
    .toBuffer(function(err, res) {
        if (err) return console.log(err);
        apiRes.setHeader('Content-Type', 'application/pdf');
        apiRes.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
        apiRes.send(res);
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});