import React, { useCallback, useState } from 'react';
import { Connection, Keypair, Signer } from '@solana/web3.js';
import { MintPortal, NeonPortal, SPLToken } from '@neonevm/token-transfer';
import { Account } from 'web3-core';
import Web3 from 'web3';
import { delay, sendTransaction, toSigner } from '../utils';

function SolWrapForm(props: { connection: Connection, web3: Web3, splToken: SPLToken, solanaWallet: Keypair, neonWallet: Account, neonPortal: NeonPortal, mintPortal: MintPortal, callback: Function }) {
  const { connection, splToken, solanaWallet, mintPortal, callback } = props;

  const [solAmount, setSolAmount] = useState('4.8');
  const [submitDisable, setSubmitDisable] = useState(false);

  function handleSolAmount(e: any) {
    setSolAmount(e.target.value);
  }

  const handleWrapSol = useCallback(async () => {
    if (splToken) {
      setSubmitDisable(true);
      const solanaSigner: Signer = toSigner(solanaWallet);
      const wrapTransaction = await mintPortal.wrapSOLTransaction(solAmount, splToken);
      const solana = await sendTransaction(connection, wrapTransaction, [solanaSigner], true, { skipPreflight: false });
      await delay(1e3);
      if (callback) {
        callback({ solana });
      }
      setSubmitDisable(false);
    }
  }, [connection, mintPortal, solAmount, solanaWallet, splToken]);

  return (
    <form className='flex flex-row gap-[10px]'>
      <div className='form-field w-full'>
        <input value={solAmount} onInput={handleSolAmount} type='text' className='form-input'
               placeholder='0' disabled={true} />
      </div>
      <div className='form-field w-[200px]'>
        <button type='button' className='form-button' onClick={handleWrapSol}
                disabled={submitDisable}>Wrap SOL
        </button>
      </div>
    </form>
  );
}

export default SolWrapForm;
