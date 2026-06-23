"use client"
import { useEffect } from "react"

export default function Error({
     error,
     reset
}: {
     error: Error & { digest?: string },
     reset: () => void
}) {

     useEffect(() => {
         console.error(error)
     },[error])

    return (
        <div className="p-2 border rounded bg-red-100 text-red-800">
            <h2>Something went wrong!</h2>
            <button onClick={reset}>
                 Try again
            </button>
        </div>
    );
}