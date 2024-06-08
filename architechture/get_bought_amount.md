```mermaid
sequenceDiagram
    title: Buying tokens: getting the estimating amount

    actor Client
    participant Gateway
    participant Binance
    participant OSESmartContract
    participant LINSmartContract
    
    Note over Client: The client wants to buy <br/> LIN tokens with 100$
     
    Client->>Gateway: getBoughtAmount(<br/> amount=100, sell=USD, buy=LIN)  
    activate Gateway
    
        Gateway->>Binance: getBoughtAmount(<br/> amount=100, sell=USD, buy=USDC)
        activate Binance        
        Binance-->>Gateway: USDCAmount
        deactivate Binance
        
        Gateway->>OSESmartContract: getPrice( USDCAmount, sell=USDC, buy=OSE)
        activate OSESmartContract
        OSESmartContract-->>Gateway: OSEAmount
        deactivate OSESmartContract
        
        Gateway->>LINSmartContract: getPrice(OSEAmount, sell=OSE, buy=LIN)
        activate LINSmartContract
        LINSmartContract-->>Gateway: LINAmount
        deactivate LINSmartContract
        
    Gateway-->>Client: LINAmount
    deactivate Gateway
```
### DESCRIPTION

* `OSESmartContract` and `LINSmartContract` are an Augmented Bonding Curve smart contract as described in the white paper.
* `OSESmartContract` quote currency is USDC. 
* `LINSmartContract` quote currency is OSE.

### FUTURE IMPROVEMENTS

> Query the price on demand is not the best solution
> * First  the user does not see the price ticking. We should have a websocket to update the price in real-time.
> * Second, we should have a cache system to store the prices for a certain amount of time.

> We should add other exchanges to have a back-up if Binance is down.

### VIDEO
[Explanatory video](https://youtu.be/bVjSHMxHiRc) of this diagram.