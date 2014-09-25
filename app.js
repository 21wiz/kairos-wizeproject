var express = require('express'),
  routes = require('./routes'),
  user = require('./routes/user'),
  http = require('http'),
  https = require('https'),
  path = require('path'),
  qs = require('querystring'),
  fs = require('fs'),
  request = require('request');

var thsqapikey = '90284141063228944763927466195481',
  host_bin = 'requestb.in',
  path_bin = '/15bbcut1',
  host_thsq = 'demo.thsq.io',
  path_thsq = '/api/v0/devices',
  dev_light = '1082344083801',
  dev_goya = '334965454937798799971908643391743932105',
  var_leds = 'd/leds',
  var_rssi = 's/rssi',
  var_t= 's/t',
  var_power = 'd/power',
  pathX = 's/x.txt',
  pathY = 's/y.txt',
  pathZ = 's/z.txt',
  pathd = 'DeviceList.txt',
  pathg = 'GoyaList.txt',
  value = '',
  mod = '',
  syn = '';

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

function PostCode(origen){
  var post_data = origen;
  var post_options = {
	host: host_bin,
	path: path_bin,
	method: 'POST',
	headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_data.length
	}
  };
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
	console.log("POST_statusCode: ", res.statusCode);
	console.log("POST_headers: ", res.headers);
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });
  post_req.write(post_data);
  post_req.end();
	console.log("POST Request sent!");
  post_req.on('error', function(e) {
  console.error(e);
  });
}

function Getthsq(device,variable) {
  var get_options = {
	hostname: host_thsq,
	//port: 453,
	path: path_thsq + '/' + device + '/' + variable,
	method: 'GET',
	headers: {
  		apikey : "90284141063228944763927466195481",
	}
  };
  var get_req = https.request(get_options, function(res) {
	//console.log("GET_statusCode: ", res.statusCode);
	//console.log("GET_headers: ", res.headers);
 	res.on('data', function(d) {
        	var info = JSON.parse(d);
		var dataw = '';
		console.log('\r\n\r\nINFO: \r\n'); 
        	console.log(info);
		if(device == ''){
			for(var i = 0; i < info.devices.length; i++) {
				dataw += info.devices[i] + '\r\n';console.log('\r\n dataw'); console.log(dataw);
    			}//end loop
			fs.open(pathd, 'w', function(err, fd) {
			    if (err) { throw 'error opening file: ' + err; }
			    else {
				fs.writeFile(pathd,dataw,function(err) { if (err) throw 'error writing file: ' + err; });
			    }//end if
			    fs.close(fd, function() {
                		console.log('file written');
	        	    })
			});//end open file
    			//PostCode(qs.stringify(info));
			dataw = '';
		}else if(device == dev_goya){
		    if(variable == ''){
			for (var key in info) {
				if (info.hasOwnProperty(key)) {
					console.log('Number of variables in ' + key + ': ' + info[key].length);
					console.log(key + ' contiene -> ' + info[key]);
					var pathwritekey = device +'/' + key + '.txt';
					var towrite = '';					
					for (var i = 0; i < info[key].length; i++) {
					  console.log('key ' + i + ' -> ' + info[key][i]);
					  towrite += info[key][i]+ '\r\n';
					  if (i==info[key].length-1) {
					    fs.writeFile(pathwritekey,towrite,function(err) { if (err) throw 'error writing file: ' + err; });
					  }
						  var pathwritei = device +'/' + key + '/' + info[key][i]+'.txt';
					  //fs.writeFile(pathwritei,'',function(err) { if (err) throw 'error writing file: ' + err; });
					}//end loop
				}//end if
			}// end loop
    			//PostCode(qs.stringify(info));
		    }else if(variable != ''){
			console.log('asking for variable' + variable);
			for (var k in info) { if (info.hasOwnProperty(k)) {
				for (var l in info[k]) { if (info[k].hasOwnProperty(l)) {
					console.log('---- Number of variables in ' + k + ': ' + info[k][l].length);
					console.log('---- ' + k + ' contiene -> ' + l);
					var pathwritel = device +'/' + variable + '/' + l + '.txt';
					var towrite = '';
					fs.open(pathwritel, 'w', function(err, fd) {
			  		if (err) { throw 'error opening file: ' + err; }});
					for (var p in info[k][l]) { if (info[k][l].hasOwnProperty(p)) {
					  console.log('---- ---- Number of variables in ' + l + ': ' + info[k][l][p].length);
					  console.log('---- ---- ' + l + ' contiene -> ' + info[k][l][p]);
					  towrite += info[k][l][p];
					    fs.writeFile(pathwritel,towrite,function(err) { if (err) throw 'error writing file: ' + err; });
					}}
				}}//end loop
			}}//end if
        			console.log('\r\n\r\n INFO->  '); console.log(info);
				}	
		}else{

			console.log('OTRA VARIABLE');console.log('\r\n\r\ndevice: ' + device + '\r\nvariable:' + variable);
		}
    		//console.log('\r\n WRITTING D por stdout\r\n');process.stdout.write(d);
  	});
  });
  get_req.end();
	console.log("GET Request sent!");
  get_req.on('error', function(e) {
  console.error(e);
  });
}

app.get('/', function(req, res){
  res.render('index', {
    title: 'Project'
  });
});
app.get('/project', function(req, res){
  res.render('project', {
    title: 'Devices'
  });
});
app.get('/rssi', function(req, res){
Getthsq(dev_goya,var_rssi);
var pathreadrs = dev_goya +'/' + var_rssi + '/';
  fs.readFile(pathreadrs + 'value.txt', function(err,data) { if (err) throw err;
  value = data;
  fs.readFile(pathreadrs + 'modified.txt', function(err,data) { if (err) throw err;
  mod = data;
  fs.readFile(pathreadrs + 'synched.txt', function(err,data) { if (err) throw err;
  syn = data;
  res.render('rssi', {
    title: 'Rssi', mvalue: value, mmod: mod, msyn: syn
  });});});});
});

app.get('/light', function(req, res){
Getthsq(dev_goya,var_t);
var pathreadt = dev_goya +'/' + var_t + '/';// value='', mod='', syn='';
    fs.readFile(pathreadt + 'value.txt', function(err,data) { if (err) throw err;
    value = data;
    fs.readFile(pathreadt + 'modified.txt', function(err,data) { if (err) throw err;
    mod = data;
    fs.readFile(pathreadt + 'synched.txt', function(err,data) { if (err) throw err;
    syn = data;
    res.render('light', {
    title: 'Light', mvalue: value, mmod: mod, msyn: syn
  });});});});
});

app.get('/dev', function (req, res) {

  res.render('dev', { title: 'Devices',});
});

app.get('/devices.json', function(request, response) {
  // We want to set the content-type header so that the browser understands
  //  the content of the response.
  response.contentType('application/json');

  // Normally, the would probably come from a database, but we can cheat:
  var people = [
    { name: 'Dave', location: 'Atlanta' },
    { name: 'Santa Claus', location: 'North Pole' },
    { name: 'Man in the Moon', location: 'The Moon' }
  ];

  // Since the request is for a JSON representation of the people, we
  //  should JSON serialize them. The built-in JSON.stringify() function
  //  does that.
  var peopleJSON = JSON.stringify(people);

  // Now, we can use the response object's send method to push that string
  //  of people JSON back to the browser in response to this request:
  response.send(peopleJSON);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

