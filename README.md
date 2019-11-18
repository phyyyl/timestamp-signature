# timestamp-signature
Cryptigraphically linking data with timestamps (Proof-of-Concept)

Data can be signed together with a unix timestamp by a trusted party. A user can proof a data-time-relation to others as long as the signing-party is concidered trusted (doesn't fake timestamps). It's done by using PGP keys to sign and verify the payload. The signature is compressed and combined with the payload and timestamp in a single json object.

```javascript
{ data: 'Hello World!',
  time: '1574112398697',
  signature: 'wl4EARMIAAYFAl3TDI4ACgkQZhoWwP4o4w/b1gD+N1kT3pseyyn65Q2Kly9zzGEvVoD6Hp33EamQ8gCWl5kBAOIDgLXx9kkposJm1Nzpf794vOvJ+rhrp5Oubp4DuCPm=ny3P', // signed with the demo key
  sig_ver: 'OpenPGP.js v4.6.2', // openpgpjs version
  tsst_ver: '0.0.0' } // version of this module
```

* [Set up](https://github.com/phyyyl/timestamp-signature#set-up)
* [Generate & export keys](https://github.com/phyyyl/timestamp-signature#generate--export-keys)
* [Load & import keys](https://github.com/phyyyl/timestamp-signature#load--import-keys)
* [Sign](https://github.com/phyyyl/timestamp-signature#sign)
* [Verify](https://github.com/phyyyl/timestamp-signature#verify)

## Set up
_not yet on npm_
```javascript
const tss = require('./tss'); // import as local file

const openpgp = require('openpgp'); // for production key management
const openpgp_utils = require('./openpgp_utils'); // wrapping openpgp functionality for development
```

## Generate & export keys
This package is not meant to generate keys for production. It's only wrapping OpenPGPJS functionality for development purposes. [Generate a new key pair with OpenPGPJS](https://github.com/openpgpjs/openpgpjs#generate-new-key-pair)

```javascript
var userId = { name: 'John Smith', email: 'john.smith@example.com' } // can be empty
var passphrase = 'supersecure' // passphrase to protect the private key

openpgp_utils.generateKeyPair(userId, passphrase, (keys)=>{
  keys.public.export('public_demo_key.asc') // saves the key at the given path
  keys.private.export('private_demo_key.asc')
})
```

## Load & import keys
This package is not meant to load and save keys for production. It's only wrapping OpenPGPJS functionality for development purposes. [Load keys with OpenPGPJS](https://github.com/openpgpjs/openpgpjs#create-and-verify-detached-signatures)

```javascript
var publicKeyArmored = "-----BEGIN PGP PUBLIC KEY BLOCK----- ..."
var publicKey = new openpgp_utils.PGPKey(publicKeyArmored) // import from string
```

```javascript
var privateKey = new openpgp_utils.PGPKey().import('private_demo_key.asc')  // import from path
privateKey.decrypt(passphrase) // decrypt private key with passphrase
```
These key objects contain a plain version ```privateKey.plain``` of the key and the key object created by openpgp ```privateKey.openpgp``` which is actually needed to sign and verify.

## Sign
Data can be signed with the private key. The timestamp is added internally.
```javascript
var tsst = tss.sign("Hello World!", privateKey.openpgp) // returns timestamp-signature-token as seen above
```

## Verify
A TSST can be verified with the public key.
```javascript
var isValid = tss.verify(tsst, publicKey.openpgp) // tells if the signature is valid
```
