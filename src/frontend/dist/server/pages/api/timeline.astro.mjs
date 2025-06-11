import require$$0$4 from 'events';
import require$$0$1 from 'pg-types';
import require$$0$2 from 'crypto';
import require$$0$3 from 'dns';
import require$$2 from 'pg-connection-string';
import require$$1$1 from 'pg-protocol';
import require$$0$5 from 'net';
import require$$1 from 'tls';
import require$$2$1 from 'pg-cloudflare';
import require$$5 from 'pg-pool';
import require$$1$2 from 'util';
export { renderers } from '../../renderers.mjs';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
        return Reflect.construct(f, arguments, this.constructor);
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var lib = {exports: {}};

var defaults$3 = {exports: {}};

(function (module) {
	module.exports = {
	  // database host. defaults to localhost
	  host: "localhost",
	  // database user's name
	  user: process.platform === "win32" ? process.env.USERNAME : process.env.USER,
	  // name of database to connect
	  database: void 0,
	  // database user's password
	  password: null,
	  // a Postgres connection string to be used instead of setting individual connection items
	  // NOTE:  Setting this value will cause it to override any other value (such as database or user) defined
	  // in the defaults object.
	  connectionString: void 0,
	  // database port
	  port: 5432,
	  // number of rows to return at a time from a prepared statement's
	  // portal. 0 will return all rows at once
	  rows: 0,
	  // binary result mode
	  binary: false,
	  // Connection pool options - see https://github.com/brianc/node-pg-pool
	  // number of connections to use in connection pool
	  // 0 will disable connection pooling
	  max: 10,
	  // max milliseconds a client can go unused before it is removed
	  // from the pool and destroyed
	  idleTimeoutMillis: 3e4,
	  client_encoding: "",
	  ssl: false,
	  application_name: void 0,
	  fallback_application_name: void 0,
	  options: void 0,
	  parseInputDatesAsUTC: false,
	  // max milliseconds any query using this connection will execute for before timing out in error.
	  // false=unlimited
	  statement_timeout: false,
	  // Abort any statement that waits longer than the specified duration in milliseconds while attempting to acquire a lock.
	  // false=unlimited
	  lock_timeout: false,
	  // Terminate any session with an open transaction that has been idle for longer than the specified duration in milliseconds
	  // false=unlimited
	  idle_in_transaction_session_timeout: false,
	  // max milliseconds to wait for query to complete (client side)
	  query_timeout: false,
	  connect_timeout: 0,
	  keepalives: 1,
	  keepalives_idle: 0
	};
	const pgTypes = require$$0$1;
	const parseBigInteger = pgTypes.getTypeParser(20, "text");
	const parseBigIntegerArray = pgTypes.getTypeParser(1016, "text");
	module.exports.__defineSetter__("parseInt8", function(val) {
	  pgTypes.setTypeParser(20, "text", val ? pgTypes.getTypeParser(23, "text") : parseBigInteger);
	  pgTypes.setTypeParser(1016, "text", val ? pgTypes.getTypeParser(1007, "text") : parseBigIntegerArray);
	}); 
} (defaults$3));

var defaultsExports = defaults$3.exports;

const defaults$2 = defaultsExports;

function escapeElement(elementRepresentation) {
  const escaped = elementRepresentation.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  return '"' + escaped + '"'
}

// convert a JS array to a postgres array literal
// uses comma separator so won't work for types like box that use
// a different array separator.
function arrayString(val) {
  let result = '{';
  for (let i = 0; i < val.length; i++) {
    if (i > 0) {
      result = result + ',';
    }
    if (val[i] === null || typeof val[i] === 'undefined') {
      result = result + 'NULL';
    } else if (Array.isArray(val[i])) {
      result = result + arrayString(val[i]);
    } else if (ArrayBuffer.isView(val[i])) {
      let item = val[i];
      if (!(item instanceof Buffer)) {
        const buf = Buffer.from(item.buffer, item.byteOffset, item.byteLength);
        if (buf.length === item.byteLength) {
          item = buf;
        } else {
          item = buf.slice(item.byteOffset, item.byteOffset + item.byteLength);
        }
      }
      result += '\\\\x' + item.toString('hex');
    } else {
      result += escapeElement(prepareValue(val[i]));
    }
  }
  result = result + '}';
  return result
}

// converts values from javascript types
// to their 'raw' counterparts for use as a postgres parameter
// note: you can override this function to provide your own conversion mechanism
// for complex types, etc...
const prepareValue = function (val, seen) {
  // null and undefined are both null for postgres
  if (val == null) {
    return null
  }
  if (typeof val === 'object') {
    if (val instanceof Buffer) {
      return val
    }
    if (ArrayBuffer.isView(val)) {
      const buf = Buffer.from(val.buffer, val.byteOffset, val.byteLength);
      if (buf.length === val.byteLength) {
        return buf
      }
      return buf.slice(val.byteOffset, val.byteOffset + val.byteLength) // Node.js v4 does not support those Buffer.from params
    }
    if (val instanceof Date) {
      if (defaults$2.parseInputDatesAsUTC) {
        return dateToStringUTC(val)
      } else {
        return dateToString(val)
      }
    }
    if (Array.isArray(val)) {
      return arrayString(val)
    }

    return prepareObject(val, seen)
  }
  return val.toString()
};

function prepareObject(val, seen) {
  if (val && typeof val.toPostgres === 'function') {
    seen = seen || [];
    if (seen.indexOf(val) !== -1) {
      throw new Error('circular reference detected while preparing "' + val + '" for query')
    }
    seen.push(val);

    return prepareValue(val.toPostgres(prepareValue), seen)
  }
  return JSON.stringify(val)
}

function dateToString(date) {
  let offset = -date.getTimezoneOffset();

  let year = date.getFullYear();
  const isBCYear = year < 1;
  if (isBCYear) year = Math.abs(year) + 1; // negative years are 1 off their BC representation

  let ret =
    String(year).padStart(4, '0') +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0') +
    'T' +
    String(date.getHours()).padStart(2, '0') +
    ':' +
    String(date.getMinutes()).padStart(2, '0') +
    ':' +
    String(date.getSeconds()).padStart(2, '0') +
    '.' +
    String(date.getMilliseconds()).padStart(3, '0');

  if (offset < 0) {
    ret += '-';
    offset *= -1;
  } else {
    ret += '+';
  }

  ret += String(Math.floor(offset / 60)).padStart(2, '0') + ':' + String(offset % 60).padStart(2, '0');
  if (isBCYear) ret += ' BC';
  return ret
}

function dateToStringUTC(date) {
  let year = date.getUTCFullYear();
  const isBCYear = year < 1;
  if (isBCYear) year = Math.abs(year) + 1; // negative years are 1 off their BC representation

  let ret =
    String(year).padStart(4, '0') +
    '-' +
    String(date.getUTCMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getUTCDate()).padStart(2, '0') +
    'T' +
    String(date.getUTCHours()).padStart(2, '0') +
    ':' +
    String(date.getUTCMinutes()).padStart(2, '0') +
    ':' +
    String(date.getUTCSeconds()).padStart(2, '0') +
    '.' +
    String(date.getUTCMilliseconds()).padStart(3, '0');

  ret += '+00:00';
  if (isBCYear) ret += ' BC';
  return ret
}

function normalizeQueryConfig(config, values, callback) {
  // can take in strings or config objects
  config = typeof config === 'string' ? { text: config } : config;
  if (values) {
    if (typeof values === 'function') {
      config.callback = values;
    } else {
      config.values = values;
    }
  }
  if (callback) {
    config.callback = callback;
  }
  return config
}

// Ported from PostgreSQL 9.2.4 source code in src/interfaces/libpq/fe-exec.c
const escapeIdentifier = function (str) {
  return '"' + str.replace(/"/g, '""') + '"'
};

const escapeLiteral = function (str) {
  let hasBackslash = false;
  let escaped = "'";

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === "'") {
      escaped += c + c;
    } else if (c === '\\') {
      escaped += c + c;
      hasBackslash = true;
    } else {
      escaped += c;
    }
  }

  escaped += "'";

  if (hasBackslash === true) {
    escaped = ' E' + escaped;
  }

  return escaped
};

var utils$3 = {
  prepareValue: function prepareValueWrapper(value) {
    // this ensures that extra arguments do not get passed into prepareValue
    // by accident, eg: from calling values.map(utils.prepareValue)
    return prepareValue(value)
  },
  normalizeQueryConfig,
  escapeIdentifier,
  escapeLiteral,
};

var utils$2 = {exports: {}};

var utilsLegacy;
var hasRequiredUtilsLegacy;

function requireUtilsLegacy () {
	if (hasRequiredUtilsLegacy) return utilsLegacy;
	hasRequiredUtilsLegacy = 1;
	// This file contains crypto utility functions for versions of Node.js < 15.0.0,
	// which does not support the WebCrypto.subtle API.

	const nodeCrypto = require$$0$2;

	function md5(string) {
	  return nodeCrypto.createHash('md5').update(string, 'utf-8').digest('hex')
	}

	// See AuthenticationMD5Password at https://www.postgresql.org/docs/current/static/protocol-flow.html
	function postgresMd5PasswordHash(user, password, salt) {
	  const inner = md5(password + user);
	  const outer = md5(Buffer.concat([Buffer.from(inner), salt]));
	  return 'md5' + outer
	}

	function sha256(text) {
	  return nodeCrypto.createHash('sha256').update(text).digest()
	}

	function hashByName(hashName, text) {
	  hashName = hashName.replace(/(\D)-/, '$1'); // e.g. SHA-256 -> SHA256
	  return nodeCrypto.createHash(hashName).update(text).digest()
	}

	function hmacSha256(key, msg) {
	  return nodeCrypto.createHmac('sha256', key).update(msg).digest()
	}

	async function deriveKey(password, salt, iterations) {
	  return nodeCrypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256')
	}

	utilsLegacy = {
	  postgresMd5PasswordHash,
	  randomBytes: nodeCrypto.randomBytes,
	  deriveKey,
	  sha256,
	  hashByName,
	  hmacSha256,
	  md5,
	};
	return utilsLegacy;
}

var utilsWebcrypto;
var hasRequiredUtilsWebcrypto;

