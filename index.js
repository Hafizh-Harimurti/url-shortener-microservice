require('dotenv').config();
require('node:url');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

const ShortURL = require('./schemas/ShortURLSchema');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({extended:false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res, next) {
  try{
    target_url = req.body.url.endsWith('/') ? req.body.url.slice(0, -1) : req.body.url;
    full_url = new URL(target_url);
    dns.lookup(full_url.hostname, function(err, address, family){
      if(err){
        res.json({error: 'invalid url'});
      } else {
        ShortURL.findOne({original_url:full_url.href}, function(err, data){
          if(err){
            res.json({error: 'invalid url'})
          } else if(data) {
            res.json({original_url:data.original_url, short_url:data.short_url});
          } else {
            ShortURL.create({original_url:full_url.href},function(err, data){
              if(err){
                return next(err);
              }
              res.json({original_url:data.original_url, short_url:data.short_url});
            });
          }
        });
      }
    });
  } catch {
    res.json({error: 'invalid url'})
  }
});

app.get('/api/shorturl/:short_url', function(req,res,next){
  try{
    ShortURL.findOne({'short_url':req.params.short_url},function(err,data){
      if(err){
        return next(err);
      } else if (data) {
        res.redirect(data.original_url)
      } else {
        res.json({error: 'invalid url'})
      }
    })
  }catch{
    res.json({error: 'invalid url'})
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
