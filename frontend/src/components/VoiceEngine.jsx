import React, { forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react'

const VoiceEngine = forwardRef(({ onCommand, useWhisper = false }, ref) => {
    // --- Web Speech API State ---
    let recognition = null

    // --- Whisper API State ---
    const [isRecording, setIsRecording] = useState(false)
    const mediaRecorderRef = useRef(null)
    const chunksRef = useRef([])
    const intervalRef = useRef(null)

    useImperativeHandle(ref, () => ({
        stop: () => {
            if (useWhisper) stopWhisper()
            else recognition && recognition.stop()
        }
    }))

    // ----------------------------------------------------------------
    // 1. Web Speech API Implementation (Native, Free, Fast)
    // ----------------------------------------------------------------
    // Keep a ref to the latest callback to avoid restarting the effect
    const onCommandRef = useRef(onCommand)
    useEffect(() => {
        onCommandRef.current = onCommand
    }, [onCommand])

    // ----------------------------------------------------------------
    // 1. Web Speech API Implementation (Native, Free, Fast)
    // ----------------------------------------------------------------
    useEffect(() => {
        if (useWhisper) return // Skip if using Whisper

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            console.warn('Web Speech API not supported in this browser.')
            return
        }

        recognition = new SpeechRecognition()
        recognition.lang = 'en-US'
        recognition.interimResults = false
        recognition.continuous = true

        recognition.onresult = (e) => {
            const results = e.results
            const latestResult = results[results.length - 1]
            const text = latestResult[0].transcript.trim()
            console.log('Native Voice Heard:', text)
            if (latestResult.isFinal) {
                // Use the ref here
                onCommandRef.current && onCommandRef.current(text)
            }
        }

        recognition.onerror = (err) => {
            if (err.error === 'no-speech') return
            console.warn('Speech error:', err.error)
        }

        recognition.onend = () => {
            setTimeout(() => {
                try { recognition && recognition.start() } catch (e) { }
            }, 300)
        }

        try { recognition.start() } catch (e) { console.error("Failed to start voice:", e) }

        return () => {
            if (recognition) {
                recognition.onend = null
                recognition.stop()
            }
        }
    }, [useWhisper]) // Removed onCommand from dependency

    // ----------------------------------------------------------------
    // 2. OpenAI Whisper API Implementation (Paid, High Accuracy, Latency)
    // ----------------------------------------------------------------
    useEffect(() => {
        if (!useWhisper) return // Skip if using Native

        startWhisper()
        return () => stopWhisper()
    }, [useWhisper])

    const startWhisper = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaRecorderRef.current = new MediaRecorder(stream)

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }

            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                chunksRef.current = []
                if (blob.size > 0) {
                    await sendAudioToWhisper(blob)
                }
            }

            setIsRecording(true)
            // Start the loop: Record for 2.5s -> Stop (Process) -> Start
            intervalRef.current = setInterval(() => {
                cycleRecording()
            }, 3000) // 3 seconds cycle

            mediaRecorderRef.current.start()
        } catch (e) {
            console.error("Whisper Mic Error:", e)
            alert("Microphone access denied for Whisper.")
        }
    }

    const stopWhisper = () => {
        setIsRecording(false)
        if (intervalRef.current) clearInterval(intervalRef.current)
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
        }
        // Stop tracks
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())
        }
    }

    const cycleRecording = () => {
        if (!mediaRecorderRef.current) return
        if (mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop()
            // It will trigger onstop -> upload
            // We need to restart it after a tiny delay or immediately
            setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
                    mediaRecorderRef.current.start()
                }
            }, 100)
        }
    }

    const sendAudioToWhisper = async (audioBlob) => {
        const formData = new FormData()
        formData.append('audio', audioBlob, 'recording.webm')

        try {
            console.log("Sending audio to Whisper...")
            const res = await fetch('http://localhost:4001/api/transcribe', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            if (data.text) {
                console.log("Whisper Heard:", data.text)
                onCommandRef.current && onCommandRef.current(data.text)
            }
        } catch (e) {
            console.error("Whisper Upload Error:", e)
        }
    }

    return null
})

export default VoiceEngine
