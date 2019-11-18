const openpgp = require('openpgp')
const wait = require('wait-for-stuff')
const package_version = require('./../package.json').version

const print = console.log

var D_sign = require('debug')('sign()')
var D_verify = require('debug')('verify()')


function sign(data, privateKey) {
  D_sign('called')
  var time = String(Date.now())
  var options = {
    message: openpgp.cleartext.fromText(data + time),
    privateKeys: [privateKey],
    detached: true
  }
  D_sign('configured')
  var signed = wait.for.promise(openpgp.sign(options))
  D_sign('signed')
  var deflated = deflateSignature(signed.signature)
  D_sign('deflated')
  var tsst = { // timestamp signature token
    "data": data,
    "time": time,
    "signature": deflated.signature,
    "sig_ver": deflated.sig_ver,
    "tsst_ver": package_version
  }
  D_sign('token created')
  return tsst
}

function verify(tsst, publicKey) {
  D_verify('called')
  var inflatedSignature = inflateSignature({
    "sig_ver": tsst.sig_ver,
    "signature": tsst.signature
  })
  D_verify('inflated')
  var options = {
    message: openpgp.cleartext.fromText(tsst.data + tsst.time),
    signature: wait.for.promise(openpgp.signature.readArmored(inflatedSignature)),
    publicKeys: [publicKey]
  };
  D_verify('configured')

  var verified = wait.for.promise(openpgp.verify(options))
  D_verify('verified')
  // console.log(verified)
  var isValid = verified.signatures[0].valid;
  // if(isValid) {
  //   console.log('signed by key id ' + verified.signatures[0].keyid.toHex());
  // }
  return isValid
}

function deflateSignature(signature) {
  signature = signature.split('\n')
  var deflated = {
    "sig_ver": signature[1].slice(9, -1),
    "signature": ""
  }
  for(var i = 4; i < signature.length -2; i++) {
    deflated.signature += signature[i].slice(0, -1)
  }
  return deflated
}

function inflateSignature(deflated) {
  signature = []
  signature.push('-----BEGIN PGP SIGNATURE-----\r')
  if(deflated.version) signature.push('Version: ' + deflated.version + '\r')
  signature.push('\r')
  var equals = deflated.signature.split('=')
  while (equals[0].length) {
      signature.push(equals[0].substr(0, 60) + '\r');
      equals[0] = equals[0].substr(60);
  }
  signature.push('='+equals[1]+'\r')
  signature.push('-----END PGP SIGNATURE-----\r')
  signature.push('')
  return signature.join('\n')
}

module.exports = {
  sign: sign,
  verify: verify,
  deflateSignature: deflateSignature,
  inflateSignature: inflateSignature
}
