module 0x1::vulnerable_nft;
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::clock::{Self, Clock};
use std::string::{Self, String};

public struct NFTCollection has key {
    id: UID,
    name: String,
    creator: address,
    total_supply: u64,
    royalty_rate: u64,
}

public struct NFT has key, store {
    id: UID,
    collection_id: address,
    token_id: u64,
    owner: address,
    metadata_uri: String,
}

public struct Listing has key {
    id: UID,
    nft_id: address,
    seller: address,
    price: u64,
    timestamp: u64,
}

public struct Auction has key {
    id: UID,
    nft_id: address,
    seller: address,
    highest_bid: u64,
    highest_bidder: address,
    end_time: u64,
    reserve_price: u64,
}

public struct MarketplaceFees has key {
    id: UID,
    platform_fee: u64,
    owner: address,
}

public fun create_collection(
    name: vector<u8>,
    royalty_rate: u64,
    ctx: &mut TxContext
) {
    let collection = NFTCollection {
        id: object::new(ctx),
        name: string::utf8(name),
        creator: tx_context::sender(ctx),
        total_supply: 0,
        royalty_rate,
    };
    transfer::share_object(collection);
}

public fun mint_nft(
    collection: &mut NFTCollection,
    metadata_uri: vector<u8>,
    to: address,
    ctx: &mut TxContext
) {
    collection.total_supply = collection.total_supply + 1;
    let nft = NFT {
        id: object::new(ctx),
        collection_id: object::uid_to_address(&collection.id),
        token_id: collection.total_supply,
        owner: to,
        metadata_uri: string::utf8(metadata_uri),
    };
    transfer::transfer(nft, to);
}

public fun list_nft(
    nft: NFT,
    price: u64,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let nft_id = object::uid_to_address(&nft.id);
    let listing = Listing {
        id: object::new(ctx),
        nft_id,
        seller: tx_context::sender(ctx),
        price,
        timestamp: clock::timestamp_ms(clock),
    };
    transfer::public_transfer(nft, @0x1);
    transfer::share_object(listing);
}

public fun buy_nft(
    listing: Listing,
    mut payment: Coin<SUI>,
    fees: &MarketplaceFees,
    ctx: &mut TxContext
) {
    let Listing { 
        id, 
        nft_id, 
        seller, 
        price, 
        timestamp: _ 
    } = listing;
    
    let payment_amount = coin::value(&payment);
    let platform_fee_amount = price * fees.platform_fee / 10000;
    let seller_amount = price - platform_fee_amount;
    
    let platform_fee = coin::split(&mut payment, platform_fee_amount, ctx);
    let seller_payment = coin::split(&mut payment, seller_amount, ctx);
    
    transfer::public_transfer(platform_fee, fees.owner);
    transfer::public_transfer(seller_payment, seller);
    transfer::public_transfer(payment, tx_context::sender(ctx)); 

    object::delete(id);
}

public fun start_auction(
    nft: NFT,
    reserve_price: u64,
    duration: u64,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let nft_id = object::uid_to_address(&nft.id);
    let end_time = clock::timestamp_ms(clock) + duration;
    
    let auction = Auction {
        id: object::new(ctx),
        nft_id,
        seller: tx_context::sender(ctx),
        highest_bid: 0,
        highest_bidder: @0x0,
        end_time,
        reserve_price,
    };
    
    transfer::public_transfer(nft, @0x1);
    transfer::share_object(auction);
}

public fun place_bid(
    auction: &mut Auction,
    mut bid: Coin<SUI>,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let bid_amount = coin::value(&bid);
    let current_time = clock::timestamp_ms(clock);
    
    if (auction.highest_bidder != @0x0) {
        let refund = coin::split(&mut bid, auction.highest_bid, ctx);
        transfer::public_transfer(refund, auction.highest_bidder);
    };
    
    auction.highest_bid = bid_amount;
    auction.highest_bidder = tx_context::sender(ctx);
    
    transfer::public_transfer(bid, @0x1);
}

public fun finalize_auction(
    auction: Auction,
    clock: &Clock,
    _ctx: &mut TxContext
) {
    let Auction { 
        id, 
        nft_id: _, 
        seller, 
        highest_bid, 
        highest_bidder, 
        end_time, 
        reserve_price 
    } = auction;
    
    let current_time = clock::timestamp_ms(clock);
    
    if (current_time >= end_time && highest_bid >= reserve_price) {
    };
    object::delete(id);
}

public fun update_marketplace_fees(
    fees: &mut MarketplaceFees,
    new_fee: u64,
    _ctx: &mut TxContext
) {
    fees.platform_fee = new_fee;
}

public fun batch_mint(
    collection: &mut NFTCollection,
    recipients: vector<address>,
    metadata_uris: vector<vector<u8>>,
    ctx: &mut TxContext
) {
    let mut i = 0;
    let len = vector::length(&recipients);
    
    while (i < len) {
        let recipient = *vector::borrow(&recipients, i);
        let uri = *vector::borrow(&metadata_uris, i);
        
        collection.total_supply = collection.total_supply + 1;
        
        let nft = NFT {
            id: object::new(ctx),
            collection_id: object::uid_to_address(&collection.id),
            token_id: collection.total_supply,
            owner: recipient,
            metadata_uri: string::utf8(uri),
        };
        
        transfer::transfer(nft, recipient);
        i = i + 1;
    };
}

public fun calculate_royalty(sale_price: u64, royalty_rate: u64): u64 {
    sale_price * royalty_rate / 10000
}

public fun transfer_with_royalty(
    mut nft: NFT,
    mut payment: Coin<SUI>,
    collection: &NFTCollection,
    to: address,
    ctx: &mut TxContext
) {
    let sale_price = coin::value(&payment);
    let royalty = sale_price * collection.royalty_rate / 10000;
    let seller_amount = sale_price - royalty;
    
    let royalty_payment = coin::split(&mut payment, royalty, ctx);
    
    transfer::public_transfer(royalty_payment, collection.creator);
    transfer::public_transfer(payment, nft.owner);
    
    nft.owner = to;
    transfer::transfer(nft, to);
}

