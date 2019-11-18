const tss = require('./../src/tss');
const fs = require('fs');
const openpgp_utils = require('./../src/openpgp_utils')
const package_name = require('./../package.json').name

var D_main = require('debug')('main')

D_main('started')
if(!fs.existsSync('private_demo_key.asc')) {
  openpgp_utils.generateKeyPair({ name: package_name + ' DEMO' }, 'pswd', (keys)=>{
    D_main('Key pair generated')
    keys.public.export('public_demo_key.asc')
    keys.private.export('private_demo_key.asc')
    D_main('keys exported')
  })
  while(!fs.existsSync('private_demo_key.asc')) {}
}

var privateKey = new openpgp_utils.PGPKey().import('private_demo_key.asc').decrypt('pswd')
D_main('private key loaded & decrypted')
var tsst = tss.sign("Hello World!", privateKey.openpgp)
D_main('meassege signed & token created: %o', tsst)

var publicKey = new openpgp_utils.PGPKey().import('public_demo_key.asc')
D_main('public key loaded')
var isValid = tss.verify(tsst, publicKey.openpgp)
D_main('meassege verified?: %o', isValid)
