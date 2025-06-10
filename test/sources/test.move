
module test::test;
use sui::coin::Coin;
use sui::balance::Balance;
use sui::sui::SUI;

public struct Bank has key {
    id: UID,
    balance: Balance<SUI>,
}

public fun withdraw(bank: &mut Bank, amount: u64, ctx: &mut TxContext){
    assert!(bank.balance.value() >= amount, 0);
    let withdrawal_coin = bank.balance.split(amount);
    transfer::public_transfer(withdrawal_coin.into_coin(ctx), ctx.sender());
    // withdrawal_coin.into_coin(ctx)
}

public fun me(){

}