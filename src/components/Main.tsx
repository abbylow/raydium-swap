import React, {
  FC,
  useState,
  ChangeEvent,
  MouseEventHandler,
  useEffect
} from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import {
  Liquidity,
  LiquidityPoolKeys,
  jsonInfo2PoolKeys,
  LiquidityPoolJsonInfo,
  TokenAccount,
} from "@raydium-io/raydium-sdk";
import AlertDismissable from './AlertDismissable';
import { getTokenAccountsByOwner, calcAmountOut } from '../utils';
import {
  SOL_IMG,
  RAY_IMG,
  RAY_SOL_LP_V4_POOL_KEY,
  RAYDIUM_LIQUIDITY_JSON,
  RAY_TOKEN_MINT
} from '../constant';

const Main: FC = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [solBalance, setSolBalance] = useState<number>(0);
  const [rayBalance, setRayBalance] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<string>('');

  const [raySolPoolKey, setRaySolPoolKey] = useState<LiquidityPoolKeys>();
  const [tokenAccounts, setTokenAccounts] = useState<TokenAccount[]>([]);

  const [alertHeading, setAlertHeading] = useState<string>('');
  const [alertContent, setAlertContent] = useState<string>('');
  const [alertType, setAlertType] = useState<string>('danger');
  const [alertShow, setAlertShow] = useState<boolean>(false);

  const [input, setInput] = useState<string>('0');
  const [output, setOutput] = useState<string>('0');

  const [swapInDirection, setSwapInDirection] = useState<boolean>(false); // IN: RAY to SOL; OUT: SOL to RAY

  useEffect(() => {
    const getAccountInfo = async () => {
      if (publicKey !== null) {
        const balance = await connection.getBalance(publicKey); // get SOL balance
        setSolBalance(balance / LAMPORTS_PER_SOL);

        const tokenAccs = await getTokenAccountsByOwner(connection, publicKey as PublicKey); // get all token accounts
        setTokenAccounts(tokenAccs);

        let rayTokenAddress: PublicKey;
        tokenAccs.filter(acc => acc.accountInfo.mint.toBase58() === RAY_TOKEN_MINT).map(async (acc) => {
          rayTokenAddress = acc.pubkey;
          const accBalance = await connection.getTokenAccountBalance(rayTokenAddress);
          const rayBal = accBalance.value.uiAmount || 0;
          setRayBalance(rayBal);
        });

      }
    };
    const getPoolInfo = async () => {
      const liquidityJsonResp = await fetch(RAYDIUM_LIQUIDITY_JSON);
      if (!(await liquidityJsonResp).ok) return []
      const liquidityJson = await liquidityJsonResp.json();
      const allPoolKeysJson = [...(liquidityJson?.official ?? []), ...(liquidityJson?.unOfficial ?? [])]
      const poolKeysRaySolJson: LiquidityPoolJsonInfo = allPoolKeysJson.filter((item) => item.lpMint === RAY_SOL_LP_V4_POOL_KEY)?.[0] || null;
      const raySolPk = jsonInfo2PoolKeys(poolKeysRaySolJson);
      setRaySolPoolKey(raySolPk);
    }
    getAccountInfo();
    getPoolInfo();
  }, [publicKey, connection]);

  useEffect(() => {
    const getInitialRate = async () => {
      if (raySolPoolKey && publicKey) {
        const { executionPrice } = await calcAmountOut(connection, raySolPoolKey, 1, swapInDirection);
        const rate = executionPrice?.toFixed() || '0';
        setExchangeRate(rate);
      }
    }
    getInitialRate();
  }, [publicKey, raySolPoolKey, swapInDirection]);

  useEffect(() => {
    // update estimated output
    if (exchangeRate) {
      const inputNum: number = parseFloat(input);
      const calculatedOutput: number = inputNum * parseFloat(exchangeRate);
      const processedOutput: string = isNaN(calculatedOutput) ? '0' : String(calculatedOutput);
      setOutput(processedOutput);
    }
  }, [exchangeRate, input]);

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSwap: MouseEventHandler<HTMLButtonElement> = async () => {
    const inputNumber = parseFloat(input);
    if (raySolPoolKey && publicKey) {
      try {
        const { amountIn, minAmountOut } = await calcAmountOut(connection, raySolPoolKey, inputNumber, swapInDirection);

        const { transaction, signers } = await Liquidity.makeSwapTransaction({
          connection,
          poolKeys: raySolPoolKey,
          userKeys: {
            tokenAccounts,
            owner: publicKey,
          },
          amountIn,
          amountOut: minAmountOut,
          fixedSide: "in"
        });
        const txid = await sendTransaction(transaction, connection, { signers, skipPreflight: true });

        setAlertHeading('Transaction sent');
        setAlertContent(`Check it at https://solscan.io/tx/${txid}`);
        setAlertType('success');
        setAlertShow(true);
      } catch (err: any) {
        console.error('tx failed => ', err);
        setAlertHeading('Something went wrong');
        if (err?.code && err?.message) {
          setAlertContent(`${err.code}: ${err.message}`)
        } else {
          setAlertContent(JSON.stringify(err));
        }
        setAlertType('danger');
        setAlertShow(true);
      }
    }
  };

  const handleSwitchDirection: MouseEventHandler<HTMLButtonElement> = () => {
    const newDirection = !swapInDirection;
    setSwapInDirection(newDirection);
  };

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
                    {`Balance: ${!swapInDirection ? solBalance.toFixed(9) : rayBalance.toFixed(6)} ${!swapInDirection ? 'SOL' : 'RAY'}`}
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
                    <img className="mx-2" src={!swapInDirection ? SOL_IMG : RAY_IMG} height='32' alt='tokenIn' />
                    {!swapInDirection ? 'SOL' : 'RAY'}
                  </div>
                </div>

                <div className="d-flex justify-content-center my-2">
                  <button type="button" className="btn btn-primary" onClick={handleSwitchDirection}>
                    <i className="bi bi-arrow-down-up"></i>
                  </button>
                </div>

                <div>
                  <label className="float-start"><b>Estimated Output</b></label>
                  <span className="float-end text-muted">
                    {`Balance: ${!swapInDirection ? rayBalance.toFixed(6) : solBalance.toFixed(9)} ${!swapInDirection ? 'RAY' : 'SOL'}`}
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
                    <img className="mx-2" src={!swapInDirection ? RAY_IMG : SOL_IMG} height='32' alt='tokenOut' />
                    {!swapInDirection ? 'RAY' : 'SOL'}
                  </div>

                </div>
                <div className="mb-5">
                  <span className="float-start text-muted">Exchange Rate (not real time)</span>
                  <span className="float-end text-muted">
                    {`1 ${!swapInDirection ? 'SOL' : 'RAY'} = ${exchangeRate} ${!swapInDirection ? 'RAY' : 'SOL'}`}
                  </span>
                </div>
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary btn-lg"
                    type="button"
                    onClick={handleSwap}
                    disabled={!publicKey || !raySolPoolKey || parseFloat(input) <= 0 || parseFloat(input) > (!swapInDirection ? solBalance : rayBalance)}
                  >
                    SWAP
                  </button>
                </div>
              </form>
            </div>
          </div>

          <AlertDismissable
            heading={alertHeading}
            content={alertContent}
            type={alertType}
            show={alertShow}
            setShow={setAlertShow}
          />
        </div>
      </main >
    </div >
  );
}

export default Main;