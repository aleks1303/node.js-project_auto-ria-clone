import { IBrand } from "../interfaces/brand.interface";

export class BrandPresenter {
    public static toResponse(brand: IBrand) {
        return {
            id: brand._id,
            brand: brand.brand,
            models: brand.models,
        };
    }

    public static toResponseList(brands: IBrand[]) {
        return brands.map((brand) => this.toResponse(brand));
    }
}
