```mermaid
sequenceDiagram
    title: Fund issue (happy path)

    actor Client

    participant Stripe
    participant CompanyBankAccount
    
    participant Gateway
    participant Binance

    participant SmartContract
    
    participant CompanyWallet
    
    Note over Client: The client wants to fund the <br/>issue number 1 of Linux with 100$
    
    Client->>Gateway: login
     
    Client->>Stripe: pay(amount=100, <br/> currency=USD, <br/> note=Linux_issue_1)
    activate Stripe
    Note over Stripe: verify and confirm payment
    
    Stripe-->>Client: Ok
    Note over Client: See success page <br/> reconcile with metadata (payment details)
    Stripe->>Gateway: receivePayment(amount=100$, <br/> from=Client, note=Linux_issue_1)
    activate Gateway
    Stripe->>CompanyBankAccount: send(amount=100$)
    deactivate Stripe
    
    note over Binance: Binance account has been previously <br/>funded with a bag of $
    Gateway->>Binance: swap(amount=100$, to=USDC)
    activate Binance
    Binance-->>Gateway: USDCAmount
    deactivate Binance

    note over CompanyWallet: Company wallet has been previously <br/> funded with a bag of USDC
    Gateway->>SmartContract: swap(amount=USDCAmount, to=LIN, signer=CompanyWallet)
    activate SmartContract
   
    CompanyWallet->>SmartContract: send(amount=USDCAmount)
    SmartContract->>SmartContract : mint(LINAmount)
    SmartContract->>SmartContract : fund(amount=LINAmount, what=Linux_issue_1)
    
    SmartContract-->>Gateway: ok
    deactivate SmartContract

    deactivate Gateway
```

### DESCRIPTION
* `SmartContract` is a contract that aggregate two other smart contracts: the Augmented Bonding Curve for `OSE` and `LIN` token, as described in the white paper. This contract is used to mint new tokens and fund an issue.
More details on diagram [smart_contracts](smart_contracts.md).
* `Stripe` is a payment gateway. We will use it's `Checkout` feature. See how it works in details [here](https://docs.stripe.com/payments/checkout/how-checkout-works?payment-ui=embedded-form#lifecycle).

### FUTURE IMPROVEMENTS

> Be sure that the swap is processed even if the gateway crashes. 

> We should add other exchanges (like coinbase) to have a back-up if Binance is down.

### VIDEO
[Explanatory video](https://youtu.be/CCO8v1yHzKA) of this diagram.