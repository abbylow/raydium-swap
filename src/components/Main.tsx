import React, {
  FC,
  useState,
  ChangeEvent,
  MouseEvent,
  MouseEventHandler,
  useEffect
} from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
// import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { 
  Liquidity,  Market,
  GetMultipleAccountsInfoConfig, 
  LiquidityPoolKeys,
  LiquidityStateLayout, LiquidityAssociatedPoolKeys, getMultipleAccountsInfo, 
  LIQUIDITY_STATE_LAYOUT_V4, findProgramAddress 
} from "@raydium-io/raydium-sdk";

import { SOL_IMG, RAY_IMG } from '../constant';

const Main: FC = () => {
console.log(Market)
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const [solBalance, setSolBalance] = useState(0);
  // const [rayBalance, setRayBalance] = useState(0);

  useEffect(() => {
    const getBalance = async () => {
      if (publicKey !== null) {
        const balance = await connection.getBalance(publicKey);
        setSolBalance(balance / LAMPORTS_PER_SOL);

        // get ray balance
        // const tokenResp = await connection.getTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID });
        
        // for (const { pubkey, account } of tokenResp.value) {
        //   const rawResult = SPL_ACCOUNT_LAYOUT.decode(account.data);
        //   const { mint, amount } = rawResult;
        //   const associatedTokenAddress = await Spl.getAssociatedTokenAccount({ mint, owner })

        //   accounts.push({
        //     publicKey: pubkey,
        //     mint,
        //     isAssociated: associatedTokenAddress.equals(pubkey),
        //     amount,
        //     isNative: false
        //   })
        //   rawInfos.push({ pubkey, accountInfo: rawResult })
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
                    {`Balance: ${solBalance.toFixed(5)} SOL`}
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
                  {/* <span className="float-end text-muted"> */}
                  {/* {`Balance: ${rayBalance.toFixed(5)}`} RAY*/}
                  {/* </span> */}
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