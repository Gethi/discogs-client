// const {Client, util} = require('disconnect');
//var parser = require('fast-xml-parser');
// var he = require('he');


// const discogs = new Client('MyUserAgent/1.0', {
// 	consumerKey: 'UhQJzygSzPkpbKBOItfx', 
// 	consumerSecret: 'tHoVRUZoZoKztDkAGUZVTkaJFCwKhLHC'
// });

// let authRequestData = null;
// let authAccessData = null;
// const oAuth = discogs.oauth();
// const getRequestTokens = ()=> {
//     return new Promise(
//         (resolve) => {
//             oAuth.getRequestToken(
//                 'UhQJzygSzPkpbKBOItfx', 
//                 'tHoVRUZoZoKztDkAGUZVTkaJFCwKhLHC', 
//                 'http://your-script-url/callback', 
//                 function(err, requestData){
//                     authRequestData = requestData;
//                     resolve();
//                 }
//             );
//         }
//     );
// }

// const getAccessTokens = ()=> {
//     return new Promise(
//         (resolve) => {
//             oAuth.getAccessToken(
//                 authRequestData.token, // Verification code sent back by Discogs
//                 function(err, accessData){
//                     // Persist "accessData" here for following OAuth calls 
//                     authAccessData = accessData;
//                     resolve();
//                 }
//             );
//         }
//     );
// }


// const run = async ()=> {
//     console.log('Get Tokens !')
//     await getRequestTokens();
//     await getAccessTokens();

//     const db = discogs.database();
//     db.search(
//         "", 
//         {
//             type: "release",
//             per_page: 100,
//             format: 'Vinyl',
//             country: 'UK',
//             genre: 'Electronic',
//             style: 'House',
//             // decade: '1990',
//             year: '',
//             page: 1
//         }
//     )
// 	.then(function(release){ 
//         console.log(release.pagination);
        
//         release.results.map(
//             (result)=>{
//                 if(!result.year) {
//                     console.log(result.year)
//                 }
//             }
//         )
// 	})
// }

//run();


// var fs        = require('fs')
//   , path      = require('path')
//   , XmlStream = require('xml-stream')
//   ;

// // Create a file stream and pass it to XmlStream
// var stream = fs.createReadStream(path.join(__dirname, 'releases_20080309.xml'));
// var xml = new XmlStream(stream);

// xml.preserve('release', true);
// //xml.collect('artists');
// xml.on('endElement: release', function(item) {
//   console.log(item);
// });

const omitDeep = require("omit-deep-lodash");
var fs        = require('fs');
var path      = require('path');
var XmlStream = require('xml-stream');
var fse = require('fs-extra');
//const Saxophone = require('saxophone');
//const parser = new Saxophone();


var stream = fs.createReadStream(path.join(__dirname, 'chunk.xml'));
//var stream = fs.createReadStream(path.join(__dirname, 'releases_20080309.xml'));
 
// Called whenever an opening tag is found in the document,
// such as <example id="1" /> - see below for a list of events

// release
// let release = {};

