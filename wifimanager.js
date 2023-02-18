var C = {
  DNSIP : "192.168.1.1",
  APNAME : "ESP32",
};
var wifi = require('Wifi');
function WifiManager(options) {
  options = options || {};
  this.options=options;
  this.minimumQuality = options.minimumQuality || -1;
  this.wifiScanInterval = options.wifiScanInterval || 30000;
  this.apName = options.apName || C.APNAME;
  this.title = options.title || C.APNAME;
  this.params = options.params || [];
  this.paramscallback = options.paramscallback;
  this.connectedcallback = options.connectedcallback;
  this.log = options.log || console.log;
  this.restart = options.restart || function(){require('ESP32').reboot();};
  this.wifiitems = "";
}

function wifiScan(self) {
  self.log('scan wifi...');
  wifi.scan((res)=>{
    //sort by rssi
    res = res.sort((a,b) => (b.rssi - a.rssi)); 
    // remove dubs
    res = res.filter((t, i, s) => i === s.findIndex((th) => (th.ssid === t.ssid)));
    var count=0;
    var scantxt='';
    res.forEach((e)=>{
      var quality = getRSSIasQuality(e.rssi);
      if (self.minimumQuality == -1 || self.minimumQuality < quality) {
        count++;
        scantxt += HTTP_ITEM
          .replace("{v}", e.ssid)
          .replace("{r}", quality)
          .replace("{i}", e.authmode == 'open' ? '' : 'l');
      }
    });
    if (count===0) scantxt = "No networks found.";
    wifiitems="<br/>"+scantxt;
    self.log('wifi scan done. found '+count+' networks.');
    self.wifiscantimer=setTimeout(()=>{wifiScan(self);},self.wifiScanInterval);
  });
}


function getRSSIasQuality(RSSI) {
  var  quality;
  if (RSSI <= -100) { quality = 0; } 
  else if (RSSI >= -50) { quality = 100; } 
  else { quality = 2 * (RSSI + 100); }
  return quality;
}


WifiManager.prototype.start = function(self) {
  if (wifi.getStatus().station=='connecting') {
    setTimeout(()=>{self.start(self);},500);
    return false;
  }
  if( wifi.getIP().ip === "0.0.0.0" ) {
    self.log('No wifi connection. Starting setup. Connect to ap '+self.apName+' for setup.');
    wifi.setConfig({powersave : "none"});
    wifi.startAP(self.apName,{},(err) => {
      if (err) {
        self.log(err);
        self.restart(err);
      }
      self.log("AP started");
      self.startHttpServer();
      self.startDNSServer();
      setTimeout(()=>{wifiScan(self);},2000);
    });
  } else {
    self.log('wifi connected. IP: '+wifi.getIP().ip);
    wifi.stopAP();
	if (self.scanwifitimer) clearTimeout(self.scanwifitimer);
    if (self.connectedcallback) self.connectedcallback();
  }
};

WifiManager.prototype.params = function() {
  return this.params;
};

var HTTP_HEAD = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8' name='viewport' content='width=device-width, initial-scale=1, user-scalable=no' /><style>.c{text-align: center;}div, input {padding: 5px;        font-size: 1em;      }      input {        width: 95%;      }      body {        text-align: center;        font-family: verdana;      }      button {        border: 0;        border-radius: 0.3rem;        background-color: #1fa3ec;        color: #fff;        line-height: 2.4rem;        font-size: 1.2rem;        width: 100%;      }      .q {        float: right;        width: 64px;        text-align: right;      }      .l {        background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAALVBMVEX///8EBwfBwsLw8PAzNjaCg4NTVVUjJiZDRUUUFxdiZGSho6OSk5Pg4eFydHTCjaf3AAAAZElEQVQ4je2NSw7AIAhEBamKn97/uMXEGBvozkWb9C2Zx4xzWykBhFAeYp9gkLyZE0zIMno9n4g19hmdY39scwqVkOXaxph0ZCXQcqxSpgQpONa59wkRDOL93eAXvimwlbPbwwVAegLS1HGfZAAAAABJRU5ErkJggg==') no-repeat left center;        background-size: 1em;      }    </style>    <script>      function c(l) {        document.getElementById('s').value = l.innerText || l.textContent;        document.getElementById('p').focus();      }    </script>  </head>  <body>    <div style='text-align:left;display:inline-block;min-width:260px;'>";
var HTTP_ITEM = "<div><a href='#p' onclick='c(this)'>{v}</a>&nbsp;<span class='q {i}'>{r}%</span></div>";
var HTTP_FORM_START = "<form method='get' action='/s'><input id='s' name='s' length=32 placeholder='SSID'><br/><input id='p' name='p' length=64 type='password' placeholder='password'><br/><input id='n' name='n' length=32 placeholder='Device name' value='{n}'><br/>";
var HTTP_FORM_PARAM = "<input id='{i}' name='{n}' maxlength={l} placeholder='{p}' value='{v}' {c}><br/>";
var HTTP_FORM_END = "<br/><button type='submit'>Save and connect</button></form>";
var HTTP_SCAN_LINK = "<br/><div class='c'><a href='/'>Scan for networks</a></div>";
var HTTP_SAVED = "<div>Credentials Saved!<br/>Trying to connect ESP to network...<br/>If it fails reconnect to AP to try again.</div>";
var HTTP_END = "</div></body></html>";


