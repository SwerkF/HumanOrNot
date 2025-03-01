import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { login } from "@/redux/slices/userSlices";

import Input from "@/components/Input/Input";
import Button from "@/components/Button/Button";

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { isAuth, error, status } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuth) {
            navigate("/");
        }
    }, [isAuth]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(login({ email, password }));
    };

    return (
        <main className="flex flex-col justify-center items-center gap-2 h-screen">
            <h1 className="text-6xl font-bold text-white">Login.</h1>
            <p className="text-white text-md mb-5">Connectez-vous pour continuer.</p>
            <form onSubmit={handleSubmit} className="flex flex-col justify-center gap-2 items-center w-[400px]">
                <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Button 
                    label={
                        status === "loading" ? "Chargement..." : "Se connecter"
                    } 
                    type="submit" className="w-full" 
                />
                {status === "failed" && <p className="text-red-500">{error}</p>}
            </form>
            <p className="text-white text-md mb-5">
                Vous n'avez pas de compte?{" "}
                <a className="text-primary cursor-pointer hover:text-secondary transition-colors" onClick={() => navigate("/register")}>
                    S'inscrire
                </a>
            </p>
        </main>
    );
}