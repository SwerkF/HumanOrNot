import API from "@/services/Interceptor";

export default class GameService {
    async getGames() {
        try {
            const response = await API.get("/game");
            return response.data;
        } catch (error) {
            return error;
        }
    }

    async voteGame(gameId: string, vote: boolean) {
        try {
            const response = await API.post("/game/vote", { gameId, vote });
            return response.data;
        } catch (error) {
            return error;
        }
    }
}
