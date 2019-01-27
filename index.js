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


var fs        = require('fs');
var path      = require('path');
const Saxophone = require('saxophone');
const parser = new Saxophone();


//var stream = fs.createReadStream(path.join(__dirname, 'discogs_20190101_releases.xml'));
var stream = fs.createReadStream(path.join(__dirname, 'releases_20080309.xml'));
 
// Called whenever an opening tag is found in the document,
// such as <example id="1" /> - see below for a list of events

// release
// let release = {};
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
        const attrCollection = ['images','artists', 'labels', 'formats', 'genres', 'styles'];
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
                        if(previousTag.name === "artist" || previousTag.name === "name" || previousTag.name === "anv" || previousTag.name === "join") {
                            previousArtist.name = tmp;
                        } else {
                            console.error(`Error >> Previous is not artist in name: ${previousTag.name}`);
                        }
                        break;
                    }
                    case "anv": {
                        if(previousTag.name === "artist" || previousTag.name === "name" || previousTag.name === "anv" || previousTag.name === "join") {
                            previousArtist.anv = tmp;
                        } else {
                            console.error(`Error >> Previous is not artist in anv: ${previousTag.name}`);
                        }
                        break;
                    }
                    case "join": {
                        if(previousTag.name === "artist" || previousTag.name === "name" || previousTag.name === "anv" || previousTag.name === "join") {
                            previousArtist.join = tmp;
                        } else {
                            console.error(`Error >> Previous is not artist in join: ${previousTag.name}`);
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
                        console.error(`Unknown tag name ${tag.name}, ${release.id}`);
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
        //if(count > 3000) {
         //   exit(0);
       // }
       
    }
   
});
 
// Called when we are done parsing the document
parser.on('finish', () => {
    console.log(count);
    console.log('Parsing finished.');
});
 
// stdin is '<root><example id="1" /><example id="2" /></root>'
stream.setEncoding('utf8');
stream.pipe(parser);