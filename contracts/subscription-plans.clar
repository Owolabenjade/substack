;; Registry for merchant subscription plans

;; ============================================
;; CONSTANTS & ERROR CODES
;; ============================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u200))
(define-constant ERR-PLAN-NOT-FOUND (err u201))
(define-constant ERR-INVALID-AMOUNT (err u202))
(define-constant ERR-INVALID-INTERVAL (err u203))
(define-constant ERR-PLAN-INACTIVE (err u204))
(define-constant ERR-NOT-PLAN-OWNER (err u205))
(define-constant ERR-PLAN-ALREADY-EXISTS (err u206))

(define-constant MIN-INTERVAL u6)
(define-constant MAX-INTERVAL u52560)

;; ============================================
;; DATA MAPS & VARIABLES
;; ============================================

(define-data-var next-plan-id uint u1)

(define-map plans uint
  {
    merchant: principal,
    amount: uint,
    interval-blocks: uint,
    active: bool,
    metadata-uri: (string-utf8 256),
    created-at: uint,
    subscriber-count: uint
  }
)

(define-map merchant-plans principal (list 20 uint))

;; ============================================
;; PRIVATE FUNCTIONS
;; ============================================

(define-private (add-plan-to-merchant (merchant principal) (plan-id uint))
  (let (
    (current-plans (default-to (list) (map-get? merchant-plans merchant)))
  )
    (map-set merchant-plans merchant 
      (unwrap! (as-max-len? (append current-plans plan-id) u20) false)
    )
    true
  )
)

;; ============================================
;; PUBLIC FUNCTIONS - MERCHANT OPERATIONS
;; ============================================

(define-public (create-plan (amount uint) (interval-blocks uint) (metadata-uri (string-utf8 256)))
  (let (
    (plan-id (var-get next-plan-id))
  )
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    (asserts! (>= interval-blocks MIN-INTERVAL) ERR-INVALID-INTERVAL)
    (asserts! (<= interval-blocks MAX-INTERVAL) ERR-INVALID-INTERVAL)
    
    (map-set plans plan-id
      {
        merchant: tx-sender,
        amount: amount,
        interval-blocks: interval-blocks,
        active: true,
        metadata-uri: metadata-uri,
        created-at: stacks-block-height,
        subscriber-count: u0
      }
    )
    
    (add-plan-to-merchant tx-sender plan-id)
    (var-set next-plan-id (+ plan-id u1))
    (ok plan-id)
  )
)

(define-public (update-plan-amount (plan-id uint) (new-amount uint))
  (let (
    (plan-opt (map-get? plans plan-id))
  )
    (asserts! (is-some plan-opt) ERR-PLAN-NOT-FOUND)
    (let ((plan (unwrap-panic plan-opt)))
      (asserts! (is-eq tx-sender (get merchant plan)) ERR-NOT-PLAN-OWNER)
      (asserts! (> new-amount u0) ERR-INVALID-AMOUNT)
      (map-set plans plan-id (merge plan { amount: new-amount }))
      (ok true)
    )
  )
)

(define-public (update-plan-interval (plan-id uint) (new-interval uint))
  (let (
    (plan-opt (map-get? plans plan-id))
  )
    (asserts! (is-some plan-opt) ERR-PLAN-NOT-FOUND)
    (let ((plan (unwrap-panic plan-opt)))
      (asserts! (is-eq tx-sender (get merchant plan)) ERR-NOT-PLAN-OWNER)
      (asserts! (>= new-interval MIN-INTERVAL) ERR-INVALID-INTERVAL)
      (asserts! (<= new-interval MAX-INTERVAL) ERR-INVALID-INTERVAL)
      (map-set plans plan-id (merge plan { interval-blocks: new-interval }))
      (ok true)
    )
  )
)

(define-public (update-plan-metadata (plan-id uint) (new-metadata (string-utf8 256)))
  (let (
    (plan-opt (map-get? plans plan-id))
  )
    (asserts! (is-some plan-opt) ERR-PLAN-NOT-FOUND)
    (let ((plan (unwrap-panic plan-opt)))
      (asserts! (is-eq tx-sender (get merchant plan)) ERR-NOT-PLAN-OWNER)
      (map-set plans plan-id (merge plan { metadata-uri: new-metadata }))
      (ok true)
    )
  )
)

(define-public (deactivate-plan (plan-id uint))
  (let (
    (plan-opt (map-get? plans plan-id))
  )
    (asserts! (is-some plan-opt) ERR-PLAN-NOT-FOUND)
    (let ((plan (unwrap-panic plan-opt)))
      (asserts! (is-eq tx-sender (get merchant plan)) ERR-NOT-PLAN-OWNER)
      (map-set plans plan-id (merge plan { active: false }))
      (ok true)
    )
  )
)

(define-public (reactivate-plan (plan-id uint))
  (let (
    (plan-opt (map-get? plans plan-id))
  )
    (asserts! (is-some plan-opt) ERR-PLAN-NOT-FOUND)
    (let ((plan (unwrap-panic plan-opt)))
      (asserts! (is-eq tx-sender (get merchant plan)) ERR-NOT-PLAN-OWNER)
      (map-set plans plan-id (merge plan { active: true }))
      (ok true)
    )
  )
)

;; ============================================
;; ENGINE FUNCTIONS
;; ============================================

(define-public (increment-subscribers (plan-id uint))
  (let (
    (plan-opt (map-get? plans plan-id))
  )
    (asserts! (is-some plan-opt) ERR-PLAN-NOT-FOUND)
    (let ((plan (unwrap-panic plan-opt)))
      (map-set plans plan-id 
        (merge plan { subscriber-count: (+ (get subscriber-count plan) u1) })
      )
      (ok true)
    )
  )
)

(define-public (decrement-subscribers (plan-id uint))
  (let (
    (plan-opt (map-get? plans plan-id))
  )
    (asserts! (is-some plan-opt) ERR-PLAN-NOT-FOUND)
    (let ((plan (unwrap-panic plan-opt)))
      (map-set plans plan-id 
        (merge plan { 
          subscriber-count: (if (> (get subscriber-count plan) u0)
                              (- (get subscriber-count plan) u1)
                              u0)
        })
      )
      (ok true)
    )
  )
)

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

(define-read-only (get-plan (plan-id uint))
  (map-get? plans plan-id)
)

(define-read-only (is-plan-active (plan-id uint))
  (match (map-get? plans plan-id)
    plan (get active plan)
    false
  )
)

(define-read-only (get-plan-merchant (plan-id uint))
  (match (map-get? plans plan-id)
    plan (some (get merchant plan))
    none
  )
)

(define-read-only (get-plan-amount (plan-id uint))
  (match (map-get? plans plan-id)
    plan (some (get amount plan))
    none
  )
)

(define-read-only (get-plan-interval (plan-id uint))
  (match (map-get? plans plan-id)
    plan (some (get interval-blocks plan))
    none
  )
)

(define-read-only (get-merchant-plans (merchant principal))
  (default-to (list) (map-get? merchant-plans merchant))
)

(define-read-only (get-total-plans)
  (- (var-get next-plan-id) u1)
)

(define-read-only (get-subscriber-count (plan-id uint))
  (match (map-get? plans plan-id)
    plan (get subscriber-count plan)
    u0
  )
)

(define-read-only (get-monthly-cost (plan-id uint))
  (match (map-get? plans plan-id)
    plan 
      (let (
        (blocks-per-month u4320)
        (charges-per-month (/ blocks-per-month (get interval-blocks plan)))
      )
        (some (* (get amount plan) charges-per-month))
      )
    none
  )
)