const openpgp = require('openpgp')
const wait = require('wait-for-stuff')
const fs = require('fs')

var D_PGPGKey_constructor = require('debug')('PGPGKey.constructor()')
var D_PGPGKey_import = require('debug')('PGPGKey.import()')
var D_PGPGKey_export = require('debug')('PGPGKey.export()')
var D_PGPGKey__load = require('debug')('PGPGKey._load()')
var D_PGPGKey_decrypt = require('debug')('PGPGKey.decrypt()')
var D_generateKeyPair = require('debug')('generateKeyPair()')

class PGPKey {
  constructor(keyArmored) {
    D_PGPGKey_constructor('called')
    this.plain = keyArmored
    if(keyArmored) this._load()
    D_PGPGKey_constructor('done')
  }
  import(path) {
    D_PGPGKey_import('called')
    this.plain = fs.readFileSync(path, 'utf8')
    this._load()
    D_PGPGKey_import('done')
    return this
  }
  export(path) {
    D_PGPGKey_export('called')
    fs.writeFileSync(path, this.plain)
    D_PGPGKey_export('done')
  }
  _load() {
    D_PGPGKey__load('called')
    this.openpgp = wait.for.promise(openpgp.key.readArmored(this.plain)).keys[0]
    D_PGPGKey__load('done')
  }
  decrypt(passphrase) {
    D_PGPGKey_decrypt('called')
    this.openpgp.decrypt(passphrase)
    D_PGPGKey_decrypt('done')
    return this
  }
}

function generateKeyPair(userID, passphrase, callback) {
  console.log('called')
  D_generateKeyPair('called')
  // options
  var options = {}
  options.userIds = [userID]
  options.curve = "p256"
  options.passphrase = String(passphrase)
  D_generateKeyPair('configured %o', options)
  var keysArmored = wait.for.promise(openpgp.generateKey(options))
  D_generateKeyPair('generated')
  var keys = {
    "private": new PGPKey(keysArmored.privateKeyArmored).decrypt(passphrase), // '-----BEGIN PGP PRIVATE KEY BLOCK ... '
    "public": new PGPKey(keysArmored.publicKeyArmored),   // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
    // "revocation": new PGPKey(key.revocationCertificate) // '-----BEGIN PGP PUBLIC KEY BLOCK ... '
  }
  D_generateKeyPair('keys loaded - done')
  callback(keys)
}

module.exports = {
  generateKeyPair: generateKeyPair,
  PGPKey: PGPKey
}
