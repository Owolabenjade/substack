;; Holds subscriber funds and manages merchant spending authorizations

;; ============================================
;; CONSTANTS & ERROR CODES
;; ============================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-BALANCE (err u101))
(define-constant ERR-INVALID-AMOUNT (err u102))
(define-constant ERR-AUTHORIZATION-NOT-FOUND (err u103))
(define-constant ERR-EXCEEDS-SPENDING-LIMIT (err u104))
(define-constant ERR-UNAUTHORIZED-CALLER (err u105))
(define-constant ERR-ALREADY-AUTHORIZED (err u106))
(define-constant ERR-SELF-AUTHORIZATION (err u107))

;; ============================================
;; DATA MAPS & VARIABLES
;; ============================================

(define-map balances principal uint)

(define-map authorizations 
  { subscriber: principal, merchant: principal }
  {
    max-per-period: uint,
    period-length: uint,
    spent-this-period: uint,
    period-start: uint,
    active: bool
  }
)

(define-data-var engine-contract (optional principal) none)
(define-data-var fee-recipient principal CONTRACT-OWNER)
(define-data-var protocol-fee-bps uint u30)

;; ============================================
;; PRIVATE FUNCTIONS
;; ============================================

(define-private (is-engine-caller)
  (match (var-get engine-contract)
    engine (is-eq contract-caller engine)
    false
  )
)

(define-private (maybe-reset-period (auth {max-per-period: uint, period-length: uint, spent-this-period: uint, period-start: uint, active: bool}))
  (let (
    (current-block stacks-block-height)
    (period-end (+ (get period-start auth) (get period-length auth)))
  )
    (if (>= current-block period-end)
      (merge auth { spent-this-period: u0, period-start: current-block })
      auth
    )
  )
)

;; ============================================
;; PUBLIC FUNCTIONS - USER OPERATIONS
;; ============================================

(define-public (deposit (amount uint))
  (begin
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set balances tx-sender 
      (+ (default-to u0 (map-get? balances tx-sender)) amount)
    )
    (ok (default-to u0 (map-get? balances tx-sender)))
  )
)

(define-public (withdraw (amount uint))
  (let (
    (current-balance (default-to u0 (map-get? balances tx-sender)))
  )
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (<= amount current-balance) ERR-INSUFFICIENT-BALANCE)
    (map-set balances tx-sender (- current-balance amount))
    (try! (as-contract (stx-transfer? amount tx-sender tx-sender)))
    (ok (- current-balance amount))
  )
)

(define-public (authorize-merchant (merchant principal) (max-per-period uint) (period-length uint))
  (begin
    (asserts! (> max-per-period u0) ERR-INVALID-AMOUNT)
    (asserts! (> period-length u0) ERR-INVALID-AMOUNT)
    (asserts! (not (is-eq tx-sender merchant)) ERR-SELF-AUTHORIZATION)
    (asserts! 
      (not (default-to false 
        (get active (map-get? authorizations { subscriber: tx-sender, merchant: merchant }))
      ))
      ERR-ALREADY-AUTHORIZED
    )
    (map-set authorizations
      { subscriber: tx-sender, merchant: merchant }
      {
        max-per-period: max-per-period,
        period-length: period-length,
        spent-this-period: u0,
        period-start: stacks-block-height,
        active: true
      }
    )
    (ok true)
  )
)

(define-public (revoke-authorization (merchant principal))
  (let (
    (auth-key { subscriber: tx-sender, merchant: merchant })
    (auth (map-get? authorizations auth-key))
  )
    (asserts! (is-some auth) ERR-AUTHORIZATION-NOT-FOUND)
    (map-set authorizations auth-key
      (merge (unwrap-panic auth) { active: false })
    )
    (ok true)
  )
)

(define-public (update-authorization (merchant principal) (max-per-period uint) (period-length uint))
  (begin
    (try! (revoke-authorization merchant))
    (authorize-merchant merchant max-per-period period-length)
  )
)

;; ============================================
;; PUBLIC FUNCTIONS - ENGINE OPERATIONS
;; ============================================

(define-public (debit (subscriber principal) (merchant principal) (amount uint))
  (let (
    (auth-key { subscriber: subscriber, merchant: merchant })
    (auth-opt (map-get? authorizations auth-key))
    (current-balance (default-to u0 (map-get? balances subscriber)))
  )
    (asserts! (is-engine-caller) ERR-UNAUTHORIZED-CALLER)
    (asserts! (is-some auth-opt) ERR-AUTHORIZATION-NOT-FOUND)
    
    (let (
      (auth (unwrap-panic auth-opt))
      (updated-auth (maybe-reset-period auth))
    )
      (asserts! (get active updated-auth) ERR-NOT-AUTHORIZED)
      (asserts! 
        (<= (+ (get spent-this-period updated-auth) amount) (get max-per-period updated-auth))
        ERR-EXCEEDS-SPENDING-LIMIT
      )
      (asserts! (<= amount current-balance) ERR-INSUFFICIENT-BALANCE)
      
      (let (
        (fee (/ (* amount (var-get protocol-fee-bps)) u10000))
        (merchant-amount (- amount fee))
      )
        (map-set balances subscriber (- current-balance amount))
        (map-set authorizations auth-key
          (merge updated-auth { 
            spent-this-period: (+ (get spent-this-period updated-auth) amount)
          })
        )
        (try! (as-contract (stx-transfer? merchant-amount tx-sender merchant)))
        (if (> fee u0)
          (try! (as-contract (stx-transfer? fee tx-sender (var-get fee-recipient))))
          true
        )
        (ok { amount: amount, fee: fee, merchant-received: merchant-amount })
      )
    )
  )
)

;; ============================================
;; ADMIN FUNCTIONS
;; ============================================

(define-public (set-engine-contract (engine principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set engine-contract (some engine))
    (ok true)
  )
)

(define-public (set-fee-recipient (recipient principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set fee-recipient recipient)
    (ok true)
  )
)

(define-public (set-protocol-fee (fee-bps uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (<= fee-bps u500) ERR-INVALID-AMOUNT)
    (var-set protocol-fee-bps fee-bps)
    (ok true)
  )
)

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

(define-read-only (get-balance (user principal))
  (default-to u0 (map-get? balances user))
)

(define-read-only (get-authorization (subscriber principal) (merchant principal))
  (map-get? authorizations { subscriber: subscriber, merchant: merchant })
)

(define-read-only (is-authorized (subscriber principal) (merchant principal))
  (default-to false 
    (get active (map-get? authorizations { subscriber: subscriber, merchant: merchant }))
  )
)

(define-read-only (get-remaining-limit (subscriber principal) (merchant principal))
  (match (map-get? authorizations { subscriber: subscriber, merchant: merchant })
    auth 
      (let ((updated-auth (maybe-reset-period auth)))
        (if (get active updated-auth)
          (some (- (get max-per-period updated-auth) (get spent-this-period updated-auth)))
          none
        )
      )
    none
  )
)

(define-read-only (get-protocol-fee)
  (var-get protocol-fee-bps)
)

(define-read-only (get-engine-contract)
  (var-get engine-contract)
)