function requireUtilsWebcrypto () {
	if (hasRequiredUtilsWebcrypto) return utilsWebcrypto;
	hasRequiredUtilsWebcrypto = 1;
	const nodeCrypto = require$$0$2;

	utilsWebcrypto = {
	  postgresMd5PasswordHash,
	  randomBytes,
	  deriveKey,
	  sha256,
	  hashByName,
	  hmacSha256,
	  md5,
	};

	/**
	 * The Web Crypto API - grabbed from the Node.js library or the global
	 * @type Crypto
	 */
	// eslint-disable-next-line no-undef
	const webCrypto = nodeCrypto.webcrypto || globalThis.crypto;
	/**
	 * The SubtleCrypto API for low level crypto operations.
	 * @type SubtleCrypto
	 */
	const subtleCrypto = webCrypto.subtle;
	const textEncoder = new TextEncoder();

	/**
	 *
	 * @param {*} length
	 * @returns
	 */
	function randomBytes(length) {
	  return webCrypto.getRandomValues(Buffer.alloc(length))
	}

	async function md5(string) {
	  try {
	    return nodeCrypto.createHash('md5').update(string, 'utf-8').digest('hex')
	  } catch (e) {
	    // `createHash()` failed so we are probably not in Node.js, use the WebCrypto API instead.
	    // Note that the MD5 algorithm on WebCrypto is not available in Node.js.
	    // This is why we cannot just use WebCrypto in all environments.
	    const data = typeof string === 'string' ? textEncoder.encode(string) : string;
	    const hash = await subtleCrypto.digest('MD5', data);
	    return Array.from(new Uint8Array(hash))
	      .map((b) => b.toString(16).padStart(2, '0'))
	      .join('')
	  }
	}

	// See AuthenticationMD5Password at https://www.postgresql.org/docs/current/static/protocol-flow.html
	async function postgresMd5PasswordHash(user, password, salt) {
	  const inner = await md5(password + user);
	  const outer = await md5(Buffer.concat([Buffer.from(inner), salt]));
	  return 'md5' + outer
	}

	/**
	 * Create a SHA-256 digest of the given data
	 * @param {Buffer} data
	 */
	async function sha256(text) {
	  return await subtleCrypto.digest('SHA-256', text)
	}

	async function hashByName(hashName, text) {
	  return await subtleCrypto.digest(hashName, text)
	}

	/**
	 * Sign the message with the given key
	 * @param {ArrayBuffer} keyBuffer
	 * @param {string} msg
	 */
	async function hmacSha256(keyBuffer, msg) {
	  const key = await subtleCrypto.importKey('raw', keyBuffer, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
	  return await subtleCrypto.sign('HMAC', key, textEncoder.encode(msg))
	}

	/**
	 * Derive a key from the password and salt
	 * @param {string} password
	 * @param {Uint8Array} salt
	 * @param {number} iterations
	 */
	async function deriveKey(password, salt, iterations) {
	  const key = await subtleCrypto.importKey('raw', textEncoder.encode(password), 'PBKDF2', false, ['deriveBits']);
	  const params = { name: 'PBKDF2', hash: 'SHA-256', salt: salt, iterations: iterations };
	  return await subtleCrypto.deriveBits(params, key, 32 * 8, ['deriveBits'])
	}
	return utilsWebcrypto;
}

const useLegacyCrypto = parseInt(process.versions && process.versions.node && process.versions.node.split('.')[0]) < 15;
if (useLegacyCrypto) {
  // We are on an old version of Node.js that requires legacy crypto utilities.
  utils$2.exports = requireUtilsLegacy();
} else {
  utils$2.exports = requireUtilsWebcrypto();
}

var utilsExports = utils$2.exports;

function x509Error(msg, cert) {
  return new Error('SASL channel binding: ' + msg + ' when parsing public certificate ' + cert.toString('base64'))
}

function readASN1Length(data, index) {
  let length = data[index++];
  if (length < 0x80) return { length, index }

  const lengthBytes = length & 0x7f;
  if (lengthBytes > 4) throw x509Error('bad length', data)

  length = 0;
  for (let i = 0; i < lengthBytes; i++) {
    length = (length << 8) | data[index++];
  }

  return { length, index }
}

function readASN1OID(data, index) {
  if (data[index++] !== 0x6) throw x509Error('non-OID data', data) // 6 = OID

  const { length: OIDLength, index: indexAfterOIDLength } = readASN1Length(data, index);
  index = indexAfterOIDLength;
  const lastIndex = index + OIDLength;

  const byte1 = data[index++];
  let oid = ((byte1 / 40) >> 0) + '.' + (byte1 % 40);

  while (index < lastIndex) {
    // loop over numbers in OID
    let value = 0;
    while (index < lastIndex) {
      // loop over bytes in number
      const nextByte = data[index++];
      value = (value << 7) | (nextByte & 0x7f);
      if (nextByte < 0x80) break
    }
    oid += '.' + value;
  }

  return { oid, index }
}

function expectASN1Seq(data, index) {
  if (data[index++] !== 0x30) throw x509Error('non-sequence data', data) // 30 = Sequence
  return readASN1Length(data, index)
}

function signatureAlgorithmHashFromCertificate$1(data, index) {
  // read this thread: https://www.postgresql.org/message-id/17760-b6c61e752ec07060%40postgresql.org
  if (index === undefined) index = 0;
  index = expectASN1Seq(data, index).index;
  const { length: certInfoLength, index: indexAfterCertInfoLength } = expectASN1Seq(data, index);
  index = indexAfterCertInfoLength + certInfoLength; // skip over certificate info
  index = expectASN1Seq(data, index).index; // skip over signature length field
  const { oid, index: indexAfterOID } = readASN1OID(data, index);
  switch (oid) {
    // RSA
    case '1.2.840.113549.1.1.4':
      return 'MD5'
    case '1.2.840.113549.1.1.5':
      return 'SHA-1'
    case '1.2.840.113549.1.1.11':
      return 'SHA-256'
    case '1.2.840.113549.1.1.12':
      return 'SHA-384'
    case '1.2.840.113549.1.1.13':
      return 'SHA-512'
    case '1.2.840.113549.1.1.14':
      return 'SHA-224'
    case '1.2.840.113549.1.1.15':
      return 'SHA512-224'
    case '1.2.840.113549.1.1.16':
      return 'SHA512-256'
    // ECDSA
    case '1.2.840.10045.4.1':
      return 'SHA-1'
    case '1.2.840.10045.4.3.1':
      return 'SHA-224'
    case '1.2.840.10045.4.3.2':
      return 'SHA-256'
    case '1.2.840.10045.4.3.3':
      return 'SHA-384'
    case '1.2.840.10045.4.3.4':
      return 'SHA-512'
    // RSASSA-PSS: hash is indicated separately
    case '1.2.840.113549.1.1.10': {
      index = indexAfterOID;
      index = expectASN1Seq(data, index).index;
      if (data[index++] !== 0xa0) throw x509Error('non-tag data', data) // a0 = constructed tag 0
      index = readASN1Length(data, index).index; // skip over tag length field
      index = expectASN1Seq(data, index).index; // skip over sequence length field
      const { oid: hashOID } = readASN1OID(data, index);
      switch (hashOID) {
        // standalone hash OIDs
        case '1.2.840.113549.2.5':
          return 'MD5'
        case '1.3.14.3.2.26':
          return 'SHA-1'
        case '2.16.840.1.101.3.4.2.1':
          return 'SHA-256'
        case '2.16.840.1.101.3.4.2.2':
          return 'SHA-384'
        case '2.16.840.1.101.3.4.2.3':
          return 'SHA-512'
      }
      throw x509Error('unknown hash OID ' + hashOID, data)
    }
    // Ed25519 -- see https: return//github.com/openssl/openssl/issues/15477
    case '1.3.101.110':
    case '1.3.101.112': // ph
      return 'SHA-512'
    // Ed448 -- still not in pg 17.2 (if supported, digest would be SHAKE256 x 64 bytes)
    case '1.3.101.111':
    case '1.3.101.113': // ph
      throw x509Error('Ed448 certificate channel binding is not currently supported by Postgres')
  }
  throw x509Error('unknown OID ' + oid, data)
}

var certSignatures = { signatureAlgorithmHashFromCertificate: signatureAlgorithmHashFromCertificate$1 };

const crypto$1 = utilsExports;
const { signatureAlgorithmHashFromCertificate } = certSignatures;

function startSession(mechanisms, stream) {
  const candidates = ['SCRAM-SHA-256'];
  if (stream) candidates.unshift('SCRAM-SHA-256-PLUS'); // higher-priority, so placed first

  const mechanism = candidates.find((candidate) => mechanisms.includes(candidate));

  if (!mechanism) {
    throw new Error('SASL: Only mechanism(s) ' + candidates.join(' and ') + ' are supported')
  }

  if (mechanism === 'SCRAM-SHA-256-PLUS' && typeof stream.getPeerCertificate !== 'function') {
    // this should never happen if we are really talking to a Postgres server
    throw new Error('SASL: Mechanism SCRAM-SHA-256-PLUS requires a certificate')
  }

  const clientNonce = crypto$1.randomBytes(18).toString('base64');
  const gs2Header = mechanism === 'SCRAM-SHA-256-PLUS' ? 'p=tls-server-end-point' : stream ? 'y' : 'n';

  return {
    mechanism,
    clientNonce,
    response: gs2Header + ',,n=*,r=' + clientNonce,
    message: 'SASLInitialResponse',
  }
}

async function continueSession(session, password, serverData, stream) {
  if (session.message !== 'SASLInitialResponse') {
    throw new Error('SASL: Last message was not SASLInitialResponse')
  }
  if (typeof password !== 'string') {
    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string')
  }
  if (password === '') {
    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a non-empty string')
  }
  if (typeof serverData !== 'string') {
    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: serverData must be a string')
  }

  const sv = parseServerFirstMessage(serverData);

  if (!sv.nonce.startsWith(session.clientNonce)) {
    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce does not start with client nonce')
  } else if (sv.nonce.length === session.clientNonce.length) {
    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: server nonce is too short')
  }

  const clientFirstMessageBare = 'n=*,r=' + session.clientNonce;
  const serverFirstMessage = 'r=' + sv.nonce + ',s=' + sv.salt + ',i=' + sv.iteration;

  // without channel binding:
  let channelBinding = stream ? 'eSws' : 'biws'; // 'y,,' or 'n,,', base64-encoded

  // override if channel binding is in use:
  if (session.mechanism === 'SCRAM-SHA-256-PLUS') {
    const peerCert = stream.getPeerCertificate().raw;
    let hashName = signatureAlgorithmHashFromCertificate(peerCert);
    if (hashName === 'MD5' || hashName === 'SHA-1') hashName = 'SHA-256';
    const certHash = await crypto$1.hashByName(hashName, peerCert);
    const bindingData = Buffer.concat([Buffer.from('p=tls-server-end-point,,'), Buffer.from(certHash)]);
    channelBinding = bindingData.toString('base64');
  }

  const clientFinalMessageWithoutProof = 'c=' + channelBinding + ',r=' + sv.nonce;
  const authMessage = clientFirstMessageBare + ',' + serverFirstMessage + ',' + clientFinalMessageWithoutProof;

  const saltBytes = Buffer.from(sv.salt, 'base64');
  const saltedPassword = await crypto$1.deriveKey(password, saltBytes, sv.iteration);
  const clientKey = await crypto$1.hmacSha256(saltedPassword, 'Client Key');
  const storedKey = await crypto$1.sha256(clientKey);
  const clientSignature = await crypto$1.hmacSha256(storedKey, authMessage);
  const clientProof = xorBuffers(Buffer.from(clientKey), Buffer.from(clientSignature)).toString('base64');
  const serverKey = await crypto$1.hmacSha256(saltedPassword, 'Server Key');
  const serverSignatureBytes = await crypto$1.hmacSha256(serverKey, authMessage);

  session.message = 'SASLResponse';
  session.serverSignature = Buffer.from(serverSignatureBytes).toString('base64');
  session.response = clientFinalMessageWithoutProof + ',p=' + clientProof;
}

function finalizeSession(session, serverData) {
  if (session.message !== 'SASLResponse') {
    throw new Error('SASL: Last message was not SASLResponse')
  }
  if (typeof serverData !== 'string') {
    throw new Error('SASL: SCRAM-SERVER-FINAL-MESSAGE: serverData must be a string')
  }

  const { serverSignature } = parseServerFinalMessage(serverData);

  if (serverSignature !== session.serverSignature) {
    throw new Error('SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature does not match')
  }
}

/**
 * printable       = %x21-2B / %x2D-7E
 *                   ;; Printable ASCII except ",".
 *                   ;; Note that any "printable" is also
 *                   ;; a valid "value".
 */
function isPrintableChars(text) {
  if (typeof text !== 'string') {
    throw new TypeError('SASL: text must be a string')
  }
  return text
    .split('')
    .map((_, i) => text.charCodeAt(i))
    .every((c) => (c >= 0x21 && c <= 0x2b) || (c >= 0x2d && c <= 0x7e))
}

/**
 * base64-char     = ALPHA / DIGIT / "/" / "+"
 *
 * base64-4        = 4base64-char
 *
 * base64-3        = 3base64-char "="
 *
 * base64-2        = 2base64-char "=="
 *
 * base64          = *base64-4 [base64-3 / base64-2]
 */
function isBase64(text) {
  return /^(?:[a-zA-Z0-9+/]{4})*(?:[a-zA-Z0-9+/]{2}==|[a-zA-Z0-9+/]{3}=)?$/.test(text)
}

function parseAttributePairs(text) {
  if (typeof text !== 'string') {
    throw new TypeError('SASL: attribute pairs text must be a string')
  }

  return new Map(
    text.split(',').map((attrValue) => {
      if (!/^.=/.test(attrValue)) {
        throw new Error('SASL: Invalid attribute pair entry')
      }
      const name = attrValue[0];
      const value = attrValue.substring(2);
      return [name, value]
    })
  )
}

function parseServerFirstMessage(data) {
  const attrPairs = parseAttributePairs(data);

  const nonce = attrPairs.get('r');
  if (!nonce) {
    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce missing')
  } else if (!isPrintableChars(nonce)) {
    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: nonce must only contain printable characters')
  }
  const salt = attrPairs.get('s');
  if (!salt) {
    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: salt missing')
  } else if (!isBase64(salt)) {
    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: salt must be base64')
  }
  const iterationText = attrPairs.get('i');
  if (!iterationText) {
    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: iteration missing')
  } else if (!/^[1-9][0-9]*$/.test(iterationText)) {
    throw new Error('SASL: SCRAM-SERVER-FIRST-MESSAGE: invalid iteration count')
  }
  const iteration = parseInt(iterationText, 10);

  return {
    nonce,
    salt,
    iteration,
  }
}

function parseServerFinalMessage(serverData) {
  const attrPairs = parseAttributePairs(serverData);
  const serverSignature = attrPairs.get('v');
  if (!serverSignature) {
    throw new Error('SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature is missing')
  } else if (!isBase64(serverSignature)) {
    throw new Error('SASL: SCRAM-SERVER-FINAL-MESSAGE: server signature must be base64')
  }
  return {
    serverSignature,
  }
}

function xorBuffers(a, b) {
  if (!Buffer.isBuffer(a)) {
    throw new TypeError('first argument must be a Buffer')
  }
  if (!Buffer.isBuffer(b)) {
    throw new TypeError('second argument must be a Buffer')
  }
  if (a.length !== b.length) {
    throw new Error('Buffer lengths must match')
  }
  if (a.length === 0) {
    throw new Error('Buffers cannot be empty')
  }
  return Buffer.from(a.map((_, i) => a[i] ^ b[i]))
}

var sasl$1 = {
  startSession,
  continueSession,
  finalizeSession,
};

const types$1 = require$$0$1;

function TypeOverrides$1(userTypes) {
  this._types = userTypes || types$1;
  this.text = {};
  this.binary = {};
}

TypeOverrides$1.prototype.getOverrides = function (format) {
  switch (format) {
    case 'text':
      return this.text
    case 'binary':
      return this.binary
    default:
      return {}
  }
};

TypeOverrides$1.prototype.setTypeParser = function (oid, format, parseFn) {
  if (typeof format === 'function') {
    parseFn = format;
    format = 'text';
  }
  this.getOverrides(format)[oid] = parseFn;
};

TypeOverrides$1.prototype.getTypeParser = function (oid, format) {
  format = format || 'text';
  return this.getOverrides(format)[oid] || this._types.getTypeParser(oid, format)
};

var typeOverrides = TypeOverrides$1;

const dns = require$$0$3;
const defaults$1 = defaultsExports;
const parse$1 = require$$2.parse;
const val = function(key, config, envVar) {
  if (envVar === void 0) {
    envVar = process.env["PG" + key.toUpperCase()];
  } else if (envVar === false) ; else {
    envVar = process.env[envVar];
  }
  return config[key] || envVar || defaults$1[key];
};
const readSSLConfigFromEnvironment = function() {
  switch (process.env.PGSSLMODE) {
    case "disable":
      return false;
    case "prefer":
    case "require":
    case "verify-ca":
    case "verify-full":
      return true;
    case "no-verify":
      return { rejectUnauthorized: false };
  }
  return defaults$1.ssl;
};
const quoteParamValue = function(value) {
  return "'" + ("" + value).replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
};
const add = function(params, config, paramName) {
  const value = config[paramName];
  if (value !== void 0 && value !== null) {
    params.push(paramName + "=" + quoteParamValue(value));
  }
};
let ConnectionParameters$1 = class ConnectionParameters {
  constructor(config) {
    config = typeof config === "string" ? parse$1(config) : config || {};
    if (config.connectionString) {
      config = Object.assign({}, config, parse$1(config.connectionString));
    }
    this.user = val("user", config);
    this.database = val("database", config);
    if (this.database === void 0) {
      this.database = this.user;
    }
    this.port = parseInt(val("port", config), 10);
    this.host = val("host", config);
    Object.defineProperty(this, "password", {
      configurable: true,
      enumerable: false,
      writable: true,
      value: val("password", config)
    });
    this.binary = val("binary", config);
    this.options = val("options", config);
    this.ssl = typeof config.ssl === "undefined" ? readSSLConfigFromEnvironment() : config.ssl;
    if (typeof this.ssl === "string") {
      if (this.ssl === "true") {
        this.ssl = true;
      }
    }
    if (this.ssl === "no-verify") {
      this.ssl = { rejectUnauthorized: false };
    }
    if (this.ssl && this.ssl.key) {
      Object.defineProperty(this.ssl, "key", {
        enumerable: false
      });
    }
    this.client_encoding = val("client_encoding", config);
    this.replication = val("replication", config);
    this.isDomainSocket = !(this.host || "").indexOf("/");
    this.application_name = val("application_name", config, "PGAPPNAME");
    this.fallback_application_name = val("fallback_application_name", config, false);
    this.statement_timeout = val("statement_timeout", config, false);
    this.lock_timeout = val("lock_timeout", config, false);
    this.idle_in_transaction_session_timeout = val("idle_in_transaction_session_timeout", config, false);
    this.query_timeout = val("query_timeout", config, false);
    if (config.connectionTimeoutMillis === void 0) {
      this.connect_timeout = process.env.PGCONNECT_TIMEOUT || 0;
    } else {
      this.connect_timeout = Math.floor(config.connectionTimeoutMillis / 1e3);
    }
    if (config.keepAlive === false) {
      this.keepalives = 0;
    } else if (config.keepAlive === true) {
      this.keepalives = 1;
    }
    if (typeof config.keepAliveInitialDelayMillis === "number") {
      this.keepalives_idle = Math.floor(config.keepAliveInitialDelayMillis / 1e3);
    }
  }
  getLibpqConnectionString(cb) {
    const params = [];
    add(params, this, "user");
    add(params, this, "password");
    add(params, this, "port");
    add(params, this, "application_name");
    add(params, this, "fallback_application_name");
    add(params, this, "connect_timeout");
    add(params, this, "options");
    const ssl = typeof this.ssl === "object" ? this.ssl : this.ssl ? { sslmode: this.ssl } : {};
    add(params, ssl, "sslmode");
    add(params, ssl, "sslca");
    add(params, ssl, "sslkey");
    add(params, ssl, "sslcert");
    add(params, ssl, "sslrootcert");
    if (this.database) {
      params.push("dbname=" + quoteParamValue(this.database));
    }
    if (this.replication) {
      params.push("replication=" + quoteParamValue(this.replication));
    }
    if (this.host) {
      params.push("host=" + quoteParamValue(this.host));
    }
    if (this.isDomainSocket) {
      return cb(null, params.join(" "));
    }
    if (this.client_encoding) {
      params.push("client_encoding=" + quoteParamValue(this.client_encoding));
    }
    dns.lookup(this.host, function(err, address) {
      if (err) return cb(err, null);
      params.push("hostaddr=" + quoteParamValue(address));
      return cb(null, params.join(" "));
    });
  }
};
var connectionParameters = ConnectionParameters$1;

const types = require$$0$1;

const matchRegexp = /^([A-Za-z]+)(?: (\d+))?(?: (\d+))?/;

// result object returned from query
// in the 'end' event and also
// passed as second argument to provided callback
let Result$1 = class Result {
  constructor(rowMode, types) {
    this.command = null;
    this.rowCount = null;
    this.oid = null;
    this.rows = [];
    this.fields = [];
    this._parsers = undefined;
    this._types = types;
    this.RowCtor = null;
    this.rowAsArray = rowMode === 'array';
    if (this.rowAsArray) {
      this.parseRow = this._parseRowAsArray;
    }
    this._prebuiltEmptyResultObject = null;
  }

  // adds a command complete message
  addCommandComplete(msg) {
    let match;
    if (msg.text) {
      // pure javascript
      match = matchRegexp.exec(msg.text);
    } else {
      // native bindings
      match = matchRegexp.exec(msg.command);
    }
    if (match) {
      this.command = match[1];
      if (match[3]) {
        // COMMAND OID ROWS
        this.oid = parseInt(match[2], 10);
        this.rowCount = parseInt(match[3], 10);
      } else if (match[2]) {
        // COMMAND ROWS
        this.rowCount = parseInt(match[2], 10);
      }
    }
  }

  _parseRowAsArray(rowData) {
    const row = new Array(rowData.length);
    for (let i = 0, len = rowData.length; i < len; i++) {
      const rawValue = rowData[i];
      if (rawValue !== null) {
        row[i] = this._parsers[i](rawValue);
      } else {
        row[i] = null;
      }
    }
    return row
  }

  parseRow(rowData) {
    const row = { ...this._prebuiltEmptyResultObject };
    for (let i = 0, len = rowData.length; i < len; i++) {
      const rawValue = rowData[i];
      const field = this.fields[i].name;
      if (rawValue !== null) {
        row[field] = this._parsers[i](rawValue);
      } else {
        row[field] = null;
      }
    }
    return row
  }

  addRow(row) {
    this.rows.push(row);
  }

  addFields(fieldDescriptions) {
    // clears field definitions
    // multiple query statements in 1 action can result in multiple sets
    // of rowDescriptions...eg: 'select NOW(); select 1::int;'
    // you need to reset the fields
    this.fields = fieldDescriptions;
    if (this.fields.length) {
      this._parsers = new Array(fieldDescriptions.length);
    }

    const row = {};

    for (let i = 0; i < fieldDescriptions.length; i++) {
      const desc = fieldDescriptions[i];
      row[desc.name] = null;

      if (this._types) {
        this._parsers[i] = this._types.getTypeParser(desc.dataTypeID, desc.format || 'text');
      } else {
        this._parsers[i] = types.getTypeParser(desc.dataTypeID, desc.format || 'text');
      }
    }

    this._prebuiltEmptyResultObject = { ...row };
  }
};

var result = Result$1;

const { EventEmitter: EventEmitter$2 } = require$$0$4;

const Result = result;
const utils$1 = utils$3;

let Query$1 = class Query extends EventEmitter$2 {
  constructor(config, values, callback) {
    super();

    config = utils$1.normalizeQueryConfig(config, values, callback);

    this.text = config.text;
    this.values = config.values;
    this.rows = config.rows;
    this.types = config.types;
    this.name = config.name;
    this.queryMode = config.queryMode;
    this.binary = config.binary;
    // use unique portal name each time
    this.portal = config.portal || '';
    this.callback = config.callback;
    this._rowMode = config.rowMode;
    if (process.domain && config.callback) {
      this.callback = process.domain.bind(config.callback);
    }
    this._result = new Result(this._rowMode, this.types);

    // potential for multiple results
    this._results = this._result;
    this._canceledDueToError = false;
  }

  requiresPreparation() {
    if (this.queryMode === 'extended') {
      return true
    }

    // named queries must always be prepared
    if (this.name) {
      return true
    }
    // always prepare if there are max number of rows expected per
    // portal execution
    if (this.rows) {
      return true
    }
    // don't prepare empty text queries
    if (!this.text) {
      return false
    }
    // prepare if there are values
    if (!this.values) {
      return false
    }
    return this.values.length > 0
  }

  _checkForMultirow() {
    // if we already have a result with a command property
    // then we've already executed one query in a multi-statement simple query
    // turn our results into an array of results
    if (this._result.command) {
      if (!Array.isArray(this._results)) {
        this._results = [this._result];
      }
      this._result = new Result(this._rowMode, this._result._types);
      this._results.push(this._result);
    }
  }

  // associates row metadata from the supplied
  // message with this query object
  // metadata used when parsing row results
  handleRowDescription(msg) {
    this._checkForMultirow();
    this._result.addFields(msg.fields);
    this._accumulateRows = this.callback || !this.listeners('row').length;
  }

  handleDataRow(msg) {
    let row;

    if (this._canceledDueToError) {
      return
    }

    try {
      row = this._result.parseRow(msg.fields);
    } catch (err) {
      this._canceledDueToError = err;
      return
    }

    this.emit('row', row, this._result);
    if (this._accumulateRows) {
      this._result.addRow(row);
    }
  }

  handleCommandComplete(msg, connection) {
    this._checkForMultirow();
    this._result.addCommandComplete(msg);
    // need to sync after each command complete of a prepared statement
    // if we were using a row count which results in multiple calls to _getRows
    if (this.rows) {
      connection.sync();
    }
  }

  // if a named prepared statement is created with empty query text
  // the backend will send an emptyQuery message but *not* a command complete message
  // since we pipeline sync immediately after execute we don't need to do anything here
  // unless we have rows specified, in which case we did not pipeline the intial sync call
  handleEmptyQuery(connection) {
    if (this.rows) {
      connection.sync();
    }
  }

  handleError(err, connection) {
    // need to sync after error during a prepared statement
    if (this._canceledDueToError) {
      err = this._canceledDueToError;
      this._canceledDueToError = false;
    }
    // if callback supplied do not emit error event as uncaught error
    // events will bubble up to node process
    if (this.callback) {
      return this.callback(err)
    }
    this.emit('error', err);
  }

  handleReadyForQuery(con) {
    if (this._canceledDueToError) {
      return this.handleError(this._canceledDueToError, con)
    }
    if (this.callback) {
      try {
        this.callback(null, this._results);
      } catch (err) {
        process.nextTick(() => {
          throw err
        });
      }
    }
    this.emit('end', this._results);
  }

  submit(connection) {
    if (typeof this.text !== 'string' && typeof this.name !== 'string') {
      return new Error('A query must have either text or a name. Supplying neither is unsupported.')
    }
    const previous = connection.parsedStatements[this.name];
    if (this.text && previous && this.text !== previous) {
      return new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`)
    }
    if (this.values && !Array.isArray(this.values)) {
      return new Error('Query values must be an array')
    }
    if (this.requiresPreparation()) {
      // If we're using the extended query protocol we fire off several separate commands
      // to the backend. On some versions of node & some operating system versions
      // the network stack writes each message separately instead of buffering them together
      // causing the client & network to send more slowly. Corking & uncorking the stream
      // allows node to buffer up the messages internally before sending them all off at once.
      // note: we're checking for existence of cork/uncork because some versions of streams
      // might not have this (cloudflare?)
      connection.stream.cork && connection.stream.cork();
      try {
        this.prepare(connection);
      } finally {
        // while unlikely for this.prepare to throw, if it does & we don't uncork this stream
        // this client becomes unresponsive, so put in finally block "just in case"
        connection.stream.uncork && connection.stream.uncork();
      }
    } else {
      connection.query(this.text);
    }
    return null
  }

  hasBeenParsed(connection) {
    return this.name && connection.parsedStatements[this.name]
  }

  handlePortalSuspended(connection) {
    this._getRows(connection, this.rows);
  }

  _getRows(connection, rows) {
    connection.execute({
      portal: this.portal,
      rows: rows,
    });
    // if we're not reading pages of rows send the sync command
    // to indicate the pipeline is finished
    if (!rows) {
      connection.sync();
    } else {
      // otherwise flush the call out to read more rows
      connection.flush();
    }
  }

  // http://developer.postgresql.org/pgdocs/postgres/protocol-flow.html#PROTOCOL-FLOW-EXT-QUERY
  prepare(connection) {
    // TODO refactor this poor encapsulation
    if (!this.hasBeenParsed(connection)) {
      connection.parse({
        text: this.text,
        name: this.name,
        types: this.types,
      });
    }

    // because we're mapping user supplied values to
    // postgres wire protocol compatible values it could
    // throw an exception, so try/catch this section
    try {
      connection.bind({
        portal: this.portal,
        statement: this.name,
        values: this.values,
        binary: this.binary,
        valueMapper: utils$1.prepareValue,
      });
    } catch (err) {
      this.handleError(err, connection);
      return
    }

    connection.describe({
      type: 'P',
      name: this.portal || '',
    });

    this._getRows(connection, this.rows);
  }

  handleCopyInResponse(connection) {
    connection.sendCopyFail('No source stream defined');
  }

  handleCopyData(msg, connection) {
    // noop
  }
};

var query$1 = Query$1;

const { getStream: getStream$1, getSecureStream: getSecureStream$1 } = getStreamFuncs();

var stream = {
  /**
   * Get a socket stream compatible with the current runtime environment.
   * @returns {Duplex}
   */
  getStream: getStream$1,
  /**
   * Get a TLS secured socket, compatible with the current environment,
   * using the socket and other settings given in `options`.
   * @returns {Duplex}
   */
  getSecureStream: getSecureStream$1,
};

/**
 * The stream functions that work in Node.js
 */
function getNodejsStreamFuncs() {
  function getStream(ssl) {
    const net = require$$0$5;
    return new net.Socket()
  }

  function getSecureStream(options) {
    const tls = require$$1;
    return tls.connect(options)
  }
  return {
    getStream,
    getSecureStream,
  }
}

/**
 * The stream functions that work in Cloudflare Workers
 */
function getCloudflareStreamFuncs() {
  function getStream(ssl) {
    const { CloudflareSocket } = require$$2$1;
    return new CloudflareSocket(ssl)
  }

  function getSecureStream(options) {
    options.socket.startTls(options);
    return options.socket
  }
  return {
    getStream,
    getSecureStream,
  }
}

/**
 * Are we running in a Cloudflare Worker?
 *
 * @returns true if the code is currently running inside a Cloudflare Worker.
 */
function isCloudflareRuntime() {
  // Since 2022-03-21 the `global_navigator` compatibility flag is on for Cloudflare Workers
  // which means that `navigator.userAgent` will be defined.
  // eslint-disable-next-line no-undef
  if (typeof navigator === 'object' && navigator !== null && typeof navigator.userAgent === 'string') {
    // eslint-disable-next-line no-undef
    return navigator.userAgent === 'Cloudflare-Workers'
  }
  // In case `navigator` or `navigator.userAgent` is not defined then try a more sneaky approach
  if (typeof Response === 'function') {
    const resp = new Response(null, { cf: { thing: true } });
    if (typeof resp.cf === 'object' && resp.cf !== null && resp.cf.thing) {
      return true
    }
  }
  return false
}

function getStreamFuncs() {
  if (isCloudflareRuntime()) {
    return getCloudflareStreamFuncs()
  }
  return getNodejsStreamFuncs()
}

const EventEmitter$1 = require$$0$4.EventEmitter;

const { parse, serialize } = require$$1$1;
const { getStream, getSecureStream } = stream;

const flushBuffer = serialize.flush();
const syncBuffer = serialize.sync();
const endBuffer = serialize.end();

// TODO(bmc) support binary mode at some point
let Connection$1 = class Connection extends EventEmitter$1 {
  constructor(config) {
    super();
    config = config || {};

    this.stream = config.stream || getStream(config.ssl);
    if (typeof this.stream === 'function') {
      this.stream = this.stream(config);
    }

    this._keepAlive = config.keepAlive;
    this._keepAliveInitialDelayMillis = config.keepAliveInitialDelayMillis;
    this.lastBuffer = false;
    this.parsedStatements = {};
    this.ssl = config.ssl || false;
    this._ending = false;
    this._emitMessage = false;
    const self = this;
    this.on('newListener', function (eventName) {
      if (eventName === 'message') {
        self._emitMessage = true;
      }
    });
  }

  connect(port, host) {
    const self = this;

    this._connecting = true;
    this.stream.setNoDelay(true);
    this.stream.connect(port, host);

    this.stream.once('connect', function () {
      if (self._keepAlive) {
        self.stream.setKeepAlive(true, self._keepAliveInitialDelayMillis);
      }
      self.emit('connect');
    });

    const reportStreamError = function (error) {
      // errors about disconnections should be ignored during disconnect
      if (self._ending && (error.code === 'ECONNRESET' || error.code === 'EPIPE')) {
        return
      }
      self.emit('error', error);
    };
    this.stream.on('error', reportStreamError);

    this.stream.on('close', function () {
      self.emit('end');
    });

    if (!this.ssl) {
      return this.attachListeners(this.stream)
    }

    this.stream.once('data', function (buffer) {
      const responseCode = buffer.toString('utf8');
      switch (responseCode) {
        case 'S': // Server supports SSL connections, continue with a secure connection
          break
        case 'N': // Server does not support SSL connections
          self.stream.end();
          return self.emit('error', new Error('The server does not support SSL connections'))
        default:
          // Any other response byte, including 'E' (ErrorResponse) indicating a server error
          self.stream.end();
          return self.emit('error', new Error('There was an error establishing an SSL connection'))
      }
      const options = {
        socket: self.stream,
      };

      if (self.ssl !== true) {
        Object.assign(options, self.ssl);

        if ('key' in self.ssl) {
          options.key = self.ssl.key;
        }
      }

      const net = require$$0$5;
      if (net.isIP && net.isIP(host) === 0) {
        options.servername = host;
      }
      try {
        self.stream = getSecureStream(options);
      } catch (err) {
        return self.emit('error', err)
      }
      self.attachListeners(self.stream);
      self.stream.on('error', reportStreamError);

      self.emit('sslconnect');
    });
  }

  attachListeners(stream) {
    parse(stream, (msg) => {
      const eventName = msg.name === 'error' ? 'errorMessage' : msg.name;
      if (this._emitMessage) {
        this.emit('message', msg);
      }
      this.emit(eventName, msg);
    });
  }

  requestSsl() {
    this.stream.write(serialize.requestSsl());
  }

  startup(config) {
    this.stream.write(serialize.startup(config));
  }

  cancel(processID, secretKey) {
    this._send(serialize.cancel(processID, secretKey));
  }

  password(password) {
    this._send(serialize.password(password));
  }

  sendSASLInitialResponseMessage(mechanism, initialResponse) {
    this._send(serialize.sendSASLInitialResponseMessage(mechanism, initialResponse));
  }

  sendSCRAMClientFinalMessage(additionalData) {
    this._send(serialize.sendSCRAMClientFinalMessage(additionalData));
  }

  _send(buffer) {
    if (!this.stream.writable) {
      return false
    }
    return this.stream.write(buffer)
  }

  query(text) {
    this._send(serialize.query(text));
  }

  // send parse message
  parse(query) {
    this._send(serialize.parse(query));
  }

  // send bind message
  bind(config) {
    this._send(serialize.bind(config));
  }

  // send execute message
  execute(config) {
    this._send(serialize.execute(config));
  }

  flush() {
    if (this.stream.writable) {
      this.stream.write(flushBuffer);
    }
  }

  sync() {
    this._ending = true;
    this._send(syncBuffer);
  }

  ref() {
    this.stream.ref();
  }

  unref() {
    this.stream.unref();
  }

  end() {
    // 0x58 = 'X'
    this._ending = true;
    if (!this._connecting || !this.stream.writable) {
      this.stream.end();
      return
    }
    return this.stream.write(endBuffer, () => {
      this.stream.end();
    })
  }

  close(msg) {
    this._send(serialize.close(msg));
  }

  describe(msg) {
    this._send(serialize.describe(msg));
  }

  sendCopyFromChunk(chunk) {
    this._send(serialize.copyData(chunk));
  }

  endCopyFrom() {
    this._send(serialize.copyDone());
  }

  sendCopyFail(msg) {
    this._send(serialize.copyFail(msg));
  }
};

var connection = Connection$1;

const EventEmitter = require$$0$4.EventEmitter;
const utils = utils$3;
const sasl = sasl$1;
const TypeOverrides = typeOverrides;

const ConnectionParameters = connectionParameters;
const Query = query$1;
const defaults = defaultsExports;
const Connection = connection;
const crypto = utilsExports;

let Client$1 = class Client extends EventEmitter {
  constructor(config) {
    super();

    this.connectionParameters = new ConnectionParameters(config);
    this.user = this.connectionParameters.user;
    this.database = this.connectionParameters.database;
    this.port = this.connectionParameters.port;
    this.host = this.connectionParameters.host;

    // "hiding" the password so it doesn't show up in stack traces
    // or if the client is console.logged
    Object.defineProperty(this, 'password', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: this.connectionParameters.password,
    });

    this.replication = this.connectionParameters.replication;

    const c = config || {};

    this._Promise = c.Promise || commonjsGlobal.Promise;
    this._types = new TypeOverrides(c.types);
    this._ending = false;
    this._ended = false;
    this._connecting = false;
    this._connected = false;
    this._connectionError = false;
    this._queryable = true;

    this.enableChannelBinding = Boolean(c.enableChannelBinding); // set true to use SCRAM-SHA-256-PLUS when offered
    this.connection =
      c.connection ||
      new Connection({
        stream: c.stream,
        ssl: this.connectionParameters.ssl,
        keepAlive: c.keepAlive || false,
        keepAliveInitialDelayMillis: c.keepAliveInitialDelayMillis || 0,
        encoding: this.connectionParameters.client_encoding || 'utf8',
      });
    this.queryQueue = [];
    this.binary = c.binary || defaults.binary;
    this.processID = null;
    this.secretKey = null;
    this.ssl = this.connectionParameters.ssl || false;
    // As with Password, make SSL->Key (the private key) non-enumerable.
    // It won't show up in stack traces
    // or if the client is console.logged
    if (this.ssl && this.ssl.key) {
      Object.defineProperty(this.ssl, 'key', {
        enumerable: false,
      });
    }

    this._connectionTimeoutMillis = c.connectionTimeoutMillis || 0;
  }

  _errorAllQueries(err) {
    const enqueueError = (query) => {
      process.nextTick(() => {
        query.handleError(err, this.connection);
      });
    };

    if (this.activeQuery) {
      enqueueError(this.activeQuery);
      this.activeQuery = null;
    }

    this.queryQueue.forEach(enqueueError);
    this.queryQueue.length = 0;
  }

  _connect(callback) {
    const self = this;
    const con = this.connection;
    this._connectionCallback = callback;

    if (this._connecting || this._connected) {
      const err = new Error('Client has already been connected. You cannot reuse a client.');
      process.nextTick(() => {
        callback(err);
      });
      return
    }
    this._connecting = true;

    if (this._connectionTimeoutMillis > 0) {
      this.connectionTimeoutHandle = setTimeout(() => {
        con._ending = true;
        con.stream.destroy(new Error('timeout expired'));
      }, this._connectionTimeoutMillis);

      if (this.connectionTimeoutHandle.unref) {
        this.connectionTimeoutHandle.unref();
      }
    }

    if (this.host && this.host.indexOf('/') === 0) {
      con.connect(this.host + '/.s.PGSQL.' + this.port);
    } else {
      con.connect(this.port, this.host);
    }

    // once connection is established send startup message
    con.on('connect', function () {
      if (self.ssl) {
        con.requestSsl();
      } else {
        con.startup(self.getStartupConf());
      }
    });

    con.on('sslconnect', function () {
      con.startup(self.getStartupConf());
    });

    this._attachListeners(con);

    con.once('end', () => {
      const error = this._ending ? new Error('Connection terminated') : new Error('Connection terminated unexpectedly');

      clearTimeout(this.connectionTimeoutHandle);
      this._errorAllQueries(error);
      this._ended = true;

      if (!this._ending) {
        // if the connection is ended without us calling .end()
        // on this client then we have an unexpected disconnection
        // treat this as an error unless we've already emitted an error
        // during connection.
        if (this._connecting && !this._connectionError) {
          if (this._connectionCallback) {
            this._connectionCallback(error);
          } else {
            this._handleErrorEvent(error);
          }
        } else if (!this._connectionError) {
          this._handleErrorEvent(error);
        }
      }

      process.nextTick(() => {
        this.emit('end');
      });
    });
  }

  connect(callback) {
    if (callback) {
      this._connect(callback);
      return
    }

    return new this._Promise((resolve, reject) => {
      this._connect((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    })
  }

  _attachListeners(con) {
    // password request handling
    con.on('authenticationCleartextPassword', this._handleAuthCleartextPassword.bind(this));
    // password request handling
    con.on('authenticationMD5Password', this._handleAuthMD5Password.bind(this));
    // password request handling (SASL)
    con.on('authenticationSASL', this._handleAuthSASL.bind(this));
    con.on('authenticationSASLContinue', this._handleAuthSASLContinue.bind(this));
    con.on('authenticationSASLFinal', this._handleAuthSASLFinal.bind(this));
    con.on('backendKeyData', this._handleBackendKeyData.bind(this));
    con.on('error', this._handleErrorEvent.bind(this));
    con.on('errorMessage', this._handleErrorMessage.bind(this));
    con.on('readyForQuery', this._handleReadyForQuery.bind(this));
    con.on('notice', this._handleNotice.bind(this));
    con.on('rowDescription', this._handleRowDescription.bind(this));
    con.on('dataRow', this._handleDataRow.bind(this));
    con.on('portalSuspended', this._handlePortalSuspended.bind(this));
    con.on('emptyQuery', this._handleEmptyQuery.bind(this));
    con.on('commandComplete', this._handleCommandComplete.bind(this));
    con.on('parseComplete', this._handleParseComplete.bind(this));
    con.on('copyInResponse', this._handleCopyInResponse.bind(this));
    con.on('copyData', this._handleCopyData.bind(this));
    con.on('notification', this._handleNotification.bind(this));
  }

  // TODO(bmc): deprecate pgpass "built in" integration since this.password can be a function
  // it can be supplied by the user if required - this is a breaking change!
  _checkPgPass(cb) {
    const con = this.connection;
    if (typeof this.password === 'function') {
      this._Promise
        .resolve()
        .then(() => this.password())
        .then((pass) => {
          if (pass !== undefined) {
            if (typeof pass !== 'string') {
              con.emit('error', new TypeError('Password must be a string'));
              return
            }
            this.connectionParameters.password = this.password = pass;
          } else {
            this.connectionParameters.password = this.password = null;
          }
          cb();
        })
        .catch((err) => {
          con.emit('error', err);
        });
    } else if (this.password !== null) {
      cb();
    } else {
      try {
        const pgPass = require('pgpass');
        pgPass(this.connectionParameters, (pass) => {
          if (undefined !== pass) {
            this.connectionParameters.password = this.password = pass;
          }
          cb();
        });
      } catch (e) {
        this.emit('error', e);
      }
    }
  }

  _handleAuthCleartextPassword(msg) {
    this._checkPgPass(() => {
      this.connection.password(this.password);
    });
  }

  _handleAuthMD5Password(msg) {
    this._checkPgPass(async () => {
      try {
        const hashedPassword = await crypto.postgresMd5PasswordHash(this.user, this.password, msg.salt);
        this.connection.password(hashedPassword);
      } catch (e) {
        this.emit('error', e);
      }
    });
  }

  _handleAuthSASL(msg) {
    this._checkPgPass(() => {
      try {
        this.saslSession = sasl.startSession(msg.mechanisms, this.enableChannelBinding && this.connection.stream);
        this.connection.sendSASLInitialResponseMessage(this.saslSession.mechanism, this.saslSession.response);
      } catch (err) {
        this.connection.emit('error', err);
      }
    });
  }

  async _handleAuthSASLContinue(msg) {
    try {
      await sasl.continueSession(
        this.saslSession,
        this.password,
        msg.data,
        this.enableChannelBinding && this.connection.stream
      );
      this.connection.sendSCRAMClientFinalMessage(this.saslSession.response);
    } catch (err) {
      this.connection.emit('error', err);
    }
  }

  _handleAuthSASLFinal(msg) {
    try {
      sasl.finalizeSession(this.saslSession, msg.data);
      this.saslSession = null;
    } catch (err) {
      this.connection.emit('error', err);
    }
  }

  _handleBackendKeyData(msg) {
    this.processID = msg.processID;
    this.secretKey = msg.secretKey;
  }

  _handleReadyForQuery(msg) {
    if (this._connecting) {
      this._connecting = false;
      this._connected = true;
      clearTimeout(this.connectionTimeoutHandle);

      // process possible callback argument to Client#connect
      if (this._connectionCallback) {
        this._connectionCallback(null, this);
        // remove callback for proper error handling
        // after the connect event
        this._connectionCallback = null;
      }
      this.emit('connect');
    }
    const { activeQuery } = this;
    this.activeQuery = null;
    this.readyForQuery = true;
    if (activeQuery) {
      activeQuery.handleReadyForQuery(this.connection);
    }
    this._pulseQueryQueue();
  }

  // if we receieve an error event or error message
  // during the connection process we handle it here
  _handleErrorWhileConnecting(err) {
    if (this._connectionError) {
      // TODO(bmc): this is swallowing errors - we shouldn't do this
      return
    }
    this._connectionError = true;
    clearTimeout(this.connectionTimeoutHandle);
    if (this._connectionCallback) {
      return this._connectionCallback(err)
    }
    this.emit('error', err);
  }

  // if we're connected and we receive an error event from the connection
  // this means the socket is dead - do a hard abort of all queries and emit
  // the socket error on the client as well
  _handleErrorEvent(err) {
    if (this._connecting) {
      return this._handleErrorWhileConnecting(err)
    }
    this._queryable = false;
    this._errorAllQueries(err);
    this.emit('error', err);
  }

  // handle error messages from the postgres backend
  _handleErrorMessage(msg) {
    if (this._connecting) {
      return this._handleErrorWhileConnecting(msg)
    }
    const activeQuery = this.activeQuery;

    if (!activeQuery) {
      this._handleErrorEvent(msg);
      return
    }

    this.activeQuery = null;
    activeQuery.handleError(msg, this.connection);
  }

  _handleRowDescription(msg) {
    // delegate rowDescription to active query
    this.activeQuery.handleRowDescription(msg);
  }

  _handleDataRow(msg) {
    // delegate dataRow to active query
    this.activeQuery.handleDataRow(msg);
  }

  _handlePortalSuspended(msg) {
    // delegate portalSuspended to active query
    this.activeQuery.handlePortalSuspended(this.connection);
  }

  _handleEmptyQuery(msg) {
    // delegate emptyQuery to active query
    this.activeQuery.handleEmptyQuery(this.connection);
  }

  _handleCommandComplete(msg) {
    if (this.activeQuery == null) {
      const error = new Error('Received unexpected commandComplete message from backend.');
      this._handleErrorEvent(error);
      return
    }
    // delegate commandComplete to active query
    this.activeQuery.handleCommandComplete(msg, this.connection);
  }

  _handleParseComplete() {
    if (this.activeQuery == null) {
      const error = new Error('Received unexpected parseComplete message from backend.');
      this._handleErrorEvent(error);
      return
    }
    // if a prepared statement has a name and properly parses
    // we track that its already been executed so we don't parse
    // it again on the same client
    if (this.activeQuery.name) {
      this.connection.parsedStatements[this.activeQuery.name] = this.activeQuery.text;
    }
  }

  _handleCopyInResponse(msg) {
    this.activeQuery.handleCopyInResponse(this.connection);
  }

  _handleCopyData(msg) {
    this.activeQuery.handleCopyData(msg, this.connection);
  }

  _handleNotification(msg) {
    this.emit('notification', msg);
  }

  _handleNotice(msg) {
    this.emit('notice', msg);
  }

  getStartupConf() {
    const params = this.connectionParameters;

    const data = {
      user: params.user,
      database: params.database,
    };

    const appName = params.application_name || params.fallback_application_name;
    if (appName) {
      data.application_name = appName;
    }
    if (params.replication) {
      data.replication = '' + params.replication;
    }
    if (params.statement_timeout) {
      data.statement_timeout = String(parseInt(params.statement_timeout, 10));
    }
    if (params.lock_timeout) {
      data.lock_timeout = String(parseInt(params.lock_timeout, 10));
    }
    if (params.idle_in_transaction_session_timeout) {
      data.idle_in_transaction_session_timeout = String(parseInt(params.idle_in_transaction_session_timeout, 10));
    }
    if (params.options) {
      data.options = params.options;
    }

    return data
  }

  cancel(client, query) {
    if (client.activeQuery === query) {
      const con = this.connection;

      if (this.host && this.host.indexOf('/') === 0) {
        con.connect(this.host + '/.s.PGSQL.' + this.port);
      } else {
        con.connect(this.port, this.host);
      }

      // once connection is established send cancel message
      con.on('connect', function () {
        con.cancel(client.processID, client.secretKey);
      });
    } else if (client.queryQueue.indexOf(query) !== -1) {
      client.queryQueue.splice(client.queryQueue.indexOf(query), 1);
    }
  }

  setTypeParser(oid, format, parseFn) {
    return this._types.setTypeParser(oid, format, parseFn)
  }

  getTypeParser(oid, format) {
    return this._types.getTypeParser(oid, format)
  }

  // escapeIdentifier and escapeLiteral moved to utility functions & exported
  // on PG
  // re-exported here for backwards compatibility
  escapeIdentifier(str) {
    return utils.escapeIdentifier(str)
  }

  escapeLiteral(str) {
    return utils.escapeLiteral(str)
  }

  _pulseQueryQueue() {
    if (this.readyForQuery === true) {
      this.activeQuery = this.queryQueue.shift();
      if (this.activeQuery) {
        this.readyForQuery = false;
        this.hasExecuted = true;

        const queryError = this.activeQuery.submit(this.connection);
        if (queryError) {
          process.nextTick(() => {
            this.activeQuery.handleError(queryError, this.connection);
            this.readyForQuery = true;
            this._pulseQueryQueue();
          });
        }
      } else if (this.hasExecuted) {
        this.activeQuery = null;
        this.emit('drain');
      }
    }
  }

  query(config, values, callback) {
    // can take in strings, config object or query object
    let query;
    let result;
    let readTimeout;
    let readTimeoutTimer;
    let queryCallback;

    if (config === null || config === undefined) {
      throw new TypeError('Client was passed a null or undefined query')
    } else if (typeof config.submit === 'function') {
      readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
      result = query = config;
      if (typeof values === 'function') {
        query.callback = query.callback || values;
      }
    } else {
      readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
      query = new Query(config, values, callback);
      if (!query.callback) {
        result = new this._Promise((resolve, reject) => {
          query.callback = (err, res) => (err ? reject(err) : resolve(res));
        }).catch((err) => {
          // replace the stack trace that leads to `TCP.onStreamRead` with one that leads back to the
          // application that created the query
          Error.captureStackTrace(err);
          throw err
        });
      }
    }

    if (readTimeout) {
      queryCallback = query.callback;

      readTimeoutTimer = setTimeout(() => {
        const error = new Error('Query read timeout');

        process.nextTick(() => {
          query.handleError(error, this.connection);
        });

        queryCallback(error);

        // we already returned an error,
        // just do nothing if query completes
        query.callback = () => {};

        // Remove from queue
        const index = this.queryQueue.indexOf(query);
        if (index > -1) {
          this.queryQueue.splice(index, 1);
        }

        this._pulseQueryQueue();
      }, readTimeout);

      query.callback = (err, res) => {
        clearTimeout(readTimeoutTimer);
        queryCallback(err, res);
      };
    }

    if (this.binary && !query.binary) {
      query.binary = true;
    }

    if (query._result && !query._result._types) {
      query._result._types = this._types;
    }

    if (!this._queryable) {
      process.nextTick(() => {
        query.handleError(new Error('Client has encountered a connection error and is not queryable'), this.connection);
      });
      return result
    }

    if (this._ending) {
      process.nextTick(() => {
        query.handleError(new Error('Client was closed and is not queryable'), this.connection);
      });
      return result
    }

    this.queryQueue.push(query);
    this._pulseQueryQueue();
    return result
  }

  ref() {
    this.connection.ref();
  }

  unref() {
    this.connection.unref();
  }

  end(cb) {
    this._ending = true;

    // if we have never connected, then end is a noop, callback immediately
    if (!this.connection._connecting || this._ended) {
      if (cb) {
        cb();
      } else {
        return this._Promise.resolve()
      }
    }

    if (this.activeQuery || !this._queryable) {
      // if we have an active query we need to force a disconnect
      // on the socket - otherwise a hung query could block end forever
      this.connection.stream.destroy();
    } else {
      this.connection.end();
    }

    if (cb) {
      this.connection.once('end', cb);
    } else {
      return new this._Promise((resolve) => {
        this.connection.once('end', resolve);
      })
    }
  }
};

// expose a Query constructor
Client$1.Query = Query;

var client$1 = Client$1;

var client = {exports: {}};

const __viteOptionalPeerDep_pgNative_pg = {};

const __viteOptionalPeerDep_pgNative_pg$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: __viteOptionalPeerDep_pgNative_pg
}, Symbol.toStringTag, { value: 'Module' }));

const require$$0 = /*@__PURE__*/getAugmentedNamespace(__viteOptionalPeerDep_pgNative_pg$1);

var query = {exports: {}};

var hasRequiredQuery;

function requireQuery () {
	if (hasRequiredQuery) return query.exports;
	hasRequiredQuery = 1;

	const EventEmitter = require$$0$4.EventEmitter;
	const util = require$$1$2;
	const utils = utils$3;

	const NativeQuery = (query.exports = function (config, values, callback) {
	  EventEmitter.call(this);
	  config = utils.normalizeQueryConfig(config, values, callback);
	  this.text = config.text;
	  this.values = config.values;
	  this.name = config.name;
	  this.queryMode = config.queryMode;
	  this.callback = config.callback;
	  this.state = 'new';
	  this._arrayMode = config.rowMode === 'array';

	  // if the 'row' event is listened for
	  // then emit them as they come in
	  // without setting singleRowMode to true
	  // this has almost no meaning because libpq
	  // reads all rows into memory befor returning any
	  this._emitRowEvents = false;
	  this.on(
	    'newListener',
	    function (event) {
	      if (event === 'row') this._emitRowEvents = true;
	    }.bind(this)
	  );
	});

	util.inherits(NativeQuery, EventEmitter);

	const errorFieldMap = {
	  sqlState: 'code',
	  statementPosition: 'position',
	  messagePrimary: 'message',
	  context: 'where',
	  schemaName: 'schema',
	  tableName: 'table',
	  columnName: 'column',
	  dataTypeName: 'dataType',
	  constraintName: 'constraint',
	  sourceFile: 'file',
	  sourceLine: 'line',
	  sourceFunction: 'routine',
	};

	NativeQuery.prototype.handleError = function (err) {
	  // copy pq error fields into the error object
	  const fields = this.native.pq.resultErrorFields();
	  if (fields) {
	    for (const key in fields) {
	      const normalizedFieldName = errorFieldMap[key] || key;
	      err[normalizedFieldName] = fields[key];
	    }
	  }
	  if (this.callback) {
	    this.callback(err);
	  } else {
	    this.emit('error', err);
	  }
	  this.state = 'error';
	};

	NativeQuery.prototype.then = function (onSuccess, onFailure) {
	  return this._getPromise().then(onSuccess, onFailure)
	};

	NativeQuery.prototype.catch = function (callback) {
	  return this._getPromise().catch(callback)
	};

	NativeQuery.prototype._getPromise = function () {
	  if (this._promise) return this._promise
	  this._promise = new Promise(
	    function (resolve, reject) {
	      this._once('end', resolve);
	      this._once('error', reject);
	    }.bind(this)
	  );
	  return this._promise
	};

	NativeQuery.prototype.submit = function (client) {
	  this.state = 'running';
	  const self = this;
	  this.native = client.native;
	  client.native.arrayMode = this._arrayMode;

	  let after = function (err, rows, results) {
	    client.native.arrayMode = false;
	    setImmediate(function () {
	      self.emit('_done');
	    });

	    // handle possible query error
	    if (err) {
	      return self.handleError(err)
	    }

	    // emit row events for each row in the result
	    if (self._emitRowEvents) {
	      if (results.length > 1) {
	        rows.forEach((rowOfRows, i) => {
	          rowOfRows.forEach((row) => {
	            self.emit('row', row, results[i]);
	          });
	        });
	      } else {
	        rows.forEach(function (row) {
	          self.emit('row', row, results);
	        });
	      }
	    }

	    // handle successful result
	    self.state = 'end';
	    self.emit('end', results);
	    if (self.callback) {
	      self.callback(null, results);
	    }
	  };

	  if (process.domain) {
	    after = process.domain.bind(after);
	  }

	  // named query
	  if (this.name) {
	    if (this.name.length > 63) {
	      console.error('Warning! Postgres only supports 63 characters for query names.');
	      console.error('You supplied %s (%s)', this.name, this.name.length);
	      console.error('This can cause conflicts and silent errors executing queries');
	    }
	    const values = (this.values || []).map(utils.prepareValue);

	    // check if the client has already executed this named query
	    // if so...just execute it again - skip the planning phase
	    if (client.namedQueries[this.name]) {
	      if (this.text && client.namedQueries[this.name] !== this.text) {
	        const err = new Error(`Prepared statements must be unique - '${this.name}' was used for a different statement`);
	        return after(err)
	      }
	      return client.native.execute(this.name, values, after)
	    }
	    // plan the named query the first time, then execute it
	    return client.native.prepare(this.name, this.text, values.length, function (err) {
	      if (err) return after(err)
	      client.namedQueries[self.name] = self.text;
	      return self.native.execute(self.name, values, after)
	    })
	  } else if (this.values) {
	    if (!Array.isArray(this.values)) {
	      const err = new Error('Query values must be an array');
	      return after(err)
	    }
	    const vals = this.values.map(utils.prepareValue);
	    client.native.query(this.text, vals, after);
	  } else if (this.queryMode === 'extended') {
	    client.native.query(this.text, [], after);
	  } else {
	    client.native.query(this.text, after);
	  }
	};
	return query.exports;
}

var hasRequiredClient;

function requireClient () {
	if (hasRequiredClient) return client.exports;
	hasRequiredClient = 1;

	// eslint-disable-next-line
	var Native;
	// eslint-disable-next-line no-useless-catch
	try {
	  // Wrap this `require()` in a try-catch to avoid upstream bundlers from complaining that this might not be available since it is an optional import
	  Native = require$$0;
	} catch (e) {
	  throw e
	}
	const TypeOverrides = typeOverrides;
	const EventEmitter = require$$0$4.EventEmitter;
	const util = require$$1$2;
	const ConnectionParameters = connectionParameters;

	const NativeQuery = requireQuery();

	const Client = (client.exports = function (config) {
	  EventEmitter.call(this);
	  config = config || {};

	  this._Promise = config.Promise || commonjsGlobal.Promise;
	  this._types = new TypeOverrides(config.types);

	  this.native = new Native({
	    types: this._types,
	  });

	  this._queryQueue = [];
	  this._ending = false;
	  this._connecting = false;
	  this._connected = false;
	  this._queryable = true;

	  // keep these on the object for legacy reasons
	  // for the time being. TODO: deprecate all this jazz
	  const cp = (this.connectionParameters = new ConnectionParameters(config));
	  if (config.nativeConnectionString) cp.nativeConnectionString = config.nativeConnectionString;
	  this.user = cp.user;

	  // "hiding" the password so it doesn't show up in stack traces
	  // or if the client is console.logged
	  Object.defineProperty(this, 'password', {
	    configurable: true,
	    enumerable: false,
	    writable: true,
	    value: cp.password,
	  });
	  this.database = cp.database;
	  this.host = cp.host;
	  this.port = cp.port;

	  // a hash to hold named queries
	  this.namedQueries = {};
	});

	Client.Query = NativeQuery;

	util.inherits(Client, EventEmitter);

	Client.prototype._errorAllQueries = function (err) {
	  const enqueueError = (query) => {
	    process.nextTick(() => {
	      query.native = this.native;
	      query.handleError(err);
	    });
	  };

	  if (this._hasActiveQuery()) {
	    enqueueError(this._activeQuery);
	    this._activeQuery = null;
	  }

	  this._queryQueue.forEach(enqueueError);
	  this._queryQueue.length = 0;
	};

	// connect to the backend
	// pass an optional callback to be called once connected
	// or with an error if there was a connection error
	Client.prototype._connect = function (cb) {
	  const self = this;

	  if (this._connecting) {
	    process.nextTick(() => cb(new Error('Client has already been connected. You cannot reuse a client.')));
	    return
	  }

	  this._connecting = true;

	  this.connectionParameters.getLibpqConnectionString(function (err, conString) {
	    if (self.connectionParameters.nativeConnectionString) conString = self.connectionParameters.nativeConnectionString;
	    if (err) return cb(err)
	    self.native.connect(conString, function (err) {
	      if (err) {
	        self.native.end();
	        return cb(err)
	      }

	      // set internal states to connected
	      self._connected = true;

	      // handle connection errors from the native layer
	      self.native.on('error', function (err) {
	        self._queryable = false;
	        self._errorAllQueries(err);
	        self.emit('error', err);
	      });

	      self.native.on('notification', function (msg) {
	        self.emit('notification', {
	          channel: msg.relname,
	          payload: msg.extra,
	        });
	      });

	      // signal we are connected now
	      self.emit('connect');
	      self._pulseQueryQueue(true);

	      cb();
	    });
	  });
	};

	Client.prototype.connect = function (callback) {
	  if (callback) {
	    this._connect(callback);
	    return
	  }

	  return new this._Promise((resolve, reject) => {
	    this._connect((error) => {
	      if (error) {
	        reject(error);
	      } else {
	        resolve();
	      }
	    });
	  })
	};

	// send a query to the server
	// this method is highly overloaded to take
	// 1) string query, optional array of parameters, optional function callback
	// 2) object query with {
	//    string query
	//    optional array values,
	//    optional function callback instead of as a separate parameter
	//    optional string name to name & cache the query plan
	//    optional string rowMode = 'array' for an array of results
	//  }
	Client.prototype.query = function (config, values, callback) {
	  let query;
	  let result;
	  let readTimeout;
	  let readTimeoutTimer;
	  let queryCallback;

	  if (config === null || config === undefined) {
	    throw new TypeError('Client was passed a null or undefined query')
	  } else if (typeof config.submit === 'function') {
	    readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
	    result = query = config;
	    // accept query(new Query(...), (err, res) => { }) style
	    if (typeof values === 'function') {
	      config.callback = values;
	    }
	  } else {
	    readTimeout = config.query_timeout || this.connectionParameters.query_timeout;
	    query = new NativeQuery(config, values, callback);
	    if (!query.callback) {
	      let resolveOut, rejectOut;
	      result = new this._Promise((resolve, reject) => {
	        resolveOut = resolve;
	        rejectOut = reject;
	      }).catch((err) => {
	        Error.captureStackTrace(err);
	        throw err
	      });
	      query.callback = (err, res) => (err ? rejectOut(err) : resolveOut(res));
	    }
	  }

	  if (readTimeout) {
	    queryCallback = query.callback;

	    readTimeoutTimer = setTimeout(() => {
	      const error = new Error('Query read timeout');

	      process.nextTick(() => {
	        query.handleError(error, this.connection);
	      });

	      queryCallback(error);

	      // we already returned an error,
	      // just do nothing if query completes
	      query.callback = () => {};

	      // Remove from queue
	      const index = this._queryQueue.indexOf(query);
	      if (index > -1) {
	        this._queryQueue.splice(index, 1);
	      }

	      this._pulseQueryQueue();
	    }, readTimeout);

	    query.callback = (err, res) => {
	      clearTimeout(readTimeoutTimer);
	      queryCallback(err, res);
	    };
	  }

	  if (!this._queryable) {
	    query.native = this.native;
	    process.nextTick(() => {
	      query.handleError(new Error('Client has encountered a connection error and is not queryable'));
	    });
	    return result
	  }

	  if (this._ending) {
	    query.native = this.native;
	    process.nextTick(() => {
	      query.handleError(new Error('Client was closed and is not queryable'));
	    });
	    return result
	  }

	  this._queryQueue.push(query);
	  this._pulseQueryQueue();
	  return result
	};

	// disconnect from the backend server
	Client.prototype.end = function (cb) {
	  const self = this;

	  this._ending = true;

	  if (!this._connected) {
	    this.once('connect', this.end.bind(this, cb));
	  }
	  let result;
	  if (!cb) {
	    result = new this._Promise(function (resolve, reject) {
	      cb = (err) => (err ? reject(err) : resolve());
	    });
	  }
	  this.native.end(function () {
	    self._errorAllQueries(new Error('Connection terminated'));

	    process.nextTick(() => {
	      self.emit('end');
	      if (cb) cb();
	    });
	  });
	  return result
	};

	Client.prototype._hasActiveQuery = function () {
	  return this._activeQuery && this._activeQuery.state !== 'error' && this._activeQuery.state !== 'end'
	};

	Client.prototype._pulseQueryQueue = function (initialConnection) {
	  if (!this._connected) {
	    return
	  }
	  if (this._hasActiveQuery()) {
	    return
	  }
	  const query = this._queryQueue.shift();
	  if (!query) {
	    if (!initialConnection) {
	      this.emit('drain');
	    }
	    return
	  }
	  this._activeQuery = query;
	  query.submit(this);
	  const self = this;
	  query.once('_done', function () {
	    self._pulseQueryQueue();
	  });
	};

	// attempt to cancel an in-progress query
	Client.prototype.cancel = function (query) {
	  if (this._activeQuery === query) {
	    this.native.cancel(function () {});
	  } else if (this._queryQueue.indexOf(query) !== -1) {
	    this._queryQueue.splice(this._queryQueue.indexOf(query), 1);
	  }
	};

	Client.prototype.ref = function () {};
	Client.prototype.unref = function () {};

	Client.prototype.setTypeParser = function (oid, format, parseFn) {
	  return this._types.setTypeParser(oid, format, parseFn)
	};

	Client.prototype.getTypeParser = function (oid, format) {
	  return this._types.getTypeParser(oid, format)
	};
	return client.exports;
}

var native;
var hasRequiredNative;

function requireNative () {
	if (hasRequiredNative) return native;
	hasRequiredNative = 1;
	native = requireClient();
	return native;
}

(function (module) {
	const Client = client$1;
	const defaults = defaultsExports;
	const Connection = connection;
	const Result = result;
	const utils = utils$3;
	const Pool = require$$5;
	const TypeOverrides = typeOverrides;
	const { DatabaseError } = require$$1$1;
	const { escapeIdentifier, escapeLiteral } = utils$3;
	const poolFactory = (Client2) => {
	  return class BoundPool extends Pool {
	    constructor(options) {
	      super(options, Client2);
	    }
	  };
	};
	const PG = function(clientConstructor) {
	  this.defaults = defaults;
	  this.Client = clientConstructor;
	  this.Query = this.Client.Query;
	  this.Pool = poolFactory(this.Client);
	  this._pools = [];
	  this.Connection = Connection;
	  this.types = require$$0$1;
	  this.DatabaseError = DatabaseError;
	  this.TypeOverrides = TypeOverrides;
	  this.escapeIdentifier = escapeIdentifier;
	  this.escapeLiteral = escapeLiteral;
	  this.Result = Result;
	  this.utils = utils;
	};
	if (typeof process.env.NODE_PG_FORCE_NATIVE !== "undefined") {
	  module.exports = new PG(requireNative());
	} else {
	  module.exports = new PG(Client);
	  Object.defineProperty(module.exports, "native", {
	    configurable: true,
	    enumerable: false,
	    get() {
	      let native = null;
	      try {
	        native = new PG(requireNative());
	      } catch (err) {
	        if (err.code !== "MODULE_NOT_FOUND") {
	          throw err;
	        }
	      }
	      Object.defineProperty(module.exports, "native", {
	        value: native
	      });
	      return native;
	    }
	  });
	} 
} (lib));

var libExports = lib.exports;
const pg = /*@__PURE__*/getDefaultExportFromCjs(libExports);

// ESM wrapper for pg

// Re-export all the properties
const Client = pg.Client;
pg.Pool;
pg.Connection;
pg.types;
pg.Query;
pg.DatabaseError;
pg.escapeIdentifier;
pg.escapeLiteral;
pg.Result;
pg.TypeOverrides;

// Also export the defaults
pg.defaults;

// src/frontend/src/pages/api/timeline.js

async function get(context) {
  let client;
  try {
    // Connect to the PostgreSQL database service (called 'backend')
    client = new Client({
      host: 'backend',  // PostgreSQL service name
      port: 5432,
      user: 'missionuser',
      password: 'missionpass',
      database: 'missionplanning',
      // Add connection timeout and retry options
      connectionTimeoutMillis: 10000,
    });

    console.log('Attempting to connect to database...');
    await client.connect();
    console.log('Successfully connected to database');

    // Test the connection first
    await client.query('SELECT 1');
    console.log('Database connection test successful');

    // Join event and satellite tables for timeline
    const result = await client.query(`
      SELECT
        e.event_id,
        s.name AS satellite_name,
        s.colour,
        e.activity_type,
        e.duration,
        e.planned_time
      FROM event e
      JOIN satellite s ON e.satellite_id = s.satellite_id
      ORDER BY e.event_id ASC
    `);

    console.log(`Retrieved ${result.rows.length} timeline events`);
    
    return new Response(JSON.stringify(result.rows), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.error('Error details:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Database connection failed',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } finally {
    if (client) {
      try {
        await client.end();
        console.log('Database connection closed');
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	get
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
