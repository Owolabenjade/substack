;; Core subscription lifecycle management and charge execution

;; ============================================
;; CONSTANTS & ERROR CODES
;; ============================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u300))
(define-constant ERR-PLAN-NOT-FOUND (err u301))
(define-constant ERR-PLAN-INACTIVE (err u302))
(define-constant ERR-ALREADY-SUBSCRIBED (err u303))
(define-constant ERR-NOT-SUBSCRIBED (err u304))
(define-constant ERR-CHARGE-NOT-DUE (err u305))
(define-constant ERR-SUBSCRIPTION-INACTIVE (err u306))
(define-constant ERR-INSUFFICIENT-AUTHORIZATION (err u307))
(define-constant ERR-VAULT-ERROR (err u308))
(define-constant ERR-SELF-SUBSCRIBE (err u309))

(define-constant KEEPER-FEE-BPS u20)

;; ============================================
;; DATA MAPS & VARIABLES
;; ============================================

(define-map subscriptions
  { subscriber: principal, plan-id: uint }
  {
    start-block: uint,
    last-charged-block: uint,
    active: bool,
    plan-amount: uint,
    plan-interval: uint
  }
)

(define-map user-subscriptions principal (list 50 uint))
(define-map plan-subscribers uint (list 1000 principal))

(define-data-var total-charges-processed uint u0)
(define-data-var total-volume-processed uint u0)

;; ============================================
;; PRIVATE FUNCTIONS
;; ============================================

(define-private (add-subscription-to-user (user principal) (plan-id uint))
  (let (
    (current-subs (default-to (list) (map-get? user-subscriptions user)))
  )
    (map-set user-subscriptions user 
      (unwrap! (as-max-len? (append current-subs plan-id) u50) false)
    )
    true
  )
)

(define-private (add-subscriber-to-plan (plan-id uint) (subscriber principal))
  (let (
    (current-subs (default-to (list) (map-get? plan-subscribers plan-id)))
  )
    (map-set plan-subscribers plan-id 
      (unwrap! (as-max-len? (append current-subs subscriber) u1000) false)
    )
    true
  )
)

;; ============================================
;; PUBLIC FUNCTIONS - SUBSCRIPTION MANAGEMENT
;; ============================================

(define-public (subscribe (plan-id uint))
  (let (
    (plan-opt (contract-call? .subscription-plans get-plan plan-id))
  )
    (asserts! (is-some plan-opt) ERR-PLAN-NOT-FOUND)
    
    (let (
      (plan (unwrap-panic plan-opt))
      (merchant (get merchant plan))
      (amount (get amount plan))
      (interval (get interval-blocks plan))
      (sub-key { subscriber: tx-sender, plan-id: plan-id })
    )
      (asserts! (get active plan) ERR-PLAN-INACTIVE)
      (asserts! (not (is-eq tx-sender merchant)) ERR-SELF-SUBSCRIBE)
      (asserts! 
        (not (default-to false (get active (map-get? subscriptions sub-key))))
        ERR-ALREADY-SUBSCRIBED
      )
      (asserts! 
        (contract-call? .subscription-vault is-authorized tx-sender merchant)
        ERR-INSUFFICIENT-AUTHORIZATION
      )
      
      (map-set subscriptions sub-key
        {
          start-block: stacks-block-height,
          last-charged-block: stacks-block-height,
          active: true,
          plan-amount: amount,
          plan-interval: interval
        }
      )
      
      (add-subscription-to-user tx-sender plan-id)
      (add-subscriber-to-plan plan-id tx-sender)
      (try! (contract-call? .subscription-plans increment-subscribers plan-id))
      (try! (execute-charge tx-sender plan-id))
      
      (ok { plan-id: plan-id, merchant: merchant, amount: amount, interval: interval })
    )
  )
)