/*
let open = false;
let tags = [];
parser.on('tagopen', tag => {
   // if(tag.name === "release") {
    //    open = true;
        
   // } else if(open){
        //console.log(tag)
        // release[tag.name] = Saxophone.parseAttrs(tag.attrs);

        //parseEntities(tag.text)
  //  }
    // console.log(
    //     `Open tag "${tag.name}" with attributes: ${JSON.stringify(Saxophone.parseAttrs(tag.attrs))}.`
    // );

    //if(tags.length > 1 && tags[tags.length-1].name === "artist" && tag.name === "name") {
        // do nothing
    //} else {
        //console.log(tag)
        tags.push(tag);
   // }
});
parser.on('text', text => {
    //onsole.log(Saxophone.parseEntities(text.contents))
    //console.log(text.contents)
    if(tags.length > 1) {
        tags[tags.length-1].content = text.contents;
    }
});

let count = 0;
parser.on('tagclose', ctag => {
    if(ctag.name === "release") {
        let release = {
            images: [],
            artists: [],
            labels: [],
            formats: [],
            genres: [],
            styles: [],
        };
        const attrCollection = ['images','artists', 'labels', 'formats', 'genres', 'styles', 'releases'];
        let previousArtist = {};
        let previousFormat = {};
        let previousDescriptions = {};
        let noRelease = true;
        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];
            const previousTag = i > 1 ? tags[i-1]: null;
            if(tag.name === "release") {
                release = {
                    ...release,
                    ...Saxophone.parseAttrs(tag.attrs),
                }
            } else if(attrCollection.indexOf(tag.name) !== -1){
                // do nothing
            } else {
                let tmp = {
                    tagName: tag.name,
                    content: tag.content || null,
                    attrs: Saxophone.parseAttrs(tag.attrs),
                }
                
                //console.log(release.hasOwnProperty(tag.name))
                switch (tag.name) {
                    case "image":
                        release['images'].push(tmp);
                        break;
                    case "artist":
                        release['artists'].push(tmp);
                        previousArtist = tmp;
                        break;
                    case "label":
                        release['labels'].push(tmp);
                        break;
                    case "format":
                        tmp = {
                            ...tmp,
                            descriptions: []
                        };
                        release['formats'].push(tmp);
                        previousFormat = tmp;
                        break;
                    case "descriptions": {
                        if(previousTag.name === "format") {
                            previousDescriptions = previousFormat.descriptions;
                        } else {
                            console.error(`Error >> Previous is not format: ${previousTag.name}`);
                        }
                        break;
                    }
                    case "description":{
                        if(previousTag.name === "descriptions" || previousTag.name === "description") {
                            //release['formats'][0].descriptions.push(tmp);
                            previousDescriptions.push(tmp);
                        } else {
                           console.error(`Error >> Previous is not descriptions: ${previousTag.name}`);
                        }
                        break;
                    }
                    case "genre":
                        release['genres'].push(tmp);
                        break;
                    case "style":
                        release['styles'].push(tmp);
                        break;
                    case "name": {
                        if(previousTag.name === "artist" || previousTag.name === "name" || previousTag.name === "anv" || previousTag.name === "join" || previousTag.name === "id" || previousTag.name === "role" || previousTag.name === "tracks") {
                            previousArtist.name = tmp;
                        } else {
                            console.error(`Error >> Previous is not artist in name: ${previousTag.name}`);
                        }
                        break;
                    }
                    case "anv": {
                        if(previousTag.name === "artist" || previousTag.name === "name" || previousTag.name === "anv" || previousTag.name === "join" || previousTag.name === "id" || previousTag.name === "role" || previousTag.name === "tracks") {
                            previousArtist.anv = tmp;
                        } else {
                            console.error(`Error >> Previous is not artist in anv: ${previousTag.name}`);
                        }
                        break;
                    }
                    case "join": {
                        if(previousTag.name === "artist" || previousTag.name === "name" || previousTag.name === "anv" || previousTag.name === "join" || previousTag.name === "id" || previousTag.name === "role" || previousTag.name === "tracks") {
                            previousArtist.join = tmp;
                        } else {
                            console.error(`Error >> Previous is not artist in join: ${previousTag.name}`);
                        }
                        break;
                    }
                    case "id": {
                        if(previousTag.name === "artist" || previousTag.name === "name" || previousTag.name === "anv" || previousTag.name === "join" || previousTag.name === "id" || previousTag.name === "role" || previousTag.name === "tracks") {
                            previousArtist.id = tmp;
                        } else {
                            console.error(`Error >> Previous is not artist in id: ${previousTag.name}`);
                        }
                        break;
                    }
                    case "role": {
                        if(previousTag.name === "artist" || previousTag.name === "name" || previousTag.name === "anv" || previousTag.name === "join" || previousTag.name === "id" || previousTag.name === "role" || previousTag.name === "tracks") {
                            previousArtist.role = tmp;
                        } else {
                            console.error(`Error >> Previous is not artist in role: ${previousTag.name}`);
                        }
                        break;
                    }
                    case "tracks": {
                        if(previousTag.name === "artist" || previousTag.name === "name" || previousTag.name === "anv" || previousTag.name === "join" || previousTag.name === "id" || previousTag.name === "role" || previousTag.name === "tracks") {
                            previousArtist.tracks = tmp;
                        } else {
                            console.error(`Error >> Previous is not artist in tracks: ${previousTag.name}`);
                        }
                        break;
                    }
                    case "released": {
                        noRelease = false;
                        release[tag.name] = tmp;
                        break;
                    }
                    case "title":
                    case "country":
                    case "released":
                    case "notes":
                        release[tag.name] = tmp;
                        break;
                    default:
                        console.error(`Unknown tag ${tag.name}, ${release.id}`);
                        break;
                }
                
            }
            
        }
        count++;
        //console.log(release);
        tags = [];
        if(noRelease) {
            //console.log("NO RELEASE DATE");
        }
        noRelease=true;
        if(count > 0) {
            exit(0);
        }
       
    } else {
        //console.log(ctag.name)
    }
   
});
 
// Called when we are done parsing the document
parser.on('finish', () => {
    console.log(count);
    console.log('Parsing finished.');
});*/
 
