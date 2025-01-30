import Button from "@/components/Button/Button"
import { useNavigate } from "react-router-dom";

const Home = () => {

  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-primary">Human or Bot ?</h1>
      <p className="text-white text-md mb-5 w-1/2 text-center">Dans ce jeu, vous devez indiquer, en 10 messages, si la personne en face est un humain ou un robot.</p>
      <div className="w-1/2 flex flex-col items-center">
        <Button label="Je suis CHAUD !" className="font-bold" onClick={() => navigate("/game")} />
      </div>
    </div>
  );
};

export default Home;
