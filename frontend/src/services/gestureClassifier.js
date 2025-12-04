// gestureClassifier.js
// Robust gesture detection using strict geometric rules.

// Calculate Euclidean distance
function distance(a, b) {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

export function detectGestureFromLandmarks(landmarks) {
    const wrist = landmarks[0]

    // Finger Indices
    // Thumb: 1,2,3,4
    // Index: 5,6,7,8
    // Middle: 9,10,11,12
    // Ring: 13,14,15,16
    // Pinky: 17,18,19,20

    // 1. Determine which fingers are OPEN
    // A finger is open if the TIP is significantly farther from the Wrist than the PIP (Knuckle)
    // AND the TIP is farther from the Wrist than the MCP (Base).

    const isOpen = [false, false, false, false, false] // Thumb, Index, Middle, Ring, Pinky

    // Thumb (Special case: check lateral distance or simple distance)
    // For thumb, we check if tip is farther from pinky base (17) than the thumb base (2)
    // Or simply check distance from wrist vs MCP
    const thumbTip = landmarks[4]
    const thumbIp = landmarks[3]
    const thumbMcp = landmarks[2]
    // Simple check: Is tip farther from wrist than IP?
    isOpen[0] = distance(thumbTip, wrist) > distance(thumbIp, wrist) * 1.1

    // Fingers (Index to Pinky)
    const fingerIndices = [
        { tip: 8, pip: 6, mcp: 5 },   // Index
        { tip: 12, pip: 10, mcp: 9 }, // Middle
        { tip: 16, pip: 14, mcp: 13 },// Ring
        { tip: 20, pip: 18, mcp: 17 } // Pinky
    ]

    for (let i = 0; i < 4; i++) {
        const { tip, pip, mcp } = fingerIndices[i]
        const tipPt = landmarks[tip]
        const pipPt = landmarks[pip]
        const mcpPt = landmarks[mcp]

        // Strict extension check:
        // 1. Tip to Wrist > PIP to Wrist
        // 2. Tip to Wrist > MCP to Wrist
        const distTip = distance(tipPt, wrist)
        const distPip = distance(pipPt, wrist)
        const distMcp = distance(mcpPt, wrist)

        isOpen[i + 1] = (distTip > distPip) && (distTip > distMcp)
    }

    // 2. Detect Gestures based on Open State

    // OK SIGN (👌) -> SUBMIT TEST
    // Logic: Thumb tip and Index tip are close. Middle, Ring, Pinky are OPEN.
    const indexTip = landmarks[8]
    const distThumbIndex = distance(thumbTip, indexTip)

    // Threshold for touching: 0.05 (adjustable)
    // And check if other 3 fingers are open
    if (distThumbIndex < 0.05 && isOpen[2] && isOpen[3] && isOpen[4] && !isOpen[1]) {
        return 'submit_test'
    }

    // Count open fingers (excluding thumb for some logic)
    const openCount = isOpen.filter(Boolean).length
    const fingersOnly = isOpen.slice(1).filter(Boolean).length

    // 5 FINGERS OPEN -> Reserved (maybe for something else later)
    // if (openCount === 5) return 'prev'

    // FIST (Clear) -> 0 or 1 (thumb might be loose) fingers open
    // Strictly: No fingers open (thumb can be anywhere)
    if (fingersOnly === 0 && !isOpen[0]) return 'clear'

    // THUMB GESTURES (Navigation: Next, Save&Next)
    // Condition: Only Thumb is Open
    if (isOpen[0] && fingersOnly === 0) {
        // thumbTip and thumbMcp are already defined above

        const dx = thumbTip.x - thumbMcp.x
        const dy = thumbTip.y - thumbMcp.y // Y increases downwards

        // Calculate angle or ratio to distinguish Up vs Side
        // Save & Next (Up): dy should be negative (up) and dominant.
        // Next (Side): dx should be dominant (Right).

        const isVertical = Math.abs(dy) > Math.abs(dx) * 1.5 // Strict vertical check
        const isHorizontal = Math.abs(dx) > Math.abs(dy) // Normal horizontal check

        if (isVertical) {
            // Vertical -> Save & Next (Thumb Up)
            // Must be pointing UP (dy < 0)
            if (dy < -0.03) return 'save_next'
        } else if (isHorizontal) {
            // Horizontal -> Next/Prev
            // Must be significant horizontal movement
            if (dx > 0.03) return 'next'  // Thumb Right
            if (dx < -0.03) return 'prev' // Thumb Left
        }

        return null
    }

    // OPTIONS (A, B, C, D)

    // Option A: 1 Finger (Index)
    // Now strictly just 1 finger, no pointing logic needed.
    if (fingersOnly === 1 && isOpen[1]) return 'option_A'

    // Option B: 2 Fingers (Index + Middle)
    if (fingersOnly === 2 && isOpen[1] && isOpen[2]) return 'option_B'

    // Option C: 3 Fingers (Index + Middle + Ring)
    if (fingersOnly === 3 && isOpen[1] && isOpen[2] && isOpen[3]) return 'option_C'

    // Option D: 4 Fingers (Index to Pinky Open, Thumb Closed)
    if (fingersOnly === 4 && !isOpen[0]) return 'option_D'

    return null
}

export default detectGestureFromLandmarks