// stdin is '<root><example id="1" /><example id="2" /></root>'
stream.setEncoding('utf8');
//stream.pipe(parser);


var xml = new XmlStream(stream);

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
xml.on('endElement: release', function(item) {
  //console.log(item);
  xml.pause();

  let omited = omitDeep(item, "$children");
  omited = omitDeep(omited, "$name");

    omited = {
        ...omited,
        ...omited.$
    };
    delete omited.$;
    delete omited.$name;

  console.group(`Formating ${omited.id}`);

  omited.title = omited.title.$text;
  
  try {
    omited.country = omited.country.$text;
  } catch (error) {
      console.log("no contry");
      omited.country = "";
  }

  try {
    omited.released = omited.released.$text;
  } catch (error) {
      console.log("no released");
      omited.released = "";
  }
  
  try {
    omited.notes = omited.notes.$text;
  } catch (error) {
    omited.notes = "";
      console.log("no notes");
  }
  
  try {
    omited.data_quality = omited.data_quality.$text;
  } catch (error) {
    omited.data_quality = "";
    console.log("no data quality");
  }

  try {
    omited.formats = omited.formats.format;
    for (let i = 0; i < omited.formats.length; i++) {
        const format = omited.formats[i];

        try {
            format.descriptions = format.descriptions.description;
            for (let j = 0; j < format.descriptions.length; j++) {
                format.descriptions[j] = format.descriptions[j].$text;
            }
        } catch (error) {
            console.log("no format.descriptions");
        }
        
        format.metadata = format.$;
        delete format.$;
        delete format.$name;
    }
  } catch (error) {
    omited.formats = [];
    console.log("no formats");
  }

  try {
    omited.genres = omited.genres.genre;
    for (let i = 0; i < omited.genres.length; i++) {
        omited.genres[i] = omited.genres[i].$text;
    }
  } catch (error) {
    omited.genres = [];
    console.log("no genres");
  }

  try {
    omited.companies = omited.companies.company;
    for (let i = 0; i < omited.companies.length; i++) {
        try {
            omited.companies[i].id = omited.companies[i].id.$text;
            omited.companies[i].name = omited.companies[i].name.$text;
            omited.companies[i].entity_type = omited.companies[i].entity_type.$text;
            omited.companies[i].entity_type_name = omited.companies[i].entity_type_name.$text;
            omited.companies[i].resource_url = omited.companies[i].resource_url.$text;
            omited.companies[i].catno = omited.companies[i].catno.$text;
        } catch (error) {
            console.log("companies reordering > ", error);
        }
    }
  } catch (error) {
    omited.companies = [];
    console.log("no companies");
  }

  try {
    omited.styles = omited.styles.style;
    for (let i = 0; i < omited.styles.length; i++) {
        omited.styles[i] = omited.styles[i].$text;
    }
  } catch (error) {
    omited.styles = [];
    console.log("no styles");
  }

  try {
    omited.labels = omited.labels.label;
    for (let i = 0; i < omited.labels.length; i++) {
        omited.labels[i].metadata = omited.labels[i].$;
        delete  omited.labels[i].$;
    }
  } catch (error) {
    omited.labels = [];
    console.log("no labels");
  }

  fse.writeJson(
    `./JSON/getJson_${omited.id}.json`,
    omited,
    {
        spaces: 4
    },
    err => {
        if (err) return console.error(err)
    
        console.groupEnd('success!')
        xml.resume();

        if(omited.id === "13827565") {
            //exit(0);
        }
    }
  );
  
});