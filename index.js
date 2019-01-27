const {Client, util} = require('disconnect');

const discogs = new Client('MyUserAgent/1.0', {
	consumerKey: 'UhQJzygSzPkpbKBOItfx', 
	consumerSecret: 'tHoVRUZoZoKztDkAGUZVTkaJFCwKhLHC'
});

let authRequestData = null;
let authAccessData = null;
const oAuth = discogs.oauth();
const getRequestTokens = ()=> {
    return new Promise(
        (resolve) => {
            oAuth.getRequestToken(
                'UhQJzygSzPkpbKBOItfx', 
                'tHoVRUZoZoKztDkAGUZVTkaJFCwKhLHC', 
                'http://your-script-url/callback', 
                function(err, requestData){
                    authRequestData = requestData;
                    resolve();
                }
            );
        }
    );
}

const getAccessTokens = ()=> {
    return new Promise(
        (resolve) => {
            oAuth.getAccessToken(
                authRequestData.token, // Verification code sent back by Discogs
                function(err, accessData){
                    // Persist "accessData" here for following OAuth calls 
                    authAccessData = accessData;
                    resolve();
                }
            );
        }
    );
}


const run = async ()=> {
    console.log('Get Tokens !')
    await getRequestTokens();
    //console.log(authRequestData);
    await getAccessTokens();
    //console.log(authAccessData);

    const db = discogs.database();
    db.search(
        "House", 
        {
            type: "release",
            per_page: 100,
            page: 100
        }
    )
	.then(function(release){ 
		console.log(release);
	})
	// .then(function(artist){
	// 	console.log(artist.name);
	// });
}

run();


