import { IToken, ITokenModel } from "../interfaces/token.interface";
import { Token } from "../models/token.model";

class TokenRepository {
    public create(dto: ITokenModel): Promise<IToken> {
        return Token.create(dto);
    }
    public findByParams(params: Partial<IToken>): Promise<IToken> {
        return Token.findOne(params);
    }
    public async deleteByParams(params: Partial<IToken>): Promise<void> {
        await Token.deleteOne(params);
    }
}
export const tokenRepository = new TokenRepository();
