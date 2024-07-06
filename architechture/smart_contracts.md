```mermaid
sequenceDiagram
    title: Smart Contract Architecture
       
    actor Client
    
    participant GatewaySmartContract
    participant OSESmartContract
    Note over OSESmartContract: Augmented Bonding Curve for `OSE` token <br/> with USDC as quote currency
    
    participant LINSmartContract
    Note over LINSmartContract: Augmented Bonding Curve for `LIN` token <br/> with OSE as quote currency
    
    Note over Client: The client wants buy 100 USC worth of LIN tokens
     
    Client->>GatewaySmartContract: swap(amount=100 USDC, to=LIN)  
    activate GatewaySmartContract
    
    GatewaySmartContract->>OSESmartContract: swap(amount=100 USDC, to=OSE)
    activate OSESmartContract
    OSESmartContract-->>GatewaySmartContract: OSEAmount
    deactivate OSESmartContract
    
    GatewaySmartContract->>LINSmartContract: swap(amount=OSEAmount, to=LIN)
    activate LINSmartContract
    LINSmartContract-->>GatewaySmartContract: LINAmount
    deactivate LINSmartContract
    
    GatewaySmartContract-->>Client: LINAmount
    
    activate OSESmartContract

deactivate GatewaySmartContract
```

### DESCRIPTION
*  An `Augmented Bonding Curve` is a smart contract that is managing the liquidity and the price of a token. See [Open Source Economy White Paper](www.open-source-economy.com) for more details.