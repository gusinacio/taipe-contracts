import { POSClient, setProofApi, use } from '@maticnetwork/maticjs'
import { Web3ClientPlugin } from '@maticnetwork/maticjs-ethers'
import { Network } from '../../src';
import { getRelayerSigner } from '../utils/signers';

// install ethers plugin
use(Web3ClientPlugin)
setProofApi("https://apis.matic.network/");

async function main() {
    const rootErc721 = '0xbb373ebd2e94699981fa0970dfe3c0a8241c6547';
    const childErc721 = '0xe407b349068680817ea95180745619422384e696';
    const parentProvider = getRelayerSigner(Network.Goerli);
    const childProvider = getRelayerSigner(Network.Mumbai);
    
    const posClient = new POSClient();
    await posClient.init({
        network: 'testnet',
        version: 'mumbai',
        parent: {
          provider: parentProvider,
          defaultConfig: {
            from : await parentProvider.getAddress()
          }
        },
        child: {
          provider: childProvider,
          defaultConfig: {
            from : await childProvider.getAddress()
          }
        }
    });

    const hash = '0x02c070de2856c6fc5551a09d1ba249a8310a7b9a223e1924540533aec43c8276'
    const isCheckPointed = await posClient.isCheckPointed(hash);
    console.log('isCheckPointed', isCheckPointed);
    if (!isCheckPointed) 
        throw new Error('Checkpoint not found');
    console.log('Exiting token...');
    const erc721RootToken = posClient.erc721(rootErc721, true);

    console.log("Withdrawing token...");
    const result = await erc721RootToken.withdrawExitFaster(hash, {
        gasLimit: 1000000,
    });
    const txHash = await result.getTransactionHash();
    const txReceipt = await result.getReceipt();

    console.log('txHash', txHash);
    console.log('txReceipt', txReceipt);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});