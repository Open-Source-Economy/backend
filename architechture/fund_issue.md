sequenceDiagram
    title: Fund issue

    actor Client

    participant OSE_frontend
    participant Stripe
    participant CompanyBankAccount
    participant OSE_backend

    participant Binance
    participant SmartContract
    participant CompanyWallet
    
    
    Note over Client: The client wants to fund the <br/>issue number 1 of Linux with 100$

    Client->>OSE_frontend: login
    
    Note over OSE_frontend: PAY button <br/> embedded stripe.Checkout method
    OSE_frontend->>Stripe: pay(amount=100, <br/> currency=USD, <br/> note=Linux_issue_1)

    Note over Stripe: verify and confirm payment
    Stripe->>CompanyBankAccount: 
    CompanyBankAccount-->>Stripe: 
    Note over Stripe: Webhook payment status
    Stripe-->>OSE_frontend: OK / NOK

    Note over OSE_frontend: display success or error page <br/> reconcile with metadata (payment details)
    OSE_frontend->>OSE_backend: sendPayment(amount=100$, <br/> from=Client, note=Linux_issue_1)
    Note over OSE_backend: Store transaction
    Note over OSE_backend: Trigger Binance process
    Note over Binance: Binance account has been previously <br/>funded with a bag of $
    OSE_backend->>Binance: swap(amount=100$, to=USDC)
    Binance-->>OSE_backend: USDCAmount

    note over CompanyWallet: Company wallet has been previously <br/> funded with a bag of USDC
    OSE_backend->>SmartContract: swap(amount=USDCAmount, to=LIN, signer=CompanyWallet)
   
    CompanyWallet->>SmartContract: send(amount=USDCAmount)
    SmartContract->>SmartContract : mint(LINAmount)
    SmartContract->>SmartContract : fund(amount=LINAmount, what=Linux_issue_1)
    
    SmartContract-->>OSE_backend: ok
