#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AVyXCfFBjbeKbm7bhBMeEmWRz1v6gNw24w2YNyYNdvhr");

#[program]
pub mod crudapp {
    use super::*;

    pub fn create_journal_entry(ctx:Context <CreateEntry>, title:String,message:String ) -> Result<()> {
          let journal_entry = &mut ctx.accounts.journal_entry;
            journal_entry.owner = *ctx.accounts.owner.key;  // set the owner of the journal entry
            journal_entry.title = title; // set the title of the journal entry
            journal_entry.message = message; // set the message of the journal entry
            Ok(())
    }
  
    pub fn update_journal_entry(ctx:Context<UpdateEntry> ,
        _title:String ,message:String) -> Result<()> {
        let journal_entry = &mut ctx.accounts.journal_entry;
        // if journal_entry.owner != *ctx.accounts.owner.key {
        //     return Err(ErrorCode::Unauthorized.into());
        // }
        journal_entry.message = message;
        Ok(())
    }

    pub fn delete_journal_entry(_ctx:Context<DeleteEntry>, _title:String) -> Result<()> {
        Ok(())
    }
}



#[derive(Accounts)]
#[instruction(title:String)]
pub struct CreateEntry<'info>{
    #[account(
        init,
        seeds = [title.as_bytes() , owner.key().as_ref()], // since we have PDA for this account we need to provide seeds,seed is used to generate the PDA address for the account.
        bump, // bump 
        payer = owner,
        space = 8 + JournalEntryState::INIT_SPACE,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title:String)]
pub struct UpdateEntry<'info>{

    #[account(
        mut,
        seeds = [title.as_bytes() , owner.key().as_ref()],
        bump,
        realloc = 8 + JournalEntryState::INIT_SPACE,
        realloc::payer = owner,
        realloc::zero = true,
    )]

    pub journal_entry: Account<'info, JournalEntryState>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
#[instruction(title:String)]
pub struct DeleteEntry<'info>{
  #[account(
        mut,
        seeds = [title.as_bytes() , owner.key().as_ref()],
        bump,
        close = owner,      
    )]
    pub journal_entry: Account<'info, JournalEntryState>, 

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,

}

#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner:Pubkey,
    #[max_len(50)]
    pub title: String,
    #[max_len(1000)]
    pub message: String,
}

