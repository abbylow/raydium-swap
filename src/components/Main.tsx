import React, {
  FC,
  useState,
  ChangeEvent,
  MouseEvent,
  MouseEventHandler,
  useEffect
} from 'react';
import { Spinner } from 'react-bootstrap';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, Keypair } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Liquidity, Market,
  GetMultipleAccountsInfoConfig,
  LiquidityPoolKeys,
  LiquidityStateLayout, LiquidityAssociatedPoolKeys, getMultipleAccountsInfo,
  LIQUIDITY_STATE_LAYOUT_V4, findProgramAddress,
  jsonInfo2PoolKeys,
  LiquidityPoolJsonInfo,
  Trade,
  TokenAccount,
} from "@raydium-io/raydium-sdk";


import { toPercent } from '../utils/format/toPercent';
import { swap, calcAmountOut } from '../utils/swap';
import { fetchPoolKeys } from '../utils/swap/util_mainnet';
import { getTokenAccountsByOwner } from '../utils';
import AlertDismissable from './AlertDismissable';
// import { deUIToken, deUITokenAmount } from '../utils/token/quantumSOL';
import {
  SOL_IMG,
  RAY_IMG,
  RAY_SOL_LP_V4_POOL_KEY,
  RAYDIUM_LIQUIDITY_JSON
} from '../constant';

const Main: FC = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [solBalance, setSolBalance] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<string>('');

  const [raySolPoolKey, setRaySolPoolKey] = useState<LiquidityPoolKeys>();
  const [tokenAccounts, setTokenAccounts] = useState<TokenAccount[]>([]);

  const [alertHeading, setAlertHeading] = useState<string>('');
  const [alertContent, setAlertContent] = useState<string>('');
  const [alertType, setAlertType] = useState<string>('danger');
  const [alertShow, setAlertShow] = useState<boolean>(false);

  const [input, setInput] = useState('0');
  const [output, setOutput] = useState('0');

  useEffect(() => {
    const getAccountInfo = async () => {
      if (publicKey !== null) {
        const balance = await connection.getBalance(publicKey); // get SOL balance
        setSolBalance(balance / LAMPORTS_PER_SOL);

        const tokenAccs = await getTokenAccountsByOwner(connection, publicKey as PublicKey); // get all token accounts
        setTokenAccounts(tokenAccs);
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
        const { executionPrice } = await calcAmountOut(connection, raySolPoolKey, 1);
        const rate = executionPrice?.toFixed() || '0';
        setExchangeRate(rate);
      }
    }
    getInitialRate();
  }, [publicKey, raySolPoolKey]);

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
        const { amountIn, minAmountOut } = await calcAmountOut(connection, raySolPoolKey, inputNumber);

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
                  <label className="float-start"><b>Estimated Output</b></label>
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
                  <span className="float-start text-muted">Exchange Rate (not real time)</span>
                  <span className="float-end text-muted">
                    {`1 SOL = ${exchangeRate} RAY`}
                  </span>
                </div>
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary btn-lg"
                    type="button"
                    onClick={handleSwap}
                    disabled={!publicKey || !raySolPoolKey || parseFloat(input) < 0 || parseFloat(input) > solBalance}
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