(define-public (unsubscribe (plan-id uint))
  (let (
    (sub-key { subscriber: tx-sender, plan-id: plan-id })
    (sub-opt (map-get? subscriptions sub-key))
  )
    (asserts! (is-some sub-opt) ERR-NOT-SUBSCRIBED)
    
    (let ((sub (unwrap-panic sub-opt)))
      (asserts! (get active sub) ERR-SUBSCRIPTION-INACTIVE)
      (map-set subscriptions sub-key (merge sub { active: false }))
      (try! (contract-call? .subscription-plans decrement-subscribers plan-id))
      (ok true)
    )
  )
)

;; ============================================
;; PUBLIC FUNCTIONS - CHARGE EXECUTION
;; ============================================

(define-public (execute-charge (subscriber principal) (plan-id uint))
  (let (
    (sub-key { subscriber: subscriber, plan-id: plan-id })
    (sub-opt (map-get? subscriptions sub-key))
  )
    (asserts! (is-some sub-opt) ERR-NOT-SUBSCRIBED)
    
    (let (
      (sub (unwrap-panic sub-opt))
      (plan-opt (contract-call? .subscription-plans get-plan plan-id))
    )
      (asserts! (get active sub) ERR-SUBSCRIPTION-INACTIVE)
      (asserts! (is-some plan-opt) ERR-PLAN-NOT-FOUND)
      
      (let (
        (plan (unwrap-panic plan-opt))
        (merchant (get merchant plan))
        (amount (get plan-amount sub))
        (interval (get plan-interval sub))
        (last-charge (get last-charged-block sub))
        (next-charge-due (+ last-charge interval))
      )
        (asserts! 
          (or 
            (is-eq last-charge (get start-block sub))
            (>= stacks-block-height next-charge-due)
          )
          ERR-CHARGE-NOT-DUE
        )
        
        (let (
          (debit-result (contract-call? .subscription-vault debit subscriber merchant amount))
        )
          (asserts! (is-ok debit-result) ERR-VAULT-ERROR)
          
          (map-set subscriptions sub-key
            (merge sub { last-charged-block: stacks-block-height })
          )
          
          (var-set total-charges-processed (+ (var-get total-charges-processed) u1))
          (var-set total-volume-processed (+ (var-get total-volume-processed) amount))
          
          (ok {
            subscriber: subscriber,
            plan-id: plan-id,
            amount: amount,
            merchant: merchant,
            next-charge-block: (+ stacks-block-height interval)
          })
        )
      )
    )
  )
)

(define-public (batch-execute-charges (charges (list 10 { subscriber: principal, plan-id: uint })))
  (ok (map execute-single-charge charges))
)

(define-private (execute-single-charge (charge { subscriber: principal, plan-id: uint }))
  (execute-charge (get subscriber charge) (get plan-id charge))
)

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

(define-read-only (get-subscription (subscriber principal) (plan-id uint))
  (map-get? subscriptions { subscriber: subscriber, plan-id: plan-id })
)

(define-read-only (is-subscribed (subscriber principal) (plan-id uint))
  (default-to false 
    (get active (map-get? subscriptions { subscriber: subscriber, plan-id: plan-id }))
  )
)

(define-read-only (get-next-charge-block (subscriber principal) (plan-id uint))
  (match (map-get? subscriptions { subscriber: subscriber, plan-id: plan-id })
    sub 
      (if (get active sub)
        (some (+ (get last-charged-block sub) (get plan-interval sub)))
        none
      )
    none
  )
)

(define-read-only (is-charge-due (subscriber principal) (plan-id uint))
  (match (map-get? subscriptions { subscriber: subscriber, plan-id: plan-id })
    sub 
      (if (get active sub)
        (let (
          (next-charge (+ (get last-charged-block sub) (get plan-interval sub)))
        )
          (>= stacks-block-height next-charge)
        )
        false
      )
    false
  )
)

(define-read-only (get-user-subscriptions (user principal))
  (default-to (list) (map-get? user-subscriptions user))
)

(define-read-only (get-plan-subscribers (plan-id uint))
  (default-to (list) (map-get? plan-subscribers plan-id))
)

(define-read-only (get-total-charges)
  (var-get total-charges-processed)
)

(define-read-only (get-total-volume)
  (var-get total-volume-processed)
)

(define-read-only (get-keeper-fee-rate)
  KEEPER-FEE-BPS
)