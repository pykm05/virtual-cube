'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const login = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) {
                setFeedback(data.message);
                return;
            }

            router.push(`../play/`);
        } catch (error) {
            setFeedback('An unexpected error occured');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-full min-w-[750px] min-h-[500px]">
            <title>Sign In</title>

            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col bg-white w-[400px] h-[500px] rounded shadow-md justify-center items-center gap-3">
                    <div className="text-black font-bold font-inter text-3xl">Login</div>
                    <div className="text-black font-inter text-xs">Welcome back</div>
                    <br />
                    <input
                        type="text"
                        className="border-b border-black border-opacity-50 w-2/3 outline-none focus:outline-none"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <br />
                    <input
                        type="password"
                        className="border-b border-black border-opacity-50 w-2/3 outline-none focus:outline-none"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <br />
                    <button onClick={login} className="pt-2 pb-2 pl-4 pr-4 bg-blue-100 rounded-l">
                        Sign In
                    </button>
                    {feedback && <div className="text-red-500 ">{feedback}</div>}
                </div>
            </div>
        </div>
    );
}
export default Login;
