'use client'

import {PublicKey } from '@solana/web3.js'
import { useCrudappProgram, useCrudappProgramAccount } from './crudapp-data-access'
import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react';

export function CrudappCreate() {

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const { createEntry } = useCrudappProgram();
  const {publicKey} = useWallet();

  const isFormValid = title.trim() !== '' && message.trim() !== '';

  const handleSubmit =  () => {
    if (publicKey && isFormValid){
      createEntry.mutateAsync({title, message, owner: publicKey});
    }
  };

  if (!publicKey) {
    return <span>Connect wallet to create a journal entry</span>
  }

  return (
    <div>
      <input 
      type="text"
      placeholder='Title'
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      className='input input-bordered w-full max-w-xs'
      />
      <textarea
      placeholder='Message'
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      className='textarea textarea-bordered w-full max-w-xs'
      />
      <button
      onClick={handleSubmit}
      disabled={createEntry.isPending || !isFormValid}
      className='btn btn-xs lg:btn-md btn-primary'
      >create journal entry {createEntry.isPending && "..."}</button>
    </div>
  );
}

export function CrudappList() {
  const { accounts, getProgramAccount } = useCrudappProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CrudappCard 
            key={account.publicKey.toString()} 
            account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function CrudappCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry , deleteEntry} = useCrudappProgramAccount({
    account,
  })

  const {publicKey} = useWallet();

  const [message,setMessage] = useState("");     
  const title = accountQuery.data?.title;
  const isFormValid = message.trim() !== '';

  const handleSubmit = () => {
    if (publicKey && isFormValid && title) {
      updateEntry.mutateAsync({title, message, owner: publicKey});
    }
  } 

  if (!publicKey) {
    return <span>Connect wallet to create a journal entry</span>
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) :  (
    <div className="card">
      <div className="card-body">
        <h2 
        className="card-title" 
        onClick={()=>accountQuery.refetch()}>
          {accountQuery.data?.title}
          </h2>
        <p className="text-sm text-gray-500">{accountQuery.data?.message}</p>
        <div className='card-actions'>
          <textarea 
          placeholder='Message'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className='textarea textarea-bordered w-full max-w-xs'
          />
          <button
          onClick={handleSubmit}
          disabled={updateEntry.isPending || !isFormValid}
          className='btn btn-xs lg:btn-md btn-primary'
          >update journal entry {updateEntry.isPending && "..."}</button>
          <button
          onClick={()=>{
            const title = accountQuery.data?.title;
            if (title) {
              return deleteEntry.mutateAsync(title);
            }
          }
        }
        disabled={deleteEntry.isPending}
          >
            delete
          </button>
        
        </div>
      </div>
    </div>
  ) ;
}
