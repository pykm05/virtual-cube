'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

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
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message);
            }

            router.push('../');
        } catch (error) {
            setFeedback((error as Error).message || 'An unexpected error occurred');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex relative items-center justify-center h-full text-white bg-gray-100">
            <div className="relative flex flex-col w-[400px] h-[500px] justify-center items-center text-white rounded shadow-md gap-[5px] bg-gray-200">
                <button
                    onClick={() => router.push('../')}
                    className="absolute right-85 top-5 py-2 pl-2 pr-1 rounded-[5px] bg-gray-200 hover:bg-gray-100"
                >
                    <Image src="/arrow.svg" height={30} width={30} priority={true} alt="user icon" />
                </button>

                <div className="font-bold text-3xl mb-[50px]">Login</div>

                <input
                    type="text"
                    className="border-1 border-gray-100 rounded-[5px] px-2 py-1 mb-[40px] w-2/3 outline-none bg-gray-100"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    className="border-1 border-gray-100 rounded-[5px] px-2 py-1 mb-[50px] w-2/3 outline-none bg-gray-100"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button onClick={login} className="py-2 w-[200px] rounded-[5px] mb-2 bg-purple-100 hover:bg-purple-50">
                    Sign In
                </button>
                <button
                    onClick={() => router.push('/register')}
                    className="mb-2 px-2 py-1 rounded-[5px] text-xs hover:bg-gray-100"
                >
                    Create an account
                </button>

                {feedback && <div className="absolute bottom-10 text-red-500">{feedback}</div>}
            </div>
        </div>
    );
}
export default Login;
