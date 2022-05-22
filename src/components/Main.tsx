import React, {
  FC,
  useState,
  ChangeEvent,
  MouseEvent,
  MouseEventHandler,
  useEffect
} from 'react';
// import { getAssociatedTokenAddress, getAccount, TokenAccountNotFoundError } from "@solana/spl-token"
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

import { SOL_IMG, RAY_IMG, RAY_DEVNET_ADDRESS } from '../constant';


const Main: FC = () => {

  const { publicKey } = useWallet();
  const { connection } = useConnection();

  // // not sure about the mint address for RAY
  // const mint = new PublicKey(RAY_DEVNET_ADDRESS);

  const [solBalance, setSolBalance] = useState(0);
  // const [rayBalance, setRayBalance] = useState(0);

  useEffect(() => {
    const getBalance = async () => {
      if (publicKey !== null) {
        const balance = await connection.getBalance(publicKey);
        setSolBalance(balance / LAMPORTS_PER_SOL);

        // const accounts = await connection.getTokenAccountsByOwner(publicKey, { mint });s
        // if (accounts?.value?.length > 0) {
        //   const rayAcc = accounts.value[0]; // assume the first account is ray
        //   const rayBalance = await connection.getTokenAccountBalance(rayAcc.pubkey);
        //   setRayBalance(+rayBalance / LAMPORTS_PER_SOL);
        // }
      }
    };

    getBalance();

  }, [publicKey, connection]);

  const [input, setInput] = useState('0');
  const [output, setOutput] = useState('0');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    // TODO: calculate the estimated output using input and exchangeRate

  }

  const handleSwap: MouseEventHandler<HTMLButtonElement> = (e) => {
    console.log('swap');
  }


  return (
    <div className="d-flex justify-content-center mx-3">
      <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '600px' }} >
        <div className="mt-3">
          <div className="card mb-4">
            <div className="card-body">
              <form className="mb-3">
                <div>
                  <label className="float-start">
                    <b>Input</b>
                  </label>
                  <span className="float-end text-muted">
                    {`Balance: ${solBalance}`}
                  </span>
                </div>
                <div className="input-group mb-4">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={input}
                    onChange={handleChange}
                  />

                  <div className="input-group-text">
                    <img className="mx-2" src={SOL_IMG} height='32' alt="SOL" />
                    SOL
                  </div>

                </div>
                <div>
                  <label className="float-start"><b>Output</b></label>
                  <span className="float-end text-muted">
                    {/* {`Balance: ${rayBalance}`} */}
                  </span>
                </div>
                <div className="input-group mb-2">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={output}
                    disabled
                  />

                  <div className="input-group-text">
                    <img className="mx-2" src={RAY_IMG} height='32' alt="RAY" />
                    RAY
                  </div>

                </div>
                <div className="mb-5">
                  <span className="float-start text-muted">Exchange Rate</span>
                  <span className="float-end text-muted">
                    {/* TODO: get exchange rate and display here */}
                    exchange rate
                  </span>
                </div>
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary btn-lg"
                    type="button"
                    onClick={handleSwap}
                  >
                    SWAP
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main >
    </div >
  );
}

export default Main;