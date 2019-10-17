
const omitDeep = require("omit-deep-lodash");
var fs        = require('fs');
var path      = require('path');
var XmlStream = require('xml-stream');
var fse = require('fs-extra');

var cluster = require('cluster');
var numCPUs = 6; // IMPORTANT

const formatArrayByAttribute = (unformat, attributeName)=> {
    if(unformat.length === 0) return unformat;
    let formated = unformat;
    for (let j = 0; j < formated.length; j++) {
        formated[j] = formated[j][attributeName];
    }
    return formated;
};

const formatArrayText = (unformat)=> {
    if(unformat.length === 0) return unformat;
    let formated = unformat;
    for (let j = 0; j < formated.length; j++) {
        const attributes = Object.keys(formated[j]);
        for (let k = 0; k < attributes.length; k++) {
            const attribute = attributes[k];
            if(formated[j][attribute].$text) {
                formated[j][attribute] = formated[j][attribute].$text;
            } else if(Object.keys(formated[j][attribute]).length === 0) {
                formated[j][attribute] = null;
            } else if (attribute === "extraartists") {
                formated[j][attribute] = formated[j][attribute].artist || [];
                formated[j][attribute] = formatArrayText(formated[j][attribute]);
            } 
        }
    }
    return formated;
};

const scanDir = async (dirName) => {
    return new Promise((resolve,reject)=>{
        //joining path of directory 
        const directoryPath = path.join(__dirname, dirName);
        //passsing directoryPath and callback function
        fs.readdir(directoryPath, function (err, files) {
            //handling error
            if (err) {
                console.log('Unable to scan directory: ' + err);
                reject();
            }
            const filtered = files.filter(item => {
                //!(/(^|\/)\.[^\/\.]/g).test(item)
                return (/\.xml$/g).test(item) && !(/discogs_20190901_releases-exc.xml$/g).test(item) && !(/discogs_20190901_releases-exc-00.xml$/g).test(item)
            });
            resolve(filtered);
        });
    });
};


