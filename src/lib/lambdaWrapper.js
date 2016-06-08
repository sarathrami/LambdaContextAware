// THE REAL LAMBDA FUNCTION
var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var s3params = {Bucket: 'ramsarattestbucket', Key: 'temp.json'};
var s3bucket = new AWS.S3({params: s3params});
exports.handler = function(event, context) {
    console.log('Entering Lambda fn with Event: ' + JSON.stringify(event) + '& Context' + JSON.stringify(context));
    s3bucket.getObject({}, function(err, data){
        var body = (data && !event.restart) ? data.Body : '{}';
        var bodyString = body ? body.toString() : '{}';
        var bodyJSON = JSON.parse(bodyString);
		if(__codeHash != bodyJSON.code_hash) // The code hash has changed, discard context
			bodyJSON = {code_hash: __codeHash};
        // Call the actual flow
		var generator = new __transCompiledCode(event, bodyJSON);
        var ret = generator.next();
        console.log('CONTEXT:' + JSON.stringify(bodyJSON));
		console.log('RETURNED:' + JSON.stringify(ret));
        if(ret.done) { // This call was the end of the lambda fn(), reset the context
          bodyJSON = {};
        }
        s3bucket.upload({Body: JSON.stringify(bodyJSON)}, function(err, data){
			if(ret.done) {
			  context.fail('Finished execution!');
			} else {
		      context.succeed(ret.value);
			}
        });
    });
};
