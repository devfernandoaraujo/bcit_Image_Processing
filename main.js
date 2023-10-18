const { promises } = require('dns');
const {unzip, readDir, grayScale} = require('./IOHandler');
const path = require("path");
const {pipeline, Transform } = require('stream');

const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");

const processFile=async (zipFilePath,pathUnzipped,pathProcessed)=>{
    try{
         await unzip(zipFilePath, pathUnzipped);
        const files = await readDir(pathUnzipped);
        await grayScale(pathUnzipped, pathProcessed, files);
    }
    catch(error){
        console.error("An error occurred: ", error)
    }

}

processFile(zipFilePath,pathUnzipped, pathProcessed);