const parseXML = (filePath)=> {
    return new Promise((resolve,reject)=>{

        const stream = fs.createReadStream(path.join(__dirname, filePath));
        stream.setEncoding('utf8');

        const xml = new XmlStream(stream);

        let parseEnded = false;
        let hasRelease = false;
        let tokenToResolve = -1;

        xml.preserve('release', true);
        xml.collect('description');
        xml.collect('image');
        xml.collect('style');
        xml.collect('label');
        xml.collect('genre');
        xml.collect('video');
        xml.collect('format');
        xml.collect('company');
        xml.collect('track');
        xml.collect('identifier');
        xml.collect('url');
        xml.collect('artist');
        xml.on('end', function() {
            parseEnded = true;
            if(!hasRelease) {
                clearTimeout(tokenToResolve);
                tokenToResolve = setTimeout(() => {
                    resolve();
                }, 10000);
            }
        });
        xml.on('endElement: release', function(item) {
            //console.log(item);
            xml.pause();
            hasRelease = true;

            if(parseEnded) {
                clearTimeout(tokenToResolve);
                tokenToResolve = setTimeout(() => {
                    resolve();
                }, 10000);
            }

            let omited = omitDeep(item, "$children");
            omited = omitDeep(omited, "$name");

            omited = {
                ...omited,
                ...omited.$
            };

            delete omited.$;
            delete omited.$name;

            omited.title = omited.title.$text;

            if(omited.master_id) {
                omited.master_id.master_id = omited.master_id.$text;
                omited.master_id = {
                    ...omited.master_id,
                    ...omited.master_id.$
                };
                delete omited.master_id.$;
                delete omited.master_id.$text;
            }
        
        
            try {
                omited.country = omited.country.$text;
            } catch (error) {
                omited.country = "";
            }

            try {
                omited.released = omited.released.$text;
                let rDate = omited.released;
                if(omited.released.length > 4) {
                    rDate = new Date(omited.released);
                    rDate = rDate.getFullYear().toString();
                    omited.releasedDate = omited.released;
                } else {
                    omited.releasedDate = `${rDate}-02-01`;
                }
                omited.releasedDecade = `${rDate[0]}${rDate[1]}${rDate[2]}0`;
            } catch (error) {
                omited.released = "";
            }
            
            try {
                omited.notes = omited.notes.$text;
            } catch (error) {
                omited.notes = "";
            }
            
            try {
                omited.data_quality = omited.data_quality.$text;
            } catch (error) {
                omited.data_quality = "";
            }

            try {
                omited.formats = omited.formats.format || [];
                omited.joinformats = [];
                for (let i = 0; i < omited.formats.length; i++) {
                    omited.formats[i] = {
                        ...omited.formats[i],
                        ...omited.formats[i].$
                    };
                    delete omited.formats[i].$;

                    try {
                        omited.formats[i].descriptions = omited.formats[i].descriptions.description;
                    } catch (error) {
                        omited.formats[i].descriptions = [];
                    }
                    omited.formats[i].descriptions = formatArrayByAttribute(omited.formats[i].descriptions, "$text");
                    
                    omited.joinformats.push(omited.formats[i].name);
                }
            } catch (error) {
                omited.formats = [];
            }

            try {
                omited.artists = omited.artists.artist || [];
            } catch (error) {
                omited.artists = [];
            }
            omited.artists = formatArrayText(omited.artists);

            try {
                omited.extraartists = omited.extraartists.artist || [];
            } catch (error) {
                omited.extraartists = [];
            }
            omited.extraartists = formatArrayText(omited.extraartists);
            
            try {
                omited.tracklist = omited.tracklist.track || [];
            } catch (error) {
                omited.tracklist = [];
            }
            omited.tracklist = formatArrayText(omited.tracklist);

            try {
                omited.identifiers = omited.identifiers.identifier || [];
            } catch (error) {
                omited.identifiers = [];
            }

            try {
                omited.genres = omited.genres.genre || [];
            } catch (error) {
                omited.genres = [];
            }
            omited.genres = formatArrayByAttribute(omited.genres, "$text");

            try {
                omited.images = omited.images.image || [];
            } catch (error) {
                omited.images = [];
            }
            omited.images = formatArrayByAttribute(omited.images, "$");
            for (let j = 0; j < omited.images.length; j++) {
                const keys = Object.keys(omited.images[j]);
                for (let i = 0; i < keys.length; i++) {
                    omited.images[j][keys[i]] = omited.images[j][keys[i]] === "" ? null : omited.images[j][keys[i]];
                }
            }

            try {
                omited.videos = omited.videos.video || [];
                for (let i = 0; i < omited.videos.length; i++) {
                    omited.videos[i].title = omited.videos[i].title.$text;
                    if(omited.videos[i].description) {
                        omited.videos[i].description = formatArrayByAttribute(omited.videos[i].description, "$text");
                    }
                    omited.videos[i] = {
                        ...omited.videos[i],
                        ...omited.videos[i].$
                    };
                    delete omited.videos[i].$;
                }
            } catch (error) {
                omited.videos = [];
            }

            try {
                omited.companies = omited.companies.company || [];
                for (let i = 0; i < omited.companies.length; i++) {
                    try {
                        omited.companies[i].id = omited.companies[i].id.$text;
                        omited.companies[i].name = omited.companies[i].name.$text;
                        omited.companies[i].entity_type = omited.companies[i].entity_type.$text;
                        omited.companies[i].entity_type_name = omited.companies[i].entity_type_name.$text;
                        omited.companies[i].resource_url = omited.companies[i].resource_url.$text;
                        omited.companies[i].catno = omited.companies[i].catno.$text;
                    } catch (error) {
                        //console.log("companies reordering > ", error);
                    }
                }
            } catch (error) {
                omited.companies = [];
            }

            try {
                omited.styles = omited.styles.style || [];
                for (let i = 0; i < omited.styles.length; i++) {
                    omited.styles[i] = omited.styles[i].$text;
                }
            } catch (error) {
                omited.styles = [];
            }

            try {
                omited.labels = omited.labels.label || [];
                for (let i = 0; i < omited.labels.length; i++) {
                    omited.labels[i] = {
                        ...omited.labels[i],
                        ...omited.labels[i].$
                    };
                    delete  omited.labels[i].$;
                }
            } catch (error) {
                omited.labels = [];
            }

            fse.writeJson(`./data/JSON/getJson_${omited.id}.json`, omited, {spaces: 4},
                err => {
                    if (err) return console.error(err)
                
                    xml.resume();
                    hasRelease = false;

                    if(parseEnded) {
                        clearTimeout(tokenToResolve);
                        tokenToResolve = setTimeout(() => {
                            resolve();
                        }, 10000);
                    }
            });
        });
    });
};

//const numWorkers = require('os').cpus().length;
//console.log('Master cluster setting up ' + numWorkers + ' workers...');


const processing = async ()=> {
    if (cluster.isMaster) {
        const files = await scanDir("./data/XML");
        console.log(files);
        const nbFilesPerProcess = Math.floor(files.length / numCPUs);
        const odd = files.length % numCPUs;
        const filesPerProcess = [];
        let filePointer = 0;
        for (let i = 0; i < numCPUs; i++) {
            filesPerProcess.push([]);
            for (let j = filePointer; j < nbFilesPerProcess + filePointer; j++) {
                filesPerProcess[i].push(files[j]);
            }
            filePointer += nbFilesPerProcess;
        }
        if(odd) {
            filesPerProcess[0].push(files[filePointer]);
        }
        //console.log(filesPerProcess);

        let jobs = {};
        for (let i = 0; i < numCPUs; i++) {
            const worker = cluster.fork();
            jobs[worker.process.pid] = filesPerProcess.pop();
        }

        //onsole.log(jobs);

        cluster.on('online', function(worker) {
            console.log('Worker ' + worker.process.pid + ' is online');
            worker.send({
                type: 'job',
                from: 'master',
                data: jobs[worker.process.pid]
            });
        });
    } else {
        //console.log('Process ' + process.pid);

        process.on('message', (message) => {
            const filesToParse = message.data;

            console.log('Worker ' + process.pid);
            console.log(filesToParse);

            const promises = [];
            for (let i = 0; i < filesToParse.length; i++) {
                const file = filesToParse[i];
                promises.push(parseXML(`./data/XML/${file}`));
            }
            Promise.all(promises).then(
                ()=>{
                    console.log('Worker ' + process.pid + ' terminated');
                    process.exit(0);
                }
            );
        
        });
    }
};

processing();