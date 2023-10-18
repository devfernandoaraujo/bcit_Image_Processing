const unzipper = require("unzipper"),
  fs = require("fs"),
  PNG = require("pngjs").PNG,
  path = require("path");
  const { Transform } = require('stream');

/**TODO: This version iss not handling the directories the the files are generated. So we need to create it manually. */


/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
const unzip = (pathIn, pathOut) => {
    return new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(pathIn);

        readStream
        .pipe(unzipper.Parse())
        .on('entry', function (entry) {
            const fileName = entry.path;
            if (path.extname(fileName) === ".png" && !fileName.includes('__MACOSX')) {
                
                entry.pipe(fs.createWriteStream( path.join(pathOut,fileName)));
            } else {
                entry.autodrain();
            }
        })
        .on('finish', () =>resolve())
        .on("error", (error)=> reject(error));
    });
        
};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = (dir) => {
    return new Promise((resolve, reject) => {
        fs.readdir(dir,"utf8",(error,files)=>{
            if(error)
                reject(error);
            else{
                console.log('Those are the files found.');
                files.forEach((file)=>{
                    console.log(file);
                })
                resolve(files);
            }
        })
        
    });
};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @param {array} files
 * @return {promise}
 */
const grayScale = (pathIn, pathOut, files) => {
    return new Promise((resolve, reject) => {
        files.forEach((file, index)=>{
            
            fs.createReadStream(path.join(pathIn,file))
            .pipe(
                new PNG({
                filterType: 4,
                })
            )
            .on("parsed", function () {
                for (var y = 0; y < this.height; y++) {
                    for (var x = 0; x < this.width; x++) {
                        var idx = (this.width * y + x) << 2;
                        const average = Math.floor(
                            (this.data[idx] + this.data[idx + 1] + this.data[idx + 2]) / 3
                        );
                        // invert color
                        this.data[idx] = average;
                        this.data[idx + 1] = average;
                        this.data[idx + 2] = average;

                        // and reduce opacity
                        this.data[idx + 3] = 255;
                    }
                }

                this.pack().pipe(fs.createWriteStream(path.join(pathOut,file)));
            });
        })
    });
};

module.exports={unzip, readDir, grayScale }