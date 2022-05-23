
import { Connection, PublicKey,} from "@solana/web3.js";

import { LiquidityPoolKeys, Liquidity, TokenAmount, Token, Percent, TOKEN_PROGRAM_ID, SPL_ACCOUNT_LAYOUT,  TokenAccount } from "@raydium-io/raydium-sdk";

export async function getTokenAccountsByOwner(
  connection: Connection,
  owner: PublicKey,
) {
  const tokenResp = await connection.getTokenAccountsByOwner(
    owner,
    {
      programId: TOKEN_PROGRAM_ID
    },
  );

  const accounts: TokenAccount[] = [];

  for (const { pubkey, account } of tokenResp.value) {
    accounts.push({
      pubkey,
      accountInfo:SPL_ACCOUNT_LAYOUT.decode(account.data)
    });
  }

  return accounts;
}


export async function calcAmountOut(connection: Connection, poolKeys: LiquidityPoolKeys, rawAmountIn: number) {
  const poolInfo = await Liquidity.fetchInfo({ connection, poolKeys });
  // the pool is RAY-SOL; quote = SOL; base = RAY
  const currencyIn = new Token(poolKeys.quoteMint, poolInfo.quoteDecimals);
  const amountIn = new TokenAmount(currencyIn, rawAmountIn, false);
  const currencyOut = new Token(poolKeys.baseMint, poolInfo.baseDecimals);
  const slippage = new Percent(5, 100); // 5% slippage

  const {
      amountOut,
      minAmountOut,
      currentPrice,
      executionPrice,
      priceImpact,
      fee,
  } = Liquidity.computeAmountOut({ poolKeys, poolInfo, amountIn, currencyOut, slippage, });

  return {
      amountIn,
      amountOut,
      minAmountOut,
      currentPrice,
      executionPrice,
      priceImpact,
      fee,
  };
}