import { useState } from 'react';
import {
  EtherspotBatch,
  EtherspotBatches,
  EtherspotTransaction,
  useEtherspotTransactions,
  useWalletAddress,
} from '@etherspot/transaction-kit';

import logo from './etherspot-logo.svg';
import './App.css';
import { utils } from 'ethers';

function App() {
  const etherspotAddress = useWalletAddress('etherspot');
  const { estimate, send } = useEtherspotTransactions();
  const [address, setAddress] = useState(
    '0x271Ae6E03257264F0F7cb03506b12A027Ec53B31'
  );
  const [amount, setAmount] = useState('0.00001');
  const [latestEstimationData, setLatestEstimationData] = useState(null);
  const [latestSendData, setLatestSendData] = useState(null);

  /**
   * This runs an estimation for our transaction. We must
   * ALWAYS estimate before sending. If we change anything about
   * the transaction, we need to estimate again. This performs
   * essential cost calculations and validations before it
   * can be sent.
   */
  const runEstimation = async () => {
    // Reset the latest send data
    setLatestSendData(null);

    // Perform the estimation
    const estimationData = await estimate();
    console.log('Estimation Data:', estimationData);

    /**
     * Sometimes the estimation fails. If the estimation fails,
     * it usually means the transaction could not be validated and
     * something, usually the transaction values, were invalid.
     */
    if (JSON.stringify(estimationData).includes('reverted')) {
      alert(
        'Sorry, an estimation error occured. This may happen if:\n\n- The address or amount entered were invalid\n- Your Etherspot Smart Wallet account has no funds\n\nPlease check these points and try again.'
      );

      return;
    }

    /**
     * Otherwise, we have a successful estimation! Lets set it
     * so we can display / yse it later.
     */
    setLatestEstimationData(estimationData);
  };

  /**
   * The send method will now submit this transaction to
   * Etherspot. Etherspot will queue, submit and monitor your
   * transaction to ensure that it eventually reaches the
   * blockchain.
   */
  const runSend = async () => {
    // We must always estimate first.
    if (!latestEstimationData) {
      alert(
        'You must always estimate successfully before sending. This ensures that the transaction cost is up to date and validated.\n\nPlease try to estimate and send again.'
      );

      return;
    }

    // Lets send this transaction!
    const sendResult = await send();
    console.log('Send Data:', sendResult);

    /**
     * Sometimes the sending fails. If the sending fails, it
     * is usually due to bad network conditions or the estimation
     * is now outdated. In this scenario, try to estimate and
     * send again.
     */
    if (JSON.stringify(sendResult).includes('reverted')) {
      alert(
        'There was a problem trying to send your transaction. This can happen for a variety of reasons, but the most common problems are bad blockchain conditions or an out of date estimate.\n\nPlease try to estimate, then send again.'
      );

      return;
    }

    /**
     * Otherwise, we have a successful send! Lets set it
     * so we can display it later.
     */
    setLatestSendData(sendResult);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <a
          className="App-link"
          href="https://docs.etherspot.io/transaction-kit/introduction"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn Etherspot TransactionKit
        </a>
        <p className="App-wallet-address-label">
          Your Etherspot wallet address (Polygon Mumbai testnet)
        </p>
        <p className="App-wallet-address">{etherspotAddress}</p>
        {/**
         * We start by inserting the <EtherspotBatches /> tag.
         * This will contain 1 or more <EtherspotBatch /> tags.
         */}
        <EtherspotBatches>
          {/**
           * Inside the <EtherspotBatches /> tag, we can insert 1 or
           * more <Etherspotbatch /> tags. In our instance, we have
           * added the chainId property and set it to 80001 which
           * indicates that this batch of transactions will be executed
           * on Polygon Testnet (aka Mumbai).
           *
           * You can view other networks here:
           * https://chainlist.org/?testnets=true
           *
           * And you can view the networks that Etherspot supports here:
           * https://docs.etherspot.dev/master/chains-bridges-and-dexes
           */}
          <EtherspotBatch chainId={80001}>
            {/**
             * Inside the <EtherspotBatch /> tag, we can specify 1 or
             * more <EtherspotTransaction /> tags. All the transaction tags
             * contained within this <EtherspotBatch /> tag will be executed
             * together and on Polygon Testnet (chainId: 80001).
             */}
            <EtherspotTransaction to={address} value={amount}>
              {/**
               * The <EtherspotTransaction /> tag takes, at a minimum, a "to"
               * property, which is the destination of this transaction
               * and a "value" tag which is the amount of native token to send
               * to the aforementioned "to" value. In our case. the native
               * token is Test MATIC as we are operating on Polygon Testnet.
               */}
              <p className="App-info">
                This is the destination blockchain address. Always remember that
                the blockchain address you are sending to must ALWAYS be on the
                SAME blockchain. In our case, <b>Polygon Testnet</b>, also known
                as <b>Mumbai</b>.
              </p>

              <div className="App-form-control">
                <label className="App-label" htmlFor="addressInput">
                  Destination Address on Polygon Testnet (aka Mumbai)
                </label>
                <input
                  className="App-text-input"
                  id="addressInput"
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>

              <p className="App-info">
                Below is the amount of Test MATIC we are going to send to the
                above address. Keep the amount small so you can run this example
                several times, or you'll need to head back to the Polygon Faucet
                to get more Test MATIC.
              </p>

              <div className="App-form-control">
                <label className="App-label" htmlFor="amountInput">
                  Test MATIC Amount
                </label>
                <input
                  className="App-text-input"
                  id="amountInput"
                  type="text"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>

              {!!latestEstimationData && !latestSendData && (
                <p className="App-transaction-details">
                  Estimated transaction cost:
                  <br />
                  <strong>
                    Test MATIC{' '}
                    {utils.formatEther(
                      latestEstimationData[0].estimatedBatches[0].cost
                    )}
                  </strong>
                </p>
              )}

              {!!latestSendData && (
                <p className="App-transaction-details">
                  <strong>Your transaction was sent!</strong>
                  <br />
                  Your transaction will soon appear{' '}
                  <a
                    target="_blank"
                    href={`https://mumbai.polygonscan.com/address/${etherspotAddress}#internaltx`}
                  >
                    here
                  </a>
                  !
                </p>
              )}

              <div className="App-form-buttons-control">
                <button onClick={runEstimation} color="primary">
                  Estimate
                </button>
                <button onClick={runSend} color="success">
                  Send
                </button>
              </div>
            </EtherspotTransaction>
          </EtherspotBatch>
        </EtherspotBatches>
      </header>
    </div>
  );
}

export default App;
