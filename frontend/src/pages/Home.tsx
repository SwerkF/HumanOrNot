import Button from "@/components/Button/Button";
import { useNavigate } from "react-router-dom";
import { logout } from "@/redux/slices/userSlices";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { RootState } from "@/redux/store";
import { useEffect } from "react";
const Home = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuth } = useAppSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, [isAuth]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-primary">Human or Bot ?</h1>
      <p className="text-white text-md mb-5 w-1/2 text-center">
        Dans ce jeu, vous devez indiquer, en 10 messages, si la personne en face
        est un humain ou un robot.
      </p>
      <div className="w-1/6 flex flex-col items-center gap-3">
        <Button
          label="Je suis CHAUD !"
          className="font-bold w-full"
          onClick={() => navigate("/game")}
        />
        <Button
          label="Voir mes stats"
          className="bg-secondary font-bold text-white w-full hover:bg-primary hover:text-black transition-colors"
          onClick={() => navigate("/stats")}
        />
        <button className="text-white text-xs mb-5" onClick={handleLogout}>
          Se déconnecter
        </button>
      </div>
    </div>
  );
};

export default Home;