function onPageRequest(req, res, self) {
  var a = url.parse(req.url, true);
  var page;
  if (!self.params) {
    self.params = []; 
  }
  if (a.pathname === '/' || a.pathname === '') {
    page = HTTP_HEAD;
    page += "<h1>" + self.title + "</h1>";
    page += "<h3>Setup Wifi</h3>";
    page += HTTP_FORM_START.replace('{n}',self.apName);
    
    self.params.forEach((p)=>{
      var pitem;
      if (p.id) {
        pitem = HTTP_FORM_PARAM
        .replace("{i}", p.id)
        .replace("{n}", p.id)
        .replace("{p}", p.placeholder || '')
        .replace("{l}", p.valueLength || '')
        .replace("{v}", p.value || '')
        .replace("{c}", p.customHTML || '');
      } else {
        pitem = p.customHTML;
      }
      page += pitem;
    });
    page += wifiitems;
    page += HTTP_FORM_END;
    page += HTTP_SCAN_LINK;
    page += HTTP_END;
    res.writeHead(200,{'Content-Length':page.length,'Content-Type': 'text/html'});
    res.end(page);
    return;
  }
  if (a.pathname === '/s') {
    self.params.forEach((p)=>{
      p.value = a.query[p.id];
    });
    page = HTTP_HEAD;
    page += HTTP_SAVED;
    page += HTTP_END;
    res.writeHead(200,{'Content-Length':page.length,'Content-Type': 'text/html'});
    res.end(page);
    wifi.setHostname(a.query.n||self.apName);
    wifi.connect(a.query.s, {password:a.query.p},
       (err) => {
          if (err) {
            self.log('error connecting to wifi: '+err);
            return;
          }
          self.log('wifi connected');
          setTimeout(wifi.save,200);
          wifi.stopAP(()=>{
            if (self.connectedcallback) self.connectedcallback(); else setTimeout(self.restart,1000);
          });
     });
    if (self.paramscallback) self.paramscallback(self.params);
    return;
  }
  if (a.pathname === '/r') {
    page = HTTP_HEAD;
    page += "Module will reset in a few seconds.";
    page += HTTP_END;
    res.writeHead(200,{'Content-Length':page.length,'Content-Type': 'text/html'});
    res.end(page);
    setTimeout(self.restart,200);
    return;
  }
  res.writeHead(302, {Location: 'http://'+self.apName});
  res.end('');
  return;
}

function dnsQname(msg) {
  var i = 12;
  var qname = '';
  while ( msg[i] !== '\x00' ) {
    qname +=  msg[i];
    i++;
  }
  return qname + '\x00';
}

function dnsResponse(msg,dns_ip){
  return msg[0]+msg[1] + '\x81\x80\x00\x01\x00\x01\x00\x00\x00\x00' +
         dnsQname(msg) + '\x00\x01\x00\x01\xc0\x0c\x00\x01\x00\x01\x00\x00\x00\xf9\x00\x04' + dns_ip  ;
}

WifiManager.prototype.startDNSServer = function() { 
  this.dns = require('dgram').createSocket('udp4');
  var dnsIP = C.DNSIP.split('.').map(n => String.fromCharCode(parseInt(n, 10))).join('');
  this.dns.on('error', (err) => {
    this.log('error starting dns server: '+err);
    this.restart();
  });
  this.dns.on('message', (msg, info) => {
    if ( msg[msg.length-3] === '\x01') {
      this.dns.send(dnsResponse(msg,dnsIP),info.port,info.address);
    }
  });
  this.dns.bind(53);
};

WifiManager.prototype.startHttpServer = function(){
  console.log("Starting server!");
  this.server = require('http').createServer(function (req, res) {onPageRequest(req, res, this);});
  this.server.listen(80);
};

start = function(connectedcallback,options) {
  options = options || {};
  options.connectedcallback=connectedcallback;
  var self=new WifiManager(options);
  setTimeout(()=>{self.start(self),1000});
};

// clearsaved = function() {
//   require('Wifi').save('clear');
// };
start(() => console.log("connected"), {});