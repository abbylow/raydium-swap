import React, { useState, ChangeEvent, MouseEvent, MouseEventHandler, useEffect } from 'react';

const SOL_IMG = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png';
const RAY_IMG = 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png';

type MainProps = {
  rayBalance: string,
  solBalance: string,
  buyTokens: (etherAmount: number) => void,
  exchangeRate: string
}

const Main = (props: any) => {
  const {
    // rayBalance,
    // solBalance,
    // buyTokens,
    // exchangeRate
  } = props;

  const [input, setInput] = useState('0');
  const [output, setOutput] = useState('0');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    // TODO: calculate the estimated output using input and exchangeRate

  }

  const handleSwap: MouseEventHandler<HTMLButtonElement> = (e) => {
    console.log('swap');
  }

  useEffect(() => {
    console.log('main')
  }, []);

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
                    {/* {`Balance: ${solBalance}`} */}
                    sol balance
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
                    <img className="mr-2" src={SOL_IMG} height='32' alt="SOL" />
                    SOL
                  </div>

                </div>
                <div>
                  <label className="float-start"><b>Output</b></label>
                  <span className="float-end text-muted">
                    {/* {`Balance: ${rayBalance}`} */}
                    ray balance
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
                    <img className="mr-2" src={RAY_IMG} height='32' alt="RAY" />
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