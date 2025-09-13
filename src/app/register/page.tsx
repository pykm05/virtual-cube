'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const register = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
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
            <div>
                <title>Sign Up</title>
            </div>

            <div className="flex items-center justify-center h-screen">
                <div className="flex flex-col bg-white w-[400px] h-[500px] rounded shadow-md justify-center items-center gap-3">
                    <div className="text-black font-bold font-inter text-3xl">Sign Up</div>
                    <div className="text-black font-inter text-xs">Make an account to continue</div>
                    <br />
                    <input
                        type="text"
                        className="border-b border-black border-opacity-50 w-2/3 outline-none focus:outline-none"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
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
                    <button onClick={register} className="pt-2 pb-2 pl-4 pr-4 bg-blue-100 rounded-l">
                        Sign Up
                    </button>
                    {feedback && <div className="text-red-500 ">{feedback}</div>}
                </div>
            </div>
        </div>
    );
}
export default Register;
