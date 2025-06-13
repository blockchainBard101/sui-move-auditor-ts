
module test::test;
use sui::coin::Coin;
use sui::balance::Balance;

public struct Bank<T> has key {
    id: UID,
    balance: Balance<T>,
    owner: address
}

#[allow(lint(self_transfer))]
public fun withdraw<T>(bank: &mut Bank<T>, amount: u64, ctx: &mut TxContext){
    // assert!(bank.owner == ctx.sender(), 1);

    assert!(bank.owner == tx_context::sender(ctx), 1);

    assert!(bank.balance.value() >= amount, 0);
    let withdrawal_coin = bank.balance.split(amount);
    transfer::public_transfer(withdrawal_coin.into_coin(ctx), ctx.sender());
    // withdrawal_coin.into_coin(ctx)
}

public fun add_balance<T>(user: &mut Bank<T>, user_coin: Coin<T>) {
    user.balance.join(user_coin.into_balance());
}

