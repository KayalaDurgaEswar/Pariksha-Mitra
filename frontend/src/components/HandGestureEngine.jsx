import React, { useEffect, useRef, useState } from 'react'
// MediaPipe Hands is loaded via CDN in index.html to avoid bundler issues
// import * as mpHands from '@mediapipe/hands'

import { detectGestureFromLandmarks } from '../services/gestureClassifier'

export default function HandGestureEngine(props) {
    const { onAction } = props;
    const videoRef = useRef(null)
    const lastActionRef = useRef({ time: 0, action: null })
    const [debugGesture, setDebugGesture] = useState(null)

    const canvasRef = useRef(null)

    // Hold logic refs
    const holdStartRef = useRef(0)
    const currentGestureRef = useRef(null)
    const hasTriggeredRef = useRef(false)

    const onActionRef = useRef(onAction)

    useEffect(() => {
        onActionRef.current = onAction
    }, [onAction])

    useEffect(() => {
        // Use global Hands from CDN
        const Hands = window.Hands;
        if (!Hands) {
            console.error("MediaPipe Hands not loaded from CDN");
            alert("System Error: Hand tracking library failed to load. Please refresh.");
            return;
        }

        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        })

        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        })

        hands.onResults((results) => {
            const canvas = canvasRef.current
            const video = videoRef.current

            if (canvas && video && video.readyState === 4) {
                // Match canvas size to video
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight

                const ctx = canvas.getContext('2d')
                ctx.save()
                ctx.clearRect(0, 0, canvas.width, canvas.height)

                // Mirror the canvas context to match the mirrored video
                ctx.scale(-1, 1)
                ctx.translate(-canvas.width, 0)

                if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                    const landmarks = results.multiHandLandmarks[0]

                    // Draw Skeleton
                    ctx.lineWidth = 3
                    ctx.strokeStyle = '#00FF00'
                    ctx.fillStyle = '#FF0000'

                    // Draw Connectors
                    const HAND_CONNECTIONS = Hands.HAND_CONNECTIONS || [
                        [0, 1], [1, 2], [2, 3], [3, 4],
                        [0, 5], [5, 6], [6, 7], [7, 8],
                        [5, 9], [9, 10], [10, 11], [11, 12],
                        [9, 13], [13, 14], [14, 15], [15, 16],
                        [13, 17], [17, 18], [18, 19], [19, 20],
                        [0, 17]
                    ];
                    const connections = HAND_CONNECTIONS;

                    for (const [start, end] of connections) {
                        const p1 = landmarks[start]
                        const p2 = landmarks[end]
                        ctx.beginPath()
                        ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height)
                        ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height)
                        ctx.stroke()
                    }

                    // Draw Landmarks
                    for (const lm of landmarks) {
                        ctx.beginPath()
                        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI)
                        ctx.fill()
                    }

                    // Detect Gesture
                    const gesture = detectGestureFromLandmarks(landmarks)

                    const now = Date.now()

                    if (gesture) {
                        if (gesture === currentGestureRef.current) {
                            const duration = now - holdStartRef.current
                            const progress = Math.min(duration / 1500, 1)

                            // Draw Progress Circle
                            const cx = canvas.width / 2
                            const cy = canvas.height - 30

                            ctx.beginPath()
                            ctx.arc(cx, cy, 20, 0, 2 * Math.PI)
                            ctx.lineWidth = 4
                            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
                            ctx.stroke()

                            ctx.beginPath()
                            ctx.arc(cx, cy, 20, -Math.PI / 2, (-Math.PI / 2) + (progress * 2 * Math.PI))
                            ctx.lineWidth = 4
                            ctx.strokeStyle = '#00FF00'
                            ctx.stroke()

                            // Trigger if held long enough
                            if (duration > 1500 && !hasTriggeredRef.current) {
                                onActionRef.current && onActionRef.current(gesture)
                                hasTriggeredRef.current = true
                                // Visual feedback for trigger
                                ctx.fillStyle = '#00FF00'
                                ctx.fill()
                            }

                            setDebugGesture(`${gesture} ${Math.floor(progress * 100)}%`)
                        } else {
                            // New gesture detected
                            currentGestureRef.current = gesture
                            holdStartRef.current = now
                            hasTriggeredRef.current = false
                            setDebugGesture(gesture)
                        }
                    } else {
                        // No valid gesture
                        currentGestureRef.current = null
                        hasTriggeredRef.current = false
                        setDebugGesture(null)
                    }
                } else {
                    currentGestureRef.current = null
                    hasTriggeredRef.current = false
                    setDebugGesture(null)
                }
                ctx.restore()
            }
        })

        // Manual Camera Setup using getUserMedia
        let stream = null
        let requestID = null

        async function startCamera() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: 'user'
                    }
                })

                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    await new Promise((resolve) => {
                        videoRef.current.onloadedmetadata = () => {
                            videoRef.current.play()
                            resolve()
                        }
                    })

                    // Start processing loop
                    const processFrame = async () => {
                        if (videoRef.current && videoRef.current.readyState === 4) {
                            await hands.send({ image: videoRef.current })
                        }
                        requestID = requestAnimationFrame(processFrame)
                    }
                    requestID = requestAnimationFrame(processFrame)
                }
            } catch (err) {
                console.error("Error accessing camera:", err)
                alert("Camera access denied or not available.")
            }
        }

        startCamera()

        return () => {
            if (requestID) cancelAnimationFrame(requestID)
            if (stream) stream.getTracks().forEach(t => t.stop())
            hands.close()
        }
    }, []) // Empty dependency array: Camera setup runs ONCE

    // Calculate Stats for Legend
    const stats = React.useMemo(() => {
        if (!props.questions) return { answered: 0, notAnswered: 0, notVisited: 0 };
        let answered = 0;
        let notAnswered = 0;
        let notVisited = 0;

        props.questions.forEach(q => {
            const status = props.statusMap?.[q.id] || 'notVisited';
            const isAnswered = status === 'answered' || props.answers?.[q.id];

            if (isAnswered) answered++;
            else if (status === 'notAnswered') notAnswered++;
            else notVisited++;
        });
        return { answered, notAnswered, notVisited };
    }, [props.questions, props.statusMap, props.answers]);


    return (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Legend Overlay */}
            <div style={{
                marginBottom: '10px',
                background: 'rgba(255, 255, 255, 0.90)',
                padding: '8px 10px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '4px',
                fontSize: '0.7rem',
                fontWeight: '600',
                color: '#334155',
                border: '1px solid #e2e8f0',
                backdropFilter: 'blur(4px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#28a745', borderRadius: '50%' }}></div>
                    <span>{stats.answered} Answered</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#dc3545', borderRadius: '50%' }}></div>
                    <span>{stats.notAnswered} Not Answered</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#e5e7eb', border: '1px solid #9ca3af', borderRadius: '50%' }}></div>
                    <span>{stats.notVisited} Not Visited</span>
                </div>
            </div>

            <div style={{ position: 'relative', width: '240px', height: '180px' }}>
                <video
                    ref={videoRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '12px',
                        transform: 'scaleX(-1)',
                        border: '3px solid rgba(255,255,255,0.8)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                        objectFit: 'cover'
                    }}
                    playsInline
                />
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: '12px',
                        pointerEvents: 'none'
                    }}
                />
            </div>
            <div style={{
                marginTop: '-30px',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                backdropFilter: 'blur(4px)',
                zIndex: 10
            }}>
                {debugGesture ? `Detected: ${debugGesture}` : 'No Hand'}
            </div>
        </div>
    )
}
