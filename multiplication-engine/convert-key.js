const bs58 = require('bs58');

// Your private key from Phantom
const privateKeyBase58 = 'zswwZopvLFvthFmM1ow7Xn4zWJJD8ohfQPwmk866M32QJCd5HKMm9AphyhnBfeP1qULzhs2eQuzdb9XrdkgCfWS';

try {
    // Convert base58 to byte array
    const privateKeyBytes = bs58.decode(privateKeyBase58);
    console.log('Private key as byte array:');
    console.log('[' + Array.from(privateKeyBytes).join(', ') + ']');
    console.log('\nLength:', privateKeyBytes.length, 'bytes');
} catch (error) {
    console.error('Error converting private key:', error.message);
}