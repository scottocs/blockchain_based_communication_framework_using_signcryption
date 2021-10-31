const Main = artifacts.require("Main");
const utils = require("../utils")

function keypair(i) {
    return {
        prikey: utils.prikeys[i],
        pubkey: utils.drivePub(utils.prikeys[i])
    }
}

contract('Main', (accounts) => {

    let Alice = keypair(0)
    let Bob = keypair(1)

    // let r   = utils.randomBytes(32);
    let r   = "0x1f949ca7702deff94c4673db6f70296d7fcc9fd1bbc5fe013c66ff6207bd5e9d";
    let M = utils.asciiToHex("Hello Bob")
    let ID_A = Alice.pubkey[0]
    let ID_B = Bob.pubkey[0]

    it(`signCryption`, async () => {

        const main = await Main.deployed();

        /**
         * @param uint256    r    - random number generated by Alice
         * @param uint256    w_A  - Alice's private key
         * @param uint256    ID_A - Alice's unique identifiers
         * @param uint256    M    - message to be signcrypted
         * @param uint256[2] W_B  - Bob's public key
         * @param uint256    ID_B - Bob's unique identifiers
         */
        
        let w_A = Alice.prikey;
        let W_B = Bob.pubkey

        const signature = await main.signCryption(r, w_A, ID_A, M, W_B, ID_B);
        
        /**
         * @return uint256[2] R   - r * G, G is base of Elliptic Curve (Secp256k1)
         * @return uint256    C   - ciphertext of M
         * @return uint256    s   - signature
         */
        let R = signature.R.map(utils.bnToHex)
        let C = utils.bnToHex(signature.C)
        let s = utils.bnToHex(signature.s)

        let k = utils.bnToHex(signature.k)

        console.log({r, R, C, s, k});
        assert.equal(1, 1, 'oops');
    });

    
    it(`unSignCryption`, async () => {

        const main = await Main.deployed();

        /**
         * @param uint256[2] R    - signature
         * @param uint256    C    - ciphertext
         * @param uint256    s    - signature
         * @param uint256[2] W_A  - Alice's public key
         * @param uint256    ID_A - Alice's unique identifiers
         * @param uint256    w_B  - Bob's private key
         * @param uint256    ID_B - Bob's unique identifiers
         */
        
        let R   = [
            '0xae88579a88f74edfc374475711bf0622a0aab3a1d27a5c7602f13969e7fdd8f3',
            '0x82478be276e0400cf59159d364fda31901c78410904e23665c1dc46ce3adc95a'
        ]
        let C   = '0xc035b3ef486fbc19506344cc786653cbe14d22a3cb896e9e94b6cab3ced73804';
        let s   = '0x128e61352ad957642bc38f3ad794735ef2b872ae2c25c702dffb51c9a27f96ad';
        let W_A = Alice.pubkey;
        let w_B = Bob.prikey

        const verification = await main.unSignCryption(R, C, s, W_A, ID_A, w_B, ID_B);
        
        /**
         * @return uint256 M   - Decrypts the ciphertext C
         * @return bool    v   - result of verification(True/False).
         */
        
        let M = utils.bnToHex(verification.M)
        let k = utils.bnToHex(verification.k)
        let v = verification.v

        console.log({
            k,
            M, 
            v, 
            OM: utils.asciiToHex("Hello Bob")
        });

        assert.equal(v, true, 'oops');
    });


});