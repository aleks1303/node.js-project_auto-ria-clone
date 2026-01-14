import { IToken, ITokenModel } from "../interfaces/token.interface";
import { Token } from "../models/token.model";

class TokenRepository {
    public create(dto: ITokenModel): Promise<IToken> {
        return Token.create(dto);
    }
}
export const tokenRepository = new TokenRepository